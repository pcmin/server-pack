# Server-Pack
##### v0.3.0


# 서버 첫 실행전 설치

1. **서버 기본플랫폼 설치**

    Node.js를 설치해줍니다.
    
    Node.js 다운로드 주소: > https://nodejs.org/ko/download/
    
    설치하고자하는 운영체제에 맞게 다운로드 후 실행

    ✔ *라즈베리파이3 B+* 일 경우 아래의 절차를 참고 (자료출처:https://www.kimnjang.com/104)
    
    1. *Linux Binaries(ARM)의 v7*버전을 다운받으면 됩니다. 또는 터미널을 열고 아래를 입력, (20.02.26기준 LTS버전: v12.16.1)

           $ wget https://nodejs.org/dist/v12.16.1/node-v12.16.1-linux-armv7l.tar.xz

    2. 이후 압축을 풀고

           $ tar -xvf node-v12.16.1-linux-armv7l.tar.xz

    3. `/opt/nodejs`로 폴더를 이동

           $ sudo mv node-v12.16.1-linux-armv7l /opt/nodejs

    4. 심볼릭 링크 걸기

           $ sudo ln -s /opt/nodejs/bin/node /usr/bin/node
           $ sudo ln -s /opt/nodejs/bin/npm /usr/bin/npm
           $ sudo ln -s /opt/nodejs/bin/npx /usr/bin/npx

2. **서버 종속모듈 설치**

    프롬프트나 터미널에

       $ npm install

    를 입력하여 서버에 필요한 모듈을 설치해줍니다. (30초정도 걸립니다)

3. **데이터베이스 서버 설치**

    현 _server-pack_ 에서는 `MySQL`로 데이터베이스 서비스를 지원합니다.

    **전체적인 데이터베이스 설치 전**
    관련 연결을 자동화로 진행할 파일을 만듭니다.

    root폴더에서 `config`폴더를 만들고 그 아래에 `DB.js`파일을 만듭니다.
    해당 파일에는 아래의 내용을 적습니다.

    ```js
    module.exports = {
        host     : 'localhost',
        user     : 'root' /* 관리할 사용자 이름 */,
        password : '*****' /* 원하시는 비밀번호 */,
        port     : 3306,
        database : 'items_db'
    }
    ```

    구체적인 후에 다룰 환경설정에 맞추어 해당 값들을 바꾸어도 됩니다.

    - `user` 는 관리할 사용자 이름입니다. 기본계정인 `root`를 그대로 이용해줍니다.
    - `password` 는 데이터베이스에 접근할 비밀번호입니다.
    - `port` 는 데이터베이스 서버포트 번호입니다. 기본포트인 `3306`를 이용해줍니다.


    윈도우에서의 설치방법은 다음링크를 통해 확인해주세요.
    (설치방법:https://dog-developers.tistory.com/20)

    ✔ *라즈베리파이3 B+* 일 경우 아래의 절차를 참고 (자료출처:https://gyrfalcon.tistory.com/entry/Raspberry-PI-MySQL)
    
    1. 터미널을 열고 아래를 입력,

            $ sudo apt-get install mysql-server mysql-client

    2. `Do you want to continue? [Y/n]`라는 질문이 나오면 `y`로 완료해줍니다.

    3. 설치가 완료가 되었다면 아래를 입력해 정상적으로 접근이 가능한지 확인해줍니다.

            $ sudo mysql -uroot

    4. 비밀번호 설정, 성공적으로 접근이 된 상태에서 다음을 수행해줍니다.

        1. 기본 데이터베이스에 접근해줍니다.

                mysql> use mysql;

        2. 계정정보 구성을 확인합니다. root가 존재하는지 확인합니다.

                mysql> select user, host, password from user;

        3. root 계정의 비밀번호를 변경해줍니다.

                mysql> update user set password='(새 비밀번호)' where user='root';
                
                # (새 비밀번호)의 공간에 위 DB.js에서 설정한 password를 입력합니다.
    
    5. 터미널을 reload한 뒤, 아래를 열어 mysql를 재시작 해줍니다.

            $ sudo service mysql restart
    
    6. 최종적으로 비밀번호 입력을 통해 접근이 가능한지 확인해줍니다.

            $ sudo mysql -uroot -p


4. **서버 프로세스 매니저 설치**

    프롬프트나 터미널에

       $ npm install pm2 -g

    를 입력하여 Process Manager인 PM2를 설치합니다.


# 서버 실행방법

- **서버 프로세스 실행**

    현 디렉토리에서 프롬프트나 터미널에

       $ pm2 start main.js --name main

    를 입력하여 서버를 실행합니다.
    추가적으로 서버 실행 옵션은 [링크](./doc/pm2-command-manual.md)를 참조

- **웹앱(사용자/클라이언트) 접속**

    웹브라우저의 주소창 통해 `서버ip:3000`으로 사용자/클라이언트 접속이 가능합니다.


# 서버 관리하기

- **서버 실시간 로그 확인하는 방법**

    서버에서 이루어진 처리나 오류 관련 내역을 파악하면 빠르게 서버를 유지보수할 수 있습니다. 때문에 서버 프로세스 도중에도 로그를 조회할 수 있어야 합니다.
    로그를 확인하는 방법은 아래와 같습니다.

    프롬프트나 터미널에

      $ pm2 log

    를 입력하여 실시간으로 출력되는 서버 로그들을 확인하실 수 있습니다.


- **서버 중지및 재시작**

    예기치 못한 상황이나 급히 서버를 종료해야할 상황일 경우 아래의 방법으로 중지하면 됩니다.

    프롬프트나 터미널에

      $ pm2 stop main

    를 입력하여 일시적으로 중지하여도 되고, 완전히 프로세스 지원을 중단하고자 한다면

      $ pm2 delete main

    를 입력하여 중단할 수 있습니다.

    #### 재시작

    `pm2 stop main`을 통해 중지된 프로세스일 경우 프롬프트나 터미널에

      $ pm2 restart main

    를 입력하여 바로 다시 서버를 재시작할 수 있으나

    `pm2 delete main`를 통해 프로세스를 중단하였거나
    서버컴퓨터를 재시작하여 pm2 list에 해당 프로세스가 없을 경우

    위의 _**서버 실행방법의 4번 항목**_ 부터 진행하시면 됩니다.


- **서버 개발자 모드로 실행**

    서버 프로세스에 필요한 디렉토리 아래의 파일을 변경을 해야하거나 그러한 변경에 관해 테스트를 해보아야할 경우 아래의 command를 입력합니다. 파일 변경을 감지하고 자동으로 바로 reload를 진행합니다.

      $ pm2 start main.js --name main --watch --ignore-watch="data/*"
    
    그러나 서버 프로세스를 진행중일 경우 해당 `main.js`파일로 테스트하는 것을 권장하지 않습니다. 다른 테스트 파일로 변경하여 다른 프로세스를 통해 먼저 테스트를 하고 반영할 것을 권장합니다.