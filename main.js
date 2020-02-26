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
        fs.writeFile(`./data/${data.name}`, qs.stringify(data), "utf-8", (err)=>{
            if(err) errorExec(err);
            res.cookie("saveSuccess", "1")
            res.redirect("/")
        })
    })
})

// 스크립트 자원소스
app.use('/src', express.static(__dirname + "/src"));
// 페이지 오류
app.use((req, res, next)=>{res.status(404).send('Not Found')})
// 서버 해당port로 실행
app.listen(port, ()=>{console.log(`Web app listening on port ${port}!`)})