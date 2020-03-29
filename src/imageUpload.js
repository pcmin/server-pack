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