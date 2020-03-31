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

// 위치값 히스토리 내부 탐색인자
let historySearch = {
    name : null,
    stack : 0
}

// 홈페이지
app.get("/", (req, res)=>{
    const homeTemplate = fs.readFileSync("db-test.html", "utf-8")
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
                ['item', 'content', 'date', data.n, `[${data.p}]`],
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

const AllItemName = function(){ return new Promise((resolve, reject)=>{
    connectionDB.query("SELECT ?? FROM item", ['n'], (err, result)=>{
        if(err) reject(err);
        else resolve(result);
    })
})};

// 아이템 과거위치값 조회
app.post("/locate", (req, res)=>{
    let body = ""
    req.on("data", (data) => {body += data})
    req.on("end", async () => {
        let queryName = "";
        let queryStack = 0;
        let query = qs.unescape(body).split(",");
        /** query::
         * <length == 2>
         * query[0], query[1] == (이름, 스택신호)
         *   해당 이름의 위치값중 해당 스택신호
         * 
         *   - 내부인자 이름을 해당 이름으로 설정
         *   - 내부인자 스택신호를 초기화
         * 
         * <length == 1>
         * 1. query[0] == (스택신호)
         *   내부인자의 이름의 위치값중 해당 스택신호
         * 
         *   - 내부인자 이름은 유지
         *   - 내부인자 스택신호는 유지
         * 
         * 2. query[0] == (이름)
         *   2.1. 내부인자의 이름과 같은 경우
         *     해당 이름의 위치값중 내부인자의 스택신호
         * 
         *     - 내부인자 이름은 유지
         *     - 내부인자 스택신호를 +1 증가
         * 
         *   2.2. 내부인자의 이름과 다를 경우
         *     해당 이름의 위치값중 최근위치값
         * 
         *     - 내부인자 이름을 해당 이름으로 설정
         *     - 내부인자 스택신호를 초기화
         * 
         * 3. query[0] == ""
         *   내부인자의 이름의 위치값중 내부인자의 스택신호
         * 
         *   - 내부인자 이름은 유지
         *   - 내부인자 스택신호를 +1 증가
         */

        // 이름이 정확한지 판단
        if(!(query.length == 1 && (query[0]==="" || /^\d+$/.test(query[0].trim())))){
            // 이름 정확도 조사
            const name = query[0];
            const lcs = require('./src/LCS.js');
            const items = await AllItemName();
        
            let MaxName = "";
            let MaxVal = 0.5;
            for (let i=0; i<items.length; i++) {
                let itemName = items[i].n;
                let common = lcs(name.split(""), itemName.split(""));
        
                if(common.length/itemName.length >= MaxVal){
                    MaxName = itemName;
                    MaxVal = common.length/itemName.length;
                }
            }
            if(MaxName === "") throw new Error("There is no match item name with "+name)
            queryName = MaxName;
        }

        // 쿼리와 내부인자 상호작용 설정
        if(query.length === 2 && /^\d+$/.test(query[1].trim())){
            queryStack = Number(query[1]);
            // - 내부인자 이름은 해당이름
            // - 내부인자 스택신호를 초기화
            historySearch.name = queryName;
            historySearch.stack = 0;
        }
        else{
            if(query[0] === ""){ // 아무인자도 없을 경우
                if(historySearch.name === null) throw new Error("there is no search item before");
                // - 내부인자 이름은 유지
                // - 내부인자 스택신호를 +1 증가
                queryName = historySearch.name;
                queryStack = historySearch.stack++;
            }
            else if(/^\d+$/.test(query[0].trim())){ // 인자가 정수인 경우, 스택신호만 온 경우
                if(historySearch.name === null) throw new Error("there is no search item before");
                queryName = historySearch.name;
                queryStack = Number(query[0]);
                // - 내부인자 이름은 유지
                // - 내부인자 스택신호는 유지
            }
            else{ // 일반문자열, 이름으로 취급
                if(queryName === historySearch.name){
                    queryStack = ++historySearch.stack;
                    // - 내부인자 이름은 유지
                    // - 내부인자 스택신호를 +1 증가
                }
                else{
                    // - 내부인자 이름은 해당이름
                    // - 내부인자 스택신호를 초기화
                    historySearch.name = queryName;
                    historySearch.stack = 0;
                }
            }
        }

        // 해당 스택신호의 위치값을 불러오기
        connectionDB.query(
            "SELECT `content` FROM `position` WHERE ??=? ORDER BY `date` DESC LIMIT ?, 1",
            ['item', queryName, queryStack],
            (err, items)=>{
                if(err) throw err;
                if(items.length === 0){
                    console.log("존재하지않는 위치조회", query);
                    res.status(404);
                }
                else{
                    console.log("위치조회", query, items[0].content);
                    connectionDB.query(
                        "SELECT `value` FROM `correct`",
                        (err, value)=>{
                            if(err) throw err;
                            console.log(value)
                            res.status(200).send(`${queryName},${items[0].content.replace(']','').replace('[','').split(',')[1]},${value[0].value}`);
                        }
                    )
                }
            }
        );
    })
});

// 아이템 위치값 변경
app.post("/savelocate", (req, res)=>{
    let body = ""
    req.on("data", (data) => {body += data})
    req.on("end", async () => {
        const query = qs.unescape(body).split(",");
        /** query::
         * length == 3
         * query[0], query[1], query[2]  == (이름, 위치값, 스택신호)
         *   해당 이름의 해당 스택신호의 내용을 해당 위치값으로 변경
         * 
         * length == 2
         * query[0], query[1]  == (이름, 위치값)
         *   해당 이름의 가장 최근 내용을 해당 위치값으로 변경
         */
        
        // 이름 정확도 조사
        const name = query[0];
        const lcs = require('./src/LCS.js');
        const items = await AllItemName();
    
        let MaxName = "";
        let MaxVal = 0.5;
        for (let i=0; i<items.length; i++) {
            let itemName = items[i].n;
            let common = lcs(name.split(""), itemName.split(""));
    
            if(common.length/itemName.length >= MaxVal){
                MaxName = itemName;
                MaxVal = common.length/itemName.length;
            }
        }
        if(MaxName === "") throw new Error("There is no match item name with "+name)
        query[0] = MaxName;

        let limitNum = 0;
        if(query.length === 3) limitNum = isNaN(Number(query[2]))? 0: Number(query[2]); //스택신호가 생략되지 않은 경우

        connectionDB.query(
            "UPDATE `position` AS r, (SELECT * FROM `position` WHERE `item`=? ORDER BY `date` DESC LIMIT ?,1) t SET r.content=? WHERE r.id = t.id",
            [query[0], limitNum, query[1]],
            (err, items)=>{
                if(err) throw err;
                console.log("위치변경저장완료", query[0], limitNum, `[${query[1]}]`)
                res.status(200).send();
            }
        );
    })
})

// 보정수치를 저장합니다.
app.post("/locatem", (req, res)=>{
    let body = ""
    req.on("data", (data) => {body += data})
    req.on("end", () => {
        const query = qs.unescape(body);
        // 변경
        if(query === ""){
            res.status(404).send();
            return;
        }
        connectionDB.query(
            "UPDATE `correct` SET `value`=?",
            [query],
            (err, items)=>{
                if(err) throw err;
                console.log("보정수치저장완료", query)
                res.status(200).send();
            }
        );
    })
});

// 페이지 오류
app.use((req, res, next)=>{res.status(404).send('Not Found')})

// 서버 해당port로 실행
app.listen(port, ()=>{console.log(`Web app listening on port ${port}!`)})