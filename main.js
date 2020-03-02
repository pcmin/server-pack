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
        console.log("저장요청", data.n)
        fs.writeFile(`./data/${data.n}`, qs.stringify(data), "utf-8", (err)=>{
            if(err) errorExec(err)
            console.log("저장완료", data.n)
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

// 내용 요청
app.post("/search", (req, res)=>{
    let body = ""
    req.on("data", (data) => {body += data})
    req.on("end", () => {
        const query = qs.unescape(body)
        fs.readdir("./data", (err, files)=>{
            if(err) errorExec(err)
            let result = [];
            // 전체검색인 경우
            if(query === ""){
                for(i in files){
                    result.push(fs.readFileSync("./data/"+files[i], "utf-8"));
                }
            }
            // 이름값 포함하는 경우
            else{
                for(i in files){
                    if(files[i].indexOf(query)===-1) continue;
                    result.push(fs.readFileSync("./data/"+files[i], "utf-8"));
                }
            }
            console.log("내용검색", query, result.length)
            res.status(200).send(String(result))
        })
    })
})

// 내용 삭제
app.post("/del", (req, res)=>{
    let body = ""
    req.on("data", (data) => {body += data})
    req.on("end", () => {
        const query = qs.unescape(body)
        console.log("삭제요청", query)
        fs.unlink("./data/"+query, (err)=>{
            if(err) errorExec(err)
            console.log("삭제완료", query)
            res.status(200).send()
        });
    })
})

// 스크립트 자원소스
app.use('/src', express.static(__dirname + "/src"));
// 페이지 오류
app.use((req, res, next)=>{res.status(404).send('Not Found')})
// 서버 해당port로 실행
app.listen(port, ()=>{console.log(`Web app listening on port ${port}!`)})