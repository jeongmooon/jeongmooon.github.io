const toogleBtn = document.querySelector('.navbar__toogleBtn');
const menu = document.querySelector('.navbar__menu');
const icons = document.querySelector('.navbar__icons');
const navbarSub=document.querySelector('.navbar__note__sub');
const navbarNote=document.querySelector('.navbar__menu__note');


toogleBtn.addEventListener('click', ()=>{
    menu.classList.toggle('active');
    icons.classList.toggle('active');
})

navbarNote.addEventListener('click', ()=>{
    navbarSub.classList.toggle('active');
})
