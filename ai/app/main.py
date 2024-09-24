# main.py

import os
import math
import re
import logging
import asyncio
import traceback
# import schemas
import numpy as np
import mysql.connector
from geopy.distance import geodesic
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from tensorflow.keras.models import load_model
from typing import List
from contextlib import asynccontextmanager
# from cache import set_cache, get_cache, save_cache_to_file, load_cache_from_file, get_cache_content, clear_cache
# from ncf_model import create_ncf
from openai import AsyncOpenAI
# 절대 경로로 모듈을 가져옴
from app.model_definition import create_ncf
from app import schemas
from app.schemas import PopupStore
from app.cache import set_cache, get_cache, save_cache_to_file, load_cache_from_file, get_cache_content, clear_cache

load_dotenv()
app = FastAPI()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

CACHE_FILE = "cache_data.json"
MODEL_FILE = "ncf_model.keras"

# Docker
DB_CONFIG = {
    'user': 'root',
    'password': '1234',
    'host': 'mysql-container',
    'port': 3306,
    'database': 'popup'
}

#localhost
# DB_CONFIG = {
#     'user': 'root',
#     'password': '0000',
#     'host': 'localhost',
#     'database': 'popup'
# }

# OpenAI API 키 설정(시스템 환경변수에 설정으로 외부에 노출 가능성 하락)
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
async def save_model_periodically(interval: int = 300):
    while True:
        await asyncio.sleep(interval)
        model.save(MODEL_FILE)
        logger.info(f"모델이 파일에 저장되었습니다: {MODEL_FILE}")

# 주기적으로 캐시를 파일에 저장하는 함수
async def save_cache_periodically(interval: int = 300):
    while True:
        await asyncio.sleep(interval)
        save_cache_to_file(CACHE_FILE)

# 주기적으로 팝업 스토어 캐시를 업데이트하는 함수
async def update_popup_stores_cache_periodically(interval: int = 60):
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

# ncf 추천 모델을 위한 거리 계산 가중치 함수
def calculate_distance02(coords1, coords2):
    lat1, lon1 = coords1
    lat2, lon2 = coords2
    return math.sqrt((lat2 - lat1) ** 2 + (lon2 - lon1) ** 2)

# MySQL 데이터베이스에서 팝업 스토어 정보를 가져오는 함수
def fetch_popup_stores_from_db():
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        logger.info(f"데이터베이스 연결 성공: {conn}")
        cursor = conn.cursor(dictionary=True)
        
        query = """
        SELECT ps.id, ps.title, ps.address, ps.mapx, ps.mapy, ps.total_reservation, 
        ps.current_reservation, ps.views, ps.heart_count, 
        GROUP_CONCAT(c.category SEPARATOR ', ') AS categories
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
    
    num_recommendations = 5
    
    try:
        user_id_input = np.array([req.id for req in request])

        # mapx, mapy 값 변환 전 유효성 검증
        mapx_input = [float(req.mapx) for req in request]
        mapy_input = [float(req.mapy) for req in request]

        for i in range(len(mapx_input)):
            if not (100000000 <= mapx_input[i] <= 9999999999) or not (100000000 <= mapy_input[i] <= 9999999999):
                raise HTTPException(status_code=400, detail="Invalid coordinates: raw mapx/mapy values are out of expected range")

        # mapx, mapy 값을 올바르게 변환
        mapx_input = np.array([mx / 10000000.0 for mx in mapx_input])
        mapy_input = np.array([my / 10000000.0 for my in mapy_input])

        if len(user_id_input) != 1:
            raise HTTPException(status_code=400, detail="Request must contain exactly one user id")

        user_coords = (mapy_input[0], mapx_input[0])  # 변환된 위도와 경도

        # 변환된 좌표의 유효성 검사
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
            store_coords = (float(store.mapy) / 10000000.0, float(store.mapx) / 10000000.0)
            distance = calculate_distance(user_coords, store_coords)
            distances.append(distance)

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
    
    num_recommendations = 5
    weight_ncf = 0.2  # NCF 점수의 가중치
    weight_heart = 0.3  # 사용자가 찜한 팝업스토어에 가중치 부여
    weight_distance = 0.25  # 거리 점수의 가중치
    weight_views = 0.2  # 조회 수 가중치
    weight_reserve = 0.15  # 예약 퍼센티지 가중치
    score_scaling_factor = 100  # 점수 스케일링

    try:
        # hearts가 빈 문자열일 경우 빈 리스트로 처리
        for req in request:
            if not req.hearts:
                req.hearts = []

        # 입력 데이터 배열 변환
        user_id_input = np.array([req.id for req in request])
        categories_input = [req.categories for req in request][0]
        selected_categories = set(categories_input.split(', '))
        
        mapx_input = np.array([float(req.mapx) for req in request])
        mapy_input = np.array([float(req.mapy) for req in request])

        # 추가 지표 추출
        hearts = request[0].hearts
        view_count = request[0].view_count

        logger.info(f"사용자 찜 목록: {hearts}")
        logger.info(f"사용자 조회수: {view_count}")

        if len(user_id_input) != 1:
            raise HTTPException(status_code=400, detail="사용자 ID 값은 반드시 하나만 포함되어야 합니다.")

        # 캐시에서 팝업 스토어 데이터 로드
        popup_stores_data = get_cache("popup_stores")
        if popup_stores_data:
            popup_stores = [schemas.PopupStore(**store) for store in popup_stores_data]
            logger.info(f"캐시에서 팝업 스토어 데이터 로드 완료: {popup_stores}")
        else:
            popup_stores = fetch_popup_stores_from_db()
            if not popup_stores:
                raise HTTPException(status_code=500, detail="팝업 스토어 데이터를 로드하지 못했습니다.")
            set_cache("popup_stores", [store.dict() for store in popup_stores])
            logger.info(f"데이터베이스에서 팝업 스토어 데이터 로드 및 캐시 저장 완료: {popup_stores}")

        # 팝업 스토어 필터링: 사용자 선택 카테고리와 일치하는 팝업 스토어만 포함
        filtered_popup_stores = [store for store in popup_stores if selected_categories.intersection(set(store.categories.split(', ')))]

        if not filtered_popup_stores:
            logger.warning("선택한 카테고리에 해당하는 팝업 스토어가 없습니다.")
            raise HTTPException(status_code=404, detail="선택한 카테고리에 해당하는 팝업 스토어가 없습니다.")

        logger.info(f"카테고리와 일치하는 팝업 스토어 목록: {[store.id for store in filtered_popup_stores]}")

        # NCF 모델 예측 수행
        item_ids_input = np.array([store.id for store in filtered_popup_stores])
        predictions = model.predict([user_id_input.repeat(len(filtered_popup_stores)), item_ids_input])
        predictions = np.round(predictions.flatten(), 5)
        logger.info(f"NCF 모델 예측 완료: {predictions}")

        # 최종 점수 계산
        final_scores = []
        user_coords = (mapy_input[0] / 10000000.0, mapx_input[0] / 10000000.0)

        for idx, store in enumerate(filtered_popup_stores):
            store_coords = (float(store.mapy) / 10000000.0, float(store.mapx) / 10000000.0)
            distance = calculate_distance02(user_coords, store_coords)
            distance_score = 1 / (1 + distance)

            reserve_score = request[0].reserve_percent / 100.0 if store.id == request[0].id else 0.0
            heart_score = 1 if store.id in hearts else 0
            views_score = view_count

            # 로그 기록
            logger.info(f"스토어 ID: {store.id}")
            logger.info(f"거리 점수 계산: {distance_score}")
            logger.info(f"예약률 계산: {reserve_score}")
            logger.info(f"찜 점수(heart_score): {heart_score}")
            logger.info(f"조회수 점수(views_score): {views_score}")
            logger.info(f"NCF 예측 점수: {predictions[idx]}\n")

            # 스케일링 팩터를 포함한 최종 점수 계산
            final_score = (weight_ncf * predictions[idx] + weight_distance * distance_score +
                           weight_heart * heart_score + weight_views * views_score +
                           weight_reserve * reserve_score) * score_scaling_factor

            final_scores.append((store.id, float(final_score)))
            logger.info(f"스토어 {store.id}의 최종 점수: {float(final_score)}")

        # 최종 점수로 정렬
        final_scores.sort(key=lambda x: x[1], reverse=True)
        logger.info(f"정렬된 최종 점수 목록: {final_scores}")

        ncf_recommendations = [schemas.NfcRecommendation(id=store_id) for store_id, _ in final_scores[:num_recommendations]]
        logger.info(f"최종 추천 목록: {ncf_recommendations}")

        return ncf_recommendations
    except HTTPException as e:
        logger.error(f"HTTP 예외 발생: {str(e)}")
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
            f"당신은 카테고리 선정 어시스턴트입니다. 당신의 임무는 전달 받은 팝업스토어의 title, 그리고 description의 읽어서 선정 해주세요.\n"
            "다음 목록에서 적합한 카테고리들을 최대 3개 선정하는 것입니다: \n"
            f"{category_prompt}.\n\n"
            f"중복 응답을 자제 해주세요. 여기 세부 정보가 있습니다:\n"
            f"제목: {request.title}\n"
            f"설명: {request.description}\n"
)
        
            response = await client.completions.create(
                model="ft:davinci-002:category:category-final-v1-3:AAzvvJBy",
                prompt=detailed_prompt,
                max_tokens=15,
                temperature=0.25,
                top_p=0.5,
                frequency_penalty=0.15,
                presence_penalty=0.15,
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
    "음료", "문구", "생활용품", "스포츠", "게임", "전자제품", "인물", "건강/웰빙", "자동차", 
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