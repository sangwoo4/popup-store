from pydantic import BaseModel, RootModel, Field, validator
from typing import List, Optional

# 카테고리 요청 스키마
class CategoryRequest(BaseModel):
    id: int
    categories: str
    mapx: str
    mapy: str
    hearts: Optional[List[int]] = Field(default_factory=list)
    view_count: Optional[int] = 0
    reserve_percent: Optional[float] = 0

    # hearts 필드가 빈 문자열일 경우 빈 리스트로 변환하는 validator
    @validator('hearts', pre=True, always=True)
    def check_hearts(cls, v):
        if v == "" or v is None:
            return []
        return v
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
    views: int
    total_reservation: Optional[float]
    current_reservation: Optional[float]

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