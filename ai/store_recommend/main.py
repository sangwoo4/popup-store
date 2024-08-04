# main.py
# main.py

from fastapi import FastAPI, HTTPException
from contextlib import asynccontextmanager
import numpy as np
from tensorflow.keras.models import load_model
from geopy.distance import geodesic
from model_definition import create_ncf
import schemas
from cache import set_cache, get_cache, save_cache_to_file, load_cache_from_file, get_cache_content, clear_cache
import logging
import asyncio
import mysql.connector
import traceback

app = FastAPI()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

CACHE_FILE = "cache_data.json"
MODEL_FILE = "ncf_model.keras"
DB_CONFIG = {
    'user': 'root',
    'password': '0000',
    'host': 'localhost',
    'database': 'popup'
}

# 모델 로딩 또는 초기화
try:
    model = load_model(MODEL_FILE, compile=True)
    model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
    logger.info("모델 로드 성공")
except Exception as e:
    logger.error(f"모델 로드 실패: {e}")
    model = create_ncf(num_users=1000, num_items=500)
    model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
    logger.info("새 모델 생성 및 컴파일 완료")

# 모델을 주기적으로 파일에 저장하는 함수
async def save_model_periodically(interval: int = 600):
    while True:
        await asyncio.sleep(interval)
        model.save(MODEL_FILE)
        logger.info(f"모델이 파일에 저장되었습니다: {MODEL_FILE}")

# 주기적으로 캐시를 파일에 저장하는 함수
async def save_cache_periodically(interval: int = 600):
    while True:
        await asyncio.sleep(interval)
        save_cache_to_file(CACHE_FILE)

@asynccontextmanager
async def lifespan(app: FastAPI):
    load_cache_from_file(CACHE_FILE)
    cache_task = asyncio.create_task(save_cache_periodically())
    model_task = asyncio.create_task(save_model_periodically())

    try:
        yield
    finally:
        save_cache_to_file(CACHE_FILE)
        model.save(MODEL_FILE)
        cache_task.cancel()
        model_task.cancel()
        try:
            await cache_task
            await model_task
        except asyncio.CancelledError:
            pass

app.router.lifespan_context = lifespan

# 사용자와 상점 간 거리를 계산하는 함수
def calculate_distance(user_coords, store_coords):
    return round(geodesic(user_coords, store_coords).kilometers, 1)

# MySQL 데이터베이스에서 팝업 스토어 정보를 가져오는 함수
def fetch_popup_stores_from_db():
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        logger.info(f"데이터베이스 연결 성공: {conn}")
        cursor = conn.cursor(dictionary=True)
        
        query = """
        SELECT ps.id, ps.title, ps.address, ps.mapx, ps.mapy, GROUP_CONCAT(c.category SEPARATOR ', ') AS categories
        FROM popup_store ps
        JOIN store_category sc ON ps.id = sc.popup_store_id
        JOIN category c ON sc.category_id = c.id
        GROUP BY ps.id
        """
        
        cursor.execute(query)
        stores = cursor.fetchall()
        logger.info(f"쿼리 실행 성공, 결과: {stores}")
        cursor.close()
        conn.close()
        
        if not stores:
            logger.warning("데이터베이스에서 팝업 스토어 정보를 찾을 수 없습니다.")
        return [schemas.PopupStore(**store) for store in stores]
    except Exception as e:
        logger.error(f"데이터베이스에서 팝업 스토어 정보 로드 중 오류 발생: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="팝업 스토어 정보를 로드하는 중 오류가 발생했습니다.")

@app.post("/recommend", response_model=schemas.RecommendResponse)
async def recommendations(request: schemas.RecommendRequest):
    logger.info(f"추천 요청 수신: 사용자 ID = {request.user.id}, 추천 개수 = {request.num_recommendations}")
    logger.info(f"Request data: {request.json()}")  # 요청 데이터 전체 로깅
    
    try:
        user_id_input = np.array([request.user.id])
        user_coords = (request.user.mapy, request.user.mapx)  # 사용자 좌표
        logger.info(f"user_coords: {user_coords}")

        # 팝업 스토어 캐시 확인
        popup_stores_data = get_cache("popup_stores")
        if (popup_stores_data):
            popup_stores = [schemas.PopupStore(**store) for store in popup_stores_data]
            logger.info(f"캐시에서 팝업 스토어 데이터 로드: {popup_stores}")
        else:
            popup_stores = fetch_popup_stores_from_db()
            if not popup_stores:
                raise HTTPException(status_code=500, detail="팝업 스토어 데이터를 로드하지 못했습니다.")
            set_cache("popup_stores", [store.dict() for store in popup_stores])
            logger.info(f"데이터베이스에서 팝업 스토어 데이터 로드 및 캐시에 저장: {popup_stores}")

        # 사용자 선호 카테고리 필터링
        preferred_categories = request.user.preferred_categories.split(', ')
        filtered_popup_stores = [store for store in popup_stores if any(cat in preferred_categories for cat in store.categories.split(', '))]
        
        item_ids_input = np.array([store.id for store in filtered_popup_stores])
        predictions = model.predict([user_id_input.repeat(len(filtered_popup_stores)), item_ids_input])
        predictions = np.round(predictions.flatten(), 5)  # 점수 소수점 3자리로 반올림
        logger.info(f"NCF 모델을 사용한 예측 완료: {predictions}")

        # 점수와 팝업 스토어 ID 매칭 로그 추가
        for store, score in zip(filtered_popup_stores, predictions):
            logger.info(f"Store ID: {store.id}, Score: {score}")

        # NCF 추천 순위 계산 및 중복 제거
        top_ncf_indices = np.argsort(-predictions)
        ncf_recommendations = []
        seen = set()
        for idx in top_ncf_indices:
            if len(ncf_recommendations) >= request.num_recommendations:
                break
            if filtered_popup_stores[idx].id not in seen:
                ncf_recommendations.append(schemas.NfcRecommendation(
                    id=filtered_popup_stores[idx].id
                ))
                seen.add(filtered_popup_stores[idx].id)
        logger.info(f"NCF 추천 완료: {ncf_recommendations}")
        
        # 거리 기반 추천 계산 및 중복 제거
        distances = []
        for store in filtered_popup_stores:
            store_coords = (store.mapy / 10000000.0, store.mapx / 10000000.0)  # 좌표 변환
            logger.info(f"store_coords: {store_coords}")  # 상점 좌표 로그
            distance = calculate_distance(user_coords, store_coords)
            distances.append(distance)
            logger.info(f"Distance to store {store.id}: {distance}")

        distances = np.array(distances)
        top_distance_indices = np.argsort(distances)
        distance_recommendations = []
        seen.clear()
        for idx in top_distance_indices:
            if len(distance_recommendations) >= request.num_recommendations:
                break
            if filtered_popup_stores[idx].id not in seen:
                distance_recommendations.append(schemas.RecommendResponseItem(
                    id=filtered_popup_stores[idx].id,
                    distance=distances[idx]
                ))
                seen.add(filtered_popup_stores[idx].id)
        logger.info(f"거리 기반 추천 완료: {distance_recommendations}")

        return schemas.RecommendResponse(
            ncf_recommendations=ncf_recommendations,
            distance_recommendations=distance_recommendations
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"추천 처리 중 오류 발생: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="추천 처리 중 오류 발생")

@app.post("/save_cache")
async def save_cache():
    save_cache_to_file(CACHE_FILE)
    return {"message": "캐시가 파일에 저장되었습니다."}

@app.post("/load_cache")
async def load_cache():
    load_cache_from_file(CACHE_FILE)
    return {"message": "파일에서 캐시가 로드되었습니다."}

@app.post("/clear_cache")
async def clear_cache_endpoint():
    clear_cache()
    return {"message": "캐시가 비워졌습니다."}

@app.get("/view_cache")
async def view_cache():
    cache_content = get_cache_content()
    return {"cache_content": cache_content}

def test_db_connection():
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute("SELECT DATABASE()")
        result = cursor.fetchone()
        cursor.close()
        conn.close()
        logger.info(f"데이터베이스 연결 성공: {result[0]}")
        return True
    except Exception as e:
        logger.error(f"데이터베이스 연결 실패: {str(e)}")
        return False

if __name__ == "__main__":
    if not test_db_connection():
        logger.error("데이터베이스 연결에 실패하여 애플리케이션을 종료합니다.")
        exit(1)
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)






# 현재 사용 코드
# # main.py

# from fastapi import FastAPI, HTTPException
# from contextlib import asynccontextmanager
# import numpy as np
# from tensorflow.keras.models import load_model
# from geopy.distance import geodesic
# from model_definition import create_ncf
# import schemas
# from cache import set_cache, get_cache, save_cache_to_file, load_cache_from_file, get_cache_content, clear_cache
# import logging
# import asyncio

# app = FastAPI()

# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# CACHE_FILE = "cache_data.json"
# MODEL_FILE = "ncf_model.h5"

# # 모델 로딩 또는 초기화
# try:
#     model = load_model(MODEL_FILE, compile=True)
#     model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])  # 컴파일 포함
#     logger.info("모델 로드 성공")
# except Exception as e:
#     logger.error(f"모델 로드 실패: {e}")
#     model = create_ncf(num_users=1000, num_items=500)
#     model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
#     logger.info("새 모델 생성 및 컴파일 완료")

# # 모델을 주기적으로 파일에 저장하는 함수
# async def save_model_periodically(interval: int = 600):
#     while True:
#         await asyncio.sleep(interval)
#         model.save(MODEL_FILE)
#         logger.info(f"모델이 파일에 저장되었습니다: {MODEL_FILE}")

# # 주기적으로 캐시를 파일에 저장하는 함수
# async def save_cache_periodically(interval: int = 600):
#     while True:
#         await asyncio.sleep(interval)
#         save_cache_to_file(CACHE_FILE)

# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     # 서버 시작 시 캐시 로드
#     load_cache_from_file(CACHE_FILE)
#     cache_task = asyncio.create_task(save_cache_periodically())
#     model_task = asyncio.create_task(save_model_periodically())

#     try:
#         yield
#     finally:
#         # 서버 종료 시 캐시 저장
#         save_cache_to_file(CACHE_FILE)
#         model.save(MODEL_FILE)
#         cache_task.cancel()
#         model_task.cancel()
#         try:
#             await cache_task
#             await model_task
#         except asyncio.CancelledError:
#             pass

# app.router.lifespan_context = lifespan

# # 사용자와 상점 간 거리를 계산하는 함수
# def calculate_distance(user_coords, store_coords):
#     logger.info(f"Calculating distance between user_coords: {user_coords} and store_coords: {store_coords}")
#     return round(geodesic(user_coords, store_coords).kilometers, 1)

# @app.post("/recommend", response_model=schemas.RecommendResponse)
# async def recommendations(request: schemas.RecommendRequest):
#     logger.info(f"추천 요청 수신: 사용자 ID = {request.user.id}, 추천 개수 = {request.num_recommendations}")
#     logger.info(f"Request data: {request.json()}")  # 요청 데이터 전체 로깅
    
#     try:
#         user_id_input = np.array([request.user.id])
#         user_coords = (request.user.mapx, request.user.mapy)  # 사용자 좌표
#         logger.info(f"user_coords: {user_coords}")

#         # 팝업 스토어 캐시 확인
#         popup_stores_data = get_cache("popup_stores")
#         if popup_stores_data:
#             popup_stores = [schemas.PopupStore(**store) for store in popup_stores_data]
#             logger.info(f"캐시에서 팝업 스토어 데이터 로드: {popup_stores}")
#         else:
#             popup_stores = request.popup_stores
#             set_cache("popup_stores", [store.dict() for store in popup_stores])
#             logger.info(f"요청에서 팝업 스토어 데이터 로드 및 캐시에 저장: {popup_stores}")
        
#         item_ids_input = np.array([store.id for store in popup_stores])
#         predictions = model.predict([user_id_input.repeat(len(popup_stores)), item_ids_input])
#         logger.info(f"NCF 모델을 사용한 예측 완료: {predictions}")
        
#         # NCF 추천 순위 계산 및 중복 제거
#         top_ncf_indices = np.argsort(-predictions.flatten())
#         ncf_recommendations = []
#         seen = set()
#         preferred_categories = request.user.preferred_categories.split(', ')
#         for idx in top_ncf_indices:
#             if len(ncf_recommendations) >= request.num_recommendations:
#                 break
#             if popup_stores[idx].id not in seen and any(cat in preferred_categories for cat in popup_stores[idx].categories.split(', ')):
#                 ncf_recommendations.append(schemas.NfcRecommendation(
#                     id=popup_stores[idx].id
#                 ))
#                 seen.add(popup_stores[idx].id)
#         logger.info(f"NCF 추천 완료: {ncf_recommendations}")
        
#         # 거리 기반 추천 계산 및 중복 제거
#         distances = []
#         for store in popup_stores:
#             store_coords = (store.mapx, store.mapy)
#             logger.info(f"store_coords: {store_coords}")  # 상점 좌표 로그
#             distance = calculate_distance(user_coords, store_coords)
#             distances.append(distance)
#             logger.info(f"Distance to store {store.id}: {distance}")

#         distances = np.array(distances)
#         top_distance_indices = np.argsort(distances)
#         distance_recommendations = []
#         seen.clear()
#         for idx in top_distance_indices:
#             if len(distance_recommendations) >= request.num_recommendations:
#                 break
#             if popup_stores[idx].id not in seen:
#                 distance_recommendations.append(schemas.RecommendResponseItem(
#                     id=popup_stores[idx].id,
#                     distance=distances[idx]
#                 ))
#                 seen.add(popup_stores[idx].id)
#         logger.info(f"거리 기반 추천 완료: {distance_recommendations}")

#         return schemas.RecommendResponse(
#             ncf_recommendations=ncf_recommendations,
#             distance_recommendations=distance_recommendations
#         )
#     except Exception as e:
#         logger.error(f"추천 처리 중 오류 발생: {str(e)}")
#         raise HTTPException(status_code=500, detail="추천 처리 중 오류 발생")

# @app.post("/save_cache")
# async def save_cache():
#     save_cache_to_file(CACHE_FILE)
#     return {"message": "캐시가 파일에 저장되었습니다."}

# @app.post("/load_cache")
# async def load_cache():
#     load_cache_from_file(CACHE_FILE)
#     return {"message": "파일에서 캐시가 로드되었습니다."}

# @app.post("/clear_cache")
# async def clear_cache_endpoint():
#     clear_cache()
#     return {"message": "캐시가 비워졌습니다."}

# @app.get("/view_cache")
# async def view_cache():
#     cache_content = get_cache_content()
#     return {"cache_content": cache_content}

# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=8000)





# 첫번째 스프링부트 연결 코드

# import httpx
# from fastapi import FastAPI, HTTPException, Request
# from typing import List
# import numpy as np
# from tensorflow.keras.models import load_model
# from geopy.distance import geodesic
# from model_definition import create_ncf
# import schemas
# from cache import set_cache, get_cache, save_cache_to_file, load_cache_from_file, get_cache_content, clear_cache
# import logging
# import asyncio

# app = FastAPI()

# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# CACHE_FILE = "cache_data.json"

# # 모델 로딩 또는 초기화
# try:
#     model = load_model("ncf_model.h5")
#     logger.info("모델 로드 성공")
# except Exception as e:
#     logger.error(f"모델 로드 실패: {e}")
#     model = create_ncf(num_users=1000, num_items=500)
#     model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
#     logger.info("새 모델 생성 및 컴파일 완료")

# # 서버 시작 시 캐시 로드
# @app.on_event("startup")
# async def startup_event():
#     load_cache_from_file(CACHE_FILE)

# # 서버 종료 시 캐시 저장
# @app.on_event("shutdown")
# async def shutdown_event():
#     save_cache_to_file(CACHE_FILE)

# # 주기적으로 캐시를 파일에 저장하는 함수
# async def save_cache_periodically(interval: int = 600):
#     while True:
#         await asyncio.sleep(interval)
#         save_cache_to_file(CACHE_FILE)

# # 백그라운드 태스크로 주기적 캐시 저장 함수 실행
# @app.on_event("startup")
# async def start_background_tasks():
#     asyncio.create_task(save_cache_periodically())

# def calculate_distance(user_coords, store_coords):
#     logger.info(f"Calculating distance between user_coords: {user_coords} and store_coords: {store_coords}")
#     return round(geodesic(user_coords, store_coords).kilometers, 1)

# @app.post("/recommend", response_model=schemas.RecommendResponse)
# async def recommendations(request: schemas.RecommendRequest):
#     logger.info(f"추천 요청 수신: 사용자 ID = {request.user.id}, 추천 개수 = {request.num_recommendations}")
#     logger.info(f"Request data: {request.json()}")  # 요청 데이터 전체 로깅
    
#     user_id_input = np.array([request.user.id])
#     user_coords = (request.user.mapx, request.user.mapy)  # 사용자 좌표
#     logger.info(f"user_coords: {user_coords}")

#     # 스프링부트 서버에서 팝업 스토어 데이터 가져오기
#     async with httpx.AsyncClient() as client:
#         response = await client.get('http://springboot-server-url/api/popup_stores')
#         if response.status_code != 200:
#             raise HTTPException(status_code=response.status_code, detail="스프링부트 서버에서 팝업 스토어 데이터를 가져오는 중 오류 발생")
#         popup_stores_data = response.json()
    
#     popup_stores = [schemas.PopupStore(**store) for store in popup_stores_data]
#     logger.info(f"스프링부트 서버에서 팝업 스토어 데이터 로드: {popup_stores}")
    
#     item_ids_input = np.array([store.id for store in popup_stores])
#     predictions = model.predict([user_id_input.repeat(len(popup_stores)), item_ids_input])
#     logger.info(f"NCF 모델을 사용한 예측 완료: {predictions}")
    
#     # NCF 추천 순위 계산 및 중복 제거
#     top_ncf_indices = np.argsort(-predictions.flatten())
#     ncf_recommendations = []
#     seen = set()
#     preferred_categories = request.user.preferred_categories.split(', ')
#     for idx in top_ncf_indices:
#         if len(ncf_recommendations) >= request.num_recommendations:
#             break
#         if popup_stores[idx].id not in seen and any(cat in preferred_categories for cat in popup_stores[idx].categories.split(', ')):
#             ncf_recommendations.append(popup_stores[idx].id)
#             seen.add(popup_stores[idx].id)
#     logger.info(f"NCF 추천 완료: {ncf_recommendations}")
    
#     # 거리 기반 추천 계산 및 중복 제거
#     distances = []
#     for store in popup_stores:
#         store_coords = (store.mapx, store.mapy)
#         logger.info(f"store_coords: {store_coords}")  # 상점 좌표 로그
#         distance = calculate_distance(user_coords, store_coords)
#         distances.append(distance)
#         logger.info(f"Distance to store {store.id}: {distance}")

#     distances = np.array(distances)
#     top_distance_indices = np.argsort(distances)
#     distance_recommendations = []
#     seen.clear()
#     for idx in top_distance_indices:
#         if len(distance_recommendations) >= request.num_recommendations:
#             break
#         if popup_stores[idx].id not in seen:
#             distance_recommendations.append(schemas.RecommendResponseItem(
#                 id=popup_stores[idx].id,
#                 distance=distances[idx]
#             ))
#             seen.add(popup_stores[idx].id)
#     logger.info(f"거리 기반 추천 완료: {distance_recommendations}")

#     return schemas.RecommendResponse(
#         ncf_recommendations=ncf_recommendations,
#         distance_recommendations=distance_recommendations
#     )

# @app.post("/save_cache")
# async def save_cache():
#     save_cache_to_file(CACHE_FILE)
#     return {"message": "캐시가 파일에 저장되었습니다."}

# @app.post("/load_cache")
# async def load_cache():
#     load_cache_from_file(CACHE_FILE)
#     return {"message": "파일에서 캐시가 로드되었습니다."}

# @app.post("/clear_cache")
# async def clear_cache_endpoint():
#     clear_cache()
#     return {"message": "캐시가 비워졌습니다."}

# @app.get("/view_cache")
# async def view_cache():
#     cache_content = get_cache_content()
#     return {"cache_content": cache_content}

# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=8000)


# 두번째 스프링부트 연결 코드

# import httpx
# from fastapi import FastAPI, HTTPException, Request
# from typing import List
# import numpy as np
# from tensorflow.keras.models import load_model
# from geopy.distance import geodesic
# from model_definition import create_ncf
# import schemas
# from cache import set_cache, get_cache, save_cache_to_file, load_cache_from_file, get_cache_content, clear_cache
# import logging
# import asyncio

# app = FastAPI()

# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# CACHE_FILE = "cache_data.json"
# SPRINGBOOT_SERVER_URL = os.getenv('SPRINGBOOT_SERVER_URL', 'http://localhost:8080/api/popup_stores')

# # 모델 로딩 또는 초기화
# try:
#     model = load_model("ncf_model.h5")
#     logger.info("모델 로드 성공")
# except Exception as e:
#     logger.error(f"모델 로드 실패: {e}")
#     model = create_ncf(num_users=1000, num_items=500)
#     model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
#     logger.info("새 모델 생성 및 컴파일 완료")

# # 서버 시작 시 캐시 로드
# @app.on_event("startup")
# async def startup_event():
#     load_cache_from_file(CACHE_FILE)

# # 서버 종료 시 캐시 저장
# @app.on_event("shutdown")
# async def shutdown_event():
#     save_cache_to_file(CACHE_FILE)

# # 주기적으로 캐시를 파일에 저장하는 함수
# async def save_cache_periodically(interval: int = 600):
#     while True:
#         await asyncio.sleep(interval)
#         save_cache_to_file(CACHE_FILE)

# # 백그라운드 태스크로 주기적 캐시 저장 함수 실행
# @app.on_event("startup")
# async def start_background_tasks():
#     asyncio.create_task(save_cache_periodically())

# def calculate_distance(user_coords, store_coords):
#     logger.info(f"Calculating distance between user_coords: {user_coords} and store_coords: {store_coords}")
#     return round(geodesic(user_coords, store_coords).kilometers, 1)

# @app.post("/recommend", response_model=schemas.RecommendResponse)
# async def recommendations(request: schemas.RecommendRequest):
#     logger.info(f"추천 요청 수신: 사용자 ID = {request.user.id}, 추천 개수 = {request.num_recommendations}")
#     logger.info(f"Request data: {request.json()}")  # 요청 데이터 전체 로깅
    
#     user_id_input = np.array([request.user.id])
#     user_coords = (request.user.mapx, request.user.mapy)  # 사용자 좌표
#     logger.info(f"user_coords: {user_coords}")

#     # 스프링부트 서버에서 팝업 스토어 데이터 가져오기
#     async with httpx.AsyncClient() as client:
#         try:
#             response = await client.get(SPRINGBOOT_SERVER_URL)
#             response.raise_for_status()  # HTTP 상태 코드가 200이 아닐 경우 예외 발생
#         except httpx.RequestError as exc:
#             logger.error(f"스프링부트 서버와의 통신 중 오류 발생: {exc}")
#             raise HTTPException(status_code=500, detail="스프링부트 서버와의 통신 중 오류 발생")
#         except httpx.HTTPStatusError as exc:
#             logger.error(f"스프링부트 서버 응답 오류: {exc.response.status_code}")
#             raise HTTPException(status_code=exc.response.status_code, detail="스프링부트 서버 응답 오류")
        
#         popup_stores_data = response.json()
    
#     popup_stores = [schemas.PopupStore(**store) for store in popup_stores_data]
#     logger.info(f"스프링부트 서버에서 팝업 스토어 데이터 로드: {popup_stores}")
    
#     item_ids_input = np.array([store.id for store in popup_stores])
#     predictions = model.predict([user_id_input.repeat(len(popup_stores)), item_ids_input])
#     logger.info(f"NCF 모델을 사용한 예측 완료: {predictions}")
    
#     # NCF 추천 순위 계산 및 중복 제거
#     top_ncf_indices = np.argsort(-predictions.flatten())
#     ncf_recommendations = []
#     seen = set()
#     preferred_categories = request.user.preferred_categories.split(', ')
#     for idx in top_ncf_indices:
#         if len(ncf_recommendations) >= request.num_recommendations:
#             break
#         if popup_stores[idx].id not in seen and any(cat in preferred_categories for cat in popup_stores[idx].categories.split(', ')):
#             ncf_recommendations.append(popup_stores[idx].id)
#             seen.add(popup_stores[idx].id)
#     logger.info(f"NCF 추천 완료: {ncf_recommendations}")
    
#     # 거리 기반 추천 계산 및 중복 제거
#     distances = []
#     for store in popup_stores:
#         store_coords = (store.mapx, store.mapy)
#         logger.info(f"store_coords: {store_coords}")  # 상점 좌표 로그
#         distance = calculate_distance(user_coords, store_coords)
#         distances.append(distance)
#         logger.info(f"Distance to store {store.id}: {distance}")

#     distances = np.array(distances)
#     top_distance_indices = np.argsort(distances)
#     distance_recommendations = []
#     seen.clear()
#     for idx in top_distance_indices:
#         if len(distance_recommendations) >= request.num_recommendations:
#             break
#         if popup_stores[idx].id not in seen:
#             distance_recommendations.append(schemas.RecommendResponseItem(
#                 id=popup_stores[idx].id,
#                 distance=distances[idx]
#             ))
#             seen.add(popup_stores[idx].id)
#     logger.info(f"거리 기반 추천 완료: {distance_recommendations}")

#     return schemas.RecommendResponse(
#         ncf_recommendations=ncf_recommendations,
#         distance_recommendations=distance_recommendations
#     )

# @app.post("/save_cache")
# async def save_cache():
#     save_cache_to_file(CACHE_FILE)
#     return {"message": "캐시가 파일에 저장되었습니다."}

# @app.post("/load_cache")
# async def load_cache():
#     load_cache_from_file(CACHE_FILE)
#     return {"message": "파일에서 캐시가 로드되었습니다."}

# @app.post("/clear_cache")
# async def clear_cache_endpoint():
#     clear_cache()
#     return {"message": "캐시가 비워졌습니다."}

# @app.get("/view_cache")
# async def view_cache():
#     cache_content = get_cache_content()
#     return {"cache_content": cache_content}

# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=8000)