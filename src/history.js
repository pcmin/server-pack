// 위치 내역으로 값 출력
function addHistory(data, index){
    const historyToken = document.createElement("div");
    historyToken.classList.add("equalContainer")
    historyToken.innerHTML = `
    <input type="text" class="inputPos" name="position" placeholder="위치값 없음" value="${data}">
    <input type="button" class="btn holdSize update" value="✔" title="현 내용으로 변경" onclick="updateHistory(event,${index})">`;
    document.getElementById("positionHistory").appendChild(historyToken);
}

// 위치내역 변경
function updateHistory(ev, index){
    const targetName = ev.currentTarget.parentElement.parentElement.previousElementSibling.previousElementSibling.previousElementSibling.value;
    const targetVal = ev.currentTarget.previousElementSibling.value;
    console.log(targetName, targetVal)
    if(!confirm(`정말로 위치내용을 \'${targetVal}\'로 변경합니까?`)) return 0;
    ajaxPipe({
        method : "POST",
        url : "/savelocate",
        message: `${targetName},${targetVal},${index}`
    }, ()=>{alert("성공적으로 변경하였습니다.");},
    ()=>{alert("변경에 실패하였습니다. 다시시도 해주세요.")})
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