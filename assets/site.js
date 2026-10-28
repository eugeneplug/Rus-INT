(function(){
"use strict";
var RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
/* на телефонах экономим: меньше контекстов WebGL, ниже плотность пикселей, без сглаживания */
var COARSE=matchMedia('(pointer:coarse)').matches;
var MOBILE=COARSE||innerWidth<=820;
var DPRMAX=MOBILE?1.25:2;
var AA=!MOBILE;
if(MOBILE)document.documentElement.classList.add('lite');
var $=function(s,c){return (c||document).querySelector(s)};
var $$=function(s,c){return [].slice.call((c||document).querySelectorAll(s))};

/* ============ данные ============ */
var PROJECTS=[
 {n:'Металлконструкт',d:'Связываем 1С, CRM и склад в одну рабочую структуру',y:'2026',t:'Интеграция',v:1},
 {n:'ТехноДеталь',d:'Разрабатываем 3D-модели деталей, изделий и чертежей',y:'2025',t:'3D',v:2},
 {n:'СервисПро',d:'Подключаем ИИ для более точного анализа выручки и конверсии',y:'2025',t:'ИИ',v:3},
 {n:'ЛогистикПлюс',d:'Делаем сайты и сервисы под вашу задачу',y:'2025',t:'Разработка',v:4},
 {n:'СтройХолдинг',d:'Настраиваем портал под ваш процесс продаж',y:'2024',t:'Битрикс24',v:5},
 {n:'МедЛайн',d:'Собираем дашборды, по которым принимаются решения',y:'2024',t:'Аналитика',v:6}
];


/* Отрасли, где наши направления работают напрямую: производство и склад
   для интеграции и 3D, оптовые продажи для CRM, сервис для ИИ-разбора. */
var INDUSTRIES=['Машиностроение','Металлообработка','Мебельное производство',
 'Пищевое производство','Оптовая торговля','Дистрибуция','Логистика и склад',
 'Строительство','Инженерные системы','Сервис и обслуживание','Медицинские клиники',
 'Автобизнес','Аренда техники','Проектные бюро','Производство упаковки','Приборостроение'];

/* ============ прелоадер ============ */
(function(){
  var pre=$('#pre'),n=$('#preN'),b=$('#preB'),v=0;
  function done(){pre.classList.add('off');var hr=$('#hero');if(hr)hr.classList.add('on')}
  if(document.documentElement.classList.contains('nopre')){done();return}
  var t=setInterval(function(){
    v+=Math.random()*11+5;
    if(v>=100){v=100;clearInterval(t);setTimeout(done,300)}
    n.textContent=Math.floor(v);b.style.width=v+'%';
  },RM?8:70);
  setTimeout(done,4200);
  addEventListener('error',done);
})();

/* ============ шапка ============ */
(function(){
  var hdr=$('#hdr'),st=$('#sticky');
  addEventListener('scroll',function(){
    hdr.classList.toggle('stuck',scrollY>24);
    st.classList.toggle('on',scrollY>innerHeight*.7);
  },{passive:true});
  var bg=$('#burger'),nav=$('#nav');
  bg.addEventListener('click',function(){var o=nav.classList.toggle('open');
    bg.classList.toggle('on',o);bg.setAttribute('aria-expanded',o)});
  $$('#nav a').forEach(function(a){a.addEventListener('click',function(){
    nav.classList.remove('open');bg.classList.remove('on')})});
})();

/* ============ сердечко на кнопках заявки ============ */


/* ============ схема: чип подсвечивает свою нить ============ */
(function(){
  $$('.hv .chip-g').forEach(function(g){
    var w=$('.hv .wire[data-w="'+g.getAttribute('data-w')+'"]');
    if(!w)return;
    g.addEventListener('pointerenter',function(){w.classList.add('lit')});
    g.addEventListener('pointerleave',function(){w.classList.remove('lit')});
  });
})();

/* ============ вращающееся слово в заголовке ============ */
(function(){
  var box=$('#rot');if(!box)return;
  var el=box.firstElementChild;if(!el)return;
  var WORDS=['автономный ИИ на ваших серверах.','единый механизм 1С, CRM и склада.',
           'прозрачный расчёт маржи сделок.','кастомный софт под ваши правила.',
           '3D-сканирование и инжиниринг.'],i=0;

  /* невидимый измеритель — ширину считаем по нему, а не по живому слову */
  var ghost=document.createElement('span');
  ghost.style.cssText='position:absolute;left:-9999px;top:0;white-space:pre;visibility:hidden';
  document.body.appendChild(ghost);
  function w(txt){
    var cs=getComputedStyle(el);
    ghost.style.font=cs.fontStyle+' '+cs.fontWeight+' '+cs.fontSize+'/'+cs.lineHeight+' '+cs.fontFamily;
    ghost.style.letterSpacing=cs.letterSpacing;
    ghost.textContent=txt;
    return ghost.offsetWidth;
  }
  /* Высоту считаем по невидимому измерителю той же ширины: фраза может
     занять одну или две строки, и блок подстраивается под неё плавно. */
  function h(txt){
    var cs=getComputedStyle(el);
    ghost.style.font=cs.fontStyle+' '+cs.fontWeight+' '+cs.fontSize+'/'+cs.lineHeight+' '+cs.fontFamily;
    ghost.style.letterSpacing=cs.letterSpacing;
    ghost.style.whiteSpace='normal';
    ghost.style.width=box.offsetWidth+'px';
    ghost.textContent=txt;
    return ghost.offsetHeight;
  }
  /* Блок подстраивается под текущую фразу, а обёртка держит высоту по
     самому длинному варианту — заголовок лежит в ней абсолютом, поэтому
     содержимое под ним не сдвигается ни при какой смене текста. */
  var wrap=$('#claimBox'), h1=box.closest('.claim');
  function fit(){
    /* Пока главная скрыта, ширина блока равна нулю: измеритель переносит
       фразу по одному слову и высота выходит втрое больше настоящей.
       Поэтому считаем только на видимом блоке. */
    if(!box.offsetWidth)return;
    var cur=h(el.textContent), max=0;
    WORDS.forEach(function(t){var v=h(t);if(v>max)max=v});
    box.style.height=cur+'px';
    if(wrap&&h1)wrap.style.minHeight=(h1.offsetHeight-cur+max)+'px';
  }
  fit();setTimeout(fit,300);
  /* когда главная снова появляется, блок получает ширину — пересчитываем.
     Наблюдатель ловит это сам, а вызов из маршрутизатора страхует на случай,
     если браузер его не поддерживает. */
  window.__fitClaim=fit;
  if(window.ResizeObserver){
    var ro=new ResizeObserver(function(){fit()});
    ro.observe(box);
  }
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fit);
  addEventListener('resize',fit);
  if(RM)return;

  var busy=false;
  setInterval(function(){
    if(busy)return;busy=true;
    i=(i+1)%WORDS.length;
    var next=WORDS[i];
    el.classList.add('out');                 /* текущее уезжает вверх */
    box.style.height=h(next)+'px';           /* блок плавно подстраивается */
    setTimeout(function(){
      el.classList.add('nt');                /* переходы выключены */
      el.classList.remove('out');
      el.classList.add('in');                /* мгновенно ставим снизу */
      el.textContent=next;
      void el.offsetWidth;                   /* форсируем пересчёт стиля */
      el.classList.remove('nt');
      el.classList.remove('in');             /* выезжает на место */
      busy=false;
    },430);
  },2000);
})();

/* ============ появление ============ */
function countUpEl(c){
  var to=+c.getAttribute('data-c'),t0=null;
  requestAnimationFrame(function st(t){
    if(!t0)t0=t;var pr=Math.min((t-t0)/1500,1);
    c.textContent=Math.floor(to*(1-Math.pow(1-pr,3)));
    if(pr<1)requestAnimationFrame(st);
  });
}
var io=new IntersectionObserver(function(en){en.forEach(function(e){
  if(!e.isIntersecting)return;e.target.classList.add('in');io.unobserve(e.target);
  $$('[data-c]',e.target).forEach(function(c){
    var to=+c.getAttribute('data-c'),t0=null;
    requestAnimationFrame(function s(t){if(!t0)t0=t;var p=Math.min((t-t0)/1500,1);
      c.textContent=Math.floor(to*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(s)});
  });
})},{threshold:.12,rootMargin:'0px 0px -60px'});

/* ============ мини-3D в карточках проектов ============ */
var cardViewer=function(){return null};
/* лёгкие заглушки вместо шести сцен на телефоне */
var CARD_ART=[
 '<svg viewBox="0 0 100 100" fill="none"><circle cx="40" cy="50" r="20" stroke="#E9EBF2" stroke-width="3"/><circle cx="60" cy="50" r="20" stroke="#1F3CFF" stroke-width="3"/></svg>',
 '<svg viewBox="0 0 100 100" fill="none"><rect x="24" y="52" width="24" height="22" rx="3" stroke="#E9EBF2" stroke-width="3"/><rect x="52" y="52" width="24" height="22" rx="3" stroke="#E9EBF2" stroke-width="3"/><rect x="38" y="28" width="24" height="22" rx="3" stroke="#1F3CFF" stroke-width="3"/></svg>',
 '<svg viewBox="0 0 100 100" fill="none"><rect x="30" y="36" width="40" height="34" rx="8" stroke="#E9EBF2" stroke-width="3"/><circle cx="42" cy="52" r="3.6" fill="#1F3CFF"/><circle cx="58" cy="52" r="3.6" fill="#1F3CFF"/><path d="M50 36V26" stroke="#E9EBF2" stroke-width="3"/><circle cx="50" cy="23" r="4" fill="#E8FF4D"/></svg>',
 '<svg viewBox="0 0 100 100" fill="none"><path d="M50 24l22 12v28L50 76 28 64V36z" stroke="#E9EBF2" stroke-width="3" stroke-linejoin="round"/><path d="M50 50l22-14M50 50v26M50 50L28 36" stroke="#1F3CFF" stroke-width="2.4"/></svg>',
 '<svg viewBox="0 0 100 100" fill="none"><text x="50" y="62" text-anchor="middle" font-family="Onest,sans-serif" font-size="34" font-weight="700" fill="#E9EBF2">24</text><rect x="26" y="70" width="48" height="4" rx="2" fill="#1F3CFF"/></svg>',
 '<svg viewBox="0 0 100 100" fill="none"><rect x="28" y="26" width="38" height="48" rx="4" stroke="#E9EBF2" stroke-width="3"/><path d="M36 40h22M36 50h22M36 60h14" stroke="#1F3CFF" stroke-width="2.6"/><path d="M68 34l8 8-18 18-9 1 1-9z" stroke="#E9EBF2" stroke-width="3" stroke-linejoin="round"/></svg>'
];
(function(){
  if(typeof THREE==='undefined')return;
  var LIGHT=0xE7E9F5, ACC=0x1F3CFF, LIME=0xE8FF4D, DARK=0x2A2C3A;
  function mat(c,sh){return new THREE.MeshPhongMaterial({color:c,shininess:sh||70,specular:0x9AA4CC})}
  function box(w,h,d,c,x,y,z,g){
    var m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(c));
    m.position.set(x||0,y||0,z||0);g.add(m);return m;
  }

  /* сегментные цифры для «24» */
  function digit(which,c,g,ox){
    var H=1.3,W=.62,t=.15,seg={
      a:[0,H/2,W,t],b:[W/2,H/4,t,H/2],c:[W/2,-H/4,t,H/2],d:[0,-H/2,W,t],
      e:[-W/2,-H/4,t,H/2],f:[-W/2,H/4,t,H/2],g:[0,0,W,t]};
    (which==='2'?['a','b','g','e','d']:['f','g','b','c']).forEach(function(k){
      var s=seg[k];box(s[2],s[3],t,c,s[0]+ox,s[1],0,g);
    });
  }

  var BUILD=[
    /* 0 · интеграция — две дуговые стрелки обмена.
       Каждая стрелка строится одним замкнутым контуром: внешняя дуга,
       барбы, остриё, внутренняя дуга и полукруглый хвост. Так дуга и
       наконечник — одна деталь, стык бесшовный при любом ракурсе. */
    function(g){
      /* W — полутолщина дуги, BARB — вылет барбов, TIPA — вынос остриё.
         A1 подобран так, чтобы остриё одной стрелки не заходило в хвост
         другой: между ними остаётся зазор около 9°. */
      var R=1.0, W=.12, BARB=.29, TIPA=.32;
      var A0=Math.PI*0.93, A1=Math.PI*0.21;
      function P(a,r){return [Math.cos(a)*r, Math.sin(a)*r]}
      function arrowShape(){
        var sh=new THREE.Shape(),i,a,n=64,p;
        p=P(A0,R+W);sh.moveTo(p[0],p[1]);
        for(i=1;i<=n;i++){a=A0+(A1-A0)*i/n;p=P(a,R+W);sh.lineTo(p[0],p[1])}
        p=P(A1,R+BARB);sh.lineTo(p[0],p[1]);          /* внешний барб */
        p=P(A1-TIPA,R);sh.lineTo(p[0],p[1]);          /* остриё по касательной */
        p=P(A1,R-BARB);sh.lineTo(p[0],p[1]);          /* внутренний барб */
        for(i=0;i<=n;i++){a=A1+(A0-A1)*i/n;p=P(a,R-W);sh.lineTo(p[0],p[1])}
        var c=P(A0,R);
        sh.absarc(c[0],c[1],W,A0+Math.PI,A0,true);    /* скруглённый хвост */
        return sh;
      }
      var geo=new THREE.ExtrudeGeometry(arrowShape(),{depth:.17,bevelEnabled:true,
        bevelSize:.1,bevelThickness:.1,bevelSegments:8,curveSegments:24});
      geo.translate(0,0,-.085);
      var mm=mat(ACC,120);
      g.add(new THREE.Mesh(geo,mm));
      var second=new THREE.Mesh(geo,mm);
      second.rotation.z=Math.PI;                      /* вторая стрелка — та же деталь */
      g.add(second);
      g.rotation.z=-.1;
    },
    /* 1 · 3D-модели деталей — шестерня каркасом.
       Тело почти прозрачное, объём читается по рёбрам: так деталь выглядит
       как модель в CAD, а не как готовое изделие. */
    function(g){
      var Z=14, R=.85, TH=.2, BORE=.3, DEP=.44;
      var st=Math.PI*2/Z, sh=new THREE.Shape(), i, a2, pts=[];
      function P(a,r){return [Math.cos(a)*r, Math.sin(a)*r]}
      for(i=0;i<Z;i++){
        a2=i*st;
        pts.push(P(a2,R),P(a2+st*.28,R),P(a2+st*.36,R+TH),P(a2+st*.64,R+TH),P(a2+st*.72,R));
      }
      sh.moveTo(pts[0][0],pts[0][1]);
      for(i=1;i<pts.length;i++)sh.lineTo(pts[i][0],pts[i][1]);
      sh.closePath();
      var hole=new THREE.Path();hole.absarc(0,0,BORE,0,Math.PI*2,true);sh.holes.push(hole);

      var geo=new THREE.ExtrudeGeometry(sh,{depth:DEP,bevelEnabled:false,curveSegments:28});
      geo.translate(0,0,-DEP/2);

      /* полупрозрачная заливка задаёт объём и перекрывает дальние рёбра */
      var body=new THREE.Mesh(geo,new THREE.MeshPhongMaterial({
        color:ACC,shininess:60,specular:0x8FA0FF,transparent:true,opacity:.13,
        depthWrite:false,side:THREE.DoubleSide}));
      g.add(body);

      /* сам каркас */
      g.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo,18),
        new THREE.LineBasicMaterial({color:ACC,transparent:true,opacity:.95})));

      /* ось и спицы — деталь читается как чертёж */
      var axis=new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.CylinderGeometry(BORE*.34,BORE*.34,DEP*1.5,10),18),
        new THREE.LineBasicMaterial({color:LIGHT,transparent:true,opacity:.5}));
      axis.rotation.x=Math.PI/2;g.add(axis);
      for(i=0;i<4;i++){
        var an=i*Math.PI/2+Math.PI/4;
        var sp=new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(Math.cos(an)*BORE,Math.sin(an)*BORE,0),
            new THREE.Vector3(Math.cos(an)*R,Math.sin(an)*R,0)]),
          new THREE.LineBasicMaterial({color:LIGHT,transparent:true,opacity:.42}));
        g.add(sp);
      }
    },
    /* 2 · ИИ — орбиты вокруг неподвижной надписи.
       Кольца и частицы крутятся вместе с карточкой, а надпись сделана
       спрайтом: он всегда развёрнут к камере, поэтому остаётся читаемым
       при любом повороте модели. */
    function(g){
      var R=.95, ORB=3;
      var ringMat=new THREE.MeshPhongMaterial({color:ACC,shininess:90,specular:0xAFBBFF});
      var spin=new THREE.Group();g.add(spin);
      var holders=[];

      /* Атом всегда развёрнут к зрителю. Иначе общий поворот карточки
         перекашивает симметрию орбит и рисунок перестаёт читаться как атом.
         Гасим поворот родителя и вращаем модель только в плоскости кадра. */
      var qInv=new THREE.Quaternion(), qz=new THREE.Quaternion(), zAxis=new THREE.Vector3(0,0,1);
      spin.onBeforeRender=function(){
        qInv.copy(g.quaternion).invert();
        qz.setFromAxisAngle(zAxis, performance.now()/9000);
        this.quaternion.copy(qInv).multiply(qz);
      };

      for(var i=0;i<ORB;i++){
        /* Порядок поворотов важен: сначала наклоняем кольцо от зрителя,
           и только потом разворачиваем в плоскости кадра. Если задать оба
           угла одному объекту, разворот применится к ещё не наклонённому
           кругу и все три орбиты совпадут. */
        var holder=new THREE.Group();
        holder.rotation.z=i*Math.PI/ORB;
        var ring=new THREE.Mesh(new THREE.TorusGeometry(R,.019,16,220),ringMat);
        ring.rotation.y=Math.PI*0.36;
        holder.add(ring);
        spin.add(holder);
        holders.push(ring);          /* частицы кладём в кольцо: они наследуют его наклон */
      }

      /* Частицы бегут по своим орбитам. Положение пересчитывается перед
         каждым кадром, поэтому движение не зависит от поворота карточки. */
      var nodeMat=new THREE.MeshPhongMaterial({color:LIGHT,shininess:130,specular:0xFFFFFF});
      var PARTS=[[0,0,2.6],[0,Math.PI,2.6],[1,0.8,3.1],[2,2.1,2.3]];
      PARTS.forEach(function(pr){
        var n=new THREE.Mesh(new THREE.SphereGeometry(.085,18,14),nodeMat);
        n.onBeforeRender=function(){
          var t=performance.now()/1000, a2=pr[1]+t*pr[2];
          this.position.set(Math.cos(a2)*R,Math.sin(a2)*R,0);
        };
        holders[pr[0]].add(n);
      });

      /* ядро */
      var core=new THREE.Mesh(new THREE.SphereGeometry(.2,24,18),
        new THREE.MeshPhongMaterial({color:ACC,shininess:110,specular:0xC7D0FF,
          transparent:true,opacity:.35}));
      spin.add(core);

      /* надпись: рисуем в canvas и вешаем спрайтом — он не поворачивается */
      var cv2=document.createElement('canvas');cv2.width=512;cv2.height=256;
      var cx2=cv2.getContext('2d');
      cx2.clearRect(0,0,512,256);
      cx2.font='700 150px Onest, Arial, sans-serif';
      cx2.textAlign='center';cx2.textBaseline='middle';
      cx2.fillStyle='#EEF0FA';
      cx2.fillText('AI',256,136);
      var tex=new THREE.CanvasTexture(cv2);tex.anisotropy=4;
      var label=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,
        depthTest:false,depthWrite:false}));
      label.scale.set(1.15,.575,1);
      label.position.set(0,0,0);
      label.renderOrder=10;
      g.add(label);
    },
    /* 3 · 3D — куб с рёбрами */
    function(g){
      var geo=new THREE.BoxGeometry(1.35,1.35,1.35);
      g.add(new THREE.Mesh(geo,mat(LIGHT,100)));
      g.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo),
        new THREE.LineBasicMaterial({color:ACC})));
      var c2=new THREE.Mesh(new THREE.BoxGeometry(.42,.42,.42),mat(ACC,110));
      c2.position.set(.95,.95,.95);g.add(c2);
    },
    /* 4 · Битрикс24 — число 24 */
    function(g){
      digit('2',LIGHT,g,-.42);
      digit('4',ACC,g,.42);
      var pl=box(2.1,.1,.6,DARK,0,-.92,0,g);pl.rotation.x=.05;
    },
    /* 5 · аналитика — документ и ручка */
    function(g){
      var doc=new THREE.Group();g.add(doc);
      box(1.35,.07,1.75,LIGHT,0,0,0,doc);
      [-.5,-.22,.06,.34].forEach(function(z,i){
        box(i===0?.75:.95,.04,.09,i===0?ACC:DARK,-.12,.06,z,doc)});
      box(.45,.04,.09,LIME,-.37,.06,.62,doc);
      doc.rotation.set(-.16,.28,.08);doc.position.y=-.25;
      var pen=new THREE.Group();
      var body=new THREE.Mesh(new THREE.CylinderGeometry(.075,.075,1.25,16),mat(ACC,120));
      pen.add(body);
      var tip=new THREE.Mesh(new THREE.ConeGeometry(.075,.28,16),mat(DARK,120));
      tip.position.y=-.76;pen.add(tip);
      var cap=new THREE.Mesh(new THREE.CylinderGeometry(.085,.085,.3,16),mat(LIME,120));
      cap.position.y=.62;pen.add(cap);
      pen.rotation.set(.35,0,-.55);pen.position.set(.42,.55,.45);g.add(pen);
    }
  ];

  var views=[],running=false;
  cardViewer=function(cv,i){
    if(!cv||!BUILD[i])return null;
    try{
      var rn=new THREE.WebGLRenderer({canvas:cv,antialias:AA,alpha:true,powerPreference:"low-power"});
      rn.setPixelRatio(Math.min(devicePixelRatio,MOBILE?1:1.5));
      var sc=new THREE.Scene(),cam=new THREE.PerspectiveCamera(38,.78,.1,60);
      cam.position.set(0,.5,5);cam.lookAt(0,0,0);
      var g=new THREE.Group();sc.add(g);
      BUILD[i](g);
      g.rotation.set(.18,-.5,0);
      sc.add(new THREE.AmbientLight(0x4A5070,.95));
      var d1=new THREE.DirectionalLight(0xffffff,.85);d1.position.set(3,5,6);sc.add(d1);
      var d2=new THREE.PointLight(0x5C7BFF,1.5,26);d2.position.set(-4,-1,4);sc.add(d2);
      var d3=new THREE.PointLight(0xE8FF4D,.65,22);d3.position.set(4,3,-3);sc.add(d3);

      var V={cv:cv,rn:rn,sc:sc,cam:cam,g:g,vis:false,vx:0,vy:0,drag:false,dragged:false,w:0,h:0};
      function size(){
        var r=cv.getBoundingClientRect();if(!r.width)return;
        if(Math.abs(r.width-V.w)<1&&Math.abs(r.height-V.h)<1)return;
        V.w=r.width;V.h=r.height;rn.setSize(r.width,r.height,false);
        cam.aspect=r.width/r.height;cam.updateProjectionMatrix();
      }
      V.size=size;size();
      new IntersectionObserver(function(en){V.vis=en[0].isIntersecting},{threshold:.05}).observe(cv);

      var px=0,py=0;
      cv.addEventListener('pointerdown',function(e){
        e.stopPropagation();V.drag=true;V.dragged=false;
        V.touch=(e.pointerType==='touch');px=e.clientX;py=e.clientY;
        try{cv.setPointerCapture(e.pointerId)}catch(err){}
      });
      cv.addEventListener('pointermove',function(e){
        if(!V.drag)return;
        var dx=e.clientX-px,dy=e.clientY-py;
        if(Math.abs(dx)+Math.abs(dy)>(V.touch?8:3))V.dragged=true;
        if(V.touch&&V.dragged)e.preventDefault();
        V.vy=dx*.009;V.vx=dy*.009;
        g.rotation.y+=V.vy;g.rotation.x=Math.max(-1.1,Math.min(1.1,g.rotation.x+V.vx));
        px=e.clientX;py=e.clientY;
      });
      ['pointerup','pointercancel','pointerleave'].forEach(function(ev){
        cv.addEventListener(ev,function(){V.drag=false;
          setTimeout(function(){V.dragged=false},120)})});

      views.push(V);
      if(!running){running=true;loop();}
      return V;
    }catch(e){cv.style.display='none';return null}
  };

  var last=performance.now();
  function loop(){
    requestAnimationFrame(loop);
    var now=performance.now(),dt=Math.min((now-last)/1000,.05);last=now;
    for(var i=0;i<views.length;i++){
      var V=views[i];if(!V.vis)continue;
      V.size();
      if(!V.drag){
        V.vx*=.92;V.vy*=.92;
        V.g.rotation.y+=V.vy+(RM?0:dt*.28);
        V.g.rotation.x=Math.max(-1.1,Math.min(1.1,V.g.rotation.x+V.vx));
      }
      V.rn.render(V.sc,V.cam);
    }
  }
})();

/* ============ галерея проектов ============ */

  /* ---------- карточка «Битрикс24»: переписка в общем чате ---------- */
  var CHAT_CARD=4;

  /* Диалог собирается заново при каждой загрузке: случайная тема, случайные
     участники и случайный набор реплик. Ответы написаны так, чтобы держаться
     в любом порядке. Темы только рабочие и бытовые. */
  var CHAT_PEOPLE=[
    ['Марина','МК','#1F3CFF'],['Костя','КД','#0E9F6E'],['Аня','АС','#7A5CFF'],
    ['Лена','ЛВ','#E0761B'],['Игорь','ИП','#C2410C'],['Даша','ДР','#0891B2'],
    ['Артём','АТ','#4F46E5'],['Оля','ОН','#DB2777'],['Паша','ПГ','#65A30D']
  ];
  var CHAT_SCENES=[
    { open:['Ребят, кто в субботу на природу? Шашлык беру на себя 🔥',
            'Кто за вылазку на природу в выходные? Мангал есть 🔥'],
      say:['Я за! Привезу мангал и колонку','Не смогу, сижу с малышом 😔 в другой раз',
           'Буду, но опоздаю — до двух на объекте','Возьму салаты и посуду 🥗',
           'Плюсую, только чур я за костёр отвечаю','Если без дождя — я в деле ☀️',
           'Увы, уезжаю к родителям. Хорошо вам посидеть!'],
      close:['Отлично, создаю событие в календаре 📅','Место скину утром, встречаемся в 11 📍'] },

    { open:['У Даши завтра день рождения 🎂 скидываемся на подарок?',
            'Напоминаю: завтра поздравляем Дашу 🎂'],
      say:['Я в деле, кину вечером','Может, сертификат в книжный? Она давно хотела',
           'Торт беру на себя 🍰','Соберёмся в 16:00 в переговорке?',
           'Я на удалёнке, но переведу','Открытку подписываем в общем файле'],
      close:['Собрал всех в списке, спасибо! 🎁','Отлично, ставлю встречу на 16:00 📅'] },

    { open:['Выкатили релиз, всё зелёное ✅','Релиз ушёл в прод, тесты прошли ✅'],
      say:['Красавцы 👏','Логи чистые, полёт нормальный','Мониторинг молчит — хороший знак',
           'Проверил на трёх клиентах, всё ок','Только не трогаем прод в пятницу 😅',
           'Отчёт по релизу закину в базу знаний'],
      close:['Спасибо всем, кто тянул этот спринт 💪','Завтра ретро в 11, накидайте пунктов'] },

    { open:['Ушёл в отпуск с понедельника, задачи передал 🏖','С пятницы в отпуске на две недели 🏖'],
      say:['Хорошего отдыха! 🌴','Кто на подхвате по интеграции?','Я подхвачу заявки, не переживай',
           'Доступы у меня есть, справимся','Привези магнитик 😄','Отдыхай нормально, не открывай ноут!'],
      close:['Передачу дел зафиксировал в задачах ✅','Спасибо, ребят. На связи по срочному'] },

    { open:['Кто-нибудь понял, почему у клиента остатки разъезжались? 🤔',
            'Разобрались с расхождением остатков, делюсь 👇'],
      say:['Обмен падал по таймауту, добавили повторы','Классика: два документа на одну позицию',
           'Я такое ловил в прошлом квартале','Надо в чек-лист внедрения добавить',
           'Скинь, пожалуйста, в базу знаний','Мониторинг теперь пишет в чат при сбое'],
      close:['Добавил в чек-лист, спасибо 📌','Закрываю задачу, наблюдаем неделю'] },

    { open:['В офисе новая кофемашина ☕ инструкция на стене',
            'Кофемашину починили, можно жить ☕'],
      say:['Наконец-то 🙌','Кто последний — тот моет капучинатор!','Проверил: латте огонь',
           'Зерно закончится к четвергу, закажу','Может, скинемся на нормальные чашки?',
           'Теперь понятно, где все по утрам 😄'],
      close:['Заказал зерно, привезут в среду ✅','Инструкцию продублировал в портале'] },

    { open:['Кто идёт в четверг играть после работы? ⚽','Собираем команду на волейбол в четверг 🏐'],
      say:['Я в деле','Не смогу, тренировка у сына','Приду, но без формы 😅',
           'Нас уже шестеро, нужен ещё один','Начинаем в 19:00, площадка забронирована',
           'Если дождь — переносим на субботу'],
      close:['Записал состав, до четверга! 💪','Создал событие, отметьтесь в календаре 📅'] },

    { open:['Переезд на новый этаж в пятницу, вещи собираем в четверг 📦',
            'Напоминание: в пятницу переезжаем, коробки уже привезли 📦'],
      say:['Мониторы кто везёт?','Я подпишу коробки, чтобы не потерялись',
           'Провода складываем отдельно, умоляю 🙏','Растение с окна забираю себе 🪴',
           'В новом кабинете розеток больше — проверял','Интернет обещают поднять к обеду'],
      close:['План рассадки выложил в портал 📌','Всё, ждём пятницу. Ничего не забываем 😄'] }
  ];

  /* случайная выборка без повторов */
  function pick(arr,n){
    var c=arr.slice(),out=[];
    while(c.length&&out.length<n)out.push(c.splice((Math.random()*c.length)|0,1)[0]);
    return out;
  }
  function buildChat(){
    var sc=CHAT_SCENES[(Math.random()*CHAT_SCENES.length)|0];
    var who=pick(CHAT_PEOPLE,4);
    var msgs=[], author=who[0];
    msgs.push({n:author[1],c:author[2],a:author[0],t:sc.open[(Math.random()*sc.open.length)|0]});
    var body=pick(sc.say,3+((Math.random()*2)|0));
    /* Ровно одна реплика в середине — от лица владельца портала, и никогда
       последняя: иначе она встанет вплотную к завершающей и получится, будто
       человек отвечает сам себе. */
    var ownIdx=(Math.random()*(body.length-1))|0;
    var next=1;
    body.forEach(function(t,i){
      if(i===ownIdx){msgs.push({own:1,t:t});return}
      var w=who[next++ % (who.length-1) + 1];
      msgs.push({n:w[1],c:w[2],a:w[0],t:t});
    });
    msgs.push({own:1,t:sc.close[(Math.random()*sc.close.length)|0]});
    return msgs;
  }

  function chatDemo(box){
    if(!box)return;
    var CHAT=buildChat();
    var i=0,vis=true,wait=.7,mode='type',dots=null;
    new IntersectionObserver(function(en){vis=en[0].isIntersecting},{threshold:.05}).observe(box);

    function esc(x){return x.replace(/&/g,'&amp;').replace(/</g,'&lt;')}
    function add(m){
      var el=document.createElement('div');
      el.className='ch-m'+(m.own?' own':'');
      el.innerHTML=(m.own?'':'<span class="ch-av" style="background:'+m.c+'">'+m.n+'</span>')+
        '<div class="ch-b">'+(m.own?'':'<i>'+esc(m.a)+'</i>')+esc(m.t)+'</div>';
      box.appendChild(el);
      /* держим в кадре только последние сообщения */
      while(box.children.length>5)box.removeChild(box.firstChild);
    }
    function showDots(own){
      dots=document.createElement('div');
      dots.className='ch-m'+(own?' own':'');
      dots.innerHTML=(own?'':'<span class="ch-av" style="background:rgba(255,255,255,.12)"></span>')+
        '<div class="ch-dots"><i></i><i></i><i></i></div>';
      box.appendChild(dots);
      while(box.children.length>5)box.removeChild(box.firstChild);
    }
    var last=performance.now();
    (function loop(){
      requestAnimationFrame(loop);
      if(!vis)return;
      var now=performance.now(),dt=Math.min((now-last)/1000,.05);last=now;
      wait-=dt;if(wait>0)return;

      if(i>=CHAT.length){                     /* пауза и новый круг */
        box.innerHTML='';CHAT=buildChat();i=0;mode='type';wait=1.2;return;
      }
      if(mode==='type'){
        showDots(CHAT[i].own);
        /* длинное сообщение печатают дольше — пауза зависит от длины */
        wait=.5+Math.min(1.5,CHAT[i].t.length*.022);
        mode='send';
      }else{
        if(dots&&dots.parentNode)dots.parentNode.removeChild(dots);
        dots=null;
        add(CHAT[i]);i++;
        wait=.55+Math.random()*.5;
        mode='type';
      }
    })();
  }

  /* ---------- карточка «Аналитика»: график вычерчивается сам ---------- */
  var DASH_CARD=5;
  var DASH_VALS=[1180,1460,1320,1890,1740,2410,2760];
  function dashChart(root){
    if(!root)return;
    var plot=root.querySelector('.dsh-plot'),
        valEl=root.querySelector('.dsh-val'),
        dEl=root.querySelector('.dsh-delta');
    var W=200,H=92,PAD=6;
    var mx=Math.max.apply(null,DASH_VALS), mn=Math.min.apply(null,DASH_VALS);
    var pts=DASH_VALS.map(function(v,i){
      return [PAD+(W-PAD*2)*i/(DASH_VALS.length-1),
              H-PAD-(H-PAD*2)*(v-mn)/(mx-mn||1)];
    });
    /* сглаженная линия: управляющие плечи горизонтальные, поэтому кривая
       проходит ровно через значения и нигде не «съезжает» с них */
    var dLine='M'+pts[0][0]+' '+pts[0][1];
    for(var i=1;i<pts.length;i++){
      var p0=pts[i-1],p1=pts[i];
      dLine+=' C'+(p0[0]+(p1[0]-p0[0])*.5)+' '+p0[1]+' '+
                  (p0[0]+(p1[0]-p0[0])*.5)+' '+p1[1]+' '+p1[0]+' '+p1[1];
    }
    var dArea=dLine+' L'+pts[pts.length-1][0]+' '+H+' L'+pts[0][0]+' '+H+' Z';
    var grid='';
    for(i=1;i<4;i++){var y=PAD+(H-PAD*2)*i/4;grid+='<line class="dsh-grid" x1="0" y1="'+y+'" x2="'+W+'" y2="'+y+'"/>'}

    plot.innerHTML='<svg viewBox="0 0 '+W+' '+H+'">'+
      '<defs><linearGradient id="dshG" x1="0" y1="0" x2="0" y2="1">'+
      '<stop offset="0" stop-color="#1F3CFF" stop-opacity=".34"/>'+
      '<stop offset="1" stop-color="#1F3CFF" stop-opacity="0"/></linearGradient></defs>'+
      grid+
      '<path class="dsh-area" d="'+dArea+'" opacity="0"/>'+
      '<path class="dsh-line" d="'+dLine+'"/>'+
      pts.map(function(p,k){return '<circle class="dsh-dot'+(k===pts.length-1?' dsh-last':'')+
        '" cx="'+p[0]+'" cy="'+p[1]+'" r="'+(k===pts.length-1?4:3)+'" opacity="0"/>'}).join('')+
      '<circle class="dsh-pulse" cx="'+pts[pts.length-1][0]+'" cy="'+pts[pts.length-1][1]+
        '" r="4" fill="none" stroke="#1F3CFF" opacity="0"/>'+
      '</svg>';

    var line=plot.querySelector('.dsh-line'),
        area=plot.querySelector('.dsh-area'),
        dots=[].slice.call(plot.querySelectorAll('.dsh-dot')),
        pulse=plot.querySelector('.dsh-pulse');
    var L=line.getTotalLength?line.getTotalLength():600;
    line.style.strokeDasharray=L;

    var vis=true,last=performance.now(),t=0;
    new IntersectionObserver(function(en){vis=en[0].isIntersecting},{threshold:.05}).observe(root);

    (function loop(){
      requestAnimationFrame(loop);
      if(!vis)return;
      var now=performance.now(),dt=Math.min((now-last)/1000,.05);last=now;t+=dt;

      var DRAW=2.2, HOLD=2.6, CYCLE=DRAW+HOLD;
      var k=t%CYCLE, p=Math.min(1,k/DRAW);
      var e=1-Math.pow(1-p,3);

      line.style.strokeDashoffset=L*(1-e);
      area.setAttribute('opacity',(e*e).toFixed(3));
      dots.forEach(function(dt2,i){
        dt2.setAttribute('opacity',e>=i/(dots.length-1)?1:0);
      });

      var cur=DASH_VALS[0]+(DASH_VALS[DASH_VALS.length-1]-DASH_VALS[0])*e;
      valEl.textContent=Math.round(cur).toLocaleString('ru-RU');
      dEl.textContent='+'+Math.round((DASH_VALS[DASH_VALS.length-1]/DASH_VALS[0]-1)*100*e)+'%';

      if(p>=1){
        var q=(k-DRAW)/HOLD;
        pulse.setAttribute('opacity',(Math.max(0,1-q*1.6)*.55).toFixed(3));
        pulse.setAttribute('r',(4+q*14).toFixed(1));
      }else pulse.setAttribute('opacity',0);
    })();
  }

  /* ---------- карточка «ИИ»: разбор отчёта и сравнение с кварталом ---------- */
  var NET_CARD=2;
  var AI_STEPS=['Читаю выгрузку из 1С…','Сверяю с прошлым кварталом…',
                'Считаю отклонения…','Готовлю выводы…'];
  /* good — стало лучше; для стоимости и просрочки «лучше» это снижение */
  var AI_ROWS=[
    {n:'Выручка',        v:'+14,2%', good:1, w:71},
    {n:'Конверсия в сделку', v:'−4,1%',  good:0, w:34},
    {n:'Время первого ответа', v:'−31%', good:1, w:88},
    {n:'Просроченные заявки',  v:'+23%',  good:0, w:62}
  ];
  function aiReport(box){
    if(!box)return;
    var vis=true,last=performance.now(),t=0,phase=0,shown=-1;
    new IntersectionObserver(function(en){vis=en[0].isIntersecting},{threshold:.05}).observe(box);

    function loading(){
      box.innerHTML='<div class="ai-scan"><i class="ai-sk"></i><i class="ai-sk"></i>'+
        '<i class="ai-sk"></i><i class="ai-sk"></i></div>'+
        '<div class="ai-stat"></div><div class="ai-bar"><i></i></div><div class="ai-pct">0%</div>';
    }
    function results(){box.innerHTML=''}

    loading();
    (function loop(){
      requestAnimationFrame(loop);
      if(!vis)return;
      var now=performance.now(),dt=Math.min((now-last)/1000,.05);last=now;t+=dt;

      if(phase===0){                                   /* анализ */
        var p=Math.min(1,t/3.4);
        var bar=box.querySelector('.ai-bar i');
        if(bar)bar.style.width=(p*100).toFixed(1)+'%';
        var pct=box.querySelector('.ai-pct');
        if(pct)pct.textContent=Math.round(p*100)+'%';
        var st=box.querySelector('.ai-stat');
        if(st){
          var k=Math.min(AI_STEPS.length-1,(p*AI_STEPS.length)|0);
          if(st.textContent!==AI_STEPS[k])st.textContent=AI_STEPS[k];
        }
        if(p>=1){phase=1;t=0;shown=-1;results()}
        return;
      }

      if(phase===1){                                   /* строки выводятся по очереди */
        var need=Math.floor(t/.45);
        while(shown<need-1&&shown<AI_ROWS.length-1){
          shown++;
          var r=AI_ROWS[shown],cls=r.good?'up':'dn',arrow=r.v.charAt(0)==='+'?'↑':'↓';
          var el=document.createElement('div');
          el.style.animationDelay='0s';
          el.innerHTML='<div class="ai-row"><span class="nm">'+r.n+'</span>'+
            '<span class="ai-d '+cls+'">'+arrow+' '+r.v+'</span></div>'+
            '<div class="ai-t '+cls+'"><i></i></div>';
          box.appendChild(el);
          (function(node,w){
            requestAnimationFrame(function(){
              var f=node.querySelector('.ai-t i');if(f)f.style.width=w+'%';
            });
          })(el,r.w);
        }
        if(shown>=AI_ROWS.length-1&&!box.querySelector('.ai-sum')&&t>AI_ROWS.length*.45+.3){
          var good=0;AI_ROWS.forEach(function(x){if(x.good)good++});
          var sum=document.createElement('div');
          sum.className='ai-sum';
          sum.innerHTML='Итог: <em>'+good+'</em> показателя выросли, <em>'+
            (AI_ROWS.length-good)+'</em> требуют внимания';
          box.appendChild(sum);
        }
        if(t>AI_ROWS.length*.45+3.6){phase=0;t=0;loading()}
      }
    })();
  }

  /* ---------- карточка «Разработка»: код набирается сам ---------- */
  var CODE_CARD=3;
  var CODE_LINES=[
    '<b>const</b> naruto = <b>new</b> <b>Shinobi</b>(<u>\'Uzumaki Naruto\'</u>);',
    '',
    '<b>await</b> naruto.<b>mold</b>(Chakra.WIND, {',
    '  shape: <u>\'shuriken\'</u>,',
    '  spin:  <b>true</b>',
    '});',
    '',
    '<b>const</b> clones = naruto.<b>shadowClone</b>(2);',
    '<b>await</b> Promise.<b>all</b>(',
    '  clones.<b>map</b>(c => c.<b>channel</b>(naruto.rasengan))',
    ');',
    '',
    '<b>const</b> jutsu = naruto.<b>combine</b>(clones, <u>\'Rasenshuriken\'</u>);',
    'jutsu.<b>spin</b>(<u>\'9000rpm\'</u>);',
    '',
    '<b>if</b> (naruto.chakra > 40) {',
    '  naruto.<b>throw</b>(jutsu, target);',
    '  console.<b>log</b>(<u>\'Fuuton: Rasenshuriken!\'</u>);',
    '}'
  ];

  function typeCode(box){
    if(!box)return;
    var vis=true,raf=null,li=0,ci=0,txt='',hold=0;
    new IntersectionObserver(function(en){vis=en[0].isIntersecting},{threshold:.05}).observe(box);
    /* строки хранят разметку подсветки, поэтому печатаем по «видимым» символам,
       а теги дописываем целиком — иначе в кадре мелькнёт кусок тега */
    function slice(src,n){
      var out='',shown=0,i=0,e;
      while(i<src.length&&shown<n){
        if(src[i]==='<'){e=src.indexOf('>',i);out+=src.slice(i,e+1);i=e+1;continue}
        out+=src[i++];shown++;
      }
      /* дописываем закрывающие теги, иначе подсветка «протечёт» на курсор */
      while(i<src.length&&src[i]==='<'){e=src.indexOf('>',i);out+=src.slice(i,e+1);i=e+1}
      return out;
    }
    var last=performance.now();
    (function step(){
      raf=requestAnimationFrame(step);
      if(!vis)return;
      var now=performance.now();
      if(now-last<26)return;
      last=now;
      if(hold>0){hold--;return}
      if(li>=CODE_LINES.length){                 /* цикл: пауза и начинаем заново */
        hold=52;li=0;ci=0;txt='';
        box.innerHTML='<span class="cd-cur"></span>';
        return;
      }
      var src=CODE_LINES[li],plain=src.replace(/<[^>]+>/g,'');
      if(ci<=plain.length){
        box.innerHTML=txt+slice(src,ci)+'<span class="cd-cur"></span>';
        ci++;
      }else{
        txt+=src+'\n';li++;ci=0;hold=6;
      }
    })();
  }

(function(){
  var gal=$('#gal');if(!gal)return;
  PROJECTS.forEach(function(p,pi){
    var d=document.createElement('button');d.className='pj';d.type='button';
    d.addEventListener('click',function(){caseModal(pi)});
    d.innerHTML='<div class="pj-v"><canvas class="pj-3d"></canvas><span class="pj-t">'+p.t+'</span></div>'+
      '<p class="pj-d">'+p.d+'</p>';
    gal.appendChild(d);
    var vw=null;
    if(pi===CHAT_CARD){
      var cvC=$('.pj-3d',d);if(cvC)cvC.parentNode.removeChild(cvC);
      $('.pj-v',d).insertAdjacentHTML('afterbegin',
        '<div class="pj-chat" aria-hidden="true">'+
        '<div class="ch-list"></div></div>');
      chatDemo($('.ch-list',d));
    }else if(pi===DASH_CARD){
      var cvD=$('.pj-3d',d);if(cvD)cvD.parentNode.removeChild(cvD);
      $('.pj-v',d).insertAdjacentHTML('afterbegin',
        '<div class="pj-dash" aria-hidden="true"><div class="dsh">'+
        '<div class="dsh-bar"><i></i><i></i><i></i><span>Дашборд</span></div>'+
        '<div class="dsh-head"><b class="dsh-val">0</b><u>приёмов / мес</u><em class="dsh-delta">+0%</em></div>'+
        '<div class="dsh-plot"></div>'+
        '<div class="dsh-legend"><b><i></i>факт</b><b>6 месяцев</b></div>'+
        '</div></div>');
      dashChart($('.dsh',d));
    }else if(pi===NET_CARD){
      var cvN=$('.pj-3d',d);if(cvN)cvN.parentNode.removeChild(cvN);
      $('.pj-v',d).insertAdjacentHTML('afterbegin',
        '<div class="pj-ai" aria-hidden="true">'+
        '<div class="ai-body"></div></div>');
      aiReport($('.ai-body',d));
    }else if(MOBILE&&pi===0){
      /* На телефоне объёмные сцены не показываем: вместо первой ставим
         окно учётной программы — документы проводятся сами. */
      var cv1=$('.pj-3d',d);if(cv1)cv1.parentNode.removeChild(cv1);
      $('.pj-v',d).insertAdjacentHTML('afterbegin',
        '<div class="pj-1c" aria-hidden="true"><div class="oc-win">'+
'<div class="oc-bar"><i></i><i></i><span>Документы</span></div>'+'<div class="oc-rows">'+'<div class="oc-r"><b>Заказ №1042</b><u>проведён</u></div>'+'<div class="oc-r"><b>Заказ №1043</b><u>проведён</u></div>'+'<div class="oc-r"><b>Заказ №1044</b><u>проведён</u></div>'+'<div class="oc-r"><b>Заказ №1045</b><u>проведён</u></div>'+'</div>'+
        '</div></div>');
    }else if(MOBILE&&pi===1){
      /* вместо второй — две шестерни в зацеплении */
      var cv2=$('.pj-3d',d);if(cv2)cv2.parentNode.removeChild(cv2);
      $('.pj-v',d).insertAdjacentHTML('afterbegin',
        '<div class="pj-gears" aria-hidden="true">'+'<svg viewBox="0 0 200 200" fill="none">'+'<g class="pg pg-a">'+GEAR_PATH(12,52,13,70,70)+'</g>'+'<g class="pg pg-b">'+GEAR_PATH(9,39,13,133,133)+'</g>'+'</svg>'+'</div>');
    }else if(pi===CODE_CARD){
      var cvs0=$('.pj-3d',d);if(cvs0)cvs0.parentNode.removeChild(cvs0);
      $('.pj-v',d).insertAdjacentHTML('afterbegin',
        '<div class="pj-code" aria-hidden="true"><div class="cd-bar"><i></i><i></i><i></i></div>'+
        '<div class="cd-body"></div></div>');
      typeCode($('.cd-body',d));
    }else if(MOBILE){
      var cvs=$('.pj-3d',d);if(cvs)cvs.parentNode.removeChild(cvs);
      $('.pj-v',d).insertAdjacentHTML('afterbegin','<span class="pj-art">'+(CARD_ART[pi]||'')+'</span>');
    }else{
      /* сцену собираем только когда карточка подъезжает к экрану */
      var lazy=new IntersectionObserver(function(en){
        if(en[0].isIntersecting&&!vw){vw=cardViewer($('.pj-3d',d),pi);lazy.disconnect()}
      },{rootMargin:'300px'});
      lazy.observe(d);
    }
    d.addEventListener('click',function(e){if(vw&&vw.dragged)e.stopImmediatePropagation()},true);
  });

  /* галерея двигается только кнопками */
  var prev=$('#galPrev'),next=$('#galNext'),bar=$('#galBar'),num=$('#galNum');
  function step(){var c=$('.pj',gal);return c?c.getBoundingClientRect().width+16:360}
  function upd(){
    var max=gal.scrollWidth-gal.clientWidth,pr=max>0?gal.scrollLeft/max:0;
    var per=Math.max(1,Math.round(gal.clientWidth/step())),pages=Math.max(1,PROJECTS.length-per+1);
    var idx=Math.min(pages-1,Math.round(pr*(pages-1)));
    bar.style.width=(100/pages)+'%';
    bar.style.transform='translateX('+(idx*100)+'%)';
    num.textContent=('0'+(idx+1)).slice(-2)+' / '+('0'+PROJECTS.length).slice(-2);
    prev.disabled=gal.scrollLeft<6;
    next.disabled=gal.scrollLeft>=max-6;
  }
  function go(dir){gal.scrollBy({left:dir*step(),behavior:RM?'auto':'smooth'})}
  prev.addEventListener('click',function(){go(-1)});
  next.addEventListener('click',function(){go(1)});
  gal.addEventListener('scroll',upd,{passive:true});
  addEventListener('resize',upd);
  gal.tabIndex=0;
  gal.addEventListener('keydown',function(e){
    if(e.key==='ArrowRight'){e.preventDefault();go(1)}
    if(e.key==='ArrowLeft'){e.preventDefault();go(-1)}
  });
  setTimeout(upd,80);
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(upd);

  /* бесшовная лента */
})();

/* ==================== знаки и описания направлений ====================
   Один набор на всю страницу: список на главной и блок «о нас»
   берут отсюда, поэтому не могут разойтись. */
var AWILL={
    it:'<span class="dir-ill"><svg viewBox="0 0 100 100" fill="none" aria-hidden="true"> <rect x="12" y="16" width="76" height="68" rx="6" stroke="var(--line)" stroke-width="2"/> <path d="M12 27h76" stroke="var(--line)" stroke-width="2"/> <circle cx="18" cy="21.5" r="1.6" fill="var(--ink)" opacity=".3"/> <circle cx="23" cy="21.5" r="1.6" fill="var(--ink)" opacity=".3"/> <path d="M20 74h60" stroke="var(--line)" stroke-width="2"/> <g class="db-bars"> <rect x="19" y="64" width="6" height="10" rx="1.6"/> <rect x="28.7" y="59" width="6" height="15" rx="1.6"/> <rect x="38.3" y="61" width="6" height="13" rx="1.6"/> <rect x="48" y="54" width="6" height="20" rx="1.6"/> <rect x="57.7" y="56" width="6" height="18" rx="1.6"/> <rect x="67.3" y="49" width="6" height="25" rx="1.6"/> </g> <path class="db-line" d="M22 72 L32 62 L41 66 L51 50 L60 55 L70 40 L80 30"/> <circle class="db-dot" cx="80" cy="30" r="3.2"/> </svg></span>',
    integration:'<span class="dir-ill"><svg viewBox="0 0 100 100" fill="none" aria-hidden="true"> <g class="gr gr-a" style="transform-origin:37.78px 36.14px"> <path d="M51.21 48.13L53.73 51.50L51.02 53.89L47.99 50.96A18 18 0 0 1 41.60 53.73L41.60 53.73L41.66 57.94L38.06 58.28L37.33 54.13A18 18 0 0 1 30.53 52.61L30.53 52.61L28.10 56.05L24.99 54.21L26.84 50.43A18 18 0 0 1 22.23 45.21L22.23 45.21L18.25 46.56L16.81 43.25L20.53 41.27A18 18 0 0 1 19.87 34.33L19.87 34.33L15.85 33.09L16.64 29.56L20.81 30.15A18 18 0 0 1 24.35 24.15L24.35 24.15L21.83 20.78L24.54 18.39L27.57 21.32A18 18 0 0 1 33.96 18.55L33.96 18.55L33.91 14.34L37.50 14.00L38.23 18.15A18 18 0 0 1 45.03 19.67L45.03 19.67L47.46 16.23L50.57 18.07L48.72 21.85A18 18 0 0 1 53.33 27.07L53.33 27.07L57.31 25.72L58.75 29.03L55.03 31.01A18 18 0 0 1 55.69 37.95L55.69 37.95L59.71 39.19L58.92 42.72L54.75 42.13A18 18 0 0 1 51.21 48.13Z"/> <circle cx="37.78" cy="36.14" r="6.4"/> </g> <g class="gr gr-b" style="transform-origin:62.22px 63.86px"> <path d="M55.58 51.08L54.46 47.02L58.03 45.80L59.63 49.69A14.4 14.4 0 0 1 66.56 50.13L66.56 50.13L68.64 46.47L72.03 48.13L70.41 52.01A14.4 14.4 0 0 1 75.00 57.22L75.00 57.22L79.06 56.10L80.28 59.67L76.38 61.27A14.4 14.4 0 0 1 75.95 68.20L75.95 68.20L79.61 70.28L77.95 73.67L74.07 72.05A14.4 14.4 0 0 1 68.86 76.64L68.86 76.64L69.98 80.70L66.41 81.92L64.81 78.03A14.4 14.4 0 0 1 57.88 77.59L57.88 77.59L55.80 81.25L52.41 79.59L54.03 75.71A14.4 14.4 0 0 1 49.44 70.50L49.44 70.50L45.38 71.62L44.16 68.05L48.05 66.45A14.4 14.4 0 0 1 48.49 59.52L48.49 59.52L44.82 57.44L46.49 54.05L50.37 55.67A14.4 14.4 0 0 1 55.58 51.08Z"/> <circle cx="62.22" cy="63.86" r="5"/> </g> </svg></span>',
    ai:'<span class="dir-ill"><svg viewBox="0 0 100 100" fill="none" aria-hidden="true"> <g class="ai-legs"> <path d="M22 38h-7M78 38h7M22 50h-7M78 50h7M22 62h-7M78 62h7"/> <path d="M38 26v-7M38 74v7M50 26v-7M50 74v7M62 26v-7M62 74v7"/> </g> <rect class="ai-chip" x="22" y="26" width="56" height="48" rx="6"/> <g class="ai-net"> <line x1="34" y1="38" x2="50" y2="38"/><line x1="34" y1="38" x2="50" y2="50"/> <line x1="34" y1="50" x2="50" y2="50"/><line x1="34" y1="62" x2="50" y2="50"/> <line x1="34" y1="62" x2="50" y2="62"/><line x1="50" y1="38" x2="66" y2="43"/> <line x1="50" y1="50" x2="66" y2="43"/><line x1="50" y1="50" x2="66" y2="57"/> <line x1="50" y1="62" x2="66" y2="57"/> </g> <g class="ai-dots"> <circle cx="34" cy="38" r="2.9"/><circle cx="34" cy="50" r="2.9"/><circle cx="34" cy="62" r="2.9"/> <circle cx="50" cy="38" r="2.9"/><circle cx="50" cy="50" r="3.3"/><circle cx="50" cy="62" r="2.9"/> <circle cx="66" cy="43" r="3.3"/><circle cx="66" cy="57" r="3.3"/> </g> </svg></span>',
    bitrix:'<span class="dir-ill dir-funnel"><svg viewBox="0 0 100 100" fill="none"> <g class="fn-steps"> <path d="M8 16 L92 16 L81.1 29.5 L18.9 29.5 Z"/> <path d="M18.9 32.5 L81.1 32.5 L71.8 46 L28.2 46 Z"/> <path d="M28.2 49 L71.8 49 L63.4 62.5 L36.6 62.5 Z"/> <path d="M36.6 65.5 L63.4 65.5 L58.4 79 L41.6 79 Z"/> <path d="M41.6 82 L58.4 82 L56.7 95.5 L43.3 95.5 Z"/> </g> </svg></span>',
    onec:'<span class="dir-ill dir-doc"><svg viewBox="0 0 100 100" fill="none"> <rect class="dc-back" x="18" y="16" width="50" height="64" rx="5"/> <rect class="dc-sheet" x="32" y="24" width="50" height="64" rx="5"/> <g class="dc-lines"> <path d="M41 40h32"/><path d="M41 50h32"/><path d="M41 60h32"/><path d="M41 70h22"/> </g> <circle class="dc-dot" cx="70" cy="70" r="4"/> </svg></span>',
    dev:'<span class="dir-ill"><svg viewBox="0 0 100 100" fill="none" aria-hidden="true"><g class="cd-mark" fill="none" stroke="var(--acc)" stroke-linecap="round" stroke-linejoin="round"><path class="cd-l" d="M32 30 14 50l18 20" stroke-width="6"/><path class="cd-r" d="M68 30l18 20-18 20" stroke-width="6"/><path class="cd-s" d="M58 22 42 78" stroke-width="5.5"/></g></svg></span>',
    scan3d:'<span class="dir-ill dir-3d"><canvas class="gear3d"></canvas></span>'
};
var AWSHORT={
    it:'Инфраструктура, доступы, резервные копии и мониторинг',
    integration:'Обмен между 1С, CRM, складом и оборудованием без ручных выгрузок',
    ai:'Нейросети на ваших серверах: разбор документов и обращений',
    bitrix:'Воронки, роботы и права под ваш процесс продаж',
    onec:'Учёт, в котором любую цифру видно до первичного документа',
    dev:'Сайты, кабинеты и сервисы там, где не подходит готовое',
    scan3d:'Сканирование деталей, модели и чертежи для производства'
};

/* ==================== направления ==================== */
var SVC={
 it:{
  t:'IT-решения',
  lead:'Надёжная архитектура для бесперебойной работы компании. Проектируем IT-инфраструктуру, которая связывает отделы, склады и производственные площадки в единую систему, исключая простои из-за технических сбоев.',

  tags:['3D-моделирование и прототипирование','Цифровые копии производственных участков','Аналитические дашборды','Автоматизация производственных процессов','Аудит информационной безопасности','Тестирование на проникновение','Удобство и внешний вид интерфейсов','Сайт и соцсети','2D и 3D-визуализация процессов','Геймификация рутинных процессов'],

  whyH:'Направление, из которого вырастают остальные: сначала архитектура, потом инструменты',

  why:['Мы начинаем не с выбора программ, а с карты предприятия: какие площадки, склады и отделы обмениваются данными, где эти данные рождаются и где обрывается цепочка. Только после этого понятно, что достраивать, а что менять целиком.',
       'Дальше архитектура собирается слоями: инфраструктура и каналы, учётные системы и обмен между ними, наглядность для руководителя, защита периметра. Каждый слой можно запускать отдельно, но проектируются они сразу вместе — иначе через год приходится ломать уже сделанное.',
       'Отдельная часть работы — то, что видит человек: интерфейсы рабочих мест, сайт и внешние коммуникации компании. Система, в которую неудобно заходить, не работает, каким бы правильным ни был обмен под капотом.'],

  goals:[['Задача 01','Собрать карту предприятия','Отделы, площадки, склады, оборудование и системы: что с чем связано сегодня и в каком месте рвётся цепочка данных.'],
         ['Задача 02','Спроектировать архитектуру','План развития IT-ландшафта с приоритетами: что даёт эффект сразу, что можно отложить, а что откладывать нельзя из-за рисков.'],
         ['Задача 03','Закрыть периметр','Проверить приложения и инфраструктуру так, как это сделал бы атакующий, и устранить найденное до того, как им воспользуются.']],

  res:['Инфраструктура, которая не падает и не зависит от одного человека',
       'Описанная схема, проверенные резервные копии, мониторинг и понятный план развития на год.'],
  prices:[['Аудит IT-инфраструктуры','Точка входа в любое направление',
    ['Карта систем, площадок и потоков данных','Точки ручного ввода и места отказа','Оценка рисков и узких мест','План развития с приоритетами','Смета по этапам'],
    'от 90 000 ₽','Срок — 2–3 недели'],
   ['Аналитические дашборды','Оперативный мониторинг показателей',
    ['Согласование метрик и формул расчёта','Витрина данных отдельно от рабочей базы','Панели под роли: собственник, продажи, производство','Сводка на почту по расписанию','Сверка цифр с учётной системой'],
    'от 150 000 ₽','Срок — от 3 недель'],
   ['Цифровой двойник предприятия','Модель площадки на живых данных',
    ['Модель цеха или линии по чертежам и обмерам','Подключение к данным учёта и оборудования','Загрузка, узкие места и сценарии изменений','Обучение работе с моделью'],
    'от 600 000 ₽','Срок — от 3 месяцев'],
   ['Интерфейсы и вовлечённость','Интерфейсы, сайт и вовлечение сотрудников',
    ['Проектирование рабочих мест и клиентских кабинетов','Разработка и сопровождение сайта и соцсетей','Механики геймификации в рутинных процессах','2D- и 3D-визуализация технологических процессов','Дизайн-система, которую команда ведёт сама'],
    'от 200 000 ₽','Срок — от 4 недель'],
   ['Анализ безопасности приложений','Уровень 01 · встраивается в текущую разработку',
    ['Практики AppSec внутри вашего процесса разработки','SAST и DAST: поиск уязвимостей в коде и на стенде','SCA: контроль сторонних библиотек','Работа с секретами и ключами доступа','Отчёт с приоритетами исправлений'],
    'от 180 000 ₽','Срок — от 3 недель'],
   ['Проверка сайта на взлом','Уровень 02 · взгляд снаружи',
    ['Тестирование на проникновение по методологии OWASP','Подтверждённые векторы атаки, а не список предупреждений','Оценка последствий для бизнеса','Отчёт для технической команды и для руководства','Повторная проверка после исправлений'],
    'от 250 000 ₽','Срок — 3–4 недели'],
   ['Расследование инцидентов','Уровень 03 · DFIR',
    ['Анализ компьютерной атаки по следам в системах','Восстановление хода событий и локализация последствий','Рекомендации по устранению недостатков','Заключение, пригодное для внутреннего разбора'],
    'от 300 000 ₽','Срок — от 2 недель'],
   ['Проверка внутренней сети на взлом','Уровень 04 · Active Directory',
    ['Проверка сети предприятия изнутри периметра','Пути повышения привилегий в домене','Сегментация и разграничение доступа','План устранения по шагам'],
    'от 450 000 ₽','Срок — от 4 недель']],

  note:'Четыре уровня информационной безопасности расположены по сложности внедрения, а не по важности: первый встраивается в текущую разработку почти без остановок, четвёртый требует подготовки и согласований. Начать можно с любого, но первый обычно окупается быстрее. Цены — ориентир для предприятия среднего размера, точная смета появляется после аудита.',

  stages:[['Этап 01','Обследование','Смотрим площадки, серверы, каналы связи и системы. Разговариваем с теми, кто работает в них каждый день, а не только с руководством.'],
          ['Этап 02','Архитектура и план','Собираем схему целевого IT-ландшафта и разбиваем её на этапы с оценкой. Показываем, что даёт эффект уже в первый месяц.'],
          ['Этап 03','Внедрение по слоям','Инфраструктура, обмен данными, наглядность, защита. Каждый слой запускается и проверяется отдельно.'],
          ['Этап 04','Проверка защищённости','Тестируем приложения и инфраструктуру на проникновение, устраняем найденное и проводим повторную проверку.'],
          ['Этап 05','Передача и поддержка','Документация, доступы и мониторинг переходят к вам. Логи открыты, сбой виден сразу, а не через неделю на сверке.']],

  faq:[['У нас есть свой системный администратор, вы нужны','Часто нужны именно в паре: администратор держит текущую работу, мы приносим внешний взгляд и опыт с других предприятий. Многие вещи не видны изнутри просто потому, что к ним привыкли.'],
       ['Придётся ли останавливать производство','Стараемся обойтись без этого. Работы, требующие остановки, планируем на выходные или ночные смены и согласовываем заранее.'],
       ['Что с иностранным софтом','Смотрим по каждому продукту отдельно. Часть заменяется без потерь, часть работает и дальше, а часть требует переходного периода — об этом честно говорим на старте.']]
 },
 integration:{
  t:'Автоматизация и интеграция',
  lead:'Связываем разрозненные учётные системы, профильное ПО и оборудование в единый цифровой контур. Устраняем разрывы в передаче данных, минимизируем человеческий фактор и делаем бизнес-процессы прозрачными для руководства.',

  tags:['Обмен 1С и CRM','Интеграция с сайтом','Складской обмен','Подключение оборудования','Обмен между системами','Маркетплейсы','Банк и платежи','Мониторинг обмена'],

  whyH:'Между двумя системами обычно сидит человек — наша работа убрать его оттуда',

  why:['Почти каждый проект начинается одинаково: две-три программы, которые не разговаривают, и сотрудник, переносящий цифры руками. Он ошибается не потому, что плохо работает, а потому, что так устроен процесс.',
       'Обмен мы строим на очереди с повторной отправкой: если одна система недоступна, документ ждёт и доходит после восстановления, а не теряется. Дубли отсекаются по идентификаторам, поэтому повторная отправка не создаёт вторую копию заказа.',
       'Отдельно закладываем мониторинг. Логи и метрики обмена открыты вам, а не только нам: сбой виден в тот же час, а не на сверке в конце месяца.'],

  goals:[['Задача 01','Найти разрывы','Пройти маршрут документа от заявки до отгрузки и посчитать, сколько раз его трогают руками.'],
         ['Задача 02','Согласовать справочники','Свести номенклатуру, контрагентов и единицы измерения между системами. Без этого обмен падает на каждом втором документе.'],
         ['Задача 03','Запустить обмен и наблюдение','Поднять передачу данных и дать инструмент, в котором видно каждый документ и его статус.']],

  res:['Единый механизм, где заказ, склад, производство и учёт видят одни и те же данные',
       'С описанием обмена, панелью контроля и инструкцией, что делать при сбое.'],
  prices:[['Интеграция двух систем','Самый частый первый шаг',
    ['Схема обмена: что, куда, когда и в каком формате','Таблица соответствия справочников','Настройка обмена: напрямую между системами или через файлы','Обработка ошибок: повтор, карантин, уведомление','Панель мониторинга и инструкция администратора'],
    'от 180 000 ₽','Срок — от 3 недель'],
   ['Единый контур предприятия','Три системы и больше, включая оборудование',
    ['Обследование всех потоков данных','Обмен между учётом, CRM, сайтом, складом и телефонией','Подключение весов, ТСД, станков и датчиков','Нагрузочный тест на боевом объёме данных','Поэтапный запуск без остановки работы'],
    'от 450 000 ₽','Срок — от 2 месяцев'],
   ['Поддержка обмена','Наблюдение и развитие после запуска',
    ['Мониторинг обмена и оповещения на почту','Разбор инцидентов с письменной причиной','Часы разработки в пакете на доработки','Обновление систем без простоя обмена'],
    'от 40 000 ₽ / мес','Отвечаем на обращения в течение 4 часов в рабочее время']],

  note:'Стоимость зависит от числа систем, объёма справочников и от того, отдаёт ли ваше ПО данные наружу. Самописные и отраслевые системы без документированного API считаются отдельно. Точная смета появляется после аудита, сам аудит бесплатен.',

  stages:[['Этап 01','Аудит процессов','Смотрим маршрут документа от заявки до отгрузки и считаем, сколько раз его трогают руками. По итогам — схема и смета.'],
          ['Этап 02','Нормализация справочников','Сводим номенклатуру и контрагентов между системами. Скучный этап, который чаще всего и определяет, заработает обмен или будет падать.'],
          ['Этап 03','Пилотный участок','Берём самый болезненный обмен и запускаем его в бою. Эффект виден до того, как оплачен весь проект.'],
          ['Этап 04','Достройка контура','Подключаем остальные системы и оборудование, убираем временные решения, проводим нагрузочный тест.'],
          ['Этап 05','Мониторинг','Передаём панель наблюдения и инструкции. Сбой виден сразу, ответственный получает уведомление.']],

  faq:[['У нас самописная программа, с ней получится','Обычно да. Если у неё есть база данных или возможность обмена файлами, мы найдём способ. Сложность и срок оценим после осмотра.'],
       ['Сколько это занимает','От шести недель для связки двух систем. Большие контуры с производством и складом — дольше, скажем точнее после разбора процессов.'],
       ['Что будет, если система-приёмник упадёт','Сообщения не потеряются: они встанут в очередь и уйдут, когда связь восстановится. Вы увидите это на панели, а не узнаете постфактум.']]
 },
 ai:{
  t:'ИИ-автоматизация',
  lead:'Безопасное ускорение процессов с помощью нейросетей. Мы принципиально не используем зарубежные облачные ИИ из-за рисков утечки корпоративной информации: все интеллектуальные алгоритмы разворачиваются строго локально на ваших серверах, что гарантирует конфиденциальность данных и независимость от внешних блокировок.',

  tags:['Локальное развёртывание','Разбор входящих заявок','База знаний по документам','Расшифровка звонков','Автозаполнение карточек','Человек в цикле','Работа без интернета','Метрики качества'],

  whyH:'Мы выбрали более сложный путь: модель работает внутри вашего периметра',

  why:['Публичное облако запускается быстрее и стоит дешевле на старте. Но корпоративные документы в нём перестают быть только вашими, а доступ к сервису зависит от решений, которые принимаются не здесь. Для производственной компании это неприемлемая цена за удобство.',
       'Поэтому модель ставится на ваше оборудование и работает в изолированной сети. Права наследуются из ваших систем: сотрудник получает ответ только по тем источникам, которые он и так может открыть. Это принципиально при работе с кадровыми и финансовыми документами.',
       'Берём только те процессы, где выигрыш можно измерить. До внедрения прогоняем модель на ваших реальных документах и показываем точность. Если её недостаточно для работы без проверки человеком, говорим об этом до подписания договора.'],

  goals:[['Задача 01','Найти процесс с рутиной','Участок, где люди тратят больше всего часов на однотипную работу. Замеряем текущие затраты времени до старта.'],
         ['Задача 02','Проверить на ваших данных','Прогнать модель на реальных документах и показать точность, прежде чем что-то внедрять.'],
         ['Задача 03','Закрыть контур','Развернуть решение на ваших серверах с разграничением доступа и возможностью работы без внешней сети.']],

  res:['Работающий помощник на ваших серверах и понятная метрика пользы',
       'С панелью качества, где видно, где модель ошибается, и возможностью это исправить.'],
  prices:[['Пилот на одном процессе','Проверка до внедрения',
    ['Отбор сценария, где рутина съедает больше всего часов','Замер текущих затрат времени','Прогон модели на ваших реальных документах','Отчёт о точности и решение: внедрять или нет'],
    'от 200 000 ₽','Срок — 3–4 недели'],
   ['Локальное развёртывание','Данные не покидают ваш периметр',
    ['Подбор модели и расчёт требуемого оборудования','Установка на ваши серверы, изолированно от внешней сети','Подключение к 1С, CRM, почте и файловым хранилищам','Разграничение доступа по правам сотрудника','Работа при отключённом внешнем интернете'],
    'от 450 000 ₽','Срок — от 6 недель'],
   ['База знаний и ассистент','Поиск по внутренним документам',
    ['Сбор и подготовка документов и регламентов','Поиск с обязательной ссылкой на источник','Черновики ответов для менеджеров','Панель качества: видно, где модель ошибается'],
    'от 300 000 ₽','Срок — от 4 недель'],
   ['Разбор входящих','Заявки, письма, звонки',
    ['Классификация обращений по типу и срочности','Автозаполнение карточки сделки','Расшифровка звонков с выделением договорённостей','Порог уверенности: при сомнении заявка идёт человеку'],
    'от 250 000 ₽','Срок — от 4 недель']],

  note:'В стоимость не входит оборудование: сервер с профессиональной видеокартой обойдётся ориентировочно от 700 000 ₽ и покупается вами, а не арендуется у нас. Для задачи на десяток документов в неделю локальное развёртывание экономически бессмысленно, и мы скажем это прямо. Модель на вашем оборудовании обычно уступает крупным публичным по «интеллекту» — на разборе документов и поиске разница незаметна, на творческих задачах заметна.',

  stages:[['Этап 01','Выбор процесса','Ищем задачу с наибольшим объёмом однотипной работы и фиксируем текущие затраты времени.'],
          ['Этап 02','Проверка на ваших данных','Прогоняем модель на реальных документах, измеряем точность и показываем результат до внедрения.'],
          ['Этап 03','Развёртывание','Ставим модель на ваше оборудование, подключаем к системам, настраиваем права доступа.'],
          ['Этап 04','Человек в цикле','Вводим порог уверенности: при сомнении задача идёт человеку без метки. Так доверие к системе не разрушается.'],
          ['Этап 05','Замер эффекта','Через месяц повторяем замер по той же методике. Если экономии нет — разбираем почему и не расширяем внедрение.']],

  faq:[['Наши данные точно никуда не уйдут','Модель работает на вашем оборудовании, интернет ей для работы не нужен. Это проверяется: можно физически отключить внешний доступ и убедиться, что всё продолжает работать.'],
       ['Сколько нужно данных для обучения','Для большинства задач хватает нескольких сотен примеров из вашего архива. Точнее скажем после разбора конкретной задачи.'],
       ['А если модель ошибётся','Для этого и нужен порог уверенности: в спорных случаях заявка уходит человеку без метки. Ошибки видны на панели качества, и мы их разбираем.']]
 },
 bitrix:{
  t:'Внедрение Битрикс24',
  lead:'Полный контроль над продажами, проектами и задачами сотрудников. Оцифровываем воронки продаж и циклы исполнения обязательств, чтобы менеджеры не теряли клиентов, а вы видели реальную маржинальность каждой сделки.',

  tags:['Воронки продаж','Роботы и бизнес-процессы','Телефония и мессенджеры','Обмен с 1С','Права и юрлица','Смарт-процессы','Обучение команды','Коробочная версия'],

  whyH:'Портал считается внедрённым не когда он настроен, а когда в него заходят добровольно',

  why:['Коробка «как у всех» не работает. Мы разбираем, как реально продаёт ваш отдел, и настраиваем портал под этот процесс, убирая всё, чем никто не будет пользоваться. Чем меньше обязательных полей на старте, тем выше шанс, что их станут заполнять.',
       'Главная ценность появляется на связке с учётом: из 1С приходят себестоимость, оплаты и остатки, обратно уходят контрагенты и заказы. Только после этого маржинальность сделки становится фактом, а не оценкой менеджера.',
       'Сопротивление команды — ожидаемая часть проекта, а не сбой. Мы уменьшаем его тем, что на старте даём выгоду самому менеджеру: история клиента под рукой, счёт в один клик, не нужно ходить к бухгалтеру за статусом оплаты.'],

  goals:[['Задача 01','Оцифровать воронку','Описать реальные стадии сделки и довести их до системы, в которой видно, где именно теряются заявки.'],
         ['Задача 02','Связать продажи с учётом','Подтянуть себестоимость, оплаты и остатки из 1С, чтобы решения принимались по фактическим цифрам.'],
         ['Задача 03','Довести до ежедневного использования','Обучить по ролям, снять первые вопросы и убедиться, что менеджеры работают в портале, а не в мессенджерах.']],

  res:['Портал, в котором работают, а не отчитываются',
       'Настроенные воронки, телефония, права, обмен с 1С и обученные сотрудники.'],
  prices:[['Базовое внедрение','Отдел продаж до 50 человек',
    ['Разбор процесса продаж и проектирование воронки','Настройка карточек, полей, стадий и прав доступа','Телефония, почта, мессенджеры и формы с сайта','Перенос базы клиентов и истории','Обучение менеджеров и руководителя'],
    'от 120 000 ₽','Срок — 2–4 недели'],
   ['Внедрение со связкой с 1С','Когда нужна реальная маржа по сделке',
    ['Всё из базового внедрения','Двусторонний обмен: контрагенты, счета, оплаты, остатки','Роботы и бизнес-процессы под цикл исполнения','Отчёты по марже, менеджерам и направлениям','Дашборд руководителя'],
    'от 260 000 ₽','Срок — от 6 недель'],
   ['Коробочная версия','Холдинг или требование держать данные у себя',
    ['Разворачивание коробки на вашем сервере','Права по юрлицам и подразделениям','Смарт-процессы под производство и сервис','Доработки под нетиповые сценарии','Сопровождение обновлений'],
    'от 550 000 ₽','Срок — от 2 месяцев'],
   ['Сопровождение','После запуска',
    ['Доработки по мере роста компании','Разбор обращений менеджеров','Обучение новых сотрудников','Контроль обмена с 1С'],
    'от 35 000 ₽ / мес','Отвечаем на обращения в течение 4 часов']],

  note:'Лицензии Битрикс24 оплачиваются отдельно и напрямую вендору — мы не зарабатываем на перепродаже и помогаем подобрать минимально достаточный тариф. Облако дешевле на старте и подходит большинству компаний, коробка нужна при требованиях к хранению данных или глубоких доработках. Считаем оба варианта на ваших цифрах.',

  stages:[['Этап 01','Разбор процесса продаж','Проходим путь сделки вместе с менеджером: где теряется время, где выпадает клиент, что заполняется впустую.'],
          ['Этап 02','Базовая настройка','Воронка, карточки, права, перенос базы. Отдел продаж работает в системе с первой недели, а не после сдачи проекта.'],
          ['Этап 03','Связка с 1С','Счета, оплаты и остатки приходят из учёта. Менеджер перестаёт бегать за статусом оплаты.'],
          ['Этап 04','Автоматизация','Роботы, напоминания и бизнес-процессы: сделка не зависает без следующего шага и ответственного.'],
          ['Этап 05','Обучение и приёмка','Инструкции по ролям, разбор ошибок первых недель, отчётность для руководителя.']],

  faq:[['У нас уже есть Битрикс24, но им не пользуются','Частый случай. Обычно причина в том, что портал настраивали без разбора реального процесса. Начинаем с аудита текущей настройки — иногда достаточно перенастроить, а не внедрять заново.'],
       ['Сколько занимает внедрение','От пяти недель. Основная задержка обычно не в настройке, а в согласованиях и в том, как быстро сотрудники переходят на новый порядок.'],
       ['Обучаете ли вы сотрудников','Да, это часть работы. Проводим занятия по ролям и оставляем короткие видеоинструкции, чтобы новичка не пришлось учить с нуля.']]
 },
 onec:{
  t:'Внедрение 1С',
  lead:'Порядок в финансах, ресурсах и складском учёте. Настраиваем систему так, чтобы вы опирались на твёрдые, достоверные цифры при принятии управленческих решений, планировании закупок и оценке рентабельности.',

  tags:['Торговля, производство, комплексный учёт','Складской учёт','Себестоимость','Производственные заказы','Перенос данных','Отчёты и печатные формы','Расширения конфигураций','Обновления без потерь'],

  whyH:'Сначала методика учёта, потом настройка программы',

  why:['Большинство неудачных внедрений начинаются с того, что систему настраивают раньше, чем договорились, как именно считать. Мы делаем наоборот: методика фиксируется письменно и согласовывается до первой настройки.',
       'Доработки делаем отдельными надстройками, не трогая саму программу. Если менять её изнутри, обновления перестают ставиться сами: каждое приходится сверять и переносить руками. Именно это чаще всего приходится исправлять за предыдущими подрядчиками.',
       '1С показывает ровно то, что в неё внесли. Поэтому в проект всегда входит договорённость о дисциплине ввода — кто, что и в какой срок оформляет. Без этого пункта остатки не станут достоверными ни при какой настройке.'],

  goals:[['Задача 01','Договориться о методике','Как считаются себестоимость, остатки и рентабельность. Формулировка, с которой согласны и производство, и бухгалтерия.'],
         ['Задача 02','Перенести данные и запустить','Справочники, остатки, взаиморасчёты — без потери истории и без остановки работы компании.'],
         ['Задача 03','Сохранить обновляемость','Сделать доработки так, чтобы обновления 1С продолжали ставиться сами.']],

  res:['Учёт, которому можно доверять при принятии решений',
       'Настроенная система, обученные сотрудники и описание всех доработок.'],
  prices:[['Настройка и доработка базы','Когда 1С уже работает',
    ['Обследование текущего учёта','Доработки надстройками — обновления продолжают ставиться','Собственные отчёты и печатные формы','Исправление последствий прошлых доработок'],
    'от 90 000 ₽','Срок — от 2 недель'],
   ['Внедрение 1С: торговля, учёт или комплексная работа','Торговля, услуги, небольшое производство',
    ['Обследование и согласованная методика учёта','Разворачивание конфигурации и учётной политики','Перенос данных из старых баз и таблиц','Складской учёт: партии, серии, характеристики','Обучение по ролям и инструкции','Опытная эксплуатация рядом с вами'],
    'от 260 000 ₽','Срок — от 6 недель'],
   ['Проект на 1С:ERP — комплексный учёт производства','Производство и несколько юрлиц',
    ['Обследование производственного контура','Планирование, спецификации, расчёт себестоимости','Перенос остатков и параллельный запуск со старой базой','Интеграция с CRM, складом и оборудованием'],
    'от 40 000 ₽ / рабочее место','Срок — от 4 месяцев'],
   ['Сопровождение','Обновления и развитие',
    ['Обновление типовой без потери доработок','Часы разработки в пакете','Консультации бухгалтерии и склада','Контроль закрытия периода'],
    'от 30 000 ₽ / мес','Отвечаем на обращения в течение 4 часов']],

  note:'Лицензии 1С оплачиваются отдельно и напрямую: мы не зарабатываем на перепродаже и подбираем минимально достаточный комплект. Стоимость проекта на 1С:ERP по рыночной практике считается по числу автоматизируемых рабочих мест — это позволяет прикинуть бюджет до обследования. Если предыдущий подрядчик менял программу изнутри, возврат базы в состояние, где обновления ставятся сами, считается отдельно.',

  stages:[['Этап 01','Обследование','Разбираем, как ведётся учёт сейчас, где расходятся данные и какие решения принимаются на их основе.'],
          ['Этап 02','Методика учёта','Договариваемся о правилах расчёта и фиксируем их письменно. Этот документ дороже любой настройки.'],
          ['Этап 03','Настройка и перенос','Настраиваем систему, переносим справочники и остатки, дописываем недостающее отдельными надстройками.'],
          ['Этап 04','Параллельный запуск','Первый период документы вводятся в обе базы и цифры сверяются. Компания не остаётся без учёта в разгар сезона.'],
          ['Этап 05','Опытная эксплуатация','Месяц работаем рядом: разбираем ошибки ввода, правим отчёты, обучаем на реальных документах.']],

  faq:[['У нас старая база с ошибками','Обычная ситуация. Переносим то, что имеет ценность, а мусор оставляем в архиве. Остатки выверяем вручную вместе с вашей бухгалтерией.'],
       ['Будут ли доработки мешать обновлениям','Стараемся обходиться настройками. Если доработка неизбежна, делаем её так, чтобы обновление не ломало, и документируем каждую.'],
       ['Сколько длится внедрение','От восьми недель для торговли и дольше для производства. Точный срок зависит от состояния текущего учёта.']]
 },
 dev:{
  t:'Разработка программ, приложений и веб-сайтов',
  lead:'Кастомный софт под специфику вашей организации. Создаём защищённые мобильные приложения, сервисы для клиентов и внутренние решения, закрывающие те уникальные процессы, с которыми не справляются шаблонные программы.',

  tags:['Внутренние системы','Личные кабинеты','Мобильные приложения','Работа офлайн','Интеграция с 1С','Разработка API','Размещение у вас','Передача исходников'],

  whyH:'Разработка нужна не всегда, и мы говорим об этом первыми',

  why:['Готовое решение почти всегда дешевле и быстрее. Своя разработка оправдана в узком наборе случаев: процесс уникален и является вашим преимуществом, коробка заставляет ломать работающую схему, есть требования к безопасности и хранению данных внутри. Если ваш случай не такой, посоветуем коробку, даже когда это меньший заказ.',
       'Начинаем с обследования: за одну-две недели становится понятно, нужна ли разработка вообще, и появляется черновик будущей программы с оценкой. Дальше работаем короткими этапами — вы видите результат каждые две недели и можете остановиться на любом, оставшись с работающим продукт',
       'Обмен с учётной системой закладываем с первой рабочей версии. Продукт не должен становиться ещё одним изолированным местом, где заводят те же данные заново, — иначе он создаёт ровно ту проблему, ради которой мы существуем.'],

  goals:[['Задача 01','Проверить необходимость','Разобрать процесс и честно сопоставить его с тем, что уже есть на рынке готового.'],
         ['Задача 02','Выпустить работающий минимум','Отдать реальным пользователям версию, которая уже приносит пользу, а не демонстрацию для совета директоров.'],
         ['Задача 03','Передать актив компании','Исходный код, документация и доступы оформляются на вас: продукт можно развивать с кем угодно.']],

  res:['Работающий сервис и всё, что нужно для его развития',
       'Исходники, документация, инструкции и доступы — у вас.'],
  prices:[['Обследование и черновик программы','Прежде чем писать код',
    ['Разбор процесса и сценариев пользователей','Проверка, закрывается ли задача готовым решением','Интерактивный прототип','Состав первой версии и оценка с вилкой'],
    'от 150 000 ₽','Срок — 1–2 недели'],
   ['Внутренняя система','Рабочие места под вашу специфику',
    ['Проектирование интерфейса под конкретную роль','Разработка серверной части и базы данных','Права доступа и история изменений','Обмен с 1С и CRM с первой рабочей версии','Развёртывание на ваших серверах'],
    'от 700 000 ₽','Срок — от 3 месяцев'],
   ['Клиентский сервис','Личный кабинет или портал',
    ['Витрина, расчёт стоимости, оформление заказа','Статусы, документы и оплаты в кабинете','Интеграция с учётом и платежами','Админка для ваших сотрудников'],
    'от 900 000 ₽','Срок — от 3 месяцев'],
   ['Многостраничный сайт','Корпоративный сайт с разделами',
    ['Структура разделов и сценарии посетителя','Дизайн под ваш фирменный стиль','Панель управления содержимым','Формы заявок с передачей в CRM','Базовая поисковая оптимизация'],
    'от 60 000 ₽','Срок — 3–5 недель'],
   ['Одностраничный сайт','Посадочная страница под задачу',
    ['Проработка структуры под одно предложение','Дизайн и адаптив под все экраны','Форма заявки с передачей в CRM','Подключение аналитики'],
    'от 55 000 ₽','Срок — 2–3 недели'],
   ['Сайт-визитка','Компактное представительство компании',
    ['До пяти страниц: о компании, услуги, контакты','Дизайн и адаптив','Форма обратной связи','Подключение домена и почты'],
    'от 45 000 ₽','Срок — 2 недели'],
   ['Сайт-каталог','Витрина товаров без оплаты на сайте',
    ['Каталог с фильтрами и поиском','Карточки товаров и выгрузка из 1С','Заявка на товар с передачей в CRM','Панель управления каталогом'],
    'от 220 000 ₽','Срок — от 6 недель'],
   ['Интернет-магазин','Полноценные продажи с оплатой',
    ['Каталог, корзина и оформление заказа','Приём оплаты и расчёт доставки','Обмен с 1С: товары, остатки, заказы','Личный кабинет покупателя','Панель управления заказами'],
    'от 450 000 ₽','Срок — от 10 недель'],
   ['Мобильное приложение','Для сотрудников в поле или для клиентов',
    ['Кроссплатформенная разработка сразу под две платформы','Работа офлайн с последующей синхронизацией','Сканирование кодов и фотофиксация на объекте','Публикация в магазинах приложений'],
    'от 1 200 000 ₽','Срок — от 4 месяцев']],

  note:'Собственная разработка — не разовая покупка, а обязательство: обновления, безопасность, изменения законодательства, новые устройства. Сопровождение считаем отдельной строкой сразу, от 50 000 ₽ в месяц, чтобы эта цифра не всплыла после запуска. Обследование стоит фиксированно, потому что его объём понятен заранее. Проекты, где требования не сформулированы, а сроки уже назначены, мы не берём.',

  stages:[['Этап 01','Обследование','Разбираем процесс, смотрим готовые решения на рынке и собираем прототип. Результат — понимание, нужна ли разработка.'],
          ['Этап 02','Проектирование','Сценарии, интерфейсы, схема данных и архитектура обмена с учётной системой.'],
          ['Этап 03','Первая версия','Пишем минимум, который уже приносит пользу, и отдаём его реальным пользователям.'],
          ['Этап 04','Развитие короткими этапами','Дорабатываем по обратной связи от тех, кто работает в системе каждый день. Релиз раз в две недели.'],
          ['Этап 05','Передача','Исходный код, документация и доступы переходят к вам. Дальше сопровождаем или передаём вашей команде.']],

  faq:[['Можно ли доработать то, что уже написано','Можно, если есть исходники и документация. Сначала проводим разбор кода и честно говорим, что дешевле: доработка или переписывание.'],
       ['Кому принадлежит результат','Вам. Исходники и права передаются по договору, привязки к нам нет.'],
       ['Что после запуска','Предлагаем поддержку, но не навязываем. Если у вас есть своя команда — передаём проект ей с документацией.']]
 },
 scan3d:{
  t:'3D-моделирование и сканирование',
  lead:'Точное проектирование и наглядные модели. Переводим реальные предметы в цифру — от образцов новых товаров для показа заказчику до восстановления чертежей сложных деталей, чтобы быстро запустить их в производство.',

  tags:['3D-сканирование','Реверс-инжиниринг','Прототипирование','Контроль геометрии','Чертежи с допусками','Визуализация процессов','Конфигураторы изделий','STEP, IGES, STL, OBJ'],

  whyH:'Скан — это ещё не модель: основная работа начинается после съёмки',

  why:['Самое частое недоразумение в этой области: думают, что сканер сразу выдаёт файл для станка. На деле он выдаёт облако точек с шумом, и дальше нужно восстановить параметрическую модель — такую, которую можно править и по которой можно изготавливать.',
       'Восстанавливая деталь, мы строим её по правильным размерам, сверяясь с технологом, а не копируем скан один в один вместе с износом. Иначе модель повторит дефекты изношенной детали, и деталь по ней встанет не так же плохо, как оригинал.',
       'Одна модель живёт дальше чертежа: уходит в производство, в каталог и на сайт. Поэтому геометрию собираем так, чтобы её можно было и отфрезеровать, и показать клиенту в карточке товара.'],

  goals:[['Задача 01','Оцифровать существующее','Снять деталь, узел или площадку и получить достоверную цифровую копию с нужной точностью.'],
         ['Задача 02','Восстановить пригодную модель','Перевести облако точек в параметрическую геометрию с размерами, допусками и историей построения.'],
         ['Задача 03','Довести до производства и продаж','Передать чертежи в цех, а визуализацию и конфигуратор — в каталог и на переговоры.']],

  res:['Библиотека моделей и чертежей, по которым деталь повторяется без подгонки',
       'С параметрами, допусками и визуализациями для коммерческих предложений.'],
  prices:[['3D-модель по чертежу','Одна деталь или узел',
    ['Моделирование по чертежу, фото или образцу','Точная геометрия под производство, с допусками','Форматы STEP, STL, OBJ и чертежи','Два круга правок включены'],
    'от 12 000 ₽ / модель','Срок — от 5 дней'],
   ['3D-сканирование','Когда чертежей нет',
    ['Выездная съёмка на вашей площадке','Обработка облака точек: чистка и сшивка','Полигональная модель и карта отклонений','Согласование результата до перевода в CAD'],
    'от 15 000 ₽ / деталь','Срок — от 3 дней'],
   ['Реверс-инжиниринг','Восстановление детали по образцу',
    ['Сканирование и построение параметрической модели','Восстановление геометрии по номиналу, а не по износу','Чертежи с допусками для цеха','Модель, в которой типоразмер меняется числом'],
    'от 45 000 ₽ / деталь','Срок — от 2 недель'],
   ['Визуализация и конфигуратор','Показать продукт до изготовления',
    ['Фотореалистичные ракурсы и анимация сборки','2D- и 3D-визуализация технологических процессов','Интерактивная сцена в карточке товара','Конфигуратор с выгрузкой спецификации в 1С'],
    'от 250 000 ₽','Срок — от 5 недель']],

  note:'Цена сканирования зависит от габаритов, материала и требуемой точности. Блестящие, прозрачные и очень тёмные поверхности требуют подготовки, а глубокие внутренние полости оптический сканер не видит вовсе — там нужны другие методы или разборка узла. Оцениваем это по фотографиям до выезда, чтобы требуемая точность не оказалась недостижимой уже после съёмки.',

  stages:[['Этап 01','Оценка объекта','Смотрим размер, материал, состояние поверхности и требуемую точность. От этого зависят метод съёмки и цена.'],
          ['Этап 02','Съёмка','Сканируем на вашей площадке. Крупные объекты снимаются частями и сшиваются по контрольным меткам.'],
          ['Этап 03','Обработка','Чистим шум, выравниваем, строим поверхности. Показываем полигональную модель на согласование.'],
          ['Этап 04','Параметрическая модель','Переводим геометрию в CAD с размерами и допусками — в такую форму, где размер можно изменить.'],
          ['Этап 05','Передача','Отдаём модель, чертежи и исходники. При необходимости спецификация уходит прямо в 1С.']],

  faq:[['Чертежей на деталь нет вообще','Это и есть основной случай. Восстанавливаем геометрию по образцу и согласовываем размеры с вашим технологом.'],
       ['Насколько точны модели','Сканирование даёт сотые доли миллиметра. Но в модель идут номинальные размеры, а не замеры изношенного образца — это важнее формальной точности.'],
       ['В каких форматах отдаёте','В тех, с которыми работает ваше производство: STEP, IGES, native-форматы CAD, файлы для ЧПУ. Обсуждаем на старте.']]
 }
};
var SVC_ORDER=['it','integration','ai','bitrix','onec','dev','scan3d'];
/* перелинковка: какие кейсы относятся к направлению (и обратно) */
var SVC_CASES={it:['chpu-avtomatizaciya','1c-wms'],integration:['1c-wms','chpu-avtomatizaciya'],
  ai:['bitrix-otchety'],bitrix:['bitrix-otchety'],onec:['1c-wms','chpu-avtomatizaciya'],
  scan3d:['3d-detali']};
function casesOf(key){return (SVC_CASES[key]||[])}
function svcOf(slug){return SVC_ORDER.filter(function(k){return casesOf(k).indexOf(slug)>=0})}

/* ==================== детальные проекты ==================== */
var CASELIST=[
 ['Автоматизация станков с ЧПУ','Производственникам','2026','chpu-avtomatizaciya'],
 ['Битрикс24: разбор отчётов сотрудников','Автоматизация','2026','bitrix-otchety'],
 ['3D-моделирование деталей','Производственникам','2025','3d-detali'],
 ['Логотип и фирменный стиль бренда воды','Брендинг','2025','akvalis-brand'],
 ['Интеграция 1С:УТ со складской системой','Автоматизация','2025','1c-wms'],
];

/* ============ проекты на главной: слайдер ============ */
(function(){
  var box=$('#prail');if(!box)return;
  box.innerHTML='';  /* в HTML лежит статичная копия карточек для поисковиков */
  /* Карточки один в один как на странице «Проекты»: та же разметка,
     те же классы, тот же переход на детальную страницу. */
  CASELIST.forEach(function(p,i){
    /* карточка с разбором — настоящая ссылка, чтобы поисковик видел переход */
    var b=document.createElement(p[3]?'a':'button');
    b.className='pcard'+(p[3]?' has-case':'');
    if(p[3])b.href='/projects/'+p[3]+'/';else b.type='button';
    b.innerHTML='<span class="pn">'+('0'+(i+1)).slice(-2)+'</span>'+
      '<span class="cat">'+p[1]+'</span>'+
      '<h3>'+p[0]+'</h3>'+
      '<span class="yr">'+p[2]+'</span>'+
      (p[3]?'<span class="p-go" aria-hidden="true"><svg width="15" height="15" viewBox="0 0 15 15" fill="none">'+
        '<path d="M3 12 12 3M12 3H5M12 3v7" stroke="currentColor" stroke-width="1.6"/></svg></span>':'');
    box.appendChild(b);
  });

  var prev=$('#prPrev'),next=$('#prNext'),bar=$('#prBar'),num=$('#prNum');
  function step(){
    var c=box.querySelector('.pcard');
    return c?c.getBoundingClientRect().width+16:360;
  }
  function sync(){
    var max=box.scrollWidth-box.clientWidth;
    var p=max>0?box.scrollLeft/max:0;
    if(bar)bar.style.width=(8+p*92).toFixed(1)+'%';
    var total=CASELIST.length;
    var cur=Math.min(total,Math.round(box.scrollLeft/step())+1);
    if(num)num.textContent=('0'+cur).slice(-2)+' / '+('0'+total).slice(-2);
    if(prev)prev.disabled=box.scrollLeft<4;
    if(next)next.disabled=box.scrollLeft>=max-4;
  }
  prev.addEventListener('click',function(){box.scrollBy({left:-step(),behavior:RM?'auto':'smooth'})});
  next.addEventListener('click',function(){box.scrollBy({left:step(),behavior:RM?'auto':'smooth'})});
  box.addEventListener('scroll',sync,{passive:true});
  addEventListener('resize',sync);
  sync();
})();


/* ============ поп-апы ============ */
var openM,closeM;
(function(){
  var mask=$('#mask'),mIn=$('#mIn'),last=null;
  openM=function(html){
    mIn.innerHTML=html;mask.classList.add('on');mask.setAttribute('aria-hidden','false');
    document.body.classList.add('lock');$('#modal').scrollTop=0;
    last=document.activeElement;
    $$('[data-go]',mIn).forEach(function(b){
      b.addEventListener('click',function(){closeM();setTimeout(openForm,260)});
    });
    setTimeout(function(){$('#mX').focus()},60);
  };
  closeM=function(){mask.classList.remove('on');mask.setAttribute('aria-hidden','true');
    document.body.classList.remove('lock');if(last&&last.focus)last.focus()};
  $('#mX').addEventListener('click',closeM);
  mask.addEventListener('click',function(e){if(e.target===mask)closeM()});
  addEventListener('keydown',function(e){if(e.key==='Escape'&&mask.classList.contains('on'))closeM()});
})();
var CK='<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7.4 5.4 11 12 3.6" stroke="#1F3CFF" stroke-width="1.7"/></svg>';
function mList(a){return a.map(function(x){return '<li>'+CK+'<span>'+x+'</span></li>'}).join('')}
function mGrid(a){return '<dl class="m-g">'+a.map(function(x){
  return '<div><dt>'+x[0]+'</dt><dd>'+x[1]+'</dd></div>'}).join('')+'</dl>'}

document.addEventListener('click',function(e){if(e.target.closest('[data-mclose]'))closeM()});

/* ============ отрасли и услуги ============ */
(function(){
  /* Две встречные ленты. Ряд дублируется, поэтому при сдвиге на половину
     ширины картинка повторяется и стык не виден. */
  var rowA=$('#indA'), rowB=$('#indB');
  if(rowA&&rowB){
    rowA.innerHTML='';rowB.innerHTML='';  /* статичная копия для поисковиков */
    function fill(box,list){
      list.concat(list).forEach(function(x){
        var a=document.createElement('a');a.href='#talk';a.textContent=x;box.appendChild(a);
      });
    }
    fill(rowA,INDUSTRIES);
    fill(rowB,INDUSTRIES.slice().reverse());

    if(!RM){
      rowA.classList.add('js');rowB.classList.add('js');
      var box=$('#ind'), hover=false;
      box.addEventListener('pointerenter',function(){hover=true});
      box.addEventListener('pointerleave',function(){hover=false});
      var st=[{el:rowA,x:0,v:0,dir:-1,max:22},{el:rowB,x:0,v:0,dir:1,max:18}];
      st[1].x=-rowB.scrollWidth/2;
      var last=performance.now(),vis=true;
      new IntersectionObserver(function(en){vis=en[0].isIntersecting},{threshold:.02}).observe(box);
      (function loop(){
        requestAnimationFrame(loop);
        if(!vis)return;
        var now=performance.now(),dt=Math.min((now-last)/1000,.05);last=now;
        st.forEach(function(r){
          var target=hover?0:r.max;
          /* скорость подтягивается к цели — отсюда плавный разгон и торможение */
          r.v+=(target-r.v)*Math.min(1,dt*3.2);
          r.x+=r.dir*r.v*dt;
          var half=r.el.scrollWidth/2;
          if(half>0){
            if(r.x<=-half)r.x+=half;
            if(r.x>=0)r.x-=half;
          }
          r.el.style.transform='translateX('+r.x.toFixed(2)+'px)';
        });
      })();
    }
  }
  var srv=$('#srv');if(!srv)return;
  srv.innerHTML='';  /* в HTML лежит статичная копия списка для поисковиков */
  /* Порядок, названия и описания берём из разделов страницы «Направления»,
     чтобы главная и раздел не расходились. Строка ведёт на детальную
     страницу направления. */


  SVC_ORDER.forEach(function(key,i){
    var d=SVC[key];if(!d)return;
    var a=document.createElement('a');
    a.className='srv-r';
    a.href='/services/'+key+'/';
    a.setAttribute('data-route','services');
    a.setAttribute('data-sub',key);
    a.innerHTML='<span class="srv-ic anim">'+(AWILL[key]||'')+'</span>'+
      '<span class="srv-t">'+d.t+'</span>'+
      '<span class="srv-d">'+(AWSHORT[key]||'')+'</span>'+
      '<span class="srv-a"><svg width="15" height="15" viewBox="0 0 15 15" fill="none">'+
      '<path d="M3 12 12 3M12 3H5M12 3v7" stroke="currentColor" stroke-width="1.4"/></svg></span>';
    srv.appendChild(a);
  });
})();

/* ============ клиенты: бегущая лента ============ */
(function(){
  var row=document.getElementById('clRow');if(!row)return;
  /* Первым идёт настоящий логотип. Остальные — заглушки под будущие
     логотипы: как только появится файл, строка меняется на {logo:'…'}. */
  var CLIENTS=[
    {name:'Kiborto',logo:'https://kib-orto.com/wp-content/uploads/2026/05/logo-kiborto-beloe.svg',bg:'#624BE9'},
    {name:'РЦ Ортос',logo:'https://rc-ortos.ru/wp-content/uploads/2026/06/handled_3_1080_1920_80-photoroom-3-1.png',bg:'#F0EDE9'},
    {name:'Клиент 3',logo:'/img/1.jpg',bg:'#FFFFFF',big:true},
    {name:'Клиент 4',logo:'/img/2.jpg',bg:'#000000',big:true,scale:.68},
    {name:'Аквалис',bg:'#062B3A',mark:
      '<svg viewBox="0 0 150 44" fill="none" aria-hidden="true">'+
        '<g transform="translate(2,3) scale(0.32)">'+
          '<path d="M60 16c16 20 26 33 26 46a26 26 0 1 1-52 0c0-13 10-26 26-46z" '+
            'stroke="#0E8FA8" stroke-width="7" stroke-linejoin="round"/>'+
          '<path d="M46 66c0 8 6 14 14 14" stroke="#0E8FA8" stroke-width="7" stroke-linecap="round"/>'+
        '</g>'+
        '<text x="46" y="27" fill="#EAF6F9" font-size="15" font-weight="700" '+
          'letter-spacing="2.4" font-family="var(--sans)">АКВАЛИС</text>'+
      '</svg>'},
    {name:'Metaltech',bg:'#FFFFFF',scale:2,mark:
      '<svg viewBox="0 0 120 92" fill="none" aria-hidden="true">'+'<g fill="#2B2B2E">'+'<path d="M6 8 L15 8 L15 62 L6 62 Z M6 8 L15 8 L50 46 L50 62 L41 62 L41 50 L6 14 Z"/>'+'<path d="M114 8 L105 8 L105 62 L114 62 Z M114 8 L105 8 L70 46 L70 62 L79 62 L79 50 L114 14 Z"/>'+'<path d="M35 8 L85 8 L74 22 L46 22 Z"/>'+'</g>'+'<text x="60" y="86" text-anchor="middle" fill="#2B2B2E" font-size="13" '+'font-weight="600" letter-spacing="3.4">METALTECH</text>'+'</svg>'},
    {name:'АвтоПро',bg:'#FFFFFF',scale:2,mark:
      '<svg viewBox="0 0 260 186" fill="none" aria-hidden="true">'+'<path fill="#2B2B2E" d="M 84.5 11 L 126 11.5 L 91 59.5 L 87 66.5 L 81 73.5 L 57 108.5 L 45.5 123 L 3 122.5 L 84.5 11 Z "/><path fill="#2B2B2E" d="M 139 11 L 212.5 11 L 227.5 16 L 233.5 20 L 240 26.5 L 243 30.5 L 248 41.5 Q 247 45.5 249 46.5 L 249 61.5 L 248 62.5 L 248 65.5 L 246 71.5 L 243 77.5 L 231.5 90 L 222.5 95 L 216.5 97 L 212.5 97 L 211.5 98 L 167 98 L 167 99.5 L 181 118.5 L 183 123 L 145.5 123 L 142 119.5 L 106 68.5 L 207.5 68 Q 213 66 216 61.5 L 218 56.5 L 218 52.5 L 216 47.5 L 210.5 42 L 207.5 41 L 119 40.5 L 137 15.5 L 139 11 Z "/><path fill="#C0272D" d="M 95.5 74 L 111 95.5 L 112 99.5 L 94.5 123 L 61 122.5 L 95.5 74 Z "/>'+'<text x="130" y="172" text-anchor="middle" fill="#2B2B2E" font-size="26" '+'font-weight="600" letter-spacing="7">АВТОПРО</text>'+'</svg>'},
    {name:'Картон',bg:'#FFFFFF',scale:2.2,mark:
      '<svg viewBox="0 0 260 244" fill="none" aria-hidden="true">'+'<path fill="#A8794A" d="M 69.5 5 L 73.5 5 L 75.5 7 L 87.5 13 L 89.5 15 L 94.5 17 L 124.5 35 L 130.5 37 L 155.5 22 L 160.5 20 L 162.5 18 L 167.5 16 L 179.5 8 L 185.5 5 L 189.5 5 L 191.5 7 L 198.5 10 L 200.5 12 L 250 39.5 L 247.5 42 L 242.5 44 L 237.5 48 L 232.5 50 L 209 64.5 L 214 67.5 L 214 90.5 L 212.5 92 L 203 96 L 203 90.5 L 202 89.5 Q 204 88.5 203 84.5 L 202 81.5 L 203 80.5 L 203 74 L 197.5 76 L 195.5 78 L 165.5 94 L 163.5 96 L 144 106 L 144 159.5 L 145.5 160 L 202 128.5 L 203 121.5 L 202.5 120 L 214 120 L 214 134.5 L 211.5 137 L 195.5 145 L 186.5 151 L 159.5 165 L 148.5 172 L 137.5 177 L 135.5 179 L 134 179 L 134 96.5 L 135.5 96 L 174 74.5 L 151.5 61 L 146.5 59 L 139.5 54 L 134.5 52 L 132.5 50 L 128.5 49 L 85 74.5 L 124 96.5 L 124 108.5 L 122.5 109 L 118.5 106 L 105.5 100 L 103.5 98 L 88.5 91 L 86.5 89 L 69.5 81 L 67.5 79 L 57.5 74 L 55 74 L 55 127.5 L 57.5 130 L 110.5 158 L 124 166.5 L 123.5 179 L 102.5 168 L 93.5 162 L 84.5 158 L 82.5 156 L 75.5 153 L 73.5 151 L 64.5 147 L 62.5 145 L 53.5 141 L 51.5 139 L 44 136 L 44 67.5 L 45.5 66 L 49 64.5 L 46.5 62 L 39.5 59 L 37.5 57 L 30.5 54 L 28.5 52 L 7 40.5 L 69.5 5 Z M 70 16 L 29 41 L 32 43 L 40 47 L 45 51 L 75 69 L 106 52 L 118 44 Q 120 45 119 42 L 118 42 L 88 24 L 83 22 L 81 20 L 73 16 L 70 16 Z M 186 16 L 184 18 L 158 32 L 142 42 Q 139 41 140 44 L 184 69 L 230 41 L 193 18 L 189 16 L 186 16 Z "/>'+'<text x="130" y="230" text-anchor="middle" fill="#2B2B2E" font-size="26" '+'font-weight="600" letter-spacing="7">КАРТОН</text>'+'</svg>'}
  ];
  function card(c){
    var d=document.createElement('div');
    if(c.mark){
      /* нарисованный знак вместо файла: у Аквалиса логотип наш, отдельной
         картинки нет — вставляем ту же графику, что в разборе проекта */
      d.className='cl-i cl-logo cl-mark';
      /* доля размера — и для нарисованных знаков тоже */
      if(c.scale)d.style.setProperty('--sc',c.scale);
      if(c.bg){
        d.style.background=c.bg;
        /* рамку убираем только у тёмных подложек: светлая карточка без неё
           сливается с фоном страницы */
        var hx=c.bg.replace('#',''),
            rr=parseInt(hx.substr(0,2),16),gg=parseInt(hx.substr(2,2),16),bb=parseInt(hx.substr(4,2),16);
        if((rr*.299+gg*.587+bb*.114)<170)d.style.borderColor=c.bg;
      }
      d.innerHTML=c.mark;
    }else if(c.logo){
      d.className='cl-i cl-logo'+(c.big?' cl-big':'');
      /* у некоторых картинок своё поле вокруг знака: задаём долю карточки */
      if(c.scale)d.style.setProperty('--sc',c.scale);
      /* Фон задаётся у каждого клиента отдельно: логотипы приходят под
         разные подложки. Рамку убираем только у тёмных — светлая карточка
         без неё сливается с фоном страницы. */
      if(c.bg){
        d.style.background=c.bg;
        var hex=c.bg.replace('#',''),
            r=parseInt(hex.substr(0,2),16),g=parseInt(hex.substr(2,2),16),b=parseInt(hex.substr(4,2),16);
        if((r*.299+g*.587+b*.114)<170)d.style.borderColor=c.bg;
      }
      d.innerHTML='<img src="'+c.logo+'" alt="'+c.name+'" loading="lazy">';
    }else{
      d.className='cl-i cl-soon';
      d.innerHTML='<b>'+c.name+'</b><u>скоро</u>';
    }
    return d;
  }
  /* ряд дублируем — так лента идёт без стыка */
  CLIENTS.concat(CLIENTS).forEach(function(c){row.appendChild(card(c))});

  if(RM)return;
  var box=document.getElementById('cl'), hover=false, vis=true;
  box.addEventListener('pointerenter',function(){hover=true});
  box.addEventListener('pointerleave',function(){hover=false});
  new IntersectionObserver(function(en){vis=en[0].isIntersecting},{threshold:.02}).observe(box);

  var x=0,v=0,MAX=34,last=performance.now();
  (function loop(){
    requestAnimationFrame(loop);
    if(!vis)return;
    var now=performance.now(),dt=Math.min((now-last)/1000,.05);last=now;
    /* скорость подтягивается к цели — отсюда плавный разгон и торможение */
    v+=((hover?0:MAX)-v)*Math.min(1,dt*3.2);
    x-=v*dt;
    var half=row.scrollWidth/2;
    if(half>0&&x<=-half)x+=half;
    row.style.transform='translateX('+x.toFixed(2)+'px)';
  })();
})();


/* ============ поп-ап заявки ============ */
var openForm=function(){};
(function(){
  var mask=$('#fmask'),f=$('#popForm'),ok=$('#fok'),last=null,tm=null;
  if(!mask)return;

  /* поля растут под длину текста */
  var meas=document.createElement('span');
  meas.style.cssText='position:absolute;left:-9999px;top:0;white-space:pre;visibility:hidden';
  document.body.appendChild(meas);
  function fit(inp){
    var cs=getComputedStyle(inp);
    meas.style.font=cs.fontStyle+' '+cs.fontWeight+' '+cs.fontSize+' '+cs.fontFamily;
    meas.style.letterSpacing=cs.letterSpacing;
    meas.textContent=inp.value||inp.placeholder;
    inp.style.width=Math.max(80,meas.offsetWidth+24)+'px';
  }
  $$('#popForm input').forEach(function(i){
    i.addEventListener('input',function(){fit(i);i.parentElement.classList.remove('err')});
  });
  $('#p4').addEventListener('change',function(){this.parentElement.classList.remove('err')});

  openForm=function(){
    clearTimeout(tm);
    f.style.display='';ok.classList.remove('on');
    $$('#popForm .fl').forEach(function(x){x.classList.remove('err')});
    last=document.activeElement;
    mask.classList.add('on');mask.setAttribute('aria-hidden','false');
    document.body.classList.add('lock');
    $$('#popForm input').forEach(fit);
    setTimeout(function(){var i=$('#p1');if(i)i.focus({preventScroll:true})},520);
  };
  function close(){
    mask.classList.remove('on');mask.setAttribute('aria-hidden','true');
    document.body.classList.remove('lock');
    if(last&&last.focus)last.focus();
  }
  $('#fx').addEventListener('click',close);
  mask.addEventListener('click',function(e){if(e.target===mask)close()});
  addEventListener('keydown',function(e){if(e.key==='Escape'&&mask.classList.contains('on'))close()});

  f.addEventListener('submit',function(e){
    e.preventDefault();var good=true;
    ['#p1','#p3'].forEach(function(sel){var el=$(sel);
      if(!el.value.trim()){el.parentElement.classList.add('err');good=false}});
    if(!good){$('#p1').focus();return}
    sendForm(f,function(){
      f.style.display='none';ok.classList.add('on');
      tm=setTimeout(close,4200);
    },function(msg){formError(f,msg)});
  });
})();


/* ==================== отправка заявок ==================== */
/* Формы отправляются на send.php. Если скрипт по какой-то причине
   не сработает, у форм есть обычные action и method — заявка уйдёт
   классической отправкой, а не потеряется. */
function sendForm(form,onDone,onFail){
  /* не отправляем, пока номер не введён полностью */
  if(!phoneOk(form))return;
  var pg=form.querySelector('.js-page');
  if(pg)pg.value=location.href;
  var btn=form.querySelector('button[type=submit]');
  var old=btn?btn.innerHTML:'';
  if(btn){btn.disabled=true;btn.style.opacity='.65'}
  function restore(){if(btn){btn.disabled=false;btn.style.opacity='';btn.innerHTML=old}}

  fetch(form.getAttribute('action')||'/send.php',{
    method:'POST',
    body:new FormData(form),
    headers:{'Accept':'application/json','X-Requested-With':'fetch'}
  }).then(function(r){return r.json().catch(function(){return {ok:r.ok}}) })
    .then(function(d){
      restore();
      if(d&&d.ok)onDone();
      else onFail(d&&d.message?d.message:'Не удалось отправить. Позвоните: 8 (800) 201-11-32');
    })
    .catch(function(){
      restore();
      onFail('Нет связи с сервером. Позвоните: 8 (800) 201-11-32');
    });
}
/* Номер проверяем до отправки: 11 цифр. Так человек видит ошибку сразу,
   а не после обращения к серверу. */
function phoneOk(form){
  var el=form.querySelector('[data-phone]');
  if(!el)return true;
  var d=(el.value||'').replace(/\D/g,'');
  if(d.length===11)return true;
  if(el.parentElement)el.parentElement.classList.add('err');
  el.focus();
  formError(form,'Введите номер телефона полностью — 10 цифр после +7.');
  return false;
}

/* сообщение об ошибке под кнопкой формы */
function formError(form,text){
  var box=form.querySelector('.f-err');
  if(!box){
    box=document.createElement('p');box.className='f-err';
    form.appendChild(box);
  }
  box.textContent=text;
  box.classList.add('on');
  setTimeout(function(){box.classList.remove('on')},6000);
}

/* ============ форма-разговор ============ */
(function(){
  var f=$('#talkForm'),th=$('#thanks');
  var meas=document.createElement('span');meas.className='measure';document.body.appendChild(meas);
  function fit(inp){
    var cs=getComputedStyle(inp);
    meas.style.font=cs.fontWeight+' '+cs.fontSize+' '+cs.fontFamily;
    meas.style.letterSpacing=cs.letterSpacing;
    meas.textContent=inp.value||inp.placeholder;
    inp.style.width=Math.max(90,meas.offsetWidth+22)+'px';
  }
  $$('#talkForm input').forEach(function(i){
    fit(i);i.addEventListener('input',function(){fit(i);i.parentElement.classList.remove('err')});
  });
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){
    $$('#talkForm input').forEach(fit)});
  if($('#q4'))$('#q4').addEventListener('change',function(){this.parentElement.classList.remove('err')});

  if(f)f.addEventListener('submit',function(e){
    e.preventDefault();var ok=true;
    ['#q1','#q3'].forEach(function(s){var el=$(s);
      if(!el.value.trim()){el.parentElement.classList.add('err');ok=false}});
    if(!ok){$('#q1').focus();return}
    sendForm(f,function(){
      f.style.display='none';th.classList.add('on');
      if(window.__pzDone)window.__pzDone();
    },function(msg){formError(f,msg)});
  });

  /* делегирование: кнопки на страницах, которые рисуются позже, тоже сработают */
  document.addEventListener('click',function(e){
    var b=e.target.closest('[data-go]');
    if(b&&!b.hasAttribute('data-calc'))openForm();
  });
})();

/* ============ 3D-пазл у формы ============ */
(function(){
  var cv=$('#pz3d');if(!cv||typeof THREE==='undefined')return;
  try{
    /* контуры четырёх деталей: шипы и пазы построены одной кривой, поэтому стыкуются точно */
    var PZ=[
      [['M',0,0],['L',100,0],['L',100,35],['C',112,35,118,43,118,50],['C',118,57,112,65,100,65],
       ['L',100,100],['L',65,100],['C',65,112,57,118,50,118],['C',43,118,35,112,35,100],['L',0,100]],
      [['M',100,0],['L',200,0],['L',200,100],['L',165,100],['C',165,112,157,118,150,118],
       ['C',143,118,135,112,135,100],['L',100,100],['L',100,65],['C',112,65,118,57,118,50],['C',118,43,112,35,100,35]],
      [['M',0,100],['L',35,100],['C',35,112,43,118,50,118],['C',57,118,65,112,65,100],['L',100,100],
       ['L',100,135],['C',112,135,118,143,118,150],['C',118,157,112,165,100,165],['L',100,200],['L',0,200]],
      [['M',100,100],['L',200,100],['L',200,200],['L',100,200],['L',100,165],
       ['C',112,165,118,157,118,150],['C',118,143,112,135,100,135]]
    ];
    function shapeOf(a){
      var sh=new THREE.Shape();
      a.forEach(function(c){
        if(c[0]==='M')sh.moveTo(c[1],-c[2]);
        else if(c[0]==='L')sh.lineTo(c[1],-c[2]);
        else sh.bezierCurveTo(c[1],-c[2],c[3],-c[4],c[5],-c[6]);
      });
      sh.closePath();return sh;
    }
    function geoOf(i){
      return new THREE.ExtrudeGeometry(shapeOf(PZ[i]),
        {depth:26,bevelEnabled:true,bevelSize:3.2,bevelThickness:3.2,bevelSegments:2,curveSegments:14});
    }

    var rn=new THREE.WebGLRenderer({canvas:cv,antialias:AA,alpha:true,powerPreference:"low-power"});
    rn.setPixelRatio(Math.min(devicePixelRatio,DPRMAX));
    var sc=new THREE.Scene(),cam=new THREE.PerspectiveCamera(38,1,.1,100);
    cam.position.set(0,0,6.4);
    var grp=new THREE.Group();sc.add(grp);
    grp.scale.setScalar(.0125);grp.rotation.x=-.44;

    var matFix=new THREE.MeshPhongMaterial({color:0x23242E,shininess:90,specular:0xAEB6D6});
    var matLoose=new THREE.MeshPhongMaterial({color:0xE8FF4D,shininess:80,specular:0xFFFFFF,emissive:0x2E3600});

    for(var i=0;i<3;i++){
      var g=geoOf(i);g.translate(-100,100,-13);
      grp.add(new THREE.Mesh(g,matFix));
    }
    var gd=geoOf(3);gd.translate(-150,150,-13);
    var loose=new THREE.Mesh(gd,matLoose);
    grp.add(loose);

    /* пустая ячейка: тонкий контур на месте недостающей детали */
    var slot=new THREE.LineSegments(new THREE.EdgesGeometry(geoOf(3),30),
      new THREE.LineBasicMaterial({color:0xE8FF4D,transparent:true,opacity:.34}));
    slot.geometry.translate(-100,100,-13);grp.add(slot);

    sc.add(new THREE.AmbientLight(0x3A3F55,.9));
    var l1=new THREE.DirectionalLight(0xFFFFFF,.95);l1.position.set(4,6,7);sc.add(l1);
    var l2=new THREE.PointLight(0xE8FF4D,1.5,40);l2.position.set(-4,-3,5);sc.add(l2);
    var l3=new THREE.PointLight(0x6E8BFF,1.1,40);l3.position.set(6,-2,3);sc.add(l3);

    function size(){var r=cv.getBoundingClientRect();if(!r.width)return;
      rn.setSize(r.width,r.height,false);cam.aspect=1;cam.updateProjectionMatrix()}
    size();addEventListener('resize',size);

    var base=new THREE.Vector3(50,-50,0);
    var off=new THREE.Vector3(60,-54,34),tgt=off.clone(),done=false;
    window.__pzDone=function(){
      if(done)return;done=true;tgt.set(0,0,0);
      slot.material.opacity=0;
      matLoose.color.set(0x23242E);matLoose.emissive.set(0x000000);matLoose.specular.set(0xAEB6D6);
    };

    var mx=0,my=0,ry=0,rx=0,vis=true;
    addEventListener('mousemove',function(e){mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5});
    new IntersectionObserver(function(en){vis=en[0].isIntersecting},{threshold:.05}).observe(cv);

    var cl=new THREE.Clock();
    (function loop(){
      requestAnimationFrame(loop);
      if(!vis)return;
      var d=Math.min(cl.getDelta(),.05),t=cl.getElapsedTime();
      if(!RM){
        grp.rotation.y+=d*.16;
        off.lerp(tgt,done?.05:.08);
        var fl=done?0:1;
        loose.position.set(base.x+off.x,base.y+off.y+Math.sin(t*.9)*4*fl,off.z+Math.cos(t*.7)*5*fl);
        loose.rotation.set(Math.sin(t*.6)*.14*fl,Math.cos(t*.5)*.12*fl,Math.sin(t*.45)*.1*fl);
      }else{
        loose.position.set(base.x+off.x,base.y+off.y,off.z);
      }
      rx+=((-.44-my*.16)-rx)*.05;ry+=(mx*.22-ry)*.05;
      grp.rotation.x=rx;grp.rotation.z=ry*.35;
      rn.render(sc,cam);
    })();
  }catch(e){cv.parentElement.style.display='none'}
})();

/* ============ cookie ============ */
(function(){
  var c=$('#cook');if(!c)return;
  var NAME='ri_cookie_ok', DAYS=180;

  function read(name){
    var m=document.cookie.match('(?:^|; )'+name.replace(/([.$?*|{}()\[\]\\/+^])/g,'\\$1')+'=([^;]*)');
    return m?decodeURIComponent(m[1]):null;
  }
  function write(name,val,days){
    var d=new Date();
    d.setTime(d.getTime()+days*24*60*60*1000);
    /* SameSite=Lax — cookie не уходит на сторонние сайты;
       Secure ставим только на защищённом соединении, иначе браузер
       откажется записывать на локальной проверке по http */
    var extra='; SameSite=Lax'+(location.protocol==='https:'?'; Secure':'');
    document.cookie=name+'='+encodeURIComponent(val)+'; Expires='+d.toUTCString()+'; Path=/'+extra;
  }

  /* Уже соглашались — плашку не показываем и слушателей не вешаем. */
  if(read(NAME)==='1')return;

  /* Небольшая задержка: плашка не выпрыгивает поверх первого экрана
     в момент загрузки, а появляется, когда страница уже видна. */
  setTimeout(function(){c.classList.add('on')},1200);

  var ok=$('#cookOk');
  if(ok)ok.addEventListener('click',function(){
    c.classList.add('off');
    try{ write(NAME,'1',DAYS); }catch(e){}
  });
})();

/* запускаем наблюдатель после отрисовки блоков */
setTimeout(function(){$$('.rv').forEach(function(el){io.observe(el)})},60);

/* ==================== данные писем ==================== */
var LETTERS=[
 {co:'ООО ТК «Альфа Трек»',y:'2026',role:'Транспортная компания',
  short:'За внедрение Битрикс24, 1С и разработку сайта-портала',
  text:['Выражаем благодарность компании «РУСИНТЕГРАЦИЯ» за комплексную работу: внедрение Битрикс24, настройку 1С и разработку сайта-портала для наших клиентов.',
        'Специалисты разобрались в специфике перевозок и собрали решение под наш процесс, а не под типовую схему. Заявки с сайта попадают в CRM, расчёты и документы формируются в 1С, статус рейса виден клиенту в личном кабинете.',
        'Работы выполнены в срок, замечания устранялись оперативно. После запуска команда осталась на связи и продолжает сопровождать систему. Рекомендуем как надёжного подрядчика.'],
  sign:'Тышевский Е. П.',pos:'Генеральный директор'},
 {co:'Металлконструкт',y:'2026',role:'Производство металлоконструкций',
  short:'За внедрение обмена между 1С:ERP и Битрикс24',
  text:['Выражаем благодарность компании «РУСИНТЕГРАЦИЯ» за проект по объединению системы продаж и производственного учёта.',
        'Работы выполнены в согласованные сроки. Отдельно отмечаем подход команды к запуску: обмен вводился поэтапно, параллельно со старым порядком работы, что позволило избежать остановки отгрузок.',
        'После внедрения объём ручного ввода сократился более чем на две трети, а время от подтверждения заказа до постановки в цех — с двух дней до трёх часов. Рекомендуем компанию как ответственного подрядчика.'],
  sign:'Ковалёв А. И.',pos:'Коммерческий директор'},
 {co:'ТехноДеталь',y:'2025',role:'Машиностроение',
  short:'За разработку 3D-моделей деталей',
  text:['Благодарим команду «РУСИНТЕГРАЦИЯ» за работу по созданию трёхмерных моделей узлов и оснастки нашего производства.',
        'Часть деталей выпускалась по образцам, чертежи на них отсутствовали. Специалисты подрядчика выполнили обмеры и сканирование, восстановили геометрию и подготовили параметрические модели с чертежами и допусками.',
        'Подготовка повторного заказа сократилась в разы, а изготовленные по моделям детали встают на место без подгонки. Отдельно отмечаем внимание к технологическим требованиям производства.'],
  sign:'Тимофеева М. С.',pos:'Главный конструктор'},
 {co:'СервисПро',y:'2025',role:'Обслуживание инженерных систем',
  short:'За внедрение ИИ-разбора входящих обращений',
  text:['Компания «РУСИНТЕГРАЦИЯ» выполнила для нас проект по автоматической обработке входящих заявок с использованием языковых моделей.',
        'Мы отнеслись к идее с осторожностью, однако подрядчик предложил поэтапный запуск с контролем качества и возможностью в любой момент вернуться к ручному разбору.',
        'В результате разбор обращений перестал занимать рабочее время трёх сотрудников, а точность классификации превысила 90%. Благодарим за профессиональный подход и честную оценку рисков на старте.'],
  sign:'Сорокин Д. В.',pos:'Генеральный директор'},
 {co:'МебельГрад',y:'2025',role:'Мебельное производство',
  short:'За создание 3D-каталога и конфигуратора',
  text:['Выражаем признательность компании «РУСИНТЕГРАЦИЯ» за разработку трёхмерного каталога продукции и конфигуратора для сайта.',
        'Командой смоделировано 240 позиций с проработкой фурнитуры и материалов. Конфигуратор передаёт спецификацию непосредственно в учётную систему, что избавило менеджеров от ручного расчёта.',
        'Конверсия карточки товара выросла на 18%, необходимость в фотосъёмке новых моделей отпала. Рекомендуем как подрядчика, внимательного к деталям производства.'],
  sign:'Белова И. А.',pos:'Директор по маркетингу'},
 {co:'СтройХолдинг',y:'2024',role:'Строительство',
  short:'За внедрение корпоративного портала',
  text:['Благодарим «РУСИНТЕГРАЦИЯ» за внедрение корпоративного портала для четырёх юридических лиц холдинга.',
        'Отдельно отмечаем работу с сопротивлением на местах: для прорабов был разработан отдельный сценарий взаимодействия через мессенджер, что обеспечило реальное наполнение системы данными с объектов.',
        'Подготовка сводной отчётности сократилась с недели до одного дня. Сотрудничество продолжается в формате поддержки и развития.'],
  sign:'Гордеев П. Н.',pos:'Финансовый директор'}
];

/* ==================== уведомление ==================== */
var toastTimer=null;
function toast(txt){
  var t=$('#toast');if(!t)return;
  t.textContent=txt;t.classList.add('on');
  clearTimeout(toastTimer);toastTimer=setTimeout(function(){t.classList.remove('on')},2600);
}

/* ==================== страница «О нас» ==================== */
function initAbout(){
  /* линия истории */
  var tl=$('#a-tl'),fill=$('#a-tlFill');
  if(tl){
    var upd=function(){
      if($('#page-about').hidden)return;
      var r=tl.getBoundingClientRect(),p=(innerHeight*.75-r.top)/r.height;
      fill.style.height=Math.max(0,Math.min(1,p))*100+'%';
    };
    addEventListener('scroll',upd,{passive:true});upd();
  }
  /* ==================== галерея писем ==================== */
(function(){
  var rail=$('#ltRail');if(!rail)return;
  /* лист письма рисуем кодом — без внешних картинок */
  function sheet(i){
    var lines='';
    for(var k=0;k<9;k++){
      var w=k===8?120:(k%3===0?200:230)-((k*13)%40);
      lines+='<rect x="34" y="'+(126+k*17)+'" width="'+w+'" height="5" rx="2.5" fill="rgba(12,12,14,.13)"/>';
    }
    return '<svg viewBox="0 0 290 392" xmlns="http://www.w3.org/2000/svg">'+
      '<rect width="290" height="392" fill="#fff"/>'+
      '<rect x="34" y="34" width="54" height="14" rx="3" fill="#1F3CFF"/>'+
      '<rect x="94" y="36" width="72" height="10" rx="3" fill="rgba(12,12,14,.16)"/>'+
      '<rect x="34" y="72" width="176" height="9" rx="3" fill="rgba(12,12,14,.55)"/>'+
      '<rect x="34" y="90" width="120" height="9" rx="3" fill="rgba(12,12,14,.3)"/>'+
      lines+
      '<circle cx="228" cy="322" r="30" fill="none" stroke="rgba(31,60,255,.4)" stroke-width="2"/>'+
      '<circle cx="228" cy="322" r="22" fill="none" stroke="rgba(31,60,255,.25)" stroke-width="1.4"/>'+
      '<path d="M212 322h32M228 306v32" stroke="rgba(31,60,255,.22)" stroke-width="1.4"/>'+
      '<path d="M40 330c14-16 22 10 34-4s16 12 30-6" stroke="rgba(12,12,14,.42)" stroke-width="2.4" fill="none" stroke-linecap="round"/>'+
      '<rect x="34" y="352" width="96" height="6" rx="3" fill="rgba(12,12,14,.16)"/>'+
      '</svg>';
  }
  LETTERS.forEach(function(L,i){
    var b=document.createElement('button');b.className='lt';b.type='button';
    b.innerHTML='<div class="lt-p">'+sheet(i)+'</div>'+
      '<div class="lt-m"><b>'+L.co+'</b><span>'+L.y+'</span></div>'+
      '<p class="lt-d">'+L.short+'</p>';
    b.addEventListener('click',function(){
      openM('<div class="mono">Благодарственное письмо · '+L.y+'</div>'+
        '<h3>'+L.co+'</h3>'+
        '<p style="color:var(--muted);font-size:14.5px;margin-bottom:22px">'+L.role+'</p>'+
        L.text.map(function(t){return '<p>'+t+'</p>'}).join('')+
        '<div class="m-sign"><b>'+L.sign+'</b>'+L.pos+', '+L.co+'</div>'+
        '<div class="m-c"><button class="btn" data-go><span>Обсудить задачу</span></button>'+
        '<button class="btn btn-o" data-mclose><span>Закрыть</span></button></div>');
    });
    rail.appendChild(b);
  });

  var prev=$('#ltPrev'),next=$('#ltNext'),bar=$('#ltBar'),num=$('#ltNum');
  function step(){var c=$('.lt',rail);return c?c.getBoundingClientRect().width+16:306}
  function upd(){
    var max=rail.scrollWidth-rail.clientWidth,pr=max>0?rail.scrollLeft/max:0;
    var per=Math.max(1,Math.round(rail.clientWidth/step())),pages=Math.max(1,LETTERS.length-per+1);
    var idx=Math.min(pages-1,Math.round(pr*(pages-1)));
    bar.style.width=(100/pages)+'%';bar.style.transform='translateX('+(idx*100)+'%)';
    num.textContent=('0'+(idx+1)).slice(-2)+' / '+('0'+LETTERS.length).slice(-2);
    prev.disabled=rail.scrollLeft<6;next.disabled=rail.scrollLeft>=max-6;
  }
  prev.addEventListener('click',function(){rail.scrollBy({left:-step(),behavior:RM?'auto':'smooth'})});
  next.addEventListener('click',function(){rail.scrollBy({left:step(),behavior:RM?'auto':'smooth'})});
  rail.addEventListener('scroll',upd,{passive:true});
  addEventListener('resize',upd);
  setTimeout(upd,80);
})();
  /* ==================== 3D: фирменный знак ==================== */
(function(){
  var cv=$('#trophy');if(!cv||typeof THREE==='undefined')return;
  try{
    var rn=new THREE.WebGLRenderer({canvas:cv,antialias:AA,alpha:true,powerPreference:'low-power'});
    /* на телефоне режем плотность пикселей: именно она, а не число граней,
       съедала производительность в прошлый раз */
    rn.setPixelRatio(Math.min(devicePixelRatio,MOBILE?1.25:DPRMAX));
    if(THREE.sRGBEncoding)rn.outputEncoding=THREE.sRGBEncoding;
    var sc=new THREE.Scene(),cam=new THREE.PerspectiveCamera(34,1,.1,60);
    cam.position.set(0,0,6.6);cam.lookAt(0,0,0);
    var root=new THREE.Group();sc.add(root);root.rotation.set(.14,-.42,0);

    /* цвета переводим в линейное пространство — вывод идёт в sRGB */
    function M(hex){
      var m=new THREE.MeshPhongMaterial({color:hex,shininess:22,specular:0x3A4A80});
      if(m.color.convertSRGBToLinear)m.color.convertSRGBToLinear();
      if(m.specular.convertSRGBToLinear)m.specular.convertSRGBToLinear();
      return m;
    }
    var INK=M(0x0C0C0E), ACC=M(0x1F3CFF);

    var DEPTH=1.1, BEV=.22, SEG=MOBILE?48:128, BSEG=MOBILE?6:16;
    /* перемычки делаем тоньше узлов: так их грани не совпадают с гранями
       кольца и точек, и в местах пересечения нет дрожания пикселей */
    var BAR_DEPTH=.86, BAR_BEV=.17;
    function solid(shape,mat,dep,bev){
      dep=dep||DEPTH;bev=bev||BEV;
      var g=new THREE.ExtrudeGeometry(shape,{depth:dep,bevelEnabled:true,bevelSize:bev,
        bevelThickness:bev,bevelSegments:BSEG,curveSegments:SEG});
      g.translate(0,0,-dep/2);
      return new THREE.Mesh(g,mat);
    }
    function disc(x,y,r,mat){
      var s=new THREE.Shape();s.absarc(0,0,r,0,Math.PI*2,false);
      var m=solid(s,mat);m.position.set(x,y,0);root.add(m);return m;
    }
    function ring(x,y,ro,ri,mat){
      var s=new THREE.Shape();s.absarc(0,0,ro,0,Math.PI*2,false);
      var h=new THREE.Path();h.absarc(0,0,ri,0,Math.PI*2,true);s.holes.push(h);
      var m=solid(s,mat);m.position.set(x,y,0);root.add(m);return m;
    }
    /* перемычка со скруглёнными концами */
    function bar(x1,y1,x2,y2,w,mat){
      var len=Math.hypot(x2-x1,y2-y1),r=w/2;
      var s=new THREE.Shape();
      s.moveTo(0,-r);s.lineTo(len,-r);
      s.absarc(len,0,r,-Math.PI/2,Math.PI/2,false);
      s.lineTo(0,r);
      s.absarc(0,0,r,Math.PI/2,Math.PI*1.5,false);
      var m=solid(s,mat,BAR_DEPTH,BAR_BEV);
      m.position.set(x1,y1,0);
      m.rotation.z=Math.atan2(y2-y1,x2-x1);
      root.add(m);return m;
    }

    /* ---- узлы знака ---- */
    var RC=[-6,0], RO=4, RI=2.4, DR=2.4, BW=1.5;
    var DOTS=[[6.5,6.5,ACC],[6.5,-6.5,INK]];

    /* Концы перемычек считаем, а не подбираем: торец со скруглением и фаской
       не должен заходить внутрь отверстия кольца и вылезать за край точки. */
    var CAP=BW/2+BAR_BEV;
    DOTS.forEach(function(d){
      var L=Math.hypot(d[0]-RC[0],d[1]-RC[1]);
      var ux=(d[0]-RC[0])/L, uy=(d[1]-RC[1])/L;
      var a=RI+CAP+.18;              /* отступ от центра кольца */
      var b=DR-CAP-.18;              /* отступ от центра точки  */
      bar(RC[0]+ux*a, RC[1]+uy*a, d[0]-ux*b, d[1]-uy*b, BW, INK);
    });
    ring(RC[0],RC[1],RO,RI,INK);
    DOTS.forEach(function(d){disc(d[0],d[1],DR,d[2])});

    root.scale.setScalar(.167);

    sc.add(new THREE.HemisphereLight(0xFFFFFF,0x8E96B4,.95));
    var l1=new THREE.DirectionalLight(0xFFFFFF,1.25);l1.position.set(-3,5,6);sc.add(l1);
    var l2=new THREE.DirectionalLight(0xD8E2FF,.65);l2.position.set(5,0,4);sc.add(l2);
    var l3=new THREE.PointLight(0x6E8BFF,.9,26);l3.position.set(-4,-3,3);sc.add(l3);
    var l4=new THREE.PointLight(0xFFFFFF,.5,24);l4.position.set(3,4,-4);sc.add(l4);

    function size(){var r=cv.getBoundingClientRect();if(!r.width)return;
      rn.setSize(r.width,r.height,false);cam.aspect=r.width/r.height;cam.updateProjectionMatrix()}
    size();addEventListener('resize',size);

    var vis=true,dg=false,vx=0,vy=0,px=0,py=0,touch=false;
    new IntersectionObserver(function(en){vis=en[0].isIntersecting},{threshold:.05}).observe(cv);
    cv.addEventListener('pointerdown',function(e){dg=true;touch=(e.pointerType==='touch');
      px=e.clientX;py=e.clientY;try{cv.setPointerCapture(e.pointerId)}catch(err){}});
    cv.addEventListener('pointermove',function(e){if(!dg)return;
      var dx=e.clientX-px,dy=e.clientY-py;
      if(touch&&Math.abs(dx)>4&&e.cancelable)e.preventDefault();
      vy=dx*.008;vx=dy*.008;px=e.clientX;py=e.clientY;
      root.rotation.y+=vy;root.rotation.x=Math.max(-.45,Math.min(.45,root.rotation.x+vx))});
    ['pointerup','pointercancel','pointerleave'].forEach(function(ev){
      cv.addEventListener(ev,function(){dg=false})});

    var cl=new THREE.Clock(),last=0,STEP=MOBILE?1/30:0;
    (function loop(){
      requestAnimationFrame(loop);
      if(!vis)return;
      var t=cl.getElapsedTime();
      if(STEP&&t-last<STEP)return;                        /* на телефоне 30 кадров в секунду */
      last=t;
      if(!dg){vx*=.93;vy*=.93;
        root.rotation.y+=vy+(RM?0:.0075);
        root.rotation.x=Math.max(-.45,Math.min(.45,root.rotation.x+vx))}
      if(!RM)root.position.y=Math.sin(t*.9)*.07;
      rn.render(sc,cam);
    })();
  }catch(e){cv.parentElement.style.display='none'}
})();
  $$('#page-about .top [data-c]').forEach(countUpEl);
}

/* ==================== страница «Контакты» ==================== */
function initContacts(){
  /* копирование реквизитов */
  $$('#page-contacts [data-copy]').forEach(function(b){
    b.addEventListener('click',function(){
      var txt=b.getAttribute('data-copy');
      function fallback(){
        var ta=document.createElement('textarea');
        ta.value=txt;ta.style.cssText='position:fixed;left:-9999px';
        document.body.appendChild(ta);ta.select();
        try{document.execCommand('copy');toast('Скопировано')}catch(e){toast('Не удалось скопировать')}
        document.body.removeChild(ta);
      }
      if(navigator.clipboard&&navigator.clipboard.writeText){
        navigator.clipboard.writeText(txt).then(function(){toast('Скопировано')},fallback);
      }else fallback();
    });
  });
  /* визитка */
  var vc=$('#vcard');
  if(vc)vc.addEventListener('click',function(){
    var v=['BEGIN:VCARD','VERSION:3.0','N:Швед;Святослав;;;','FN:Святослав Швед',
      'ORG:РУСИНТЕГРАЦИЯ','TITLE:Директор',
      'TEL;TYPE=WORK,VOICE:+78002011132',
      'EMAIL;TYPE=WORK:rus-integration@yandex.ru',
      'URL:https://rus-integration.ru',
      'ADR;TYPE=WORK:;;ул. Примерная, 12, офис 305;Москва;;107023;Россия',
      'END:VCARD'].join('\r\n');
    try{
      var blob=new Blob([v],{type:'text/vcard;charset=utf-8'});
      var url=URL.createObjectURL(blob),a=document.createElement('a');
      a.href=url;a.download='shved-rusintegraciya.vcf';
      document.body.appendChild(a);a.click();document.body.removeChild(a);
      setTimeout(function(){URL.revokeObjectURL(url)},1500);
      toast('Контакт сохранён');
    }catch(e){toast('Скачивание недоступно в этом браузере')}
  });
  /* ---------- 3D: метка на карте ---------- */
  initPin();
}

/* ==================== 3D: метка на карте ==================== */
function initPin(){
  var cv=$('#phone');if(!cv||typeof THREE==='undefined')return;
  try{
    var rn=new THREE.WebGLRenderer({canvas:cv,antialias:AA,alpha:true,powerPreference:'low-power'});
    rn.setPixelRatio(Math.min(devicePixelRatio,DPRMAX));
    if(THREE.sRGBEncoding)rn.outputEncoding=THREE.sRGBEncoding;
    var sc=new THREE.Scene(),cam=new THREE.PerspectiveCamera(34,1,.1,60);
    cam.position.set(0,0,6.4);cam.lookAt(0,0,0);
    var root=new THREE.Group();sc.add(root);root.rotation.set(.12,-.35,0);

    /* ---- контур капли строится по касательным к окружности головки ---- */
    var R=.62, CY=.35, TIPY=-1.10;
    var d=CY-TIPY, a=Math.acos(R/d);                 /* угол до точки касания */
    var t1=Math.atan2(-Math.cos(a)*R,Math.sin(a)*R); /* угол первой касательной */
    var sh=new THREE.Shape();
    var p1x=Math.sin(a)*R, p1y=CY-Math.cos(a)*R;
    sh.moveTo(0,TIPY);
    sh.quadraticCurveTo(p1x*.45,TIPY+(p1y-TIPY)*.42,p1x,p1y);   /* правый бок */
    sh.absarc(0,CY,R,t1,Math.PI-t1,false);                       /* головка */
    sh.quadraticCurveTo(-p1x*.45,TIPY+(p1y-TIPY)*.42,0,TIPY);    /* левый бок */
    var hole=new THREE.Path();
    hole.absarc(0,CY,R*.45,0,Math.PI*2,true);
    sh.holes.push(hole);

    var geo=new THREE.ExtrudeGeometry(sh,{depth:.18,bevelEnabled:true,bevelSize:.055,
      bevelThickness:.05,bevelSegments:MOBILE?6:14,curveSegments:MOBILE?44:96});
    geo.center();
    /* лёгкий блик: широкий и приглушённый, без резких пятен на скруглениях */
    var mat=new THREE.MeshPhongMaterial({color:0x1F3CFF,shininess:22,specular:0x3A4A80});
    /* вывод идёт в sRGB, поэтому цвет переводим в линейное пространство —
       иначе на экране он окажется светлее заданного */
    if(mat.color.convertSRGBToLinear)mat.color.convertSRGBToLinear();
    if(mat.specular&&mat.specular.convertSRGBToLinear)mat.specular.convertSRGBToLinear();
    var pin=new THREE.Mesh(geo,mat);
    pin.scale.setScalar(1.3);
    root.add(pin);

    sc.add(new THREE.HemisphereLight(0xFFFFFF,0x8E96B4,.95));
    var l1=new THREE.DirectionalLight(0xFFFFFF,1.35);l1.position.set(-3,5,6);sc.add(l1);
    var l2=new THREE.DirectionalLight(0xD8E2FF,.7);l2.position.set(5,0,4);sc.add(l2);
    var l3=new THREE.PointLight(0x6E8BFF,1,26);l3.position.set(-4,-3,3);sc.add(l3);
    var l4=new THREE.PointLight(0xFFFFFF,.55,24);l4.position.set(3,4,-4);sc.add(l4);

    function size(){var r=cv.getBoundingClientRect();if(!r.width)return;
      rn.setSize(r.width,r.height,false);cam.aspect=r.width/r.height;cam.updateProjectionMatrix()}
    size();addEventListener('resize',size);

    var vis=true,dg=false,vx=0,vy=0,px=0,py=0,touch=false;
    new IntersectionObserver(function(en){vis=en[0].isIntersecting},{threshold:.05}).observe(cv);
    cv.addEventListener('pointerdown',function(e){dg=true;touch=(e.pointerType==='touch');
      px=e.clientX;py=e.clientY;try{cv.setPointerCapture(e.pointerId)}catch(err){}});
    cv.addEventListener('pointermove',function(e){if(!dg)return;
      var dx=e.clientX-px,dy=e.clientY-py;
      if(touch&&Math.abs(dx)>4&&e.cancelable)e.preventDefault();
      vy=dx*.008;vx=dy*.008;px=e.clientX;py=e.clientY;
      root.rotation.y+=vy;root.rotation.x=Math.max(-.45,Math.min(.45,root.rotation.x+vx))});
    ['pointerup','pointercancel','pointerleave'].forEach(function(ev){
      cv.addEventListener(ev,function(){dg=false})});

    var cl=new THREE.Clock();
    (function loop(){
      requestAnimationFrame(loop);
      if(!vis)return;
      var t=cl.getElapsedTime();
      if(!dg){vx*=.93;vy*=.93;
        root.rotation.y+=vy+(RM?0:.0075);
        root.rotation.x=Math.max(-.45,Math.min(.45,root.rotation.x+vx))}
      if(!RM)root.position.y=Math.sin(t*.9)*.07;
      rn.render(sc,cam);
    })();
  }catch(e){cv.parentElement.style.display='none'}
}

/* ==================== кнопка «Наверх» ==================== */
(function(){
  var t=$('#toTop');if(!t)return;
  t.addEventListener('click',function(e){
    e.preventDefault();
    window.scrollTo({top:0,behavior:RM?'auto':'smooth'});
  });
})();

/* ==================== подсветка активного пункта ==================== */
var mark;
(function(){
  var cur={page:'home',anchor:null};
  mark=function(page,anchor){
    if(page)cur.page=page;
    cur.anchor=(cur.page==='home')?anchor:null;
    $$('[data-route]').forEach(function(a){
      var r=a.getAttribute('data-route'),an=a.getAttribute('data-anchor');
      var on=an?(cur.page==='home'&&an===cur.anchor):(r===cur.page&&r!=='home');
      a.classList.toggle('act',!!on);
    });
  };
  /* на главной активен тот раздел, который сейчас на экране */
  var spy=new IntersectionObserver(function(en){
    en.forEach(function(e){
      if(e.isIntersecting)mark(null,'#'+e.target.id);
    });
  },{rootMargin:'-45% 0px -50% 0px'});
  [].forEach(function(sel){
    var el=document.querySelector(sel);if(el)spy.observe(el);
  });
})();

/* ==================== разделы услуг ==================== */

function renderService(key){
  var d=SVC[key];if(!d)return false;
  var host=$('#page-service');
  var CK='<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7.4 5.4 11 12 3.6" stroke="#1F3CFF" stroke-width="1.7"/></svg>';
  function esc(x){return x}
  var h='';
  h+='<section class="top"><div class="top-bg" aria-hidden="true"><i class="b1"></i><i class="b2"></i></div>'+
     '<div class="wrap"><div class="crumbs mono fu"><a href="/" data-route="home">Главная</a><span>/</span>'+
     '<a href="/services/" data-route="services">Направления</a><span>/</span><span>'+d.t+'</span></div>'+
     '<h1 class="srv-h"><span class="rl"><i>'+d.t+'</i></span></h1>'+
     '<p class="lead fu fd1">'+d.lead+'</p>'+
     '<div class="sv-tags fu fd1">'+d.tags.map(function(t){return '<span>'+t+'</span>'}).join('')+'</div>'+
     '<div class="top-cta fu fd2"><button class="btn" data-go><span>Обсудить задачу</span></button>'+
     '<a href="/projects/" data-route="projects" class="btn btn-o"><span>Смотреть проекты</span></a></div>'+
     '</div></section>';

  h+='<section class="sec" style="padding-top:88px"><div class="wrap">'+
     '<div class="sv-why rv">'+
       '<div class="sv-why-l">'+
         '<span class="lbl mono" style="margin:0">Зачем это нужно</span>'+
         '<p class="st-h">'+d.whyH+'</p>'+
       '</div>'+
       '<div class="sv-why-r">'+d.why.map(function(t,n){
         return '<div class="sv-why-i"><span class="sv-why-n mono">'+('0'+(n+1)).slice(-2)+'</span><p>'+t+'</p></div>';
       }).join('')+'</div>'+
     '</div></div></section>';

  h+='<section class="sec" style="padding-top:0"><div class="wrap">'+
     '<h2 class="lbl mono rv">Что мы делаем</h2><div class="goals rv">'+
     d.goals.map(function(g){return '<div class="goal"><span>'+g[0]+'</span><h3 style="font-size:19px;font-weight:600;letter-spacing:-.035em;margin-bottom:12px">'+g[1]+'</h3><p>'+g[2]+'</p></div>'}).join('')+
     '</div><div class="result rv">'+
       '<div class="result-t"><b>'+d.res[0]+'</b><span>'+d.res[1]+'</span></div>'+
       '<span class="result-ic" aria-hidden="true"><svg viewBox="0 0 132 72" fill="none">'+'<path class="pl-base" d="M6 40h20l9-26 13 50 10-34 8 14h60"/>'+'<path class="pl-run" d="M6 40h20l9-26 13 50 10-34 8 14h60"/>'+'</svg></span>'+
     '</div></div></section>';

  h+='<section class="sec" style="padding-top:0"><div class="wrap">'+
     '<h2 class="lbl mono rv">Сколько стоит</h2><div class="prices rv">'+
     d.prices.map(function(p){
       return '<div class="price-i"><h3>'+p[0]+'</h3><div class="sub">'+p[1]+'</div><ul>'+
         p[2].map(function(x){return '<li>'+CK+'<span>'+x+'</span></li>'}).join('')+
         '</ul><div class="price-amt">'+p[3]+'<small>'+p[4]+'</small></div>'+
         '<button class="btn btn-o" data-calc data-svc="'+d.t+' · '+p[0]+'" data-price="'+p[3]+
         '" style="margin-top:22px"><span>Рассчитать</span></button></div>';
     }).join('')+'</div><p class="price-note rv">'+d.note+'</p></div></section>';

  h+='<section class="sec" style="padding-top:0"><div class="wrap">'+
     '<h2 class="st-h rv" style="margin-bottom:30px">Этапы работы</h2>'+
     '<div class="flow rv"><span class="flow-line" aria-hidden="true"><i></i></span>'+
     d.stages.map(function(st,n){
       return '<article class="flow-i"><span class="flow-ic" aria-hidden="true">'+
         '<svg viewBox="0 0 44 44" fill="none">'+STEP_IC[n%STEP_IC.length]+'</svg></span>'+
         '<span class="flow-n mono">'+('0'+(n+1)).slice(-2)+'</span>'+
         '<h3>'+st[1]+'</h3><p>'+st[2]+'</p></article>';
     }).join('')+'</div></div></section>';

  h+='<section class="sec" style="padding-top:0"><div class="wrap">'+
     '<h2 class="lbl mono rv">Частые вопросы</h2><div class="faq rv" id="svFaq">'+
     d.faq.map(function(q){
       return '<div class="q-i"><button class="q-b"><span class="q-t">'+q[0]+'</span><span class="q-ic"></span></button>'+
              '<div class="q-a"><p>'+q[1]+'</p></div></div>';
     }).join('')+'</div></div></section>';

  var mine=casesOf(key).map(function(s){var c=null;CASES.forEach(function(x){if(x.slug===s)c=x});return c}).filter(Boolean);
  if(mine.length)h+='<section class="sec" style="padding-top:0"><div class="wrap">'+
     '<h2 class="lbl mono rv">Проекты по направлению</h2><div class="sv-next rv">'+
     mine.map(function(c){return '<a href="/projects/'+c.slug+'/" data-route="projects" data-sub="'+c.slug+'">'+c.t+'</a>'}).join('')+
     '</div></div></section>';

  var others=SVC_ORDER.filter(function(k){return k!==key});
  h+='<section class="sec" style="padding-top:0"><div class="wrap">'+
     '<h2 class="lbl mono rv">Другие направления</h2><div class="sv-next rv">'+
     others.map(function(k){return '<a href="/services/'+k+'/" data-route="services" data-sub="'+k+'">'+SVC[k].t+'</a>'}).join('')+
     '</div></div></section>';

  host.innerHTML=h;
  setTimeout(function(){$$('#page-service .rv').forEach(function(el){io.observe(el)})},30);
  /* аккордеон вопросов */
  var fb=$('#svFaq');
  if(fb)fb.addEventListener('click',function(e){
    var b=e.target.closest('.q-b');if(!b)return;
    var it=b.parentElement,a=$('.q-a',it),open=it.classList.contains('open');
    $$('.q-i',fb).forEach(function(x){x.classList.remove('open');$('.q-a',x).style.maxHeight=null});
    if(!open){it.classList.add('open');a.style.maxHeight=a.scrollHeight+'px'}
  });
  /* заполнение линии этапов */
  var tl=$('#svTl'),fill=$('#svTlFill');
  if(tl&&!tl.getAttribute('data-b')){
    tl.setAttribute('data-b','1');
    addEventListener('scroll',function(){
      if($('#page-service').hidden||!document.body.contains(tl))return;
      var r=tl.getBoundingClientRect(),pr=(innerHeight*.75-r.top)/r.height;
      fill.style.height=Math.max(0,Math.min(1,pr))*100+'%';
    },{passive:true});
  }
  return true;
}

/* ==================== проекты и фильтр ==================== */


var FILTERS=['Производственникам','Автоматизация','Брендинг'];

function initProjects(){
  var grid=$('#pgrid'),fbox=$('#filters'),cnt=$('#pCount'),empty=$('#pEmpty');
  if(!grid||grid.getAttribute('data-ok'))return;
  grid.setAttribute('data-ok','1');grid.innerHTML='';  /* статичная копия для поисковиков */

  CASELIST.forEach(function(p,i){
    var b=document.createElement(p[3]?'a':'button');
    b.className='pcard';b.setAttribute('data-cat',p[1]);
    if(p[3])b.href='/projects/'+p[3]+'/';else b.type='button';
    b.innerHTML='<span class="pn">'+('0'+(i+1)).slice(-2)+'</span>'+
      '<span class="cat">'+p[1]+'</span>'+
      '<h3>'+p[0]+'</h3>'+
      '<span class="yr">'+p[2]+'</span>'+
      (p[3]?'<span class="p-go" aria-hidden="true"><svg width="15" height="15" viewBox="0 0 15 15" fill="none">'+
        '<path d="M3 12 12 3M12 3H5M12 3v7" stroke="currentColor" stroke-width="1.6"/></svg></span>':'');
    if(p[3])b.classList.add('has-case');
    if(!p[3])b.addEventListener('click',function(){openForm()});
    grid.appendChild(b);
  });
  var cards=$$('.pcard',grid);

  function chip(name,label){
    var b=document.createElement('button');
    b.className='fchip';b.type='button';b.setAttribute('data-f',name);
    var n=name==='all'?CASELIST.length:CASELIST.filter(function(p){return p[1]===name}).length;
    b.innerHTML=label+'<b>'+n+'</b>';
    b.addEventListener('click',function(){apply(name)});
    fbox.appendChild(b);
  }
  chip('all','Все');
  FILTERS.forEach(function(f){chip(f,f)});

  var STEP=9,shownAll=false,curF='all';
  var wrap=$('#moreWrap'),more=$('#moreBtn'),moreN=$('#moreN');

  function apply(f){
    if(f!==undefined){curF=f;shownAll=false;}
    $$('.fchip',fbox).forEach(function(c){c.classList.toggle('on',c.getAttribute('data-f')===curF)});
    var total=0,vis=0;
    cards.forEach(function(c){
      var ok=(curF==='all'||c.getAttribute('data-cat')===curF);
      if(!ok){c.style.display='none';return}
      total++;
      var show=shownAll||total<=STEP;
      c.style.display=show?'':'none';
      if(show)vis++;
    });
    cnt.textContent='Показано '+vis+' из '+total;
    empty.classList.toggle('on',total===0);
    var left=total-vis;
    wrap.hidden=left<=0;
    moreN.textContent=left;
  }
  more.addEventListener('click',function(){shownAll=true;apply()});

  apply('all');
}

/* ==================== 3D: рожковый ключ ==================== */
/* Контур взят строго из присланного SVG: путь разобран, к нему применена
   трансформация группы, координаты отцентрованы и нормированы по длине.
   Зев раскрыт равномерным растяжением по вертикали на 15%: преобразование
   аффинное, поэтому кривые Безье остаются гладкими и изломов не возникает. */
var WRENCH_PATH='M 1.165 0.607 C 1.057 0.591 0.958 0.537 0.859 0.439 C 0.790 0.371 0.784 0.366 0.750 0.336 C 0.711 0.302 0.675 0.276 0.648 0.262 C 0.628 0.251 0.627 0.251 0.579 0.248 C 0.495 0.244 -0.752 0.244 -0.771 0.248 C -0.838 0.263 -0.897 0.301 -0.967 0.376 C -1.023 0.437 -1.077 0.471 -1.146 0.490 C -1.355 0.547 -1.557 0.437 -1.654 0.213 C -1.679 0.156 -1.700 0.072 -1.697 0.046 C -1.694 0.026 -1.682 0.007 -1.668 -0.001 C -1.653 -0.010 -1.636 -0.009 -1.606 0.000 C -1.593 0.004 -1.529 0.020 -1.464 0.035 C -1.399 0.050 -1.343 0.063 -1.340 0.064 C -1.335 0.066 -1.331 0.063 -1.320 0.049 C -1.312 0.041 -1.302 0.024 -1.296 0.013 C -1.265 -0.051 -1.247 -0.152 -1.258 -0.198 C -1.261 -0.207 -1.263 -0.215 -1.264 -0.215 C -1.265 -0.215 -1.334 -0.236 -1.467 -0.277 C -1.581 -0.313 -1.588 -0.316 -1.599 -0.340 C -1.607 -0.355 -1.607 -0.381 -1.601 -0.396 C -1.592 -0.418 -1.543 -0.475 -1.504 -0.508 C -1.432 -0.570 -1.353 -0.601 -1.262 -0.605 C -1.184 -0.608 -1.122 -0.594 -1.054 -0.557 C -1.015 -0.536 -0.996 -0.520 -0.940 -0.464 C -0.840 -0.362 -0.797 -0.328 -0.743 -0.306 L -0.718 -0.296 L -0.043 -0.297 C 0.409 -0.297 0.639 -0.298 0.656 -0.300 C 0.685 -0.304 0.712 -0.312 0.733 -0.323 C 0.774 -0.344 0.832 -0.392 0.877 -0.441 C 0.933 -0.503 0.958 -0.524 1.005 -0.551 C 1.071 -0.589 1.136 -0.606 1.217 -0.606 C 1.346 -0.605 1.460 -0.550 1.553 -0.444 C 1.621 -0.366 1.666 -0.273 1.691 -0.160 C 1.700 -0.118 1.700 -0.108 1.693 -0.090 C 1.686 -0.073 1.681 -0.067 1.669 -0.059 C 1.651 -0.049 1.644 -0.049 1.598 -0.063 C 1.559 -0.073 1.338 -0.126 1.309 -0.132 C 1.298 -0.133 1.298 -0.133 1.284 -0.117 C 1.249 -0.077 1.220 0.008 1.210 0.095 C 1.206 0.127 1.209 0.159 1.217 0.180 C 1.220 0.189 1.221 0.190 1.269 0.204 C 1.296 0.212 1.332 0.223 1.349 0.229 C 1.367 0.235 1.422 0.252 1.471 0.267 C 1.521 0.282 1.564 0.297 1.568 0.299 C 1.585 0.309 1.598 0.334 1.598 0.357 C 1.598 0.374 1.586 0.396 1.559 0.428 C 1.486 0.517 1.401 0.573 1.298 0.600 C 1.281 0.605 1.263 0.606 1.225 0.607 C 1.197 0.608 1.170 0.608 1.165 0.607 Z';

function initWrench(){
  var cv=$('#wrench');if(!cv||typeof THREE==='undefined')return;
  if(cv.getAttribute('data-ready'))return;cv.setAttribute('data-ready','1');
  try{
    var rn=new THREE.WebGLRenderer({canvas:cv,antialias:AA,alpha:true,powerPreference:'low-power'});
    rn.setPixelRatio(Math.min(devicePixelRatio,DPRMAX));
    if(THREE.sRGBEncoding)rn.outputEncoding=THREE.sRGBEncoding;
    var sc=new THREE.Scene(),cam=new THREE.PerspectiveCamera(34,1,.1,60);
    cam.position.set(0,0,7.2);cam.lookAt(0,0,0);
    var root=new THREE.Group();sc.add(root);root.rotation.set(.12,-.3,-.62);

    /* строим фигуру по разобранному пути */
    var t=WRENCH_PATH.split(' '),sh=new THREE.Shape(),i=0;
    while(i<t.length){
      var c=t[i++];
      if(c==='M')sh.moveTo(+t[i++],+t[i++]);
      else if(c==='L')sh.lineTo(+t[i++],+t[i++]);
      else if(c==='C')sh.bezierCurveTo(+t[i++],+t[i++],+t[i++],+t[i++],+t[i++],+t[i++]);
    }

    var geo=new THREE.ExtrudeGeometry(sh,{depth:.22,bevelEnabled:true,bevelSize:.035,
      bevelThickness:.035,bevelSegments:MOBILE?5:10,curveSegments:MOBILE?6:10});
    geo.translate(0,0,-.11);
    geo.computeVertexNormals();

    var mat=new THREE.MeshPhongMaterial({color:0x1F3CFF,shininess:26,specular:0x3F4E85});
    if(mat.color.convertSRGBToLinear)mat.color.convertSRGBToLinear();
    if(mat.specular.convertSRGBToLinear)mat.specular.convertSRGBToLinear();
    root.add(new THREE.Mesh(geo,mat));

    sc.add(new THREE.HemisphereLight(0xFFFFFF,0x848CA6,.95));
    var l1=new THREE.DirectionalLight(0xFFFFFF,1.25);l1.position.set(-3,5,6);sc.add(l1);
    var l2=new THREE.DirectionalLight(0xD2DCFF,.65);l2.position.set(5,0,4);sc.add(l2);
    var l3=new THREE.PointLight(0x8FA0C8,.8,26);l3.position.set(-4,-3,3);sc.add(l3);
    var l4=new THREE.PointLight(0xFFFFFF,.45,24);l4.position.set(3,4,-4);sc.add(l4);

    function size(){var r=cv.getBoundingClientRect();if(!r.width)return;
      rn.setSize(r.width,r.height,false);cam.aspect=r.width/r.height;cam.updateProjectionMatrix()}
    size();addEventListener('resize',size);

    var vis=true,dg=false,vx=0,vy=0,px=0,py=0,touch=false;
    new IntersectionObserver(function(en){vis=en[0].isIntersecting},{threshold:.05}).observe(cv);
    cv.addEventListener('pointerdown',function(e){dg=true;touch=(e.pointerType==='touch');
      px=e.clientX;py=e.clientY;try{cv.setPointerCapture(e.pointerId)}catch(err){}});
    cv.addEventListener('pointermove',function(e){if(!dg)return;
      var dx=e.clientX-px,dy=e.clientY-py;
      if(touch&&Math.abs(dx)>4&&e.cancelable)e.preventDefault();
      vy=dx*.008;vx=dy*.008;px=e.clientX;py=e.clientY;
      root.rotation.y+=vy;root.rotation.x=Math.max(-.5,Math.min(.5,root.rotation.x+vx))});
    ['pointerup','pointercancel','pointerleave'].forEach(function(ev){
      cv.addEventListener(ev,function(){dg=false})});

    var cl=new THREE.Clock();
    (function loop(){
      requestAnimationFrame(loop);
      if(!vis)return;
      var tt=cl.getElapsedTime();
      if(!dg){vx*=.93;vy*=.93;
        root.rotation.y+=vy+(RM?0:.007);
        root.rotation.x=Math.max(-.5,Math.min(.5,root.rotation.x+vx))}
      if(!RM)root.position.y=Math.sin(tt*.85)*.06;
      rn.render(sc,cam);
    })();
  }catch(e){cv.parentElement.style.display='none'}
}

/* ==================== 3D: пара шестерён ==================== */
function initPirateMap(){
  var cv=$('#pmap');if(!cv||typeof THREE==='undefined')return;
  if(cv.getAttribute('data-ready'))return;cv.setAttribute('data-ready','1');
  try{
    var rn=new THREE.WebGLRenderer({canvas:cv,antialias:AA,alpha:true,powerPreference:'low-power'});
    rn.setPixelRatio(Math.min(devicePixelRatio,DPRMAX));
    if(THREE.sRGBEncoding)rn.outputEncoding=THREE.sRGBEncoding;
    var sc=new THREE.Scene(),cam=new THREE.PerspectiveCamera(34,1,.1,60);
    cam.position.set(0,0,7.2);cam.lookAt(0,0,0);
    var root=new THREE.Group();sc.add(root);root.rotation.set(.2,-.3,0);

    /* ---- параметры зацепления ----
       модуль общий для обеих шестерён, поэтому зубья совпадают по шагу */
    var MOD=.34, Z1=16, Z2=12, TH=.86*MOD;
    var R1=MOD*Z1/2, R2=MOD*Z2/2;
    var DIST=R1+R2+TH;                 /* межосевое расстояние */
    var PHI=-40*Math.PI/180;           /* направление на вторую шестерню */
    var P1=Math.PI*2/Z1;

    /* контур шестерни: трапециевидные зубья и отверстие в центре */
    function gearGeo(Z,R,depth,bore){
      var st=Math.PI*2/Z,sh=new THREE.Shape(),i,a2;
      function pol(ang,r){return [Math.cos(ang)*r,Math.sin(ang)*r]}
      var pts=[];
      for(i=0;i<Z;i++){
        a2=i*st;
        pts.push(pol(a2,R),pol(a2+st*.30,R),pol(a2+st*.38,R+TH),
                 pol(a2+st*.62,R+TH),pol(a2+st*.70,R));
      }
      sh.moveTo(pts[0][0],pts[0][1]);
      for(i=1;i<pts.length;i++)sh.lineTo(pts[i][0],pts[i][1]);
      sh.closePath();
      var h=new THREE.Path();h.absarc(0,0,bore,0,Math.PI*2,true);sh.holes.push(h);
      var g=new THREE.ExtrudeGeometry(sh,{depth:depth,bevelEnabled:true,bevelSize:.035,
        bevelThickness:.035,bevelSegments:MOBILE?4:8,curveSegments:MOBILE?10:20});
      g.translate(0,0,-depth/2);
      return g;
    }
    function M(hex){
      var m=new THREE.MeshPhongMaterial({color:hex,shininess:26,specular:0x565E7E});
      if(m.color.convertSRGBToLinear)m.color.convertSRGBToLinear();
      if(m.specular.convertSRGBToLinear)m.specular.convertSRGBToLinear();
      return m;
    }
    var g1=new THREE.Mesh(gearGeo(Z1,R1,.42,R1*.34),M(0x1F3CFF));
    var g2=new THREE.Mesh(gearGeo(Z2,R2,.42,R2*.34),M(0xE8FF4D));
    g2.position.set(Math.cos(PHI)*DIST,Math.sin(PHI)*DIST,0);
    /* Центруем по габаритной рамке пары, а не по осям шестерён, и подбираем
       масштаб так, чтобы модель с запасом помещалась в кадр при любом повороте
       и дрейфе — тогда она свободно парит и не упирается в края холста. */
    /* Центрирующий сдвиг кладём на внутреннюю группу, а масштаб — на внешнюю.
       Если задать сдвиг там же, где масштаб, он останется в единицах модели
       и не уменьшится вместе с ней — пару уведёт из центра кадра. */
    var inner=new THREE.Group();
    inner.add(g1);inner.add(g2);
    var bx=[-(R1+TH), g2.position.x+R2+TH];
    var by=[g2.position.y-(R2+TH), R1+TH];
    var cx=-(bx[0]+bx[1])/2, cy=-(by[0]+by[1])/2;
    inner.position.set(cx,cy,0);

    /* радиус считаем по самим шестерням, а не по углам габаритной рамки:
       они круглые и до углов не достают, иначе масштаб выходит заниженным */
    var rMax=Math.max(
      Math.hypot(cx,cy)+R1+TH,
      Math.hypot(g2.position.x+cx, g2.position.y+cy)+R2+TH);
    var DRIFT=.12, BASE_Y=-.22;   /* пара стоит чуть ниже центра кадра */
    var halfFrame=Math.tan(34/2*Math.PI/180)*7.2;      /* полувысота кадра на z=0 */

    var hold=new THREE.Group();
    hold.add(inner);
    hold.scale.setScalar((halfFrame*.76-DRIFT)/rMax);
    root.add(hold);
    root.position.y=BASE_Y;

    sc.add(new THREE.HemisphereLight(0xFFFFFF,0x8A92AC,.95));
    var l1=new THREE.DirectionalLight(0xFFFFFF,1.2);l1.position.set(-3,5,6);sc.add(l1);
    var l2=new THREE.DirectionalLight(0xD6E0FF,.6);l2.position.set(5,0,4);sc.add(l2);
    var l3=new THREE.PointLight(0x8FA0C8,.7,28);l3.position.set(-4,-3,3);sc.add(l3);
    var l4=new THREE.PointLight(0xFFFFFF,.45,24);l4.position.set(3,4,-4);sc.add(l4);

    function size(){var r=cv.getBoundingClientRect();if(!r.width)return;
      rn.setSize(r.width,r.height,false);cam.aspect=r.width/r.height;cam.updateProjectionMatrix()}
    size();addEventListener('resize',size);

    var vis=true,dg=false,vx=0,vy=0,px=0,py=0,touch=false,spin=0;
    var userY=0;                  /* поворот, набранный перетаскиванием по горизонтали */
    new IntersectionObserver(function(en){vis=en[0].isIntersecting},{threshold:.05}).observe(cv);
    cv.addEventListener('pointerdown',function(e){dg=true;touch=(e.pointerType==='touch');
      px=e.clientX;py=e.clientY;try{cv.setPointerCapture(e.pointerId)}catch(err){}});
    cv.addEventListener('pointermove',function(e){if(!dg)return;
      var dx=e.clientX-px,dy=e.clientY-py;
      if(touch&&Math.abs(dx)>4&&e.cancelable)e.preventDefault();
      vy=dx*.008;px=e.clientX;py=e.clientY;   /* вертикаль игнорируем: крутим только по горизонтали */
      userY+=vy});
    ['pointerup','pointercancel','pointerleave'].forEach(function(ev){
      cv.addEventListener(ev,function(){dg=false})});

    var cl=new THREE.Clock();
    (function loop(){
      requestAnimationFrame(loop);
      if(!vis)return;
      var d2=Math.min(cl.getDelta(),.05);
      if(!RM){
        spin+=d2*.42;
        /* фаза второй шестерни привязана к первой через передаточное число,
           поэтому зацепление не разъезжается со временем */
        g1.rotation.z=PHI-.5*P1+spin;
        g2.rotation.z=PHI+Math.PI-(Z1/Z2)*spin;
      }
      if(!dg){vy*=.93;userY+=vy}
      if(!RM){
        /* собственное движение — покачивание в пределах трети оборота:
           модель не проворачивается целиком и не показывает изнанку */
        var t2=cl.getElapsedTime();
        root.rotation.y=userY-.28+Math.sin(t2*.24)*.62;
        root.rotation.x=.18+Math.sin(t2*.19+.8)*.1;   /* наклон только собственный */
      }else{root.rotation.y=userY-.28;root.rotation.x=.18}
      if(!RM){
        /* свободный дрейф: две несоизмеримые частоты, поэтому траектория
           не повторяется и движение не выглядит зациклённым */
        var tt=cl.getElapsedTime();
        root.position.x=Math.sin(tt*.23)*DRIFT;
        root.position.y=BASE_Y+Math.sin(tt*.31+1.4)*DRIFT*.8;
        root.rotation.z=Math.sin(tt*.17)*.09;
      }
      rn.render(sc,cam);
    })();
  }catch(e){cv.parentElement.style.display='none'}
}

/* ==================== форма расчёта стоимости ==================== */
var openCalc=function(){};
(function(){
  var mask=$('#cmask');if(!mask)return;
  var f=$('#calcForm'),ok=$('#cok'),last=null,tm=null;

  openCalc=function(svc,price){
    clearTimeout(tm);f.style.display='';ok.classList.remove('on');
    $$('#calcForm .cf').forEach(function(x){x.classList.remove('err')});
    $('#cSvc').textContent=svc||'—';
    $('#cPrice').textContent=price||'по запросу';
    var hs=$('#calcSvc'),hp=$('#calcPrice');
    if(hs)hs.value=svc||'';
    if(hp)hp.value=price||'';
    last=document.activeElement;
    mask.classList.add('on');mask.setAttribute('aria-hidden','false');
    document.body.classList.add('lock');
    setTimeout(function(){var i=$('#c1');if(i)i.focus({preventScroll:true})},520);
  };
  function close(){mask.classList.remove('on');mask.setAttribute('aria-hidden','true');
    document.body.classList.remove('lock');if(last&&last.focus)last.focus()}

  $('#cx').addEventListener('click',close);
  mask.addEventListener('click',function(e){if(e.target===mask)close()});
  addEventListener('keydown',function(e){if(e.key==='Escape'&&mask.classList.contains('on'))close()});
  $$('#calcForm input').forEach(function(i){
    i.addEventListener('input',function(){i.parentElement.classList.remove('err')})});
  f.addEventListener('submit',function(e){
    e.preventDefault();var good=true;
    ['#c1','#c2'].forEach(function(sel){var el=$(sel);
      if(!el.value.trim()){el.parentElement.classList.add('err');good=false}});
    if(!good){$('#c1').focus();return}
    sendForm(f,function(){
      f.style.display='none';ok.classList.add('on');tm=setTimeout(close,4600);
    },function(msg){formError(f,msg)});
  });

  /* кнопки «Рассчитать» появляются вместе со страницей услуги — ловим их делегированием */
  document.addEventListener('click',function(e){
    var b=e.target.closest('[data-calc]');if(!b)return;
    openCalc(b.getAttribute('data-svc'),b.getAttribute('data-price'));
  });
})();



/* Каждый проект открывается своей страницей по адресу /projects/<slug>/. */
var CASES=[
{
  slug:'3d-detali', cat:'Производственникам', y:'2025',
  t:'3D-модели деталей по чертежам и обмерам',
  client:'ТехноДеталь · производство узлов для конвейеров',
  lead:'На складе лежали детали, которые завод выпускал двадцать лет, а чертежей на них не осталось. Каждый повторный заказ начинался с того, что технолог брал штангенциркуль и мерил образец вручную.',
  meta:[['Отрасль','машиностроение'],['Срок','6 недель'],['Инструменты','3D-сканирование, CAD'],['Команда','3 человека']],
  probs:[
    ['Чертежи не совпадали с деталями','Часть документации потерялась при переезде, часть относилась к старым ревизиям. Деталь на складе и чертёж в архиве отличались на доли миллиметра — и это вылезало уже при сборке.'],
    ['Обмеры делали руками','Сложные поверхности мерили штангенциркулем и шаблонами. На каждую деталь уходил день, а два технолога получали разные значения.'],
    ['Повтор заказа считали заново','Клиент возвращался через год за той же деталью, и всё начиналось сначала: поиск образца, обмеры, пробная партия.'],
    ['Показать деталь можно было только вживую','Ни картинки для коммерческого предложения, ни файла для клиента — только фотография на телефон.']
  ],
  steps:[
    ['Сканирование образцов','Сняли геометрию оптическим сканером с точностью до сотых. Для каждой детали делали несколько проходов и сшивали облака точек.'],
    ['Восстановление геометрии','Строили модель по номиналу, а не повторяли скан: изношенные кромки и следы правки в модель не попали. Каждый размер сверяли с технологом.'],
    ['Параметрические модели','Типоразмеры внутри семейства меняются одним числом. Новая длина вала — это правка параметра, а не новая модель с нуля.'],
    ['Чертежи для цеха','К каждой модели подготовили чертёж с допусками, шероховатостями и указанием базовых поверхностей.'],
    ['Визуализации для продаж','Отрисовали детали для коммерческих предложений и каталога — теперь менеджер показывает изображение, а не едет на склад.']
  ],
  hard:'Первые модели повторяли дефекты изношенных образцов: сканер честно снимал выработку на посадочных поверхностях. Если бы по такой модели изготовили деталь, она не встала бы в узел. Пришлось менять подход — строить геометрию по номинальным размерам, а скан использовать только как основу и способ проверки.',
  res:[['×4','быстрее подготовка повторного заказа'],['0','ошибок при изготовлении по моделям'],['34','детали переведены в цифру']],
  q:['Теперь деталь можно повторить хоть через пять лет, и она встанет на место без подгонки. Раньше на это уходила неделя переписки с технологом.','Главный конструктор']
},
{
  slug:'chpu-avtomatizaciya', cat:'Производственникам', y:'2026',
  t:'Автоматизация станков с ЧПУ',
  client:'Металлконструкт · раскрой и гибка металла',
  lead:'В цехе стояли шесть станков с ЧПУ разных лет и производителей. Программы для них носили на флешках, а сколько станок реально работал за смену, никто не знал.',
  meta:[['Отрасль','металлообработка'],['Срок','11 недель'],['Стек','1С:ERP, OPC UA, MQTT'],['Команда','4 человека']],
  probs:[
    ['Программы носили на флешке','Оператор получал управляющую программу от технолога и переносил вручную. Флешки терялись, версии путались, на станок попадала не та программа.'],
    ['Простои никто не считал','Станок мог стоять полсмены из-за отсутствия заготовки, но в отчёте это выглядело как обычная загрузка.'],
    ['Заказ в цех попадал бумагой','Сменное задание печатали и относили мастеру. Изменение в заказе доходило до цеха с задержкой в несколько часов.'],
    ['Брак выясняли постфактум','Отклонение находили на контроле, когда партия уже была изготовлена.']
  ],
  steps:[
    ['Подключили станки к сети','Разные поколения оборудования собрали в один механизм: современные по OPC UA, старые — через модуль опроса сигналов.'],
    ['Передача программ без флешек','Управляющая программа уходит на станок из системы. У каждой есть версия и автор, старую подсунуть невозможно.'],
    ['Сменное задание на экране','Оператор видит очередь заказов на терминале у станка, отмечает начало и завершение операции одним нажатием.'],
    ['Учёт простоев по причинам','Станок сам сообщает, что остановлен, а оператор выбирает причину из короткого списка. Через месяц стало видно, где теряется время.'],
    ['Связь с 1С:ERP','Факт выработки уходит в учётную систему в момент завершения операции, а не в конце смены.']
  ],
  hard:'Два станка 1998 года не отдавали данные вообще — у них не было ни сети, ни протокола. Мы не стали настаивать на замене оборудования: поставили модуль, который снимает сигналы с реле пуска и шпинделя. Точных параметров резания оттуда не получить, но факт работы, остановки и длительность цикла видно достоверно — а именно этого и не хватало.',
  res:[['−27%','простоев за первый квартал'],['0','потерянных программ'],['6','станков в едином механизме']],
  q:['Раньше я узнавал о простое из отчёта в конце месяца. Сейчас вижу на экране, что станок стоит уже сорок минут, и могу вмешаться сегодня.','Начальник производства']
},
{
  slug:'akvalis-brand', cat:'Брендинг', y:'2025',
  t:'Логотип и фирменный стиль бренда воды',
  client:'Аквалис · питьевая вода из артезианской скважины',
  lead:'Небольшой завод разливал воду высокого качества в бутылку, которую невозможно было отличить от десятка соседних на полке. Задача была не «нарисовать красиво», а сделать так, чтобы бренд считывался с трёх метров.',
  meta:[['Отрасль','напитки'],['Срок','7 недель'],['Состав','логотип, стиль, этикетка'],['Команда','3 человека']],
  probs:[
    ['Полка выглядела одинаково','Синие волны, капли и горы есть почти у каждого производителя воды. Логотип завода терялся среди них.'],
    ['Этикетка не работала издалека','Мелкий шрифт и три оттенка синего сливались в пятно уже с двух метров.'],
    ['Не было системы','Каждый макет — от ценника до фуры — рисовали заново и по-разному.']
  ],
  steps:[
    ['Разбор полки','Сфотографировали выкладку в пяти магазинах и разложили конкурентов по цвету и приёму. Нашли пустую территорию: почти никто не использовал глубокий бирюзовый и чистую геометрию без волн.'],
    ['Знак','Собрали монограмму из капли и буквы «А»: одна непрерывная линия, читается и в один цвет, и на тиснении. Никаких градиентов — знак должен выживать на фуре и на крышке.'],
    ['Цвет','Взяли глубокий бирюзово-синий с высокой насыщенностью. На полке он отделяется от голубого моря конкурентов, а на белой бутылке выглядит чистым.'],
    ['Этикетка','Крупное имя, много воздуха, единственный акцент — знак. Проверяли макет с трёх метров, а не на экране.'],
    ['Гайд','Собрали правила: отступы, минимальный размер, поведение на прозрачном пластике, запрещённые приёмы.']
  ],
  hard:'Первая версия знака была тоньше и изящнее — и полностью разваливалась на тиснении крышки и на трафарете для фуры. Пришлось увеличить толщину линии и упростить внутренние сопряжения, потеряв часть изящества ради того, чтобы знак жил на всех носителях.',
  res:[['3 м','дистанция уверенного узнавания'],['1','цвет достаточен для всех носителей'],['12','позиций линейки в единой системе']],
  q:['Мы просили логотип, а получили систему, по которой теперь делаем всё — от ценника до борта машины.','Коммерческий директор'],
  logo:1
},
{
  slug:'1c-wms', cat:'Автоматизация', y:'2025',
  t:'Интеграция 1С:УТ со складской системой WMS',
  client:'СибТрейд · оптовая торговля стройматериалами',
  lead:'Учёт вёлся в 1С, а склад жил в отдельной WMS. Между ними стоял человек, который выгружал файлы и вносил результаты руками — обычно вечером, а иногда и на следующий день.',
  meta:[['Отрасль','оптовая торговля'],['Срок','9 недель'],['Стек','1С:УТ, WMS, REST, RabbitMQ'],['Команда','3 человека']],
  probs:[
    ['Остатки расходились','В 1С числился товар, который на складе уже отгрузили. Менеджер продавал то, чего нет, и клиент узнавал об этом на этапе отгрузки.'],
    ['Обмен шёл вручную','Файлы выгружали дважды в день. Всё, что происходило между выгрузками, никто не видел.'],
    ['Приёмка терялась','Товар приехал, кладовщик принял, а в учёте он появлялся только на следующий день.'],
    ['Ошибки находили поздно','Расхождение всплывало на инвентаризации, когда причину уже не восстановить.']
  ],
  steps:[
    ['Разобрали процессы','Прошли путь товара от заказа поставщику до отгрузки клиенту и выписали каждое место, где данные меняли систему.'],
    ['Очередь вместо файлов','Поставили обмен через очередь сообщений: заказ, приёмка, отгрузка и перемещение уходят событиями за секунды.'],
    ['Резерв в момент заказа','Как только менеджер оформил заказ, товар резервируется на складе. Продать его второй раз невозможно.'],
    ['Повторы и контроль','Если WMS не ответила, сообщение не теряется, а уходит в повтор. Расхождения видно на отдельной панели.'],
    ['Сверка по расписанию','Ночью системы сверяют остатки и утром показывают список отличий, если они есть.']
  ],
  hard:'Первая версия обмена задыхалась в час пик: при массовой отгрузке очередь копилась быстрее, чем разбиралась. Оказалось, каждое сообщение открывало отдельное соединение с 1С. Переделали на пакетную обработку с приоритетами: сначала уходят резервы и отгрузки, остальное подтягивается следом.',
  res:[['12 сек','средняя задержка обмена вместо 12 часов'],['−94%','расхождений по остаткам'],['0','ручных выгрузок']],
  q:['Менеджеры перестали звонить на склад с вопросом «а оно точно есть». Это главное изменение.','Руководитель отдела продаж']
},
{
  slug:'bitrix-otchety', cat:'Автоматизация', y:'2026',
  t:'Битрикс24: разбор отчётов сотрудников',
  client:'СервисПро · обслуживание инженерных систем',
  lead:'Девяносто выездных инженеров ежедневно сдавали отчёты о работах. Их читали три человека, сводили в таблицу и к пятнице получали картину прошлой недели — когда влиять уже поздно.',
  meta:[['Отрасль','сервис и обслуживание'],['Срок','8 недель'],['Стек','Битрикс24, REST, LLM'],['Команда','4 человека']],
  probs:[
    ['Отчёты писали свободным текстом','Один инженер писал три строки, другой — страницу. Сравнить их между собой было невозможно.'],
    ['Сводку делали руками','Три сотрудника тратили по два часа в день на перенос данных в таблицу.'],
    ['Проблемы всплывали поздно','Повторный выезд на один и тот же объект замечали, когда клиент уже жаловался.'],
    ['Руководитель не видел динамику','Были цифры за месяц, но не было ответа на вопрос «стало лучше или хуже, чем в прошлом квартале».']
  ],
  steps:[
    ['Структурировали отчёт','Оставили свободное поле, но добавили обязательные: объект, оборудование, тип работ, затраченное время, результат.'],
    ['Разбор текста моделью','Свободную часть разбирает языковая модель: вытаскивает упомянутое оборудование, выполненные операции и признаки повторной проблемы.'],
    ['Проверка человеком','Модель не решает сама: спорные случаи уходят диспетчеру с пометкой, почему она засомневалась.'],
    ['Дашборд по сотрудникам','Загрузка, среднее время выезда, доля повторных обращений, сравнение с прошлым периодом.'],
    ['Сигналы вместо отчётов','Если по объекту третий выезд за месяц или время работ вдвое выше обычного — руководитель получает уведомление в тот же день.']
  ],
  hard:'Первая версия слишком уверенно ставила метки, и когда модель ошибалась, диспетчеры переставали доверять всей системе. Ввели порог уверенности: при сомнении заявка идёт человеку без метки, а на панели качества видно, где именно модель ошибается. Доверие вернулось, а точность выросла за счёт правок.',
  res:[['6 часов','в день освободилось у трёх сотрудников'],['в тот же день','сигнал о повторном выезде вместо недели'],['91%','меток подтверждаются диспетчером']],
  q:['Мы перестали обсуждать прошлую неделю. Разговор идёт про сегодняшний день, потому что данные приходят сегодня.','Директор по сервису']
}
];


function renderCase(slug){
  var d=null;
  CASES.forEach(function(c){if(c.slug===slug)d=c});
  if(!d)return false;
  var host=$('#page-case');

  /* концепт знака для проекта с водой: рисуем прямо в разметке,
     фирменный цвет проекта — глубокий бирюзовый, не наш синий */
  var AQ='#0E8FA8';
  var logoBlock=!d.logo?'':
    '<section class="sec" style="padding-top:0"><div class="wrap">'+
    '<h2 class="lbl mono rv">Знак</h2>'+
    '<div class="cs-logo rv">'+
      '<svg width="150" height="150" viewBox="0 0 120 120" fill="none">'+
        '<path d="M60 16c16 20 26 33 26 46a26 26 0 1 1-52 0c0-13 10-26 26-46z" '+
          'stroke="'+AQ+'" stroke-width="7" stroke-linejoin="round"/>'+
        '<path d="M46 66c0 8 6 14 14 14" stroke="'+AQ+'" stroke-width="7" stroke-linecap="round"/>'+
      '</svg>'+
      '<div>'+
        '<div style="font-size:34px;font-weight:700;letter-spacing:.14em;color:#EAF6F9">АКВАЛИС</div>'+
        '<div style="font-family:var(--mono);font-size:11px;letter-spacing:.24em;color:'+AQ+';margin-top:10px">'+
          'АРТЕЗИАНСКАЯ ВОДА</div>'+
        '<div class="sw" style="margin-top:26px">'+
          '<i style="background:'+AQ+'"></i><i style="background:#0B6E82"></i>'+
          '<i style="background:#7FD3E0"></i><i style="background:#EAF6F9"></i>'+
        '</div>'+
      '</div>'+
    '</div></div></section>';

  var h='';
  h+='<section class="top"><div class="top-bg" aria-hidden="true"><i class="b1"></i><i class="b2"></i></div>'+
     '<div class="wrap"><div class="crumbs mono fu"><a href="/" data-route="home">Главная</a><span>/</span>'+
     '<a href="/projects/" data-route="projects">Проекты</a><span>/</span><span>'+d.cat+'</span></div>'+
     '<div class="cs-client fu fd1"><i></i>'+d.client+'</div>'+
     '<h1 class="srv-h"><span class="rl"><i>'+d.t+'</i></span></h1>'+
     '<p class="lead fu fd1">'+d.lead+'</p>'+
     '<dl class="cs-meta fu fd2">'+
       d.meta.map(function(m){return '<div><dt>'+m[0]+'</dt><dd>'+m[1]+'</dd></div>'}).join('')+
     '</dl></div></section>';

  h+='<section class="sec" style="padding-top:88px"><div class="wrap">'+
     '<h2 class="lbl mono rv">Что было не так</h2><div class="cs-probs rv">'+
     d.probs.map(function(x){return '<div class="cs-p"><b>'+x[0]+'</b><p>'+x[1]+'</p></div>'}).join('')+
     '</div></div></section>';

  h+='<section class="sec" style="padding-top:0"><div class="wrap">'+
     '<h2 class="lbl mono rv">Что сделали</h2><div class="cs-steps rv">'+
     d.steps.map(function(x,i){return '<div class="cs-s"><span>'+('0'+(i+1)).slice(-2)+
       '</span><div><b>'+x[0]+'</b><p>'+x[1]+'</p></div></div>'}).join('')+
     '</div></div></section>';

  h+=logoBlock;

  h+='<section class="sec" style="padding-top:0"><div class="wrap">'+
     '<h2 class="lbl mono rv">Где споткнулись</h2>'+
     '<div class="cs-hard rv"><span>Честно о сложностях</span><p>'+d.hard+'</p></div></div></section>';

  h+='<section class="sec" style="padding-top:0"><div class="wrap">'+
     '<h2 class="lbl mono rv">Результат</h2><div class="cs-res rv">'+
     d.res.map(function(x){return '<div><b>'+x[0]+'</b><u>'+x[1]+'</u></div>'}).join('')+
     '</div><div class="cs-q rv"><p>«'+d.q[0]+'»</p><span>'+d.q[1]+'</span></div></div></section>';

  var dirs=svcOf(d.slug);
  if(dirs.length)h+='<section class="sec" style="padding-top:0"><div class="wrap">'+
     '<h2 class="lbl mono rv">Направления по теме</h2><div class="cs-next rv">'+
     dirs.map(function(k){return '<a href="/services/'+k+'/" data-route="services" data-sub="'+k+'">'+SVC[k].t+'</a>'}).join('')+
     '</div></div></section>';

  var others=CASES.filter(function(c){return c.slug!==d.slug});
  h+='<section class="sec" style="padding-top:0"><div class="wrap">'+
     '<h2 class="lbl mono rv">Другие проекты</h2><div class="cs-next rv">'+
     others.map(function(c){return '<a href="/projects/'+c.slug+'/" data-route="projects" data-sub="'+
       c.slug+'">'+c.t+'</a>'}).join('')+
     '</div></div></section>';

  host.innerHTML=h;
  setTimeout(function(){$$('#page-case .rv').forEach(function(el){io.observe(el)})},30);
  return true;
}


/* ---------- каркасная шестерня на карточке 3D ---------- */
/* Каркасная шестерня. Раньше сцена привязывалась к единственному холсту
   по имени — теперь запускается на каждом, поэтому её можно показать
   и на странице направлений, и в списке на главной. */
function initGear3D(){
  $$('canvas.gear3d').forEach(gear3dOne);
}
function gear3dOne(cv){
  if(!cv||typeof THREE==='undefined')return;
  if(cv.getAttribute('data-on'))return;
  cv.setAttribute('data-on','1');
  try{
    var rn=new THREE.WebGLRenderer({canvas:cv,antialias:AA,alpha:true,powerPreference:'low-power'});
    rn.setPixelRatio(Math.min(devicePixelRatio,DPRMAX));
    var sc=new THREE.Scene(),cam=new THREE.PerspectiveCamera(34,1,.1,40);
    cam.position.set(0,0,5.4);
    var root=new THREE.Group();sc.add(root);

    /* профиль: 12 зубьев и отверстие под вал */
    var Z=12,R=.86,TH=.2,BORE=.3,DEP=.42;
    var st=Math.PI*2/Z, sh=new THREE.Shape(), pts=[], i, a;
    function P(an,r){return [Math.cos(an)*r, Math.sin(an)*r]}
    for(i=0;i<Z;i++){
      a=i*st;
      pts.push(P(a-st*.19,R),P(a-st*.13,R+TH),P(a+st*.13,R+TH),P(a+st*.19,R));
      for(var k=1;k<4;k++)pts.push(P(a+st*.19+(st*.62)*k/4,R));
    }
    sh.moveTo(pts[0][0],pts[0][1]);
    for(i=1;i<pts.length;i++)sh.lineTo(pts[i][0],pts[i][1]);
    sh.closePath();
    var hole=new THREE.Path();hole.absarc(0,0,BORE,0,Math.PI*2,true);sh.holes.push(hole);

    var geo=new THREE.ExtrudeGeometry(sh,{depth:DEP,bevelEnabled:false,curveSegments:MOBILE?10:22});
    geo.translate(0,0,-DEP/2);

    /* полупрозрачное тело перекрывает дальние рёбра — иначе каркас
       превращается в кашу линий, где не понять, что спереди */
    root.add(new THREE.Mesh(geo,new THREE.MeshBasicMaterial({
      color:0x1F3CFF,transparent:true,opacity:.07,depthWrite:false,side:THREE.DoubleSide})));
    root.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo,18),
      new THREE.LineBasicMaterial({color:0x1F3CFF,transparent:true,opacity:.9})));

    function size(){var r=cv.getBoundingClientRect();if(!r.width)return;
      rn.setSize(r.width,r.height,false);cam.aspect=r.width/r.height;cam.updateProjectionMatrix()}
    size();addEventListener('resize',size);

    var vis=true;
    new IntersectionObserver(function(en){vis=en[0].isIntersecting},{threshold:.05}).observe(cv);
    var cl=new THREE.Clock();
    (function loop(){
      requestAnimationFrame(loop);
      if(!vis)return;
      var t=cl.getElapsedTime();
      if(!RM){root.rotation.y=t*.5;root.rotation.x=-.34+Math.sin(t*.4)*.12}
      rn.render(sc,cam);
    })();
  }catch(e){cv.style.display='none'}
}



/* ---------- политика конфиденциальности ---------- */
(function(){
  var mask=$('#polMask');if(!mask)return;
  var last=null;
  function open(){
    last=document.activeElement;
    mask.classList.add('on');mask.setAttribute('aria-hidden','false');
    document.body.classList.add('lock');
    var b=$('.pol-body',mask);if(b)b.scrollTop=0;
  }
  function close(){
    mask.classList.remove('on');mask.setAttribute('aria-hidden','true');
    document.body.classList.remove('lock');
    if(last&&last.focus)last.focus();
  }
  document.addEventListener('click',function(e){
    var a=e.target.closest('[data-policy]');
    /* внутри форм ссылка ведёт на короткое согласие — там свой обработчик */
    if(a&&!a.closest('.talk-note,.fnote')){e.preventDefault();open();return}
    if(e.target.closest('[data-pol-close]'))close();
  });
  mask.addEventListener('click',function(e){if(e.target===mask)close()});
  addEventListener('keydown',function(e){
    if(e.key==='Escape'&&mask.classList.contains('on'))close();
  });
})();






/* Что открывается по клику на карточке галереи: коротко о том, что мы умеем
   в этом направлении. Не кейс с историей, а понятный перечень возможностей. */
var SKILLS=[
 {tag:'Интеграция',
  t:'Связываем 1С, CRM и склад в одну рабочую структуру',
  lead:'Данные перестают ходить через человека: заказ, остаток и отгрузка появляются во всех системах сами.',
  can:['Обмен между 1С, Битрикс24, сайтом и складом',
       'Передача заказов в производство со спецификацией',
       'Резерв товара в момент оформления сделки',
       'Контроль расхождений и повторная отправка при сбоях'],
  note:'Обычно первые результаты видны через 6–8 недель.'},

 {tag:'3D',
  t:'Разрабатываем 3D-модели деталей, изделий и чертежей',
  lead:'Сканируем образец или читаем чертёж — и отдаём модель, по которой деталь повторяется без подгонки.',
  can:['3D-сканирование деталей и оснастки на вашей площадке',
       'Восстановление документации, когда чертежи утеряны',
       'Параметрические модели: типоразмер меняется одним числом',
       'Чертежи с допусками и файлы для станков с ЧПУ'],
  note:'Выезжаем со сканером, работаем по вашим образцам.'},

 {tag:'ИИ',
  t:'Подключаем ИИ для более точного анализа выручки и конверсии',
  lead:'Модель работает на ваших серверах: разбирает отчёты и обращения, показывает динамику и подсвечивает провалы.',
  can:['Анализ выручки и конверсии по каналам и менеджерам',
       'Разбор входящих заявок и черновики ответов',
       'Извлечение данных из документов и писем',
       'Развёртывание внутри периметра: данные не уходят наружу'],
  note:'Начинаем с одной задачи и считаем, окупается ли она.'},

 {tag:'Разработка',
  t:'Делаем сайты и сервисы под вашу задачу',
  lead:'От посадочной страницы до личного кабинета: пишем то, чего нет в готовых решениях, и отдаём исходники.',
  can:['Сайты, интернет-магазины и личные кабинеты',
       'Настройка серверов, доменов и защищённого соединения',
       'Подключение API: оплаты, доставка, учётные системы',
       'Поддержка и развитие после запуска'],
  note:'Исходники и доступы передаём вам, привязки к нам нет.'},

 {tag:'Битрикс24',
  t:'Настраиваем портал под ваш процесс продаж',
  lead:'Воронки, права и роботы собираются под то, как вы работаете, а не наоборот.',
  can:['Воронки и этапы под реальный путь сделки',
       'Автоматические задачи, напоминания и согласования',
       'Телефония, почта и заявки с сайта в одном месте',
       'Обмен с 1С: счета, отгрузки и себестоимость'],
  note:'Обучаем сотрудников и сопровождаем после запуска.'},

 {tag:'Аналитика',
  t:'Собираем дашборды, по которым принимаются решения',
  lead:'Цифры из разных систем в одном экране — с расшифровкой до первичного документа.',
  can:['Сводные показатели: выручка, загрузка, маржинальность',
       'Разрезы по филиалам, направлениям и сотрудникам',
       'Автоматическая рассылка сводки на почту',
       'Оповещения, когда показатель выходит за норму'],
  note:'Подключаемся к вашим данным, не требуем менять учёт.'}
];
/* Окно «что мы умеем»: открывается по клику на карточке слайдера. */
function caseModal(i){
  var c=SKILLS[i]||SKILLS[0];
  openM('<span class="sk-tag mono">'+c.tag+'</span>'+
    '<h3 class="sk-t">'+c.t+'</h3>'+
    '<p class="sk-lead">'+c.lead+'</p>'+
    '<ul class="sk-l">'+c.can.map(function(x){
      return '<li><svg width="16" height="16" viewBox="0 0 15 15" fill="none" aria-hidden="true">'+
             '<path d="M2 7.6 5.6 11 12.5 3.6" stroke="currentColor" stroke-width="1.9" '+
             'stroke-linecap="round" stroke-linejoin="round"/></svg><span>'+x+'</span></li>';
    }).join('')+'</ul>'+
    '<p class="sk-note">'+c.note+'</p>'+
    '<div class="m-c"><button class="btn" data-go><span>Обсудить проект</span></button>'+
    '<button class="btn btn-o" data-mclose><span>Закрыть</span></button></div>');
}



/* ---------- плавный переход к разделу на той же странице ---------- */
document.addEventListener('click',function(e){
  var a=e.target.closest('a[data-smooth]');
  if(!a)return;
  var id=(a.getAttribute('href')||'').replace('#','');
  var t=id&&document.getElementById(id);
  if(!t)return;
  e.preventDefault();
  /* отступ на высоту шапки, иначе заголовок раздела уедет под неё */
  var hdr=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hdr'))||84;
  var y=t.getBoundingClientRect().top+scrollY-hdr-16;
  scrollTo({top:y,behavior:RM?'auto':'smooth'});
});


/* ---------- высота первого экрана ----------
   Задаём точную высоту окна: на телефоне единицы vh считают экран вместе
   с адресной строкой, и первый экран оказывается выше видимой области. */
(function(){
  var root=document.documentElement;
  function set(){root.style.setProperty('--vh',innerHeight+'px')}
  set();
  addEventListener('resize',set);
  addEventListener('orientationchange',function(){setTimeout(set,120)});
})();


/* ============ «о нас»: направления ============ */
(function(){
  var box=$('#awGrid');if(!box)return;
  box.innerHTML='';  /* статичная копия для поисковиков */
  /* Берём те же данные, что и список на главной: порядок, названия
     и знаки не придётся править дважды. */
  SVC_ORDER.forEach(function(key){
    var d=SVC[key];if(!d)return;
    var a=document.createElement('a');
    a.className='aw-i';
    a.href='/services/'+key+'/';
    a.setAttribute('data-route','services');
    a.setAttribute('data-sub',key);
    a.innerHTML='<span class="aw-ic anim">'+(AWILL[key]||'')+'</span>'+
      '<span class="aw-t">'+d.t+'</span>'+
      '<span class="aw-d">'+(AWSHORT[key]||'')+'</span>'+
      '<span class="aw-go" aria-hidden="true"><svg width="15" height="15" viewBox="0 0 15 15" fill="none">'+
      '<path d="M3 12 12 3M12 3H5M12 3v7" stroke="currentColor" stroke-width="1.6"/></svg></span>';
    box.appendChild(a);
  });
  /* Семь направлений в сетке из четырёх колонок оставляют одну ячейку
     пустой. Занимаем её переходом ко всему разделу — пустоты нет,
     а действие оказывается там, где взгляд заканчивает список. */
  var all=document.createElement('a');
  all.className='aw-i aw-all';
  all.href='/services/';
  all.setAttribute('data-route','services');
  all.innerHTML='<span class="aw-all-t">Смотреть<br>все направления</span>'+
    '<span class="aw-all-i" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 15 15" fill="none">'+
    '<path d="M3 12 12 3M12 3H5M12 3v7" stroke="currentColor" stroke-width="1.5"/></svg></span>';
  box.appendChild(all);
  initGear3D();
})();


/* Знаки этапов на страницах направлений: те же, что в блоке «Как мы
   работаем» на странице «О нас», плюс запуск. Порядок идёт по кругу. */
var STEP_IC=[
 '<circle class="fl-lens" cx="20" cy="20" r="11"/><path class="fl-stick" d="M28 28l7 7"/><path class="fl-cross" d="M15 20h10M20 15v10"/>',
 '<path class="fl-l1" d="M6 14 22 6l16 8-16 8z"/><path class="fl-l2" d="M6 22l16 8 16-8"/><path class="fl-l3" d="M6 30l16 8 16-8"/>',
 '<circle class="fl-ring" cx="22" cy="22" r="14"/><path class="fl-check" d="M15 22l5 5 11-11"/>',
 '<path class="fl-rocket" d="M22 6c6 5 9 11 9 18l-9 6-9-6c0-7 3-13 9-18z"/><path class="fl-fire" d="M18 32l4 6 4-6"/>',
 '<path class="fl-shield" d="M22 6l13 5v11c0 8-5.5 13-13 16-7.5-3-13-8-13-16V11z"/><path class="fl-pulse" d="M14 23h4l2.5-5 3 9 2.5-4h4"/>'
];


/* ---------- согласие на обработку данных ---------- */
(function(){
  var mask=$('#pdMask');if(!mask)return;
  var last=null;
  function open(){
    last=document.activeElement;
    mask.classList.add('on');mask.setAttribute('aria-hidden','false');
    document.body.classList.add('lock');
    var b=$('.pol-body',mask);if(b)b.scrollTop=0;
  }
  function close(){
    mask.classList.remove('on');mask.setAttribute('aria-hidden','true');
    document.body.classList.remove('lock');
    if(last&&last.focus)last.focus();
  }
  document.addEventListener('click',function(e){
    /* ссылка из формы открывает короткое согласие, из подвала — полную политику */
    var a=e.target.closest('[data-policy]');
    if(a&&a.closest('.talk-note,.fnote')){e.preventDefault();open();return}
    if(e.target.closest('[data-pd-close]'))close();
  });
  mask.addEventListener('click',function(e){if(e.target===mask)close()});
  addEventListener('keydown',function(e){
    if(e.key==='Escape'&&mask.classList.contains('on'))close();
  });
})();


/* ---------- маска телефона ----------
   Поле всегда начинается с +7. Пользователь вводит только цифры,
   скобки и дефисы подставляются сами. Вставка из буфера тоже
   разбирается: 8..., 7..., +7... приводятся к одному виду. */
(function(){
  function digits(v){return (v||'').replace(/\D/g,'')}
  function normalize(v){
    var d=digits(v);
    if(!d)return '';
    /* 8 в начале и 7 в начале — это один и тот же код страны */
    if(d[0]==='8')d='7'+d.slice(1);
    if(d[0]!=='7')d='7'+d;
    return d.slice(0,11);
  }
  function format(d){
    if(d.length<=1)return '+7 ';
    var r='+7 ('+d.slice(1,4);
    if(d.length>=5)r+=') '+d.slice(4,7);
    else if(d.length>4)r+=') '+d.slice(4);
    if(d.length>=8)r+='-'+d.slice(7,9);
    if(d.length>=10)r+='-'+d.slice(9,11);
    return r;
  }
  function apply(el){
    el.value=format(normalize(el.value));
  }
  document.addEventListener('input',function(e){
    var el=e.target;
    if(!el.matches||!el.matches('[data-phone]'))return;
    var atEnd=el.selectionStart===el.value.length;
    apply(el);
    if(atEnd)el.setSelectionRange(el.value.length,el.value.length);
  });
  document.addEventListener('focus',function(e){
    var el=e.target;
    if(el.matches&&el.matches('[data-phone]')&&!el.value)el.value='+7 ';
  },true);
  document.addEventListener('blur',function(e){
    var el=e.target;
    /* пустое поле не оставляем с «+7 » — иначе выглядит заполненным */
    if(el.matches&&el.matches('[data-phone]')&&digits(el.value).length<=1)el.value='';
  },true);
  /* вставка из буфера */
  document.addEventListener('paste',function(e){
    var el=e.target;
    if(!el.matches||!el.matches('[data-phone]'))return;
    e.preventDefault();
    var t=(e.clipboardData||window.clipboardData).getData('text');
    el.value=format(normalize(el.value.slice(0,el.selectionStart)+t));
    el.setSelectionRange(el.value.length,el.value.length);
  });
})();


/* Профиль шестерни для карточки на телефоне: трапециевидные зубья,
   те же пропорции, что у объёмной модели в разделе направлений. */
function GEAR_PATH(Z,R,TH,cx,cy){
  var st=Math.PI*2/Z,d='',i,k;
  function P(a,r){return [(cx+Math.cos(a)*r).toFixed(1),(cy+Math.sin(a)*r).toFixed(1)]}
  for(i=0;i<Z;i++){
    var a=i*st;
    var p1=P(a-st*0.19,R),p2=P(a-st*0.13,R+TH),p3=P(a+st*0.13,R+TH),p4=P(a+st*0.19,R);
    d+=(i?'L':'M')+p1[0]+' '+p1[1]+'L'+p2[0]+' '+p2[1]+'L'+p3[0]+' '+p3[1]+'L'+p4[0]+' '+p4[1];
    var n=P(a+st-st*0.19,R);
    d+='A'+R+' '+R+' 0 0 1 '+n[0]+' '+n[1];
  }
  d+='Z';
  return '<path d="'+d+'"/><circle cx="'+cx+'" cy="'+cy+'" r="'+(R*0.32).toFixed(1)+'"/>';
}

/* ==================== маршрутизация ==================== */
/* У каждой страницы свой адрес и свой HTML-файл. Скрипт только определяет,
   какая страница открыта, и запускает её анимации и обработчики. */
var goTo;
(function(){
  var pages={home:$('#page-home'),services:$('#page-services'),service:$('#page-service'),case:$('#page-case'),projects:$('#page-projects'),about:$('#page-about'),contacts:$('#page-contacts')};
  var started={},current='';
  function boot(name){
    if(started[name])return;started[name]=true;
    try{ if(name==='about')initAbout(); if(name==='contacts')initContacts();
           if(name==='home'&&window.__fitClaim)window.__fitClaim();
           if(name==='services'){$$('#page-services .geo-f [data-c]').forEach(countUpEl);initPirateMap();}
           initGear3D();
           if(name==='projects'){initProjects();initWrench();} }catch(e){if(window.console)console.warn('boot '+name+': '+e)}
  }
  function show(name,anchor,sub){
    var navName=name;
    if(name==='services'&&sub&&renderService(sub)){name='service';navName='services'}
    if(name==='projects'&&sub&&renderCase(sub)){name='case';navName='projects'}
    if(!pages[name])name='home';
    if(current!==name){
      Object.keys(pages).forEach(function(k){if(pages[k])pages[k].hidden=(k!==name)});
      current=name;boot(name);
      dispatchEvent(new Event('resize'));
      mark(navName,null);
    }
    if(anchor){
      var el=null;try{el=document.querySelector(anchor)}catch(e){}
      if(el)setTimeout(function(){el.scrollIntoView({behavior:RM?'auto':'smooth'})},RM?0:30);
    }
  }
  goTo=show;
  var pp=location.pathname.replace(/index\.html$/,'').split('/').filter(Boolean);
  var h=location.hash;
  show(pp[0]||'home',(h&&h.length>1&&h.indexOf('#/')!==0)?h:null,pp[1]);
  addEventListener('hashchange',function(){
    var h=location.hash;if(h&&h.length>1&&h.indexOf('#/')!==0)show(current,h);
  });
  document.addEventListener('click',function(e){
    var a=e.target.closest('[data-route]');if(!a)return;
    var nav=$('#nav'),bg=$('#burger');
    if(nav)nav.classList.remove('open');if(bg)bg.classList.remove('on');
    /* ссылка на ту же страницу — просто наверх, без перезагрузки */
    var u=new URL(a.getAttribute('href')||'/',location.href);
    if(u.pathname===location.pathname&&!u.hash&&!(e.ctrlKey||e.metaKey||e.shiftKey)){
      e.preventDefault();window.scrollTo({top:0,behavior:RM?'auto':'smooth'});
    }
  });
})();

})();
