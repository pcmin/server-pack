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
            }, ()=>{
                alert("성공적으로 저장하였습니다.");
                resetForm(sign, true);
                // 모든 토큰 삭제
                document.getElementById("tokenlist").innerHTML = "";
            },
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
            setUpdateContent();
        },
        ()=>{alert("변경에 실패하였습니다. 다시시도 해주세요.")})
    }
}