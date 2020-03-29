// 오버레이 창 열기
function overlayOn(){
    document.getElementById("overlay").style.display = "flex";
    document.body.style.overflow = "hidden";
}
// 오버레이 창 닫기
function overlayOff(){
    document.getElementById("overlay").style.display = "none";
    document.body.style.overflow = "visible";
    historyToggle(true);
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
        
        // 위치내역 초기화
        document.getElementById("positionHistory").innerHTML = "";
        let lastPos = subject.getElementsByClassName("pos")[0].innerHTML
        let countIndex = 0;
        if(lastPos!=="") addHistory(lastPos, countIndex++);
        const posList = subject.querySelectorAll(".poslist>div");
        for (let i = 0; i < posList.length; i++) {
            addHistory(posList[i].innerHTML, countIndex++);
        }

        targetForm.getElementsByClassName("inputDetail")[2].value = subject.getElementsByClassName("count")[0].innerHTML;
        targetForm.getElementsByClassName("inputDetail")[3].value = subject.getElementsByClassName("total")[0].innerHTML;
        targetForm.getElementsByClassName("inputDetail")[4].value = subject.getElementsByClassName("des")[0].innerHTML;
        // src가 존재할 경우 이미지 진행 - 없을 경우 내용지우기
        targetForm.getElementsByClassName("previewImage")[0].src = subject.firstElementChild.src;
        targetForm.getElementsByClassName("previewImage")[0].style.height = "206px";
        targetForm.getElementsByClassName("imageFileName")[0].innerHTML = subject.firstElementChild.title;
    }
}