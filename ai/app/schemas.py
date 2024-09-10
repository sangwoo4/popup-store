from pydantic import BaseModel, RootModel, Field
from typing import List

# 카테고리 요청 스키마
class CategoryRequest(BaseModel):
    id: int
    categories: str
    mapx: str
    mapy: str
    # heart_count: int  # 좋아요 수
    # share_count: int  # 공유 수
    # view_count: int  # 조회 수
    # reserve_percent: float  # 예약 수 퍼센티지 (0.0 ~ 100.0)
# 거리 요청 스키마
class DistanceRequest(BaseModel):
    id: int
    mapx: str
    mapy: str

# 팝업 스토어 스키마
class PopupStore(BaseModel):
    id: int
    title: str
    address: str
    mapx: str
    mapy: str
    categories: str
    # heart_count: int
    # views: int
    # share: int
    # reservation: int

# 추천 응답 아이템 스키마
class RecommendResponseItem(BaseModel):
    id: int
    distance: float

class NfcRecommendation(BaseModel):
    id: int

# NCF 추천 응답 스키마
class NfcResponse(RootModel[List[NfcRecommendation]]):
    pass

# 거리 추천 응답 스키마
class DistanceResponse(RootModel[List[RecommendResponseItem]]):
    pass

# Category 관련 스키마
class Category(BaseModel):
    category: str = Field(default="")

class ChatRequest(BaseModel):
    title: str = Field(default="")
    description: str = Field(default="")
    category: str = Field(default="")
    categories: str = Field(default="")

class ChatResponse(BaseModel):
    categories: List[Category]