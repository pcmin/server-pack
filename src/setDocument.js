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
// 검색영역에 Enter시 내용 검색 실행
document.getElementById("searchForm").addEventListener("keypress",(ev)=>{if(ev.keyCode===13) searchContent()})