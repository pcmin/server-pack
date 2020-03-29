// 위치값 토큰 양식 반환함수
function historyTemplate(data){
    return `<input type="text" class="inputPos" name="position" placeholder="위치값 없음" value="${data}">
    <input type="button" class="btn holdSize right update" value="✔" title="현 내용으로 변경" onclick="updateHistory(event)">`
}

// 위치 내역으로 값 출력
function addHistory(data){
    const historyToken = document.createElement("div");
    historyToken.classList.add("equalContainer")
    historyToken.innerHTML = historyTemplate(data);
    document.getElementById("positionHistory").appendChild(historyToken);
}

// 위치내역 변경
function updateHistory(ev){
    const targetName = ev.currentTarget.parentElement.parentElement.previousElementSibling.previousElementSibling.previousElementSibling.value;
    const targetVal = ev.currentTarget.previousElementSibling.value;

    let index = 0; // 인덱스 위치 탐색
    let searchNode = ev.currentTarget.parentElement.previousElementSibling;
    while(searchNode !== null){
        index++;
        searchNode = searchNode.previousElementSibling;
    }
    
    if(!confirm(`정말로 위치내용을 \'${targetVal}\'로 변경합니까?`)) return 0;
    ajaxPipe({
        method : "POST",
        url : "/savelocate",
        message: `${targetName},${targetVal},${index}`
    }, ()=>{
        alert("성공적으로 위치 내용을 변경하였습니다.");
        // 토큰에 내용 적용
        setupdateHistory(index);
    },
    ()=>{alert("위치 내용 변경에 실패하였습니다. 다시시도 해주세요.")})
}

// 변경된 위치내역 토큰에 적용
function setupdateHistory(index){
    const targetForm = document.forms[1];
    const subject = document.querySelector(`#tokenlist>.token[data-id='${targetForm.dataset.tokenid}']`);
    subject.getElementsByClassName("pos")[index].innerHTML = targetForm.getElementsByClassName("inputPos")[index].value
}

// 위치 내역 토글, isHideForce=true일 경우 강제로 숨기기
function historyToggle(isHideForce=false){
    const toggleBtn = document.getElementById("positionListBtn");
    const st = toggleBtn.dataset.state;
    if(isHideForce || st === "1"){
        document.getElementById("positionHistory").style.display = "none";
        toggleBtn.dataset.state = "0";
        toggleBtn.value = "▼";
        toggleBtn.title = "위치 내역 보이기";
    }
    else{
        document.getElementById("positionHistory").style.display = "block";
        toggleBtn.dataset.state = "1";
        toggleBtn.value = "▲";
        toggleBtn.title = "위치 내역 숨기기";
    }
}