const fs = require("fs");
const qs = require("querystring");
const express = require("express");
const app = express();
//var cookieParser = require('cookie-parser') //쿠키사용시 필요
//app.use(cookieParser())

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

// 물품저장호출
app.post("/save", (req, res)=>{
    let body = ""
    req.on("data", (data) => {body += data})
    req.on("end", () => {
        const data = qs.parse(body)
        console.log("저장감지", data.n)
        fs.writeFile(`./data/${data.n}`, qs.stringify(data), "utf-8", (err)=>{
            if(err) errorExec(err)
            console.log("저장성공", data.n)
            res.redirect("/")
        })
    })
})

// 중복이름 조회
app.post("/check", (req, res)=>{
    let body = ""
    req.on("data", (data) => {body += data})
    req.on("end", () => {
        const name = qs.unescape(body)
        fs.readdir("./data", (err, files)=>{
            if(err) errorExec(err)
            const result = files.indexOf(name)===-1?'0':'1'
            console.log("중복조사", name, result)
            res.status(200).send(result)
        })
    })
})

// 스크립트 자원소스
app.use('/src', express.static(__dirname + "/src"));
// 페이지 오류
app.use((req, res, next)=>{res.status(404).send('Not Found')})
// 서버 해당port로 실행
app.listen(port, ()=>{console.log(`Web app listening on port ${port}!`)})