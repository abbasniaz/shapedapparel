(function(){
  /* menu */
  document.querySelector(".menu-toggle")?.addEventListener("click",()=>{
    const nav=document.querySelector(".nav");
    if(!nav) return;
    nav.classList.toggle("open");
    document.querySelector(".menu-toggle")?.setAttribute("aria-expanded",String(nav.classList.contains("open")));
  });

  /* cart */
  function toggleCart(open){
    const cartEl=document.querySelector(".cart");
    const overlay=document.querySelector(".overlay");
    if(!cartEl||!overlay) return;
    cartEl.classList.toggle("open",open);
    overlay.classList.toggle("show",open);
    cartEl.setAttribute("aria-hidden",String(!open));
  }
  document.querySelector(".cart-button")?.addEventListener("click",()=>toggleCart(true));
  document.querySelector(".cart-close")?.addEventListener("click",()=>toggleCart(false));
  document.querySelector(".overlay")?.addEventListener("click",()=>toggleCart(false));

  /* slideshow */
  const hero=document.querySelector(".hero-slideshow");
  if(!hero) return;

  const slides=[...hero.querySelectorAll(".hero-slide")];
  const dots=[...hero.querySelectorAll(".hero-dot")];
  const nextBtn=hero.querySelector(".hero-next");
  const prevBtn=hero.querySelector(".hero-prev");
  if(!slides.length||!dots.length||!nextBtn||!prevBtn) return;

  let index=0, timer=null;
  const interval=4000, swipeThreshold=40;
  let touchStartX=0, touchEndX=0;

  function show(i){
    index=(i+slides.length)%slides.length;
    slides.forEach((s,si)=>s.classList.toggle("is-active",si===index));
    dots.forEach((d,di)=>{
      const active=di===index;
      d.classList.toggle("is-active",active);
      d.setAttribute("aria-selected",String(active));
    });
  }
  function next(){show(index+1)}
  function prev(){show(index-1)}
  function stop(){if(timer){clearInterval(timer);timer=null}}
  function start(){stop();timer=setInterval(next,interval)}

  nextBtn.addEventListener("click",()=>{next();start()});
  prevBtn.addEventListener("click",()=>{prev();start()});
  dots.forEach((dot,i)=>dot.addEventListener("click",()=>{show(i);start()}));

  hero.addEventListener("mouseenter",stop);
  hero.addEventListener("mouseleave",start);

  hero.addEventListener("touchstart",(e)=>{
    stop();
    touchStartX=e.changedTouches[0].clientX;
    touchEndX=touchStartX;
  },{passive:true});
  hero.addEventListener("touchmove",(e)=>{
    touchEndX=e.changedTouches[0].clientX;
  },{passive:true});
  hero.addEventListener("touchend",(e)=>{
    touchEndX=e.changedTouches[0].clientX;
    const deltaX=touchEndX-touchStartX;
    if(Math.abs(deltaX)>=swipeThreshold){ deltaX<0 ? next() : prev(); }
    start();
  },{passive:true});

  show(0);
  start();
})();
