# cache.py
import gzip
import json
from cachetools import LRUCache
from typing import Any
import logging
import os

# 최대 1000개의 아이템을 저장할 수 있는 LRUCache 생성
cache = LRUCache(maxsize=1000)

# 로거 설정
logger = logging.getLogger('cache')
logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
# formatter = logging.Formatter('%(asctime)s - %(name)s - %(levellevel)s - %(message)s')
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)

# 캐시에 값을 설정하는 함수
def set_cache(key: str, value: Any):
    # 값을 JSON으로 직렬화하고 압축
    compressed_value = gzip.compress(json.dumps(value, default=lambda o: o.dict()).encode())
    cache[key] = compressed_value
    logger.info(f"캐시 설정: {key}")

# 캐시에서 값을 가져오는 함수
def get_cache(key: str):
    compressed_value = cache.get(key)
    if compressed_value:
        logger.info(f"캐시 히트: {key}")
        # 직렬화된 JSON 문자열을 해제
        return json.loads(gzip.decompress(compressed_value).decode())
    logger.info(f"캐시 미스: {key}")
    return None

# 캐시를 파일에 저장하는 함수
def save_cache_to_file(file_path: str):
    with open(file_path, 'wb') as f:
        # 캐시 데이터를 디코딩하여 저장
        cache_data = {k: json.loads(gzip.decompress(v).decode()) for k, v in cache.items()}
        f.write(gzip.compress(json.dumps(cache_data).encode()))
    logger.info(f"캐시를 파일에 저장: {file_path}")

# 파일에서 캐시를 로드하는 함수
def load_cache_from_file(file_path: str):
    if os.path.exists(file_path):
        try:
            with open(file_path, 'rb') as f:
                compressed_cache = f.read()
                if compressed_cache:
                    cache_data = json.loads(gzip.decompress(compressed_cache).decode())
                    for k, v in cache_data.items():
                        cache[k] = gzip.compress(json.dumps(v).encode())
                    logger.info(f"파일에서 캐시 로드: {file_path}")
                else:
                    logger.warning(f"캐시 파일이 비어 있습니다: {file_path}")
        except Exception as e:
            logger.error(f"캐시 파일 로드 중 오류 발생: {str(e)}")
    else:
        logger.warning(f"캐시 파일이 존재하지 않습니다: {file_path}")

# 캐시 내용을 가져오는 함수
def get_cache_content() -> str:
    try:
        # 캐시 데이터 JSON 디코딩
        cache_data = {k: json.loads(gzip.decompress(v).decode()) for k, v in cache.items()}
        # 캐시 데이터를 보기 좋게 정렬하여 반환
        formatted_cache_data = json.dumps(cache_data, indent=2, ensure_ascii=False)
        logger.info(f"캐시 내용을 가져오는 중: {formatted_cache_data}")
        return formatted_cache_data
    except Exception as e:
        logger.error(f"캐시 내용을 가져오는 중 오류 발생: {str(e)}")
        return "캐시 내용을 가져오는 중 오류 발생"

# 캐시를 비우는 함수
def clear_cache():
    cache.clear()
    logger.info("캐시가 비워졌습니다.")
