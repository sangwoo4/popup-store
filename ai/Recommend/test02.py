from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from openai import AsyncOpenAI
import os
import logging
import re
from typing import List

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# OpenAI API 키 설정
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

# 요청 및 응답 모델 정의
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
    return {"message": "FastAPI server is running"}

@app.get("/favicon.ico")
async def get_favicon():
    return {"message": "Favicon requested"}

@app.post("/navercategory", response_model=List[ChatResponse1])
async def chat(requests: List[ChatRequest1]):
    responses = []
    for request in requests:
        try:
            logger.info(f"Received request: title={request.title}\nlink={request.link}\ncategory={request.category}\ndescription={request.description}\ntelephone={request.telephone}\naddress={request.address}\nroadAddress={request.roadAddress}\nmapx={request.mapx}\nmapy={request.mapy}\n")

            response = await client.completions.create(
                model="ft:davinci-002:personal:category-v2-4-1:9mNrnUO8",
                prompt=f"title: {request.title}\ncategory: {request.category}",
                max_tokens=50,
                temperature=0.5,
                top_p=1.0,
                frequency_penalty=1.75,
                presence_penalty=1.5,
            )

            text_response = response.choices[0].text.strip()
            logger.info(f"Raw response from OpenAI: {text_response}")

            if not text_response:
                raise HTTPException(status_code=500, detail="Empty response from OpenAI")

            protected_text = protect_categories(text_response)
            categories = [category.strip() for category in re.split(r'[/, ]+', protected_text) if category.strip()]
            categories = [restore_categories(category) for category in categories]
            logger.info(f"Extracted categories from response: {categories}")
            
            matched_categories = list(set(category for category in categories if category in CATEGORY_LIST))
            logger.info(f"Matched categories: {matched_categories}")
            
            if len(matched_categories) < 1:
                raise HTTPException(status_code=500, detail="No matching categories found")
            
            categories_response = [Category(category=category) for category in matched_categories[:3]]
            logger.info(f"Final categories response: {categories_response}")

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
        
        except Exception as e:
            logger.error(f"Error occurred: {e}")
            responses.append(ChatResponse1(
                title=request.title,
                link=request.link,
                description=request.description,
                telephone=request.telephone,
                address=request.address,
                roadAddress=request.roadAddress,
                mapx=request.mapx,
                mapy=request.mapy,
                categories=[Category(category="기타행사")]
            ))
    
    return responses

@app.post("/categorize", response_model=ChatResponse2)
async def categorize(request: ChatRequest2):
    try:
        logger.info(f"Received request2: title={request.title}, description={request.description}")

        response = await client.completions.create(
            model="ft:davinci-002:personal:category-v2-3-5-2:9m0Ycily",
            prompt=f"제목: {request.title} 설명: {request.description}",
            max_tokens=35,
            temperature=0.25,
            top_p=0.5,
            frequency_penalty=2.0,
            presence_penalty=1.5,
        )

        text_response = response.choices[0].text.strip()
        logger.info(f"Raw response from OpenAI2: {text_response}")

        if not text_response:
            raise HTTPException(status_code=500, detail="Empty response from OpenAI")

        protected_text = protect_categories(text_response)
        categories = [category.strip() for category in re.split(r'[/, ]+', protected_text) if category.strip()]
        categories = [restore_categories(category) for category in categories]
        logger.info(f"Extracted categories from response2: {categories}")
        
        matched_categories = list(set(category for category in categories if category in CATEGORY_LIST))
        logger.info(f"Matched categories: {matched_categories}")
        
        if len(matched_categories) < 1:
            matched_categories = ["기타행사"]
            logger.info("No matching categories found, setting to '기타행사'")
        
        categories_response = [Category(category=category) for category in matched_categories[:3]]
        logger.info(f"Final categories response2: {categories_response}")

        return {"categories": categories_response}
    
    except Exception as e:
        logger.error(f"Error occurred: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000)
