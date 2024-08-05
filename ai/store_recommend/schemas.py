from pydantic import BaseModel, RootModel
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
class UserDistance(BaseModel):
    id: int
    mapx: float
    mapy: float

    class Config:
        from_attributes = True

# 사용자 스키마
class UserCategory(BaseModel):
    id: int
    categories: str  # 문자열로 변경되었습니다.

    class Config:
        from_attributes = True

# 거리 요청 스키마
class DistanceRequest(BaseModel):
    user: UserDistance

# 카테고리 요청 스키마
class CategoryRequest(BaseModel):
    user: UserCategory

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