# cache.py
import gzip
import json
from cachetools import LRUCache
from typing import Any
import logging
import os

# 최대 1000개의 아이템을 저장할 수 있는 LRUCache 생성
cache = LRUCache(maxsize=500)

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
    cache_size = len(compressed_value)  # 캐시 데이터의 용량 계산
    logger.info(f"캐시 설정: {key}, 크기: {cache_size} bytes")

# 캐시를 파일에 저장하는 함수
def save_cache_to_file(file_path: str):
    with open(file_path, 'wb') as f:
        # 캐시 데이터를 디코딩하여 저장
        cache_data = {k: json.loads(gzip.decompress(v).decode()) for k, v in cache.items()}
        compressed_data = gzip.compress(json.dumps(cache_data).encode())
        f.write(compressed_data)
        logger.info(f"캐시를 파일에 저장: {file_path}, 크기: {len(compressed_data)} bytes")


# 캐시에서 값을 가져오는 함수
def get_cache(key: str):
    compressed_value = cache.get(key)
    if compressed_value:
        logger.info(f"캐시 히트: {key}")
        # 직렬화된 JSON 문자열을 해제
        return json.loads(gzip.decompress(compressed_value).decode())
    logger.info(f"캐시 미스: {key}")
    return None

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

        # 캐시 데이터 크기 계산
        total_cache_size = sum(len(v) for v in cache.values())
        remaining_space = calculate_remaining_space()  # 남은 공간 계산

        logger.info(f"캐시 내용을 가져오는 중, 총 캐시 크기: {total_cache_size} bytes")

        # 크기와 남은 공간을 포함한 캐시 데이터 반환
        return json.dumps({
            "cache_content": formatted_cache_data,
            "cache_size": f"{total_cache_size} bytes",
            "remaining_space": remaining_space
        }, ensure_ascii=False, indent=2)
    except Exception as e:
        logger.error(f"캐시 내용을 가져오는 중 오류 발생: {str(e)}")
        return "캐시 내용을 가져오는 중 오류 발생"

# 캐시를 비우는 함수
def clear_cache():
    cache.clear()
    logger.info("캐시가 비워졌습니다.")

    # 캐시의 남은 저장 공간 계산 함수
def calculate_remaining_space() -> str:
    total_cache_size = sum(len(v) for v in cache.values())  # 현재 저장된 캐시 데이터의 총 크기
    remaining_items = cache.maxsize - len(cache)  # 최대 저장 가능한 항목 수에서 현재 항목 수를 뺀 값
    logger.info(f"현재 캐시 크기: {total_cache_size} bytes, 남은 항목 수: {remaining_items}")
    return f"현재 캐시 크기: {total_cache_size} bytes, 남은 항목 수: {remaining_items}"