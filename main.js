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
        console.log("저장요청", data.n, data)
        // 생략된 값 전처리
        if(data.t === "") data.t = 0;
        if(data.c === "") data.c = data.t;

        // 위치 저장
        if(data.p !== ""){
            connectionDB.query(
                "INSERT INTO `position` (??, ??, ??) VALUES (?, ?, NOW())",
                ['item', 'content', 'date', data.n, data.p],
                (err, items)=>{
                    if(err) throw err;
                    console.log("위치저장완료", data.n)
                }
            );
        }
        delete data.p;

        // 이미지파일 저장 /*** 이미지 미디어 브랜치에서 추가 ***/
        delete data.i

        // 아이템 저장
        connectionDB.query("SELECT ?? FROM item WHERE ??=?",
        ['n', 'n', data.n],
        (err, items)=>{
            if(err) throw err;
            if(items.length === 0){
                // 추가
                connectionDB.query(
                    "INSERT INTO item (??, ??, ??, ??, ??) VALUES (?, ?, ?, ?, ?)",
                    ['n', 'c', 't', 'd', 'in', data.n, data.c, data.t, data.d, data.in],
                    (err, items)=>{
                        if(err) throw err;
                        console.log("추가저장완료", data.n)
                        res.redirect("/")
                    }
                );
            }
            else{
                // 변경
                connectionDB.query(
                    "UPDATE item SET ? WHERE ??=?",
                    [data, 'n', items[0].n],
                    (err, items)=>{
                        if(err) throw err;
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
            "SELECT ?? FROM item WHERE ??=?",
            ['n', 'n', name],
            (err, items)=>{
                if(err) throw err;
                const result = (items.length===0)? '0': '1';
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

        // 아이템 형변환
        async function makeItemForm(items){
            const itemForm = function(query){ return new Promise((resolve, reject)=>{
                connectionDB.query("SELECT * FROM item WHERE ??=?", ['n', query], (err, result)=>{
                    if(err) reject(err);
                    else resolve(result);
                })
            })};
            
            const positionForm = function(query){ return new Promise((resolve, reject)=>{
                connectionDB.query("SELECT content FROM `position` WHERE ??=?", ['item', query], (err, result)=>{
                    if(err) reject(err);
                    else resolve(result);
                })
            })};

            let resultBuf = [];
            for(let i=0; i<items.length; i++){
                const itemBuf = await itemForm(items[i]);
                delete itemBuf[0].id;
                const posBuf = [];
                (await positionForm(items[i])).forEach(element => {posBuf.push(element.content)});
                // console.log(itemBuf[0], qs.escape(posBuf)); //변경된 내용 확인
                resultBuf.push(qs.stringify(itemBuf[0])+"&p="+qs.escape(posBuf));
            }
            res.status(200).send(String(resultBuf))
        }

        let result = [];
        const query = qs.unescape(body);

        // 전체검색인 경우
        if(query === ""){
            connectionDB.query("SELECT ?? FROM item",
            ['n'],
            (err, rawItems)=>{
                if(err) throw err;
                rawItems.forEach(element=>{result.push(element.n)})
                console.log("내용검색", query, result.length)
                makeItemForm(result);
            })
        }
        // 쿼리값을 포함하는 경우
        else{
            const querySelector = ['n', 'item', 'n', `%${query}%`];

            const asyncQuery = function(){ return new Promise((resolve, reject)=>{
                connectionDB.query("SELECT ?? FROM ?? WHERE ?? LIKE ?", querySelector, (err, result)=>{
                    if(err) reject(err);
                    else resolve(result);
                })
            })};
            
            asyncQuery() // ['n', 'item', 'n', `%${query}%`]
            .then((item)=>{
                item.forEach(element => {result.push(element.n)});
                querySelector[2] = 'c';
                return asyncQuery(); // ['n', 'item', 'c', `%${query}%`]
            })
            .then((item)=>{
                item.forEach(element => {result.push(element.n)});
                querySelector[2] = 't';
                return asyncQuery(); // ['n', 'item', 't', `%${query}%`]
            })
            .then((item)=>{
                item.forEach(element => {result.push(element.n)});
                querySelector[2] = 'd';
                return asyncQuery(); // ['n', 'item', 'd', `%${query}%`]
            })
            .then((item)=>{
                item.forEach(element => {result.push(element.n)});
                querySelector[2] = 'in';
                return asyncQuery(); // ['n', 'item', 'in', `%${query}%`]
            })
            .then((item)=>{
                item.forEach(element => {result.push(element.n)});
                querySelector[0] = 'item';
                querySelector[1] = 'position';
                querySelector[2] = 'content';
                return asyncQuery(); // ['item', 'position', 'content', `%${query}%`]
            })
            .then((item)=>{
                item.forEach(element => {result.push(element.item)});
                console.log("내용검색", query, result.length)
                makeItemForm(result);
            })
            .catch(e => {throw e;});
        }
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
            "DELETE FROM item WHERE ??=?",
            ['n', query],
            (err, items)=>{
                if(err) throw err;
                console.log("삭제완료", query)
                res.status(200).send();
            }
        );
    })
})

// 아이템 과거위치값 조회
app.post("locate", (req, res)=>{
    let body = ""
    req.on("data", (data) => {body += data})
    req.on("end", () => {
        let query = qs.unescape(body).split(",");

        // 이름 정확도 조사 추가

        if(query.length===2 && (query[1].trim()==="" || isNaN(Number(query[1])))){
            // 적절한 스택신호가 존재할 경우
            // 해당 스택신호의 위치값을 불러오기
            connectionDB.query(
                `SELECT content FROM position WHERE item=${query[0]} ORDER BY date DESC LIMIT ${query[1]}, ${query[1]+1}`,
                (err, items)=>{
                    console.log("위치변경저장완료")
                    res.status(200).send(`${query[0]},${items[0].content}`);
                }
            );
        }
        else{
            // 가장 최근 위치값을 불러오기
            connectionDB.query(
                `SELECT content FROM position WHERE item=${query[0]} ORDER BY date DESC LIMIT 1`,
                (err, items)=>{
                    console.log("위치변경저장완료")
                    res.status(200).send(`${query[0]},${items[0].content}`);
                }
            );
        }
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
        const query = qs.unescape(body).split(",");
        const limitNum = 0;
        if(query.length === 3) limitNum = Number(query[2]); //스택신호가 생략되지 않은 경우

        connectionDB.query(
            `UPDATE position SET content=${query[1]} WHERE item=${query[0]} ORDER BY date DESC LIMIT ${limitNum}, ${limitNum+1}`,
            (err, items)=>{
                console.log("위치변경저장완료")
                res.status(200).send();
            }
        );
    })
})

// 페이지 오류
app.use((req, res, next)=>{res.status(404).send('Not Found')})

// 서버 해당port로 실행
app.listen(port, ()=>{console.log(`Web app listening on port ${port}!`)})