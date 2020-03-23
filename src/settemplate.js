// 이미지 입력
function imageSelect(sign){
    let uploadBtn = document.createElement("input");
    uploadBtn.type = "file";
    uploadBtn.onchange = function(){
        uploadProcess(this.files, sign);
    }
    uploadBtn.click();
}
function uploadProcess(files, sign){
    if(!files[0]) return 0;
    console.log(files[0])
    // 이미지 파일만 업로드 가능
    if(!(/^image\/.*/.test(files[0].type))){
        alert("이미지 파일을 업로드 해주세요.");
        return 0;
    }
    const fileName = files[0].name
    const fileNameStr = `${fileName}(${(files[0].size/1024).toFixed(2)}kB)`;
    const reader = new FileReader();
    reader.readAsDataURL(files[0]);
    reader.onload = function(ev){
        try{
            const imgUrl = ev.target.result
            console.log(1, imgUrl) //*** image test log **************************************************************************************** */
            document.getElementById("imageFileName"+sign).innerHTML = fileNameStr;
            document.getElementById("previewImage"+sign).src = imgUrl;
            document.getElementById("previewImage"+sign).title = fileName;
            if(sign===0)document.getElementById("previewImage"+sign).style.width = "100%";
            else if(sign===1)document.getElementById("previewImage"+sign).style.height = "206px";
        }
        catch (err){
            console.log("ERR: ", err);
            alert("ERROR : "+err.name+"/"+err.message);
        }
    }
}

// 토큰 양식 반환함수
function template(name, pos, cnt, tot, des, img, imgN){return `<img src="${img}" class="thumbnail" title="${imgN}" width="100%"><div class="textgroup"><div><div class="text name" title="이름:${name}">${name}</div><div class="text count" title="현재 수량:${cnt}">${cnt}</div>/<div class="text total" title="총 재고량:${tot}">${tot}</div></div><div class="text pos" title="위치:${pos}">${pos}</div><div class="text des">${des}</div></div><button class="btn delete" title="삭제하기" onclick="deleteContent(event)"><svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg></button>`;}

// 토큰 추가
function addToken(data){
    var tok = document.createElement("div");
    tok.classList.add("token");
    tok.dataset.id = data.n;
    console.log(3, data.i) //*** image test log ********************************************************************************** */
    tok.innerHTML = template(data.n, data.p, data.c, data.t, data.d, data.i, data.in);
    tok.addEventListener("click", (ev)=>{showContent(ev)})
    document.getElementById("tokenlist").appendChild(tok);
}
// 토큰 삭제
function delelteToken(token){document.getElementById("tokenlist").removeChild(token)}

// 오버레이 창 열기
function overlayOn(){
    document.getElementById("overlay").style.display = "flex";
    document.body.style.overflow = "hidden";
}
// 오버레이 창 닫기
function overlayOff(){
    document.getElementById("overlay").style.display = "none";
    document.body.style.overflow = "visible";
}

// 메뉴 클릭
var menuList = document.querySelectorAll("#menu>li");
for(let i=0; i<menuList.length; i++){
    menuList[i].addEventListener("click", (ev)=>{
        document.getElementsByClassName("activeArticle")[0].classList.remove("activeArticle");
        document.getElementsByClassName("menucheck")[0].classList.remove("menucheck");
        document.getElementById(ev.target.dataset.tar).classList.add("activeArticle");
        ev.target.classList.add("menucheck");
    });
}

// 오버레이 외곽클릭시 창 닫기
document.getElementById("overlay").onmousedown = function(ev){if(ev.target === ev.currentTarget) overlayOff()}

// AJAX Engine
/** parameter: xhr
 * xhr <= instantof XMLHttpRequest()
 * xhr.responseText = 받은내용
 * xhr.para = obj:콜백 전달 원객체
 *  obj.method = "GET","POST": 요청방식
 *  obj.url = 주소
 *      obj.message = POST로 보낼 문자
*/
function ajaxPipe(
    obj,
    successCallback=((xhr)=>{console.log("SUCCESS", xhr.status, xhr.obj)}),
    failCallback=((xhr)=>{console.log("FAIL", xhr.status, xhr.obj)})
)
{
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(){
        if(this.readyState == 4){
            if(this.status == 200){successCallback(this);}
            else{failCallback(this);}
        }
        
    }
    xhr.para = obj;
    xhr.open(obj.method, obj.url, true);
    if(obj.method==="POST")xhr.send(obj.message);
    else xhr.send();
}

// 입력 폼 초기화 기능
function resetForm(sign, force=false){
    if(!force && !confirm("입력한 내용을 지웁니까?")) return 0;
    const targetForm = document.forms[sign];
    if(sign===0){
        for(let i=0; i<5; i++) targetForm.getElementsByClassName("inputDetail")[i].value = "";
        targetForm.getElementsByClassName("previewImage")[0].src = "";
        targetForm.getElementsByClassName("previewImage")[0].title = "";
        targetForm.getElementsByClassName("previewImage")[0].style.width = "auto";
        targetForm.getElementsByClassName("imageFileName")[0].innerHTML = "선택된 파일 없음";
    }
    else if(sign===1){setContent()}
}

// 입력 폼 서버에 전송
function submitForm(sign){
    const targetForm = document.forms[sign];

    // 유효성 검사
    if(targetForm.name.value === ""){
        alert("이름을 반드시 작성해주세요."); // "이 입력란을 작성하세요."
        return 0;
    }

    // 새 내용 추가일 경우
    if(sign === 0){
        // 중복된 이름인지 조회 (중복되었을 경우 덮어쓰기 여부 확인후)
        ajaxPipe({
            method : "POST",
            url : "/check",
            message: targetForm.name.value
        }, (xhr)=>{
            // 덮어쓰기 여부 확인
            if(xhr.responseText === '1' && !confirm("같은 이름의 내용이 이미 존재합니다.\n기존내용 위에 덮어쓰기를 진행할까요?")) return 0;
            // 입력 내용 설정
            const key = ['n','p','c','t','d','in','i'];
            let content = "";
            for(let i=0; i<5; i++) content += `${key[i]}=${targetForm[i].value}&`;
            content += `${key[5]}=${targetForm.getElementsByClassName("previewImage")[0].title}&`;
            console.log(2, targetForm.getElementsByClassName("previewImage")[0].src); //*** image test log ************************************************************ */
            let imageurl = targetForm.getElementsByClassName("previewImage")[0].src;
            if(imageurl.startsWith("http")) imageurl = ""
            content += `${key[6]}=${imageurl}`;

            // 입력 내용 제출
            ajaxPipe({
                method : "POST",
                url : "/save",
                message: content
            }, ()=>{alert("성공적으로 저장하였습니다.");resetForm(sign, true);},
            ()=>{alert("저장에 실패하였습니다. 다시시도 해주세요.")})
        })
    }
    // 이전 내용 변경일 경우
    else if(sign === 1){
        // 입력 내용 설정
        const key = ['n','p','c','t','d','in','i'];
        let content = "";
        for(let i=0; i<5; i++) content += `${key[i]}=${targetForm.getElementsByClassName("inputDetail")[i].value}&`;
        content += `${key[5]}=${targetForm.getElementsByClassName("previewImage")[0].title}&`;
        content += `${key[6]}=${targetForm.getElementsByClassName("previewImage")[0].src}`;

        // 입력 내용 제출
        ajaxPipe({
            method : "POST",
            url : "/save",
            message: content
        }, ()=>{
            alert("성공적으로 변경하였습니다.")
            setContent(true);
        },
        ()=>{alert("변경에 실패하였습니다. 다시시도 해주세요.")})
    }
}

// 내용 검색하기
function searchContent(){
    ajaxPipe({
        method : "POST",
        url : "/search",
        message: document.getElementById("searchForm").value,
    }, (xhr)=>{
        const responseContent = xhr.responseText;
        // 아무 내용도 없을 경우 내용이 없다고 안내
        if(responseContent==="") alert("해당된 내용이 없습니다.")
        // 전송받은 내용 파싱
        else{
            const contentlist = responseContent.split(",");
            document.getElementById("tokenlist").innerHTML = "";
            for(let i=0; i<contentlist.length; i++){
                // 내용 파싱
                let data = {};
                let obj = null;
                const reg = /(?<=^|&)(.*?)=(.*?)(?=&|$)/g;
                while((obj = reg.exec(contentlist[i])) !== null){
                    data[obj[1]] = decodeURIComponent(obj[2]);
                }
                addToken(data);
            }
        }
    })
}

// 검색영역에 Enter시 내용 검색 실행
document.getElementById("searchForm").addEventListener("keypress",(ev)=>{if(ev.keyCode===13) searchContent()})

// 내용 삭제하기
function deleteContent(ev, force=false){
    const targetToken = ev.currentTarget.parentElement 
    const targetName = targetToken.getElementsByClassName("name")[0].innerHTML;
    if(!force && !confirm(`정말로 ${targetName}의 내용을 삭제합니까?`)) return 0;
    ajaxPipe({
        method : "POST",
        url : "/del",
        message: targetName
    }, ()=>{
        alert("성공적으로 삭제하였습니다.");
        delelteToken(targetToken);
    },
    ()=>{alert("삭제에 실패하였습니다. 다시시도 해주세요.")})
}

// 상세 내용보기 및 내용 변경창 열기
function showContent(ev){
    // (바인딩된 노드 하위의)부모나 자신의 노드에 다른 클릭 인벤트가 있을 경우 무시
    var node = ev.target;
    while(node !== ev.currentTarget && node !== null){
        if(node.onclick !== null) return 0;
        node = node.parentElement;
    }
    
    document.forms[1].dataset.tokenid = ev.currentTarget.dataset.id;
    setContent();
    overlayOn();
}

// 내용 설정 method
function setContent(toToken=false){
    const targetForm = document.forms[1];
    const subject = document.querySelector(`#tokenlist>.token[data-id='${targetForm.dataset.tokenid}']`);
    // form => token
    if(toToken){
        subject.getElementsByClassName("name")[0].innerHTML = targetForm.getElementsByClassName("inputDetail")[0].value;
        subject.getElementsByClassName("pos")[0].innerHTML = targetForm.getElementsByClassName("inputDetail")[1].value;
        subject.getElementsByClassName("count")[0].innerHTML = targetForm.getElementsByClassName("inputDetail")[2].value;
        subject.getElementsByClassName("total")[0].innerHTML = targetForm.getElementsByClassName("inputDetail")[3].value;
        subject.getElementsByClassName("des")[0].innerHTML = targetForm.getElementsByClassName("inputDetail")[4].value;
        // src가 존재할 경우 이미지 진행
        subject.firstElementChild.src = targetForm.getElementsByClassName("previewImage")[0].src;
        subject.firstElementChild.title = targetForm.getElementsByClassName("imageFileName")[0].innerHTML;
    }
    // token => form
    else{
        targetForm.getElementsByClassName("inputDetail")[0].value = subject.getElementsByClassName("name")[0].innerHTML;
        targetForm.getElementsByClassName("inputDetail")[1].value = subject.getElementsByClassName("pos")[0].innerHTML;
        targetForm.getElementsByClassName("inputDetail")[2].value = subject.getElementsByClassName("count")[0].innerHTML;
        targetForm.getElementsByClassName("inputDetail")[3].value = subject.getElementsByClassName("total")[0].innerHTML;
        targetForm.getElementsByClassName("inputDetail")[4].value = subject.getElementsByClassName("des")[0].innerHTML;
        // src가 존재할 경우 이미지 진행 - 없을 경우 내용지우기
        targetForm.getElementsByClassName("previewImage")[0].src = subject.firstElementChild.src;
        targetForm.getElementsByClassName("previewImage")[0].style.height = "206px";
        targetForm.getElementsByClassName("imageFileName")[0].innerHTML = subject.firstElementChild.title;
    }
}

function historyToggle(){
    document.getElementById("positionHistory").style.display = "none";
}