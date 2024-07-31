# FastAPI, OpenAI API를 사용한 AI 카테고리 자동 분류

이 프로젝트는 FastAPI를 사용하여 OpenAI API를 호출하고 카테고리를 분류하는 코드

# 0. 파이썬 설치

# 1. 리포지토리 클론

# bash
### -- 클론 --
### git clone https://github.com/sangwoo4/popup-store.git

# -- 브랜치 체크아웃 --
### git fetch origin
### git checkout 25-backend-ai-category

# 2 설치 및 실행 방법

# 1. 가상 환경 설치/ 실행
### python -m venv myenv       - 반드시 ai 폴더 안에 생성
### myenv\Scripts\activate     - Windows
### source myenv/bin/activate  - MAC

# 실행 방법
### source myenv/bin/activate         #MAC
### myenv\Scripts\activate   #Windows


# 2. 라이브러리 설치
### !! 무조건 가상환경을 실행시키고 진행 !!
### pip install -r Recommend/requirements.txt

# 2-1. 위 명령어가 실행되지 않을 경우
### !! 무조건 가상환경을 실행시키고 진행 !!
### pip install fastapi
### pip install pydantic
### pip install openai
### pip install uvicorn
### pip install python-dotenv

# 3. AI 소스코드 실행 1
### uvicorn Recommend.Combine:app --reload

# 3-1. AI 소스코드 실행 방법 2
### cd Recommend
### uvicorn Combine:app --reload

# 4. 기타 예상 애로사항

# -- API KEY 부재--
### 시스템 환경변수에 키 설정

# -- openAI API 업데이트 --
### !! 무조건 가상환경을 실행시키고 진행 !!
### pip install --upgrade openai

# -- python 업데이트--
### !! 무조건 가상환경을 실행시키고 진행 !!
### pip install --upgrade python

# -- 인터프리터 설정 --
### 1. Ctrl + Shift + P  - Windows 
### 1. Cmd + Shift + P   - Mac

### 2. Python: Select InterPreter 클릭

### 3. .\ai\myenv\Scripts\python.exe  - Windows
### 3. ./ai/myenv/bin/python          - Mac

### 4. 만약에 3번이 안보인다? 파이썬부터 2번 라이브러리부터 진행

# 5. vscode/setting.json 파일에서 설정 추가
# -- Windows --
### {
###     "python.pythonPath": "./ai/myenv/bin/python",
###     "python.envFile": "${workspaceFolder}/ai/.env"
### }

# -- Mac --
### {
###     "python.pythonPath": "./ai/myenv/bin/python",
###     "python.envFile": "${workspaceFolder}/ai/.env"
### }

# 변경사항
1. 24/07/23 dotenv 라이브러리 추가, StoreDays 추가
2. 24/07/26 API 하나로 통합, 학습 모델 변경
3. 24/07/29 최신 버전: category-v2-3-7-10:9qBNO9eN
4. 24/07/30 New 폴더 생성: store_recommend(ai 추천 팝업)