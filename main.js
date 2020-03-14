const fs = require("fs");
const qs = require("querystring");
const express = require("express");
const app = express();

const port = 3000;
// 오류 상황 처리
function errorExec(err){
    console.log("Critical Error Detect!");
    console.log(err, err.code, err.name, err.message);
    throw err;
}

// lowdb를 file-async로 처리
// ASYNC >> https://github.com/typicode/lowdb/tree/master/examples
// API   >> https://github.com/typicode/lowdb
const low = require("lowdb")
const FileASync = require("lowdb/adapters/FileASync")
if(!fs.existsSync("data")) fs.mkdirSync("data")
low(new FileASync("data/db.json")).then(db => {

// 홈페이지
app.get("/", (req, res)=>{
    const homeTemplate = fs.readFileSync("index.html", "utf-8")
    res.status(200)
        .type('text/html')
        .send(homeTemplate)
})
// 스크립트 자원소스
app.use('/src', express.static(__dirname + "/src"));

// 내용 저장 요청
app.post("/save", (req, res)=>{
    let body = ""
    req.on("data", (data) => {body += data})
    req.on("end", () => {
        const data = qs.parse(body)
        console.log("저장요청", data.n)

        if(db.get("items").filter({n:data.n}).value().length===0){
            // 추가
            db.get("items")
              .push(data)
              .write()
              .then(() => {console.log("추가저장완료", data.n)})
            db.update('count', n => n + 1)
              .write() // 총 개수 변경
            res.redirect("/")
        }
        else{
            // 변경
            db.get("items")
              .find({n: data.n})
              .assign(data)
              .write()
              .then(() => {console.log("변경저장완료", data.n, data)})
            res.redirect("/")
        }
    })
})

// 중복이름 조회
app.post("/check", (req, res)=>{
    let body = ""
    req.on("data", (data) => {body += data})
    req.on("end", () => {
        const name = qs.unescape(body)

        const result = db.get("items").filter({n:name}).value().length===0?'0':'1'
        console.log("중복조사", name, result)
        res.status(200).send(result)
    })
})

// 내용 요청
app.post("/search", (req, res)=>{
    let body = ""
    req.on("data", (data) => {body += data})
    req.on("end", () => {
        const query = qs.unescape(body)

        let result = [];
        // 전체검색인 경우
        if(query === ""){
            result = db.get("items").value()
        }
        // 이름값 포함하는 경우
        else{
            result = db.get("items")
                .filter((item) => {
                    const key = ['n','p','c','r','d','in','i'];
                    for(let i=0; i<key.length; i++){
                        if(item[key].indexOf(query)!==-1) return true;
                    }
                    return false;
                })
                .value()
        }
        console.log("내용검색", query, result.length)
        // 쿼리배열형태로 변환
        const len = result.length;
        let resultBuf = [];
        for(let i=0; i<len; i++){
            resultBuf.push(qs.stringify(result[i]))
        }

        res.status(200).send(String(resultBuf))
    })
})

// 내용 삭제
app.post("/del", (req, res)=>{
    let body = ""
    req.on("data", (data) => {body += data})
    req.on("end", () => {
        const query = qs.unescape(body)
        console.log("삭제요청", query)

        db.get("items")
          .remove({n: query})
          .write()
          .then(() => {console.log("삭제완료", query)})
        res.status(200).send()
    })
})

// 페이지 오류
app.use((req, res, next)=>{res.status(404).send('Not Found')})

// db 기본값 세팅
return db.defaults({ items: [], count: 0 }).write()

})
.then(() => {
    // 서버 해당port로 실행
    app.listen(port, ()=>{console.log(`Web app listening on port ${port}!`)})
})