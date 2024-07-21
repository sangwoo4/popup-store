from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from openai import AsyncOpenAI
# from data import data03, validation_data03
import os
import logging
import re
from typing import List
import json

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# OpenAI API 키 설정(시스템 환경변수에 설정으로 외부에 노출 가능성 하락)
auto_category_key = os.environ.get("AUTO_CATEGORY_KEY")
if not auto_category_key:
    raise ValueError("API 키가 설정되지 않았습니다.")

# OpenAI 클라이언트 설정
client = AsyncOpenAI(
    api_key=auto_category_key,
    organization="org-QigtX2MxI0U14ilnGQQSbGHy"
)

# FastAPI 애플리케이션 생성
app = FastAPI()

class ChatRequest1(BaseModel):
    title: str
    link: str
    category: str
    description: str
    telephone: str
    address: str
    roadAddress: str
    mapx: str
    mapy: str

class ChatRequest2(BaseModel):
    title: str
    description: str
    categories: str

class Category(BaseModel):
    category: str

class ChatResponse1(BaseModel):
    title: str
    link: str
    description: str
    telephone: str
    address: str
    roadAddress: str
    mapx: str
    mapy: str
    categories: List[Category]

class ChatResponse2(BaseModel):
    categories: List[Category]

#     # 카테고리 목록 확인
# def adjust_category(data):
#     for item in data:
#         if 'category' in item:
#             item['category'] = [cat for cat in item['category'] if cat in CATEGORY_LIST]
#     return data

# # 카테고리 조정
# training_data_adjusted = adjust_category(data03)
# validation_data_adjusted = adjust_category(validation_data03)

# # 파일 저장
# with open('/mnt/data/data03_adjusted.jsonl', 'w', encoding='utf-8') as file:
#     for item in training_data_adjusted:
#         file.write(json.dumps(item) + '\n')

# with open('/mnt/data/validation_data03_adjusted.jsonl', 'w', encoding='utf-8') as file:
#     for item in validation_data_adjusted:
#         file.write(json.dumps(item) + '\n')

# print("Adjusted Training Data Sample:", training_data_adjusted[:2])
# print("Adjusted Validation Data Sample:", validation_data_adjusted[:2])

# 지정된 카테고리 목록
CATEGORY_LIST = [
    "화장품", "캐릭터", "도서/음반", "패션", "인테리어", "전시/체험",
    "향수", "음식", "음료", "장난감", "문구", "가정", "생활용품", "기타행사"
]

# 보호된 카테고리 목록
PROTECTED_CATEGORIES = ["전시/체험", "도서/음반"]

# 보호된 카테고리를 처리하는 함수
def protect_categories(text):
    for category in PROTECTED_CATEGORIES:
        protected = category.replace('/', '|')
        text = text.replace(category, protected)
    return text

# 보호된 카테고리를 복원하는 함수
def restore_categories(text):
    for category in PROTECTED_CATEGORIES:
        protected = category.replace('/', '|')
        text = text.replace(protected, category)
    return text

@app.get("/")
async def read_root():
    return {"message": "FastAPI 서버가 실행 중입니다\n"}

@app.get("/favicon.ico")
async def get_favicon():
    return {"message": "Favicon 요청됨\n"}

# 첫 번째 기능 엔드포인트
@app.post("/navercategory", response_model=List[ChatResponse1])
async def chat(requests: List[ChatRequest1]):
    responses = []
    for request in requests:
        try:
            logger.info(f"요청받음 1: {request}")

            category_prompt = ", ".join(CATEGORY_LIST)
            detailed_prompt = (
            "당신은 분류 어시스턴트입니다. 당신의 임무는 이벤트나 제품의 제목과 카테고리를 읽고, "
            "다음 목록에서 가장 적합한 카테고리를 선택하는 것입니다: "
            f"{category_prompt}.\n\n"
            "가능한 한 정확하게 선택해 주세요. 여기 세부 정보가 있습니다:\n"
            f"제목: {request.title}\n"
            f"카테고리: {request.category}\n"
            "카테고리:"
        )
            # OpenAI Fine-Tuning Model 호출
            response = await client.completions.create(
                model="ft:davinci-002:personal:category-v2-4-1:9mNrnUO8",
                prompt=detailed_prompt,
                max_tokens=75,
                temperature=0.25,
                top_p=0.5,
                frequency_penalty=1.75,
                presence_penalty=1.5,
            )

            # 응답 출력
            text_response = response.choices[0].text.strip()
            logger.info(f"OpenAI로부터 받은 원시 응답: {text_response}")

            # 응답이 없는 경우 예외 처리
            if not text_response:
                raise HTTPException(status_code=500, detail="OpenAI로부터 응답이 없습니다")

            # 보호된 카테고리를 처리
            protected_text = protect_categories(text_response)
            
            # 응답 텍스트를 슬래시('/'), 쉼표(','), 공백(' ')로 구분하여 단어로 나눔
            categories = [category.strip() for category in re.split(r'[/, ]+', protected_text) if category.strip()]
            
            # 보호된 카테고리를 원래대로 복원
            categories = [restore_categories(category) for category in categories]
            logger.info(f"응답에서 추출한 카테고리: {categories}")
            
            # 지정된 카테고리 목록과 정확히 일치하는 항목만 필터링 및 중복 제거
            matched_categories = list(set(category for category in categories if category in CATEGORY_LIST))
            logger.info(f"일치하는 카테고리: {matched_categories}")
            
            # 최소 1개에서 최대 3개까지 선택
            if len(matched_categories) < 1:
                raise HTTPException(status_code=500, detail="일치하는 카테고리를 찾을 수 없습니다")
            
            # 최종 카테고리 응답 생성
            categories_response = [Category(category=category) for category in matched_categories[:3]]
            logger.info(f"최종 카테고리 응답: {categories_response}")

            # 응답 데이터 구성
            chat_response = ChatResponse1(
                title=request.title,
                link=request.link,
                description=request.description,
                telephone=request.telephone,
                address=request.address,
                roadAddress=request.roadAddress,
                mapx=request.mapx,
                mapy=request.mapy,
                categories=categories_response
            )
            responses.append(chat_response)
        
        # 각 요청에 대한 예외를 개별적으로 처리
        except Exception as e:
            logger.error(f"오류 발생: {e}")
            responses.append(ChatResponse1(
                title=request.title,
                link=request.link,
                description=request.description,
                telephone=request.telephone,
                address=request.address,
                roadAddress=request.roadAddress,
                mapx=request.mapx,
                mapy=request.mapy,
                categories=[Category(category="기타행사")]  # NULL 값이면 기타행사로 카테고리 처리
            ))
    
    return responses

# 두 번째 기능 엔드포인트
@app.post("/categorize", response_model=ChatResponse2)
async def categorize(request: ChatRequest2):
    try:
        logger.info(f"요청 받음 2: {request}")

        category_prompt = ", ".join(CATEGORY_LIST)
        detailed_prompt = (
            "당신은 분류 어시스턴트입니다. 당신의 임무는 이벤트나 제품의 제목과 설명을 읽고, "
            "다음 목록에서 가장 적합한 카테고리를 선택하는 것입니다: "
            f"{category_prompt}.\n\n"
            "가능한 한 정확하게 선택해 주세요. 여기 세부 정보가 있습니다:\n"
            f"제목: {request.title}\n"
            f"설명: {request.description}\n"
            "카테고리:"
        )
        # OpenAI Fine-Tuning Model 호출
        response = await client.completions.create(
            model="ft:davinci-002:personal:category-v2-3-6-1:9n7eRo9E",
            prompt=detailed_prompt,
            max_tokens=25,
            temperature=0.25,
            top_p=0.5,
            frequency_penalty=1.0,
            presence_penalty=0.5,
        )

        # 응답 출력
        text_response = response.choices[0].text.strip()
        logger.info(f"OpenAI로부터 받은 원시 응답 2: {text_response}")

        # 응답이 없는 경우 예외 처리
        if not text_response:
            raise HTTPException(status_code=500, detail="OpenAI로부터 응답이 없습니다 2")

        # 보호된 카테고리를 처리
        protected_text = protect_categories(text_response)
            
        # 응답 텍스트를 슬래시('/'), 쉼표(','), 공백(' ')로 구분하여 단어로 나눔
        categories = [category.strip() for category in re.split(r'[/, ]+', protected_text) if category.strip()]
            
        # 보호된 카테고리를 원래대로 복원
        categories = [restore_categories(category) for category in categories]
        logger.info(f"응답에서 추출한 카테고리 2: {categories}")
            
        # 지정된 카테고리 목록과 정확히 일치하는 항목만 필터링 및 중복 제거
        matched_categories = list(set(category for category in categories if category in CATEGORY_LIST))
        logger.info(f"일치하는 카테고리 2: {matched_categories}")
            
        # 최소 1개에서 최대 3개까지 선택
        if len(matched_categories) < 1:
            matched_categories = ["기타행사"]  # 매칭되는 카테고리가 없을 경우 "기타행사"로 설정
            logger.info("일치하는 카테고리를 찾을 수 없어 '기타행사'로 설정")
            
        # 최종 카테고리 응답 생성
        categories_response = [Category(category=category) for category in matched_categories[:3]]
        logger.info(f"최종 카테고리 응답 2: {categories_response}")

        return {"categories": categories_response}
    
    except Exception as e:
        logger.error(f"오류 발생: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
# uvicorn으로 어플리케이션 실행    
if __name__ == "__main__": 
    import uvicorn 
    uvicorn.run(app, host="localhost", port=8000)
