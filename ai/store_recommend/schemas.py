from pydantic import BaseModel, RootModel
from typing import List

# 카테고리 요청 스키마
class CategoryRequest(BaseModel):
    id: int
    categories: str

# 거리 요청 스키마
class DistanceRequest(BaseModel):
    id: int
    mapx: float
    mapy: float

# 팝업 스토어 스키마
class PopupStore(BaseModel):
    id: int
    title: str
    address: str
    mapx: float
    mapy: float
    categories: str

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
