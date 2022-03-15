
let start_year="1900";
let today = new Date();
let today_year= today.getFullYear();
let index=0;

for(let y=start_year; y<=today_year; y++){
    document.getElementById('select_year').options[index] = new Option(y, y); index++; 
}

index=0;

for(let m=1; m<=12; m++){
    document.getElementById('select_month').options[index] = new Option(m, m); index++;
}

lastday();
function lastday(){

    let Year=document.getElementById('select_year').value;
    let Month=document.getElementById('select_month').value;
    let day=new Date(new Date(Year,Month,1)-86400000).getDate();

    let dayindex_len=document.getElementById('select_day').length;

    if(day>dayindex_len){
        for(let i=(dayindex_len+1); i<=day; i++){
            document.getElementById('select_day').options[i-1] = new Option(i, i);
        }
    } else if(day<dayindex_len){ 
        for(let i=dayindex_len; i>=day; i--){ 
            document.getElementById('select_day').options[i]=null; 
        } 
    }
}

education();
function education(){
    const Education = ["선택하세요","초등학교","중학교","고등학교","전문대학교","인문대학교"];

    for(let i=0; i<Education.length; i++){
        document.getElementById('education').options[i] = new Option(Education[i],Education[i]);
    }

    childnum();
    function childnum(){
        const childnum =["선택","없음",1,2,3,4];
        
        for(let i=0; i<Education.length; i++){
            document.getElementById('childnum').options[i] = new Option(childnum[i],childnum[i]);
        }
    }
}