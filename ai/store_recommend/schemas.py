# schemas.py
from pydantic import BaseModel
from typing import List

# 카테고리 스키마
class Category(BaseModel):
    id: int
    category: str

    class Config:
        from_attributes = True

# 팝업 스토어 스키마
class PopupStore(BaseModel):
    id: int
    title: str
    address: str
    mapx: float
    mapy: float
    categories: str  # 문자열로 변경되었습니다.

    class Config:
        from_attributes = True

# 사용자 스키마
class User(BaseModel):
    id: int
    mapx: float
    mapy: float
    preferred_categories: str  # 문자열로 변경되었습니다.

    class Config:
        from_attributes = True

# 추천 요청 스키마
class RecommendRequest(BaseModel):
    user: User
    popup_stores: List[PopupStore]
    num_recommendations: int = 3

# 추천 응답 아이템 스키마
class RecommendResponseItem(BaseModel):
    id: int
    distance: float

class NfcRecommendation(BaseModel):
    id: int

# 추천 응답 스키마
class RecommendResponse(BaseModel):
    ncf_recommendations: List[NfcRecommendation]
    distance_recommendations: List[RecommendResponseItem]