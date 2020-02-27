# Server-Pack

## 서버 실행방법
1. **서버 기본플랫폼 설치**

    Node.js를 설치해줍니다.
    
    Node.js 다운로드 주소: > https://nodejs.org/ko/download/
    
    설치하고자하는 운영체제에 맞게 다운로드 후 실행

    ✔ *라즈베리파이3 B+* 일 경우 아래의 절차를 참고 (자료출처:https://www.kimnjang.com/104)
    
    1. *Linux Binaries(ARM)의 v7*버전을 다운받으면 됩니다. 또는 터미널을 열고 아래를 입력
        > `wget https://nodejs.org/dist/v12.16.1/node-v12.16.1-linux-armv7l.tar.xz`(20.02.26현재 LTS버전)

    2. 이후 압축을 풀고
        > `tar -xvf node-v12.16.1-linux-armv7l.tar.xz`

    3. `/opt/nodejs`로 폴더를 이동
        > `sudo mv node-v12.16.1-linux-armv7l /opt/nodejs`

    4. 심볼릭 링크 걸기
        > sudo ln -s /opt/nodejs/bin/node /usr/bin/node
        <br>sudo ln -s /opt/nodejs/bin/npm /usr/bin/npm
        <br>sudo ln -s /opt/nodejs/bin/npx /usr/bin/npx

2. **서버 종속모듈 설치**

    프롬프트나 터미널을 열고 `npm update`로 서버실행에 필요한 모듈을 설치해줍니다.

3. **서버 실행**

    프롬프트나 터미널에 `node main.js`를 입력후 실행합니다.

4. **웹앱 접속**

    웹브라우저의 주소창 통해 `서버ip:3000`으로 클라이언트 접속이 가능합니다.