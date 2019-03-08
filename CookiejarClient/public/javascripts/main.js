

function logout_cookie(event){
    event.preventDefault();
    window.location.href='/';
}

function bake_cookie(event){
    event.preventDefault();
    const bake_cookie = document.getElementById('bake_id').value;
    const prv_key = document.getElementById('prv_key').value;
    const C_Name = document.getElementById('CookieName').value;
    if(bake_cookie.length === 0){
    alert("Please enter a number");

     }
    else{
    $.post('/bake',{cookie: bake_cookie, pkey:prv_key,name:C_Name},(data, textStatus, jqXHR)=>{
        alert(data.message);
        }, 'json');
    }
}

function eat_cookie(event){
    event.preventDefault();
    const eat_cookie = document.getElementById('eat_id').value;
    const prv_key = document.getElementById('prv_key').value;
    console.log("value"+eat_cookie)
    if(eat_cookie.length === 0){
        alert("Please enter the number");
    
    }
    else{
        $.post('/eat',{ cookie : eat_cookie, pkey:prv_key},(data,textStatus,jqXHR)=>{
            alert(data.message);
        },'json');
    }

}

function count_cookie(event){
    event.preventDefault();
    const prv_key = document.getElementById('prv_key').value;
    $.post('/count',{pkey:prv_key},(data, textStatus, jqXHR)=>{
        alert("Your cookie count is:"  + data.balance);
        document.getElementById("count_id").value ="Your cookies = " + data.balance;
    },'json');
}
