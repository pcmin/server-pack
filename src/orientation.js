// 방향값 객체
var orientationValue = {
    isSupport   : false,
    alpha       : null,
    beta        : null,
    gamma       : null
};

//지자기 센서를 지원하는지 확인합니다.
if (window.DeviceOrientationEvent){ orientationValue.isSupport = true; }

function orientTemplate(){
    return `
    <div class="stat">
        <div class="submitArea">
            <input type="button" class="btn cancel" value="닫기" onclick="inactiveOrient()">
        </div>
        <div class="message">물체 앞에서 스피커를 향해 화살표를 누르세요</div>
        <div id="garden" onclick="readOrientVal()">
            <svg id="arrowSign" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M66.9 289.5l-22.2-22.2c-9.4-9.4-9.4-24.6 0-33.9L239 39c9.4-9.4 24.6-9.4 33.9 0l194.3 194.3c9.4 9.4 9.4 24.6 0 33.9L445 289.4c-9.5 9.5-25 9.3-34.3-.4L296 168.6V456c0 13.3-10.7 24-24 24h-32c-13.3 0-24-10.7-24-24V168.6L101.2 289.1c-9.3 9.8-24.8 10-34.3.4z"/></svg>
        </div>
        <div class="equalContainer">
            <div id="rtalpha" class="data">null</div>
            <div id="rtbeta" class="data">null</div>
            <div id="rtgamma" class="data">null</div>
        </div>
        <div class="equalContainer">
            <div id="alpha" class="data"></div>
            <div id="beta" class="data"></div>
            <div id="gamma" class="data"></div>
        </div>
    </div>`;
}

function realtimeCatchOrient(event) {
    // const absolute = event.absolute;
    orientationValue.alpha = event.alpha; //(0, 360)
    orientationValue.beta = event.beta; //(-180, 180)
    orientationValue.gamma = event.gamma; //(-90, 90)

    // 실시간으로 값이 보여집니다.
    document.getElementById("rtalpha").innerHTML = orientationValue.alpha;
    document.getElementById("rtbeta").innerHTML = orientationValue.beta;
    document.getElementById("rtgamma").innerHTML = orientationValue.gamma;

    // 화살표 바닥과 평행하게 표시
    document.getElementById("arrowSign").style.transform = `rotateX(${-orientationValue.beta}deg) rotateY(${orientationValue.gamma}deg)`
}

function activeOrient(ev){

    // orientOverlay 바로 아래에 붙이기
    const newNode = document.createElement("div")
    newNode.id = "orientOverlay";
    newNode.innerHTML = orientTemplate();

    const refNode = ev.currentTarget;
    refNode.parentElement.insertBefore(newNode, refNode)
    
    window.addEventListener("deviceorientation", realtimeCatchOrient, true);
    
    const orientVal = refNode.dataset.val.split(',');
    document.getElementById("alpha").innerHTML = orientVal[0];
    document.getElementById("beta").innerHTML = orientVal[1];
    document.getElementById("gamma").innerHTML = orientVal[2];
    // 방향오버레이 외곽클릭시 창 닫기
    document.getElementById("orientOverlay").onmousedown = function(ev){if(ev.target === ev.currentTarget) inactiveOrient()}    

    document.body.style.overflow = "hidden";
}

function inactiveOrient(){
    window.removeEventListener("deviceorientation", realtimeCatchOrient);
    // orientOverlay 제거
    const refNode = document.getElementById("orientOverlay")
    refNode.parentElement.removeChild(refNode);

    document.body.style.overflow = "visible";
}

function readOrientVal(){
    const alpha = orientationValue.alpha;
    const beta = orientationValue.beta;
    const gamma = orientationValue.gamma;

    document.getElementById("alpha").innerHTML = alpha;
    document.getElementById("beta").innerHTML = beta;
    document.getElementById("gamma").innerHTML = gamma;

    console.log(alpha, beta, gamma);
    if(alpha !== null && alpha !== "" && beta !== null && beta !== "" && gamma !== null && gamma !== ""){
        const orientVal = `${alpha},${beta},${gamma}`;
        const refNode = document.getElementById("orientOverlay").nextElementSibling;
        refNode.value = "📌";
        refNode.dataset.val = orientVal;
        refNode.title = orientVal;
    }
}