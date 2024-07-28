1. docker 실행 방법
  - 도커 실행
  - 프로젝트 directory(docker-compose.yml가 있는)에서 docker-compose up (cmd, terminal)
  - 실행 시 spring boot가 에러나면 docker desktop에서 popupstore-container만 재실행

2. MySql
  - workbench에서 db 연결 시 : port 3307, pwd : 1234, root
  - Terminal, Cmd 연결 시 :
    1. docker exec -it mysql-container /bin/bash
    2. bash-5.1# --> mysql -u root p
    3. password : 1234

3. category 자동 insert 되므로 따로 저장 안해도됨.

----------
v 1.01
