const slide = document.querySelectorAll(".mainBody");

let current = 0;
let next = 1;
let id;

function slideAnimation(){
    id = window.setInterval(()=>{
        if(next > 2){
            next=0;
        }

        for(let i=0; i<2; i++){
            slide[i].classList.remove("in","out");
            slide[i].classList.add("jump");
        }

        slide[current].classList.remove("in","out");
        slide[current].classList.add("out");

        slide[next].classList.remove("in","out");
        slide[next].classList.add("out");

        current = next;
        next++;
    }, 3000);
}