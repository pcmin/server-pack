# Server-Pack
###### v0.2.1

# 서버 실행방법

1. **서버 기본플랫폼 설치**

    Node.js를 설치해줍니다.
    
    Node.js 다운로드 주소: > https://nodejs.org/ko/download/
    
    설치하고자하는 운영체제에 맞게 다운로드 후 실행

    ✔ *라즈베리파이3 B+* 일 경우 아래의 절차를 참고 (자료출처:https://www.kimnjang.com/104)
    
    1. *Linux Binaries(ARM)의 v7*버전을 다운받으면 됩니다. 또는 터미널을 열고 아래를 입력, (20.02.26기준 LTS버전: v12.16.1)
        > `wget https://nodejs.org/dist/v12.16.1/node-v12.16.1-linux-armv7l.tar.xz`

    2. 이후 압축을 풀고
        > `tar -xvf node-v12.16.1-linux-armv7l.tar.xz`

    3. `/opt/nodejs`로 폴더를 이동
        > `sudo mv node-v12.16.1-linux-armv7l /opt/nodejs`

    4. 심볼릭 링크 걸기
        > `sudo ln -s /opt/nodejs/bin/node /usr/bin/node`<br>
        > `sudo ln -s /opt/nodejs/bin/npm /usr/bin/npm`<br>
        > `sudo ln -s /opt/nodejs/bin/npx /usr/bin/npx`

2. **서버 종속모듈 설치**

    프롬프트나 터미널에

    > `npm install`

    를 입력하여 서버에 필요한 모듈을 설치해줍니다. (30초정도 걸립니다)

3. **서버 프로세스 매니저 설치**

    프롬프트나 터미널에

    > `npm install pm2 -g`

    를 입력하여 Process Manager인 PM2를 설치합니다.

4. **서버 프로세스 실행**

    현 디렉토리에서 프롬프트나 터미널에

    > `pm2 start main.js --name main`

    를 입력하여 서버를 실행합니다.
    추가적으로 서버 실행 옵션은 [링크](./doc/pm2-command-manual.md)를 참조

- **웹앱(사용자/클라이언트) 접속**

    웹브라우저의 주소창 통해 `서버ip:3000`으로 사용자/클라이언트 접속이 가능합니다.


# 서버 관리하기

- **서버 실시간 로그 확인하는 방법**

    서버에서 이루어진 처리나 오류 관련 내역을 파악하면 빠르게 서버를 유지보수할 수 있습니다. 떄문에 서버 프로세스 도중에도 로그를 조회할 수 있어야 합니다.
    로그를 확인하는 방법은 아래와 같습니다.

    프롬프트나 터미널에

    > `pm2 log`

    를 입력하여 실시간으로 출력되는 서버 로그들을 확인하실 수 있습니다.

- **서버 중지및 재시작**

    예기치 못한 상황이나 급히 서버를 종료해야할 상황일 경우 아래의 방법으로 중지하면 됩니다.

    프롬프트나 터미널에

    > `pm2 stop main`

    를 입력하여 일시적으로 중지하여도 되고, 완전히 프로세스 지원을 중단하고자 한다면

    > `pm2 delete main`

    를 입력하여 중단할 수 있습니다.

    #### 재시작

    `pm2 stop main`을 통해 중지된 프로세스일 경우 프롬프트나 터미널에

    > `pm2 restart main`

    를 입력하여 바로 다시 서버를 재시작할 수 있으나

    `pm2 delete main`를 통해 프로세스를 중단하였거나
    서버컴퓨터를 재시작하여 pm2 list에 해당 프로세스가 없을 경우
    위의 _**서버 실행방법의 4번 항목**_ 부터 진행하시면 됩니다.