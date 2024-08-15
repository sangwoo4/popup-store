from fastapi import FastAPI, HTTPException
from contextlib import asynccontextmanager
import numpy as np
from tensorflow.keras.models import load_model
from geopy.distance import geodesic
import logging
import asyncio
import mysql.connector
import traceback
from typing import List
from dotenv import load_dotenv
import os
import re
from openai import AsyncOpenAI

# 절대 경로로 모듈을 가져옴
from app.model_definition import create_ncf
from app import schemas
from app.cache import set_cache, get_cache, save_cache_to_file, load_cache_from_file, get_cache_content, clear_cache

load_dotenv()

app = FastAPI()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

CACHE_FILE = "cache_data.json"
MODEL_FILE = "ncf_model.keras"

DB_CONFIG = {
    'user': 'root',
    'password': '1234',
    'host': 'mysql-container',
    'port': 3306,
    'database': 'popup'
}

# OpenAI API 키 설정
auto_category_key = os.getenv("AUTO_CATEGORY_KEY")
if not auto_category_key:
    raise ValueError("API 키가 설정되지 않았습니다.")

# OpenAI 클라이언트 설정
client = AsyncOpenAI(
    api_key=auto_category_key,
    organization="org-QigtX2MxI0U14ilnGQQSbGHy"
)

# 모델 로딩 또는 초기화
try:
    model = load_model(MODEL_FILE, compile=True)
    model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
    logger.info("모델 로드 성공")
except Exception as e:
    logger.error(f"모델 로드 실패: {e}")
    model = create_ncf(num_users=1500, num_items=1000)
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

# 주기적으로 팝업 스토어 캐시를 업데이트하는 함수
async def update_popup_stores_cache_periodically(interval: int = 600):
    while True:
        await asyncio.sleep(interval)
        try:
            popup_stores = fetch_popup_stores_from_db()
            if popup_stores:
                set_cache("popup_stores", [store.dict() for store in popup_stores])
                logger.info("데이터베이스에서 팝업 스토어 데이터를 조회하여 캐시를 업데이트했습니다.")
            else:
                logger.warning("데이터베이스에서 팝업 스토어 데이터를 조회하지 못했습니다.")
        except Exception as e:
            logger.error(f"데이터베이스 조회 중 오류 발생: {str(e)}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    load_cache_from_file(CACHE_FILE)
    cache_task = asyncio.create_task(save_cache_periodically())
    model_task = asyncio.create_task(save_model_periodically())
    update_cache_task = asyncio.create_task(update_popup_stores_cache_periodically())

    try:
        yield
    finally:
        save_cache_to_file(CACHE_FILE)
        model.save(MODEL_FILE)
        cache_task.cancel()
        model_task.cancel()
        update_cache_task.cancel()
        try:
            await cache_task
            await model_task
            await update_cache_task
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

@app.post("/recommend/distance", response_model=List[schemas.RecommendResponseItem])
async def distance_recommendations(request: List[schemas.DistanceRequest]):
    logger.info(f"추천 요청 수신: {request}")
    
    num_recommendations = 3
    
    try:
        user_id_input = np.array([req.id for req in request])
        mapx_input = np.array([req.mapx for req in request])
        mapy_input = np.array([req.mapy for req in request])

        if len(user_id_input) != 1:
            raise HTTPException(status_code=400, detail="Request must contain exactly one user id")

        # 좌표를 변환하여 올바른 범위로 설정합니다.
        user_coords = (mapy_input[0] / 10000000.0, mapx_input[0] / 10000000.0)  # (위도, 경도)

        # 유효성 검사
        if not (-90 <= user_coords[0] <= 90) or not (-180 <= user_coords[1] <= 180):
            raise HTTPException(status_code=400, detail="Invalid coordinates: latitude must be between -90 and 90, and longitude must be between -180 and 180")

        popup_stores_data = get_cache("popup_stores")
        if popup_stores_data:
            popup_stores = [schemas.PopupStore(**store) for store in popup_stores_data]
            logger.info(f"캐시에서 팝업 스토어 데이터 로드: {popup_stores}")
        else:
            popup_stores = fetch_popup_stores_from_db()
            if not popup_stores:
                raise HTTPException(status_code=500, detail="팝업 스토어 데이터를 로드하지 못했습니다.")
            set_cache("popup_stores", [store.dict() for store in popup_stores])
            logger.info(f"데이터베이스에서 팝업 스토어 데이터 로드 및 캐시에 저장: {popup_stores}")

        distances = []
        for store in popup_stores:
            store_coords = (store.mapy / 10000000.0, store.mapx / 10000000.0)  # (위도, 경도)
            logger.info(f"store_coords: {store_coords}")
            distance = calculate_distance(user_coords, store_coords)
            distances.append(distance)
            logger.info(f"Distance to store {store.id}: {distance}")

        distances = np.array(distances)
        top_distance_indices = np.argsort(distances)
        distance_recommendations = []
        seen = set()
        for idx in top_distance_indices:
            if len(distance_recommendations) >= num_recommendations:
                break
            if popup_stores[idx].id not in seen:
                distance_recommendations.append(schemas.RecommendResponseItem(
                    id=popup_stores[idx].id,
                    distance=distances[idx]
                ))
                seen.add(popup_stores[idx].id)
        logger.info(f"거리 기반 추천 완료: {distance_recommendations}")

        return distance_recommendations
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"추천 처리 중 오류 발생: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="추천 처리 중 오류 발생")


@app.post("/recommend/category", response_model=List[schemas.NfcRecommendation])
async def category_recommendations(request: List[schemas.CategoryRequest]):
    logger.info(f"추천 요청 수신: {request}")
    
    num_recommendations = 3

    try:
        user_id_input = np.array([req.id for req in request])
        categories_input = np.array([req.categories for req in request])

        if len(user_id_input) != 1:
            raise HTTPException(status_code=400, detail="Request must contain exactly one user id")

        popup_stores_data = get_cache("popup_stores")
        if popup_stores_data:
            popup_stores = [schemas.PopupStore(**store) for store in popup_stores_data]
            logger.info(f"캐시에서 팝업 스토어 데이터 로드: {popup_stores}")
        else:
            popup_stores = fetch_popup_stores_from_db()
            if not popup_stores:
                raise HTTPException(status_code=500, detail="팝업 스토어 데이터를 로드하지 못했습니다.")
            set_cache("popup_stores", [store.dict() for store in popup_stores])
            logger.info(f"데이터베이스에서 팝업 스토어 데이터 로드 및 캐시에 저장: {popup_stores}")

        categories = categories_input[0].split(', ')
        filtered_popup_stores = [store for store in popup_stores if any(cat in categories for cat in store.categories.split(', '))]

        item_ids_input = np.array([store.id for store in filtered_popup_stores])
        predictions = model.predict([user_id_input.repeat(len(filtered_popup_stores)), item_ids_input])
        predictions = np.round(predictions.flatten(), 5)
        logger.info(f"NCF 모델을 사용한 예측 완료: {predictions}")

        for store, score in zip(filtered_popup_stores, predictions):
            logger.info(f"Store ID: {store.id}, Score: {score}")

        top_ncf_indices = np.argsort(-predictions)
        ncf_recommendations = []
        seen = set()
        for idx in top_ncf_indices:
            if len(ncf_recommendations) >= num_recommendations:
                break
            if filtered_popup_stores[idx].id not in seen:
                ncf_recommendations.append(schemas.NfcRecommendation(
                    id=filtered_popup_stores[idx].id
                ))
                seen.add(filtered_popup_stores[idx].id)
        logger.info(f"NCF 추천 완료: {ncf_recommendations}")

        return ncf_recommendations
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"추천 처리 중 오류 발생: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="추천 처리 중 오류 발생")

@app.post("/categorize", response_model=List[schemas.ChatResponse])
async def categorize(requests: List[schemas.ChatRequest]):
    responses = []
    for request in requests:
        try:
            logger.info(f"요청받음 1: {request}")

            category_prompt = ", ".join(CATEGORY_LIST)
            detailed_prompt = (
            f"당신은 카테고리 선정 어시스턴트입니다. 당신의 임무는 전달 받은 팝업스토어의 title, 그리고 description의 문장을 단어 사용 빈도에 초점을 둬서 읽어줘.\n"
            "다음 목록에서 적합한 카테고리들을 최대 3개 선정하는 것입니다: "
            f"{category_prompt}.\n\n"
            f"중복 응답을 자제 해주세요. 여기 세부 정보가 있습니다:\n"
            f"제목: {request.title}\n"
            f"설명: {request.description}\n"
)
        
            response = await client.completions.create(
                model="ft:davinci-002:category:categoryfinal03:9ve3FVGx",
                prompt=detailed_prompt,
                max_tokens=15,
                temperature=0.3,
                top_p=0.5,
                frequency_penalty=0.1,
                presence_penalty=0.1,
                # stop = [","]
            )
            text_response = response.choices[0].text.strip()
            logger.info(f"OpenAI로부터 받은 원시 응답: {text_response}")

            if not text_response:
                raise HTTPException(status_code=500, detail="OpenAI로부터 응답이 없습니다")

            protected_text = protect_categories(text_response)
            categories = [category.strip() for category in re.split(r'[/, ]+', protected_text) if category.strip()]
            categories = [restore_categories(category) for category in categories]
            logger.info(f"응답에서 추출한 카테고리: {categories}")

            matched_categories = list(set(category for category in categories if category in CATEGORY_LIST))
            logger.info(f"일치하는 카테고리: {matched_categories}")

            if len(matched_categories) < 1:
                raise HTTPException(status_code=500, detail="일치하는 카테고리를 찾을 수 없습니다")

            categories_response = [schemas.Category(category=category) for category in matched_categories[:3]]
            logger.info(f"최종 카테고리 응답: {categories_response}")

            chat_response = schemas.ChatResponse(
                categories=categories_response
            )
            responses.append(chat_response)
        
        except Exception as e:
            logger.error(f"오류 발생: {e}")
            responses.append(schemas.ChatResponse(
                categories=[schemas.Category(category="기타행사")],
            ))
    
    return responses

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

# 유틸리티 함수들
CATEGORY_LIST = [
    "화장품", "캐릭터", "도서/음반", "패션", "인테리어", "전시/체험", "향수", "음식", "주류", 
    "음료", "문구", "가정", "생활용품", "스포츠", "게임", "전자제품", "인물", "건강/웰빙", "자동차", 
    "식물", "여행/레저", "드라마/영화", "가전제품", "기타행사"
]

PROTECTED_CATEGORIES = ["전시/체험", "도서/음반", "드라마/영화", "여행/레저", "건강/웰빙"]

def protect_categories(text):
    for category in PROTECTED_CATEGORIES:
        protected = category.replace('/', '|')
        text = text.replace(category, protected)
    return text

def restore_categories(text):
    for category in PROTECTED_CATEGORIES:
        protected = category.replace('/', '|')
        text = text.replace(protected, category)
    return text











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