/* Анимированная серверная: команды и код показаны как текст, без выполнения. */
(function(){
  'use strict';
  var dialog=document.getElementById('boardDemo');
  if(!dialog)return;
  var reduced=matchMedia('(prefers-reduced-motion:reduce)');
  var frame=0,lastTime=0,lastLength=-1,lastSample=-1;
  var phase='typing',phaseTime=0,exampleIndex=0;
  var typingDuration=4000,settleDuration=450,gestureEnd=2.4;
  var ideaTimer=0,sparkTimer=0;
  var mediaObserver=null,videoFrame=0;
  var foregroundMask=null,foregroundReady=false,foregroundLoading=null;
  // Маска исходного ролика: 120 кадров по 30 кадров/с, атлас из 12 колонок.
  var foregroundArea={x:840,y:335,width:104,height:190,columns:12,frames:120,fps:30};
  var editorWidth=320,editorHeight=220;
  var screenCorners=[{x:870,y:354},{x:1105,y:323},{x:1105,y:500},{x:872,y:508}];
  var used={idea:false,spark:false};
  Object.keys(used).forEach(function(key){try{used[key]=sessionStorage.getItem('ri_it_egg_'+key)==='1'}catch(e){}});
  var examples=[
    {file:'server.py',code:[
      'from http.server import (',
      '    BaseHTTPRequestHandler,',
      '    ThreadingHTTPServer,',
      ')',
      '',
      'class Health(BaseHTTPRequestHandler):',
      '    def do_GET(self):',
      '        if self.path != "/health":',
      '            self.send_error(404)',
      '            return',
      '        body = b\'{"status":"ok"}\'',
      '        self.send_response(200)',
      '        self.send_header(',
      '            "Content-Type",',
      '            "application/json")',
      '        self.end_headers()',
      '        self.wfile.write(body)',
      '',
      'server = ThreadingHTTPServer(',
      '    ("127.0.0.1", 8080), Health)',
      'server.serve_forever()'
    ].join('\n')},
    {file:'run.sh',code:[
      '#!/usr/bin/env bash',
      'set -euo pipefail',
      'cd "$HOME/services/health"',
      '',
      'python3 -m py_compile server.py',
      'nohup python3 server.py >server.log 2>&1 &',
      'server_pid=$!',
      '',
      'for attempt in {1..20}; do',
      '  if curl -fsS \\',
      '    http://127.0.0.1:8080/health; then',
      '    printf "\\nServer ready: %s\\n" "$server_pid"',
      '    exit 0',
      '  fi',
      '  sleep 0.1',
      'done',
      'printf "Health check failed\\n" >&2',
      'exit 1'
    ].join('\n')}
  ];
  var links=[
    'M1125 432H1129Q1136 432 1136 407V386Q1136 360 1156 360H1176',
    'M1203.5 327V309Q1203.5 283 1238 283H1267',
    'M1126 445H1151Q1180 445 1180 477V601Q1180 633 1215 633H1258',
    'M1180 511.5H1213',
    'M1268.5 508.5H1290'
  ];
  function $(selector){return dialog.querySelector(selector)}
  function active(){return dialog.open&&dialog.dataset.demoType==='it'}
  function escape(text){return text.replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function paint(text){
    return text.split(/("[^"\n]*"|'[^'\n]*'|\b(?:from|import|class|def|if|return|for|in|do|then|fi|done|exit|set)\b|\b(?:ThreadingHTTPServer|BaseHTTPRequestHandler|python3|curl|nohup|printf|sleep)\b)/g).map(function(part){
      var kind=/^["']/.test(part)?'string':/^(from|import|class|def|if|return|for|in|do|then|fi|done|exit|set)$/.test(part)?'keyword':/^(ThreadingHTTPServer|BaseHTTPRequestHandler|python3|curl|nohup|printf|sleep)$/.test(part)?'command':'';
      return kind?'<span class="it-code-'+kind+'">'+escape(part)+'</span>':escape(part);
    }).join('');
  }
  function renderCode(complete){
    var index=exampleIndex,example=examples[index];
    var progress=complete||phase!=='typing'?1:Math.min(1,phaseTime/typingDuration);
    var length=Math.floor(example.code.length*progress);
    if(lastSample===index&&lastLength===length)return;
    lastSample=index;lastLength=length;
    var all=example.code.slice(0,length).split('\n'),start=Math.max(0,all.length-12),lines=all.slice(start);
    $('#itTerminalCode').innerHTML=lines.map(paint).join('\n')+'<span class="it-terminal-cursor"></span>';
    $('#itTerminalLines').textContent=lines.map(function(line,i){return String(start+i+1).padStart(2,' ')}).join('\n');
    $('#itTerminalFile').textContent=example.file;
    $('#itTerminalLanguage').textContent=index===0?'Python 3':'Bash';
    var scene=$('.it-demo-scene');scene.dataset.codeLength=String(length);scene.dataset.codeSample=String(index);
  }
  function syncEggs(){
    dialog.querySelectorAll('[data-it-egg]').forEach(function(node){
      var taken=used[node.dataset.itEgg];node.setAttribute('aria-disabled',String(taken));node.setAttribute('tabindex',taken?'-1':'0');
    });
  }
  function setPhase(name){
    phase=name;phaseTime=0;
    var scene=$('.it-demo-scene');scene.dataset.phase=name;
    scene.classList.toggle('is-video-thinking',name!=='typing');
  }
  function pauseVideo(){
    var video=$('.it-scene-video');
    if(video){video.pause();if(videoFrame&&video.cancelVideoFrameCallback)video.cancelVideoFrameCallback(videoFrame)}
    videoFrame=0;
  }
  function beginTyping(next){
    pauseVideo();
    if(next)exampleIndex=(exampleIndex+1)%examples.length;
    setPhase('typing');
    $('.it-demo-scene').classList.remove('has-video','is-settling');
    var video=$('.it-scene-video');
    if(video){video.playbackRate=1;try{video.currentTime=0}catch(e){}}
    renderCode(false);
  }
  function beginSettle(){
    if(phase!=='gesture')return;
    pauseVideo();setPhase('settling');
    $('.it-demo-scene').classList.add('is-settling');
  }
  function beginGesture(){
    setPhase('gesture');renderCode(true);
    var video=$('.it-scene-video');
    if(!video||video.error){beginSettle();return}
    video.playbackRate=1;try{video.currentTime=0}catch(e){}
    playVideo();
  }
  function loadForeground(){
    if(!foregroundLoading)foregroundLoading=new Promise(function(resolve){
      foregroundMask=new Image();
      foregroundMask.onload=function(){foregroundReady=true;resolve(true)};
      foregroundMask.onerror=function(){resolve(false)};
      foregroundMask.src='/img/demos/it-arm-mask.png';
    });
    return foregroundLoading;
  }
  function drawForeground(video,mediaTime){
    var canvas=$('.it-foreground');
    if(!canvas||!foregroundReady||video.readyState<2)return;
    var area=foregroundArea,context=canvas.getContext('2d');
    var index=Math.min(area.frames-1,Math.max(0,Math.round(mediaTime*area.fps)));
    context.clearRect(0,0,area.width,area.height);
    context.globalCompositeOperation='source-over';
    context.drawImage(video,area.x*video.videoWidth/1672,area.y*video.videoHeight/941,area.width*video.videoWidth/1672,area.height*video.videoHeight/941,0,0,area.width,area.height);
    context.globalCompositeOperation='destination-in';
    context.drawImage(foregroundMask,index%area.columns*area.width,Math.floor(index/area.columns)*area.height,area.width,area.height,0,0,area.width,area.height);
    context.globalCompositeOperation='source-over';
    canvas.dataset.maskFrame=String(index);
  }
  function editorTransform(scale,tx,ty){
    // Проективное отображение прямоугольного редактора в четыре угла экрана.
    var p=screenCorners,dx1=p[1].x-p[2].x,dx2=p[3].x-p[2].x,dx3=p[0].x-p[1].x+p[2].x-p[3].x;
    var dy1=p[1].y-p[2].y,dy2=p[3].y-p[2].y,dy3=p[0].y-p[1].y+p[2].y-p[3].y;
    var denominator=dx1*dy2-dx2*dy1;
    var g=(dx3*dy2-dx2*dy3)/denominator,h=(dx1*dy3-dx3*dy1)/denominator;
    var a=p[1].x-p[0].x+g*p[1].x,b=p[3].x-p[0].x+h*p[3].x;
    var d=p[1].y-p[0].y+g*p[1].y,e=p[3].y-p[0].y+h*p[3].y;
    return 'matrix3d('+[
      (scale*a+tx*g)/editorWidth,(scale*d+ty*g)/editorWidth,0,g/editorWidth,
      (scale*b+tx*h)/editorHeight,(scale*e+ty*h)/editorHeight,0,h/editorHeight,
      0,0,1,0,scale*p[0].x+tx,scale*p[0].y+ty,0,1
    ].join(',')+')';
  }
  function layoutVideo(){
    var stage=$('.it-scene-stage'),media=$('.it-scene-media'),video=$('.it-scene-video'),svg=$('.it-scene-svg');
    if(!stage||!media||!video)return;
    var scale=Math.min(stage.clientWidth/990,stage.clientHeight/680);
    var left=(stage.clientWidth-990*scale)/2,top=(stage.clientHeight-680*scale)/2;
    media.style.left=left+'px';media.style.top=top+'px';
    media.style.width=990*scale+'px';media.style.height=680*scale+'px';
    video.style.left=-584*scale+'px';video.style.top=-132*scale+'px';
    video.style.width=1672*scale+'px';video.style.height=941*scale+'px';
    var radius=parseFloat(getComputedStyle(stage).borderTopLeftRadius)||0;
    svg.style.clipPath='inset('+top+'px '+left+'px round '+radius+'px)';
    $('.it-terminal').style.transform=editorTransform(scale,left-584*scale,top-132*scale);
    var foreground=$('.it-foreground'),area=foregroundArea;
    foreground.style.left=left+(area.x-584)*scale+'px';foreground.style.top=top+(area.y-132)*scale+'px';
    foreground.style.width=area.width*scale+'px';foreground.style.height=area.height*scale+'px';
  }
  function watchMedia(){
    layoutVideo();
    if(!mediaObserver){mediaObserver=new ResizeObserver(layoutVideo);mediaObserver.observe($('.it-scene-stage'))}
  }
  function playVideo(){
    var video=$('.it-scene-video'),scene=$('.it-demo-scene');
    if(!video||video.error||phase!=='gesture')return;
    watchMedia();
    video.muted=true;
    function showFrame(now,metadata){
      videoFrame=0;
      if(!active()||document.hidden||reduced.matches||phase!=='gesture')return;
      drawForeground(video,metadata?metadata.mediaTime:Math.floor(video.currentTime*foregroundArea.fps)/foregroundArea.fps);
      scene.classList.add('has-video');
      if((metadata?metadata.mediaTime:video.currentTime)>=gestureEnd){beginSettle();return}
      if(video.requestVideoFrameCallback)videoFrame=video.requestVideoFrameCallback(showFrame);
    }
    loadForeground().then(function(ready){
      if(!active()||document.hidden||reduced.matches||phase!=='gesture')return;
      if(!ready){beginSettle();return}
      var playing=video.play();
      function begin(){
        if(!active()||document.hidden||reduced.matches||phase!=='gesture'){video.pause();return}
        if(videoFrame&&video.cancelVideoFrameCallback)video.cancelVideoFrameCallback(videoFrame);
        if(video.requestVideoFrameCallback)videoFrame=video.requestVideoFrameCallback(showFrame);else showFrame();
      }
      if(playing)playing.then(begin).catch(function(){if(video.paused)scene.classList.remove('has-video');if(active())beginSettle()});else begin();
    });
  }
  function stop(){
    cancelAnimationFrame(frame);frame=0;lastTime=0;
    clearTimeout(ideaTimer);clearTimeout(sparkTimer);
    if(mediaObserver){mediaObserver.disconnect();mediaObserver=null}
    pauseVideo();
    var scene=$('.it-demo-scene');if(scene){scene.classList.add('is-suspended');scene.classList.remove('is-idea','is-spark')}
  }
  function tick(time){
    frame=0;if(!active()||document.hidden||reduced.matches)return;
    var delta=lastTime?time-lastTime:0;lastTime=time;phaseTime+=delta;
    var video=$('.it-scene-video');
    if(phase==='typing'){
      renderCode(false);
      if(phaseTime>=typingDuration)beginGesture();
    }else if(phase==='gesture'){
      if(video&&!video.requestVideoFrameCallback&&video.readyState>=2){
        drawForeground(video,Math.floor(video.currentTime*foregroundArea.fps)/foregroundArea.fps);
        if(video.currentTime>=gestureEnd)beginSettle();
      }
      if(video&&phase==='gesture'){
        var progress=Math.max(0,Math.min(1,(video.currentTime-1.65)/.45));
        var speed=1-.25*progress*progress*(3-2*progress);
        if(Math.abs(video.playbackRate-speed)>.01)video.playbackRate=speed;
        if(video.error||(phaseTime>6000&&!$('.it-demo-scene').classList.contains('has-video')))beginSettle();
      }
    }else if(phaseTime>=settleDuration)beginTyping(true);
    frame=requestAnimationFrame(tick);
  }
  function resume(){
    if(!active()||document.hidden||reduced.matches)return;
    $('.it-demo-scene').classList.remove('is-suspended');
    watchMedia();if(phase==='gesture')playVideo();
    if(!frame){lastTime=0;frame=requestAnimationFrame(tick)}
  }
  function start(){
    stop();exampleIndex=0;lastSample=-1;lastLength=-1;
    beginTyping(false);
    var scene=$('.it-demo-scene');scene.classList.add('is-restarting');
    void scene.offsetWidth;scene.classList.remove('is-restarting');
    renderCode(reduced.matches);syncEggs();watchMedia();
    if(!reduced.matches)loadForeground();resume();
  }
  function egg(kind,event){
    if(!active()||used[kind])return;
    used[kind]=true;
    try{sessionStorage.setItem('ri_it_egg_'+kind,'1')}catch(e){}
    syncEggs();var scene=$('.it-demo-scene');
    if(kind==='idea'){
      scene.classList.add('is-idea');
      ideaTimer=setTimeout(function(){scene.classList.remove('is-idea')},1000);
    }else{
      var x=1380,y=397,svg=$('.it-scene-svg');
      if(event.detail>0){
        var matrix=svg.getScreenCTM();
        if(matrix){var point=new DOMPoint(event.clientX,event.clientY).matrixTransform(matrix.inverse());x=point.x;y=point.y}
      }
      $('#itSparkPosition').setAttribute('transform','translate('+x+' '+y+')');
      scene.classList.add('is-spark');
      sparkTimer=setTimeout(function(){scene.classList.remove('is-spark')},reduced.matches?140:480);
    }
  }
  function rack(x,ys,width,slope){
    return ys.map(function(y,i){return '<g style="--it-led-delay:-'+(i*.27+x*.001)+'s"><rect class="it-server-led" x="'+x+'" y="'+(y-2)+'" width="2.5" height="5" rx="1.2"/><rect class="it-server-led it-server-led--right" x="'+(x+width)+'" y="'+(y+slope-4)+'" width="2" height="8" rx="1"/>'+
      [0,1,2,3,4,5].map(function(n){return '<rect class="it-server-data" style="--it-data-delay:-'+(i*.24+n*.17)+'s" x="'+(x+10+n*4)+'" y="'+(y-1+n*slope/width*4)+'" width="2" height="1.3"/>'}).join('')+'</g>'}).join('');
  }
  function syncIcon(x,y,tilt){
    // Рамка уже есть в ролике: перекрываем только статичные стрелки внутри неё.
    return '<g class="it-sync-panel" transform="matrix(1 '+tilt+' 0 1 '+x+' '+y+')"><rect class="it-sync-face" x="4" y="4" width="48" height="48" rx="6"/><g class="it-sync-arrows"><path d="M13 28a15 15 0 0 1 26-10l3 4m0-10v10H32M43 31a15 15 0 0 1-26 10l-3-4m0 10V37h10"/></g></g>';
  }
  function markup(){
    return '<div class="flow-demo-scene it-demo-scene"><div class="it-scene-stage"><div class="it-scene-media" aria-hidden="true"><video class="it-scene-video" src="/img/demos/it-studio.mp4" poster="/img/demos/it-studio-poster.jpg" muted playsinline preload="auto" disablepictureinpicture tabindex="-1"></video></div>'+
      '<div class="it-terminal" aria-hidden="true"><div class="it-terminal-bar"><span class="it-terminal-file-icon">&lt;/&gt;</span><span id="itTerminalFile"></span><span class="it-terminal-bar-dots">···</span></div><div class="it-terminal-body"><pre class="it-terminal-lines" id="itTerminalLines"></pre><pre class="it-terminal-pre"><code id="itTerminalCode"></code></pre></div><div class="it-terminal-status"><span><i></i>Ubuntu</span><span id="itTerminalLanguage"></span><span>UTF-8</span></div></div>'+
      '<canvas class="it-foreground" width="104" height="190" aria-hidden="true"></canvas>'+
      '<svg class="it-scene-svg" viewBox="584 132 990 680" role="group" aria-labelledby="itSceneTitle itSceneDescription">'+
      '<title id="itSceneTitle">Администратор управляет серверами Ubuntu</title><desc id="itSceneDescription">Администратор работает за клавиатурой и иногда чешет голову. На мониторе набирается серверный код, индикаторы оборудования мерцают, по соединениям идёт обмен данными.</desc>'+
      '<defs><radialGradient id="itBulbGlow"><stop stop-color="#ffdd8a" stop-opacity=".5"/><stop offset="1" stop-color="#ffcc64" stop-opacity="0"/></radialGradient></defs>'+
      '<image class="it-scene-poster" href="/img/demos/it-studio-poster.jpg" width="1672" height="941"/>'+
      '<g class="it-connections">'+links.map(function(path,i){return '<path class="it-link-track" d="'+path+'"/><path class="it-link-pulse" pathLength="1" style="--it-path-delay:-'+i*.7+'s" d="'+path+'"/>'}).join('')+'</g>'+
      syncIcon(1175.5,330.5,-.12)+syncIcon(1212.5,482.2,-.05)+
      rack(1295,[269,299,328,359,398,436,470,509,542],78,-12)+rack(1288,[583,614,644,674],91,-2)+rack(1513,[333,369,404,439,475,511,546,581,617,652],31,12)+
      '<path class="it-floor-light" d="m1280 704 117 7m9-8 70-7m37-8 44-6"/>'+
      '<g class="it-keyboard-lights">'+[0,1,2,3,4,5,6].map(function(n){return '<path style="--it-key-delay:-'+n*.13+'s" d="m'+(890+n*6)+' 556h3"/>'}).join('')+'</g>'+
      '<g class="it-bulb" transform="translate(757 303)" aria-hidden="true"><circle class="it-bulb-halo" r="51" fill="url(#itBulbGlow)"/><g class="it-bulb-icon"><path class="it-bulb-glass" d="M-15-8a15 15 0 1 1 27 9c-4 5-7 7-7 13H-6C-6 8-9 6-13 1a15 15 0 0 1-2-9Z"/><path d="m-6 17 11 0m-10 4h9m-6 4h3M-4 10V-1l5 3 4-3v11M0-31v-6m-23 16-5-4m51 4 5-4M-29 0h-7m65 0h7"/></g></g>'+
      '<g id="itSparkPosition" transform="translate(1380 397)" aria-hidden="true"><g class="it-spark"><circle class="it-spark-glow" r="39"/><g class="it-spark-rays"><path d="m0-3-6-14 4 5-1-16m7 25 11-17-2 9 13-10M4 0l20-4-6 4 15 5M2 4l8 16-1-6 10 11M-2 4l-9 19 3-12-13 11M-4 1l-21 5 10-6-14-4"/><path class="it-spark-core" d="m-7 0 6-3 2-9 3 9 7 3-8 2-3 9-2-9Z"/></g></g></g>'+
      '<g class="it-egg-target" data-it-egg="idea" role="button" tabindex="0" aria-label="Идея администратора"><ellipse class="it-egg-outline" cx="755" cy="389" rx="45" ry="50"/></g>'+
      '<g class="it-egg-target" data-it-egg="spark" role="button" tabindex="0" aria-label="Проверить сервер"><path class="it-egg-outline" d="M1262 237 1400 216 1460 249 1460 273 1497 268 1561 303 1562 684 1480 703 1398 714 1258 705V550l10-3z"/></g>'+
      '</svg></div></div>';
  }
  dialog.addEventListener('click',function(event){var target=event.target.closest('[data-it-egg]');if(target&&active())egg(target.dataset.itEgg,event)});
  dialog.addEventListener('keydown',function(event){
    var target=event.target.closest('[data-it-egg]');
    if(target&&active()&&(event.key==='Enter'||event.key===' ')){event.preventDefault();egg(target.dataset.itEgg,{detail:0})}
  });
  dialog.addEventListener('error',function(event){
    if(event.target.matches&&event.target.matches('.it-scene-video')){
      event.target.pause();$('.it-demo-scene').classList.remove('has-video','is-video-thinking');
      if(active())beginSettle();
    }
  },true);
  dialog.addEventListener('ended',function(event){
    if(event.target.matches&&event.target.matches('.it-scene-video')&&active())beginSettle();
  },true);
  dialog.addEventListener('seeked',function(event){
    if(event.target.matches&&event.target.matches('.it-scene-video')&&active()){
      drawForeground(event.target,Math.floor(event.target.currentTime*foregroundArea.fps+.001)/foregroundArea.fps);
    }
  },true);
  reduced.addEventListener('change',function(){
    if(!active())return;
    if(reduced.matches){stop();watchMedia();$('.it-demo-scene').classList.remove('has-video','is-video-thinking','is-settling');lastLength=-1;renderCode(true)}else start();
  });
  window.RusItDemo={markup:markup,start:start,stop:stop,resume:resume};
})();
