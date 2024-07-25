# 알고리즘으로 유사 단어를 선정
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from openai import AsyncOpenAI
import os
import logging
import re

# 로그 기록(AI 상세 작동 파악)
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

# 클라이언트가 AI에게 전달하는 객체
class ChatRequest(BaseModel):
    title: str
    description: str

# 카테고리 이름 모델
class Category(BaseModel):
    category: str

# AI 응답 모델
class ChatResponse(BaseModel):
    categories: list[Category]

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

# API 엔드 포인트
@app.post("/categorize",  response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        logger.info(f"Received request: title={request.title}, description={request.description}")

        # OpenAI Fine-Tuning Model 호출
        response = await client.completions.create(
        model="ft:davinci-002:personal:category-v2-3-6:9mjavkxa",
        prompt=f"title: {request.title}\ndescription: {request.description}",
        max_tokens=45,
        temperature=0.5,
        top_p=0.75,
        frequency_penalty=1.5,
        presence_penalty=1.5,
        )
         # 응답 출력
        text_response = response.choices[0].text.strip()
        logger.info(f"Raw response from OpenAI: {text_response}")

        # 응답이 없는 경우 예외 처리
        if not text_response:
            raise HTTPException(status_code=500, detail="Empty response from OpenAI")

        # 보호된 카테고리를 처리
        protected_text = protect_categories(text_response)
            
        # 응답 텍스트를 슬래시('/'), 쉼표(','), 공백(' ')로 구분하여 단어로 나눔
        categories = [category.strip() for category in re.split(r'[/, ]+', protected_text) if category.strip()]
            
        # 보호된 카테고리를 원래대로 복원
        categories = [restore_categories(category) for category in categories]
        logger.info(f"Extracted categories from response: {categories}")
            
        # 지정된 카테고리 목록과 정확히 일치하는 항목만 필터링 및 중복 제거
        matched_categories = list(set(category for category in categories if category in CATEGORY_LIST))
        logger.info(f"Matched categories: {matched_categories}")
            
        # 최소 1개에서 최대 3개까지 선택
        if len(matched_categories) < 1:
            matched_categories = ["기타행사"]  # 매칭되는 카테고리가 없을 경우 "기타행사"로 설정
            logger.info("No matching categories found, setting to '기타행사'")
            
        # 최종 카테고리 응답 생성
        categories_response = [{"category": category} for category in matched_categories[:3]]
        logger.info(f"Final categories response: {categories_response}")

        return {"categories": categories_response}
    # 예외처리
    except Exception as e:
        logger.error(f"Error occurred: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# uvicorn으로 어플리케이션 실행
if __name__ == "__main__": 
    import uvicorn 
    uvicorn.run(app, host="localhost", port=8000)