// 이미지 입력
function imageSelect(){
    let uploadBtn = document.createElement("input");
    uploadBtn.type = "file";
    uploadBtn.onchange = function(){
        uploadProcess(this.files);
    }
    uploadBtn.click();
}
function uploadProcess(files){
    if(!files[0]) return 0;
    console.log(files[0])
    const fileName = `${files[0].name}(${(files[0].size/1024).toFixed(2)}kB)`;
    const reader = new FileReader();
    reader.readAsDataURL(files[0]);
    reader.onload = function(ev){
        try{
            const imgUrl = ev.target.result
            document.getElementById("imageFileName").innerHTML = fileName;
            document.getElementById("previewImage").src = imgUrl;
            document.getElementById("imageBuffer").value = imgUrl;
            document.getElementById("previewImage").style.width = "100%";
        }
        catch (err){
            console.log("ERR: ", err);
            alert("ERROR : "+err.name+"/"+err.message);
        }
    }
}

// 메뉴 클릭
var menuList = document.querySelectorAll("#menu>li");
for(let i=0; i<menuList.length; i++){
    if(i==1) continue;
    menuList[i].addEventListener("click", (ev)=>{
        document.getElementById("titleName").innerHTML = ev.target.innerHTML
        document.getElementById("mainArticle").innerHTML = template[i];
    });
}

const template = [
`<form action="/save" method="post" id="inputForm">
    <div id="inputArea">
        <div id="textUpload">
            <div class="label">이름</div>
            <input type="text" class="inputDetail" name="name" placeholder="이름(필수)" required>
            <div class="label">위치</div>
            <input type="text" class="inputDetail" name="position" placeholder="위치(GPS 태그 또는 글)">
            <div class="label">재고/수량</div>
            <input type="number" class="inputDetail" name="count" placeholder="재고/수량">
            <div class="label">대여여부</div>
            <input type="text" class="inputDetail" name="rental" placeholder="대여여부">
            <div class="label">설명</div>
            <textarea type="text" class="inputDetail" name="description" placeholder="물건에 대한 구체적인 설명을 입력해주세요"></textarea>
        </div>
        <div id="imageUpload">
            <input id="imageBuffer" type="hidden" name="image">
            <div id="imageSubmit">
                <input type="button" value="파일 선택" onclick="imageSelect()">
                <div id="imageFileName">선택된 파일 없음</div>
            </div>
            <div id="imageArea">
                <img id="previewImage" src="#" alt="이미지 없음" width="auto">
            </div>
        </div>
    </div>
    <div id="submitArea">
        <input class="btn" type="submit">
        <input class="btn" type="reset">
    </div>
</form>`
];