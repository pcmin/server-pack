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
    const fileName = `${files[0].name}(${(files[0].size/1024).toFixed(2)}kB)`;
    const reader = new FileReader();
    reader.readAsDataURL(files[0]);
    reader.onload = function(ev){
        try{
            const imgUrl = ev.target.result
            document.getElementById("imageFileName"+sign).innerHTML = fileName;
            document.getElementById("previewImage"+sign).src = imgUrl;
            document.getElementById("imageBuffer"+sign).value = imgUrl;
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
function template(img, name, rent, cnt, pos){return `<img src="${img}" class="thumbnail" width="100%"><div class="textgroup"><div><div class="text name" title="${name}">${name}</div><div class="text rent" title="${rent}">${rent}</div><div class="text count" title="${cnt}">${cnt}</div></div><div class="text pos" title="${pos}">${pos}</div></div><button class="btn delete" title="삭제하기"><svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg></button>`;}

// 토큰 추가
function addToken(data){
    var tok = document.createElement("div");
    tok.classList.add("token");
    tok.innerHTML = template(data.img, data.name, data.rent, data.count, data.pos);
    document.getElementById("tokenlist").appendChild(tok);
}
// 토큰 삭제
function delelteToken(ev){
    ev.target.parentElement.removeChild(ev.target);
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
// menuList[1].click();