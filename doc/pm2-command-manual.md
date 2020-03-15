# Quick Command
**서버실행**

    일반 실행
    $ pm2 start main.js --name main

    개발자 테스트 실행
    $ pm2 start main.js --name main --watch --ignore-watch="data/*"


**서버중지**

    $ pm2 stop main.js


**서버삭제**

    $ pm2 delete main.js


**서버로그 실시간 확인**

    $ pm2 log

    또는

    $ pm2 monit


**서버로그에서 나오기**
    
    각 Bash/Terminal에서의 Break Signal로 exit
    $ (In general) Ctrl + C



# 세부 Command Manual
- main.js 앱 프로세스 시작

      $ pm2 start main.js

    - `--watch` : 파일 변경 감시 활성화, 변경시 자동 reload
    - `--ignore-watch="~"` : 특정 디렉토리에 대한 watch중단
    - `--no-daemon` : pm2실행과 동시에 로그도 출력
    - `--name <app_name>` : 앱 프로세스의 이름 지정
    - `--time` : 로그에 시간도 함께 표시
    - `-i` : 클러스트 모드로 시작


- main.js 재시작/reload

      $ pm2 restart main.js


- main.js 중지(일시중지)

      $ pm2 stop main.js


- main.js 삭제

      $ pm2 delete main.js
    

- 모든 프로세스 중지/삭제

      $ pm2 kill


- pm2에서 실행중인 모든 앱 프로세스 정보 리스트 조회

      $ pm2 list
      $ pm2 ls
      $ pm2 status


- pm2에서 main.js 앱과 프로세스 정보 출력

      $ pm2 show main


- 실시간 로그 출력

      $ pm2 log


- 터미널 환경에서의 실시간 대시보드 열기

      $ pm2 monit

## 참조
[이외 구체적인 command 및 출처](https://pm2.keymetrics.io/docs/usage/quick-start/)