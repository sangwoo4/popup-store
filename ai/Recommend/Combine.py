from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from openai import AsyncOpenAI
import os
import logging
import re
from typing import List
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# OpenAI API 키 설정(시스템 환경변수에 설정으로 외부에 노출 가능성 하락)
auto_category_key = os.getenv("AUTO_CATEGORY_KEY")
if not auto_category_key:
    raise ValueError("API 키가 설정되지 않았습니다.")

# OpenAI 클라이언트 설정
client = AsyncOpenAI(
    api_key=auto_category_key,
    organization="org-QigtX2MxI0U14ilnGQQSbGHy"
)

# FastAPI 애플리케이션 생성
app = FastAPI()

class Category(BaseModel):
    category: str = Field(default="")

class ChatRequest(BaseModel):
    title: str = Field(default="")
    category: str = Field(default="")
    description: str = Field(default="")
    categories: str = Field(default="")

class ChatResponse(BaseModel):
    title: str
    description: str
    categories: List[Category]


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
@app.post("/navercategory", response_model=List[ChatResponse])
async def chat(requests: List[ChatRequest]):
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
            f"설명: {request.description}\n"
            f"카테고리: {request.category}\n"
            "카테고리: "
        )
            # OpenAI Fine-Tuning Model 호출
            response = await client.completions.create(
                model="ft:davinci-002:personal:category-v2-3-7-3:9nhL7U1c",
                prompt=detailed_prompt,
                max_tokens=25,
                temperature=0.5,
                top_p=0.5,
                frequency_penalty=1.0,
                presence_penalty=0.5,
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
            chat_response = ChatResponse(
                title= request.title,
                description= request.description,
                categories=categories_response
            )
            responses.append(chat_response)
        
        # 각 요청에 대한 예외를 개별적으로 처리
        except Exception as e:
            logger.error(f"오류 발생: {e}")
            responses.append(ChatResponse(
                title= request.title,
                description= request.description,
                categories=[Category(category="기타행사")],  # NULL 값이면 기타행사로 카테고리 처리
            ))
    
    return responses

@app.post("/categorize", response_model=List[ChatResponse])
async def chat(requests: List[ChatRequest]):
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
            f"설명: {request.description}\n"
            f"카테고리: {request.categories}\n"
            "카테고리: "
        )
            # OpenAI Fine-Tuning Model 호출
            response = await client.completions.create(
                model="ft:davinci-002:personal:category-v2-3-7-3:9nhL7U1c",
                prompt=detailed_prompt,
                max_tokens=25,
                temperature=0.5,
                top_p=0.5,
                frequency_penalty=1.0,
                presence_penalty=0.5,
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
            chat_response = ChatResponse(
                title= request.title,
                description= request.description,
                categories=categories_response
            )
            responses.append(chat_response)
        
        # 각 요청에 대한 예외를 개별적으로 처리
        except Exception as e:
            logger.error(f"오류 발생: {e}")
            responses.append(ChatResponse(
                title= request.title,
                description= request.description,
                categories=[Category(category="기타행사")],  # NULL 값이면 기타행사로 카테고리 처리
            ))
    
    return responses
    
# uvicorn으로 어플리케이션 실행    
if __name__ == "__main__": 
    import uvicorn 
    uvicorn.run(app, host="localhost", port=8000)