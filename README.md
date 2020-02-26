# Server-Pack

### 서버 실행방법
1. node.js를 설치해줍니다.
    > https://nodejs.org/ko/download/

    *라즈베리파이3 B+* 일 경우 (자료출처:https://www.kimnjang.com/104)
    
    1. **Linux Binaries(ARM)의 v7**버전을 다운받으면 됩니다.
    또는 터미널을 열고 아래 입력
        > `wget https://nodejs.org/dist/v12.16.1/node-v12.16.1-linux-armv7l.tar.xz`(20.02.26현재 LTS버전)

    2. 이후 압축을 풀고
        > `tar -xvf node-v12.16.1-linux-armv7l.tar.xz`

    3. `/opt/nodejs`로 폴더를 이동
        > `sudo mv node-v12.16.1-linux-armv7l /opt/nodejs`

    4. 심볼릭 링크 걸기
        > sudo ln -s /opt/nodejs/bin/node /usr/bin/node
        > sudo ln -s /opt/nodejs/bin/npm /usr/bin/npm
        > sudo ln -s /opt/nodejs/bin/npx /usr/bin/npx

2. 프롬프트나 터미널을 열고 `node main.js`를 입력후 실행

3. 웹브라우저의 주소창 통해 `서버ip:3000`으로 접속이 가능합니다