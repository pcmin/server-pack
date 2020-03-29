// 토큰 양식 반환함수
function template(name, pos, poslist, cnt, tot, des, img, imgN){return `<img src="${img}" class="thumbnail" title="${imgN}" width="100%"><div class="textgroup"><div><div class="text name" title="이름:${name}">${name}</div><div class="text count" title="현재 수량:${cnt}">${cnt}</div>/<div class="text total" title="총 재고량:${tot}">${tot}</div></div><div class="text pos" title="위치:${pos}">${pos}</div><div class="text poslist">${poslist}</div><div class="text des">${des}</div></div><button class="btn delete" title="삭제하기" onclick="deleteContent(event)"><svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg></button>`;}

// 토큰 추가
function addToken(data){
    var tok = document.createElement("div");
    tok.classList.add("token");
    tok.dataset.id = data.n;
    console.log(3, data.i) //*** image test log ********************************************************************************** */
    // 최근위치만 디스플레이되게
    let posList = data.p.split(',').reverse();
    const firstPos = posList.shift();
    let posListStr = "";
    posList.forEach(element => {posListStr += `<div class="pos">${element}</div>`});

    tok.innerHTML = template(data.n, firstPos, posListStr, data.c, data.t, data.d, data.i, data.in);
    tok.addEventListener("click", (ev)=>{showContent(ev)})
    document.getElementById("tokenlist").appendChild(tok);
}

// 토큰 삭제
function delelteToken(token){document.getElementById("tokenlist").removeChild(token)}