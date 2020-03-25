const fs = require("fs");
const qs = require("querystring");
const express = require("express");
const mysql = require('mysql');
const dbconfig = require('./config/DB.js');
const connectionDB = mysql.createConnection(dbconfig);
const app = express();

const port = 3000;
// 오류 상황 처리
function errorExec(err){
    console.log("Critical Error Detect!");
    console.log(err, err.code, err.name, err.message);
    throw err;
}

// 홈페이지
app.get("/", (req, res)=>{
    const homeTemplate = fs.readFileSync("index.html", "utf-8")
    res.status(200)
        .type('text/html')
        .send(homeTemplate)
})
// 스크립트 자원소스
app.use('/src', express.static(__dirname + "/src"));

// 아이템 추가, 내용 변경
app.post("/save", (req, res)=>{
    let body = ""
    req.on("data", (data) => {body += data})
    req.on("end", () => {
        const data = qs.parse(body)
        console.log("저장요청", data.n)

        // 위치 저장
        if(data.p !== ""){
            connectionDB.query(
                `INSERT INTO position (item, content) VALUES (${data.n}, ${data.p})`,
                (err, items)=>{console.log("위치저장완료", data.n)}
            );
        }

        // 아이템 저장
        connectionDB.query(`SELECT n FROM item WHERE n=${data.n}`, (err, items)=>{
            if(items.length === 0){
                // 추가
                connectionDB.query(
                    `INSERT INTO item (n, c, t, d, in) VALUES (${data.n}, ${data.c}, ${data.t}, ${data.d}, ${data.in})`,
                    (err, items)=>{
                        console.log("추가저장완료", data.n)
                        res.redirect("/")
                    }
                );
            }
            else{
                // 변경
                let set_expr = "";
                // 변경할 내용 쿼리문자열로 지정
                for(i in data){
                    if(i == 'n') continue;
                    set_expr += `${i}=${data[i]},`
                }
                connectionDB.query(
                    `UPDATE item SET ${set_expr} WHERE n=${items[0].n}`,
                    (err, items)=>{
                        console.log("변경저장완료", data.n, data)
                        res.redirect("/")
                    }
                );
            }
        })
    })
})

// 특정 아이템의 이름 중복 조회
app.post("/check", (req, res)=>{
    let body = ""
    req.on("data", (data) => {body += data})
    req.on("end", () => {
        const name = qs.unescape(body)

        connectionDB.query(
            `SELECT n FROM item WHERE n=${data.n}`,
            (err, items)=>{
                const result = items.length===0? '0': '1';
                console.log("중복조사", name, result)
                res.status(200).send(result)
            }
        );
    })
})

// 아이템 전체 내용 조회
app.post("/search", (req, res)=>{
    let body = ""
    req.on("data", (data) => {body += data})
    req.on("end", () => {
        const query = qs.unescape(body)
        let result = [];

        // 전체검색인 경우
        if(query === ""){
            result = connectionDB.query(`SELECT * FROM item`)
        }
        // 쿼리값을 포함하는 경우
        else{
            let temp_result = [];
            const querySelector = ['n', 'c', 't', 'd', 'in'];
            for(let i=0; i<querySelector.length; i++){
                temp_result = connectionDB.query(`SELECT n FROM item WHERE ${querySelector[i]} LIKE %${query}%`)
                if(temp_result.length !== 0) result.concat(temp_result)
            }
            temp_result = connectionDB.query(`SELECT item FROM position WHERE content LIKE %${query}%`)
            if(temp_result.length !== 0) result.concat(temp_result)
        }
        console.log("내용검색", query, result.length)

        // 아이템 형변환
        let resultBuf = [];
        let itemBuf = [];
        let posBuf = [];
        for(let i=0; i<result.length; i++){

            itemBuf = connectionDB.query(`SELECT * FROM item WHERE n=${result[i]}`)
            posBuf = connectionDB.query(`SELECT content FROM position WHERE content=${result[i]}`)

            resultBuf.push(qs.stringify(itemBuf)+"&p="+qs.stringify(posBuf))
        }

        res.status(200).send(String(resultBuf))
    })
})

// 아이템 삭제
app.post("/del", (req, res)=>{
    let body = ""
    req.on("data", (data) => {body += data})
    req.on("end", () => {
        const query = qs.unescape(body)
        console.log("삭제요청", query)

        connectionDB.query(
            `DELETE item WHERE n=${query}`,
            (err, items)=>{
                console.log("삭제완료", query)
                res.status(200).send();
            }
        );
    })
})

/* 이 이후에 대한 기능들은 테스트는 물론 제대로 완성되지 않은 기능들입니다. ***************************************************/
// 아이템 과거위치값 조회
app.post("locate", (req, res)=>{
    let body = ""
    req.on("data", (data) => {body += data})
    req.on("end", () => {

        function lastlocate(name){
            // return db.get("position").filter({n:name}).value()[0];
        }

        body = qs.unescape(body)
        // message 
        if(body.indexOf(',')===-1){ //생략이 되었을 경우
            // 가장 최근 위치값 불러오기
            lastlocate(body);
        }
        else{
            const query = qs.unescape(body).split(',');
            if(query[1].trim()==="" || isNaN(Number(query[1]))){ //숫자 이외의 값이 생략이 되었을 경우
                // 가장 최근 위치값 불러오기
                lastlocate(body);
            }
            else{ //숫자일 경우
                // 해당 숫자의 위치값 불러오기,숫자에 해당하는 위치값이 없을 경우 최근 위치값
                // db.get("position").filter({n:query[0]}).value()[query[1]]
            }
        }
        res.status(200).send()
    })
})

// 아이템 위치값 변경
app.post("savelocate", (req, res)=>{
    let body = ""
    req.on("data", (data) => {body += data})
    req.on("end", () => {
        // body = 이름, 위치값[위치이름,alpha,beta,gamma], 스택신호

        // 이름에 해당하는 위치리스트
        // 그 중에 스택신호에 해당하는 인덱스에 위치값 설정
        // 그 후 //res.status(200).send()
    })
})

// 페이지 오류
app.use((req, res, next)=>{res.status(404).send('Not Found')})

// 서버 해당port로 실행
app.listen(port, ()=>{console.log(`Web app listening on port ${port}!`)})