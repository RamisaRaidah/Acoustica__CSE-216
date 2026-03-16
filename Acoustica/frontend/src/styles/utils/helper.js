import { initScrollbar, removeScrollbar } from "/src/components/scrollbar/scrollbar.js";

export function enterApp(){
    const page=document.getElementById('page');
    page.innerHTML="";
    page.style.display='none';
    const app=document.getElementById('app');
    app.style.display='block';
    initScrollbar();
}

export function exitApp(){
    const sidebar=document.getElementById('sidebar');
    sidebar.innerHTML="";
    const topbar=document.getElementById('topbar');
    topbar.innerHTML="";
    const content=document.getElementById('content');
    content.innerHTML="";
    const music_player=document.getElementById('music_player');
    music_player.innerHTML="";
    const page=document.getElementById('page');
    page.style.display='block';
    removeScrollbar();
}