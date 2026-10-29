/* Анимированная серверная: команды и код показаны как текст, без выполнения. */
(function(){
  'use strict';
  var dialog=document.getElementById('boardDemo');
  if(!dialog)return;
  var reduced=matchMedia('(prefers-reduced-motion:reduce)');
  var frame=0,lastTime=0,elapsed=0,codeTime=0,lastLength=-1,lastSample=-1;
  var ideaTimer=0,sparkTimer=0;
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
  var cycles=examples.map(function(example){return example.code.length/.075+2200});
  var totalCycle=cycles.reduce(function(sum,time){return sum+time},0);
  var links=[
    'M1125 432H1129Q1136 432 1136 407V386Q1136 362 1156 362H1180',
    'M1209 328V309Q1209 283 1238 283H1267',
    'M1126 445H1151Q1184 445 1184 477V601Q1184 633 1215 633H1258',
    'M1185 514H1219',
    'M1276 512H1290'
  ];
  function $(selector){return dialog.querySelector(selector)}
  function active(){return dialog.open&&dialog.dataset.demoType==='it'}
  function escape(text){return text.replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function paint(text){
    return text.split(/("[^"\n]*"|'[^'\n]*'|\b(?:from|import|class|def|if|return|for|in|do|then|fi|done|exit|set)\b|\b(?:ThreadingHTTPServer|BaseHTTPRequestHandler|python3|curl|nohup|printf|sleep)\b)/g).map(function(part){
      var kind=/^["']/.test(part)?'string':/^(from|import|class|def|if|return|for|in|do|then|fi|done|exit|set)$/.test(part)?'keyword':/^(ThreadingHTTPServer|BaseHTTPRequestHandler|python3|curl|nohup|printf|sleep)$/.test(part)?'command':'';
      return kind?'<tspan class="it-code-'+kind+'">'+escape(part)+'</tspan>':escape(part);
    }).join('');
  }
  function renderCode(complete){
    var local=codeTime%totalCycle,index=0;
    while(local>=cycles[index]){local-=cycles[index];index++}
    var example=examples[index],length=complete?example.code.length:Math.min(example.code.length,Math.floor(local*.075));
    if(lastSample===index&&lastLength===length)return;
    lastSample=index;lastLength=length;
    var all=example.code.slice(0,length).split('\n'),start=Math.max(0,all.length-13),lines=all.slice(start);
    $('#itTerminalCode').innerHTML=lines.map(function(line,i){return '<tspan x="0" y="'+(12+i*10.7)+'">'+paint(line)+'</tspan>'}).join('');
    $('#itTerminalFile').textContent='admin@ubuntu: '+example.file;
    $('#itTerminalCursor').setAttribute('x',Math.min(266,lines[lines.length-1].length*4.95));
    $('#itTerminalCursor').setAttribute('y',(lines.length-1)*10.7+4);
    var scene=$('.it-demo-scene');scene.dataset.codeLength=String(length);scene.dataset.codeSample=String(index);
  }
  function ease(n){return n*n*(3-2*n)}
  function pose(){
    var phase=elapsed%18000,reach=0;
    if(phase>=6500&&phase<7200)reach=ease((phase-6500)/700);
    else if(phase>=7200&&phase<8250)reach=1;
    else if(phase>=8250&&phase<9100)reach=1-ease((phase-8250)/850);
    var rub=phase>=7200&&phase<8250?Math.sin((phase-7200)/65):0;
    var shoulder=-94*reach+rub*.7+(1-reach)*Math.sin(elapsed/240)*.18;
    var elbow=-66*reach+rub*2.4+(1-reach)*Math.sin(elapsed/110)*.55;
    $('#itUpperArm').setAttribute('transform','rotate('+shoulder.toFixed(3)+' 775 465)');
    $('#itForearm').setAttribute('transform','rotate('+elbow.toFixed(3)+' 817 539)');
    $('#itHumanHead').setAttribute('transform','rotate('+(-reach*.9+Math.sin(elapsed/1600)*.22).toFixed(3)+' 752 432)');
    $('#itArmBackdrop').setAttribute('opacity',Math.min(1,reach*5).toFixed(3));
    $('.it-demo-scene').classList.toggle('is-scratching',reach>.02);
    return reach;
  }
  function syncEggs(){
    dialog.querySelectorAll('[data-it-egg]').forEach(function(node){
      var taken=used[node.dataset.itEgg];node.setAttribute('aria-disabled',String(taken));node.setAttribute('tabindex',taken?'-1':'0');
    });
  }
  function stop(){
    cancelAnimationFrame(frame);frame=0;lastTime=0;
    clearTimeout(ideaTimer);clearTimeout(sparkTimer);
    var scene=$('.it-demo-scene');if(scene){scene.classList.add('is-suspended');scene.classList.remove('is-idea','is-spark')}
  }
  function tick(time){
    frame=0;if(!active()||document.hidden||reduced.matches)return;
    var delta=Math.min(lastTime?time-lastTime:16,80);lastTime=time;elapsed+=delta;
    var reach=pose();if(reach<.03)codeTime+=delta;
    renderCode(false);frame=requestAnimationFrame(tick);
  }
  function resume(){
    if(!active()||document.hidden||reduced.matches)return;
    $('.it-demo-scene').classList.remove('is-suspended');
    if(!frame){lastTime=0;frame=requestAnimationFrame(tick)}
  }
  function start(){
    stop();elapsed=0;codeTime=0;lastSample=-1;lastLength=-1;
    var scene=$('.it-demo-scene');scene.classList.remove('is-scratching');scene.classList.add('is-restarting');
    void scene.offsetWidth;scene.classList.remove('is-restarting');
    pose();renderCode(reduced.matches);syncEggs();resume();
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
  function syncIcon(x,y){
    return '<g transform="translate('+x+' '+y+')"><rect class="it-sync-face" width="56" height="58" rx="8"/><g class="it-sync-arrows"><path d="M13 28a15 15 0 0 1 26-10l3 4m0-10v10H32M43 31a15 15 0 0 1-26 10l-3-4m0 10V37h10"/></g></g>';
  }
  function markup(){
    return '<div class="flow-demo-scene it-demo-scene"><div class="it-scene-stage"><svg class="it-scene-svg" viewBox="584 132 990 680" role="group" aria-labelledby="itSceneTitle itSceneDescription">'+
      '<title id="itSceneTitle">Администратор управляет серверами Ubuntu</title><desc id="itSceneDescription">Набор серверного кода, работающие индикаторы и обмен данными. Администратор иногда отрывается от клавиатуры и чешет голову.</desc>'+
      '<defs><linearGradient id="itScreenGradient" x2="0" y2="1"><stop stop-color="#0b1223"/><stop offset="1" stop-color="#050b17"/></linearGradient><linearGradient id="itJacketGradient" x2="1" y2=".5"><stop stop-color="#080b10"/><stop offset="1" stop-color="#0b1018"/></linearGradient><radialGradient id="itBulbGlow"><stop stop-color="#ffdd8a" stop-opacity=".5"/><stop offset="1" stop-color="#ffcc64" stop-opacity="0"/></radialGradient>'+
      '<clipPath id="itScreenClip"><polygon points="822,359 1112,320 1113,536 819,525"/></clipPath>'+
      '<clipPath id="itHeadClip"><path id="itHeadShape" d="M714 375Q708 359 731 350Q738 332 772 345L792 349Q805 365 789 378L787 405Q787 426 774 436L749 433L721 427Z"/></clipPath>'+
      '<clipPath id="itUpperClip"><path d="M763 450C784 450 796 478 808 501L830 535C835 546 823 557 811 557C797 553 788 534 779 513L758 477Z"/></clipPath>'+
      '<clipPath id="itForearmClip"><path d="M810 524C826 529 839 532 853 531L863 531C874 523 888 531 894 540L895 548C888 550 884 542 878 542L861 551C838 563 820 566 808 551Z"/></clipPath>'+
      '<clipPath id="itArmRimClip"><path d="m813 518 103 5v14l-103-4z"/></clipPath><clipPath id="itArmDeskClip"><path d="M826 536h90v29h-90z"/></clipPath>'+
      '<mask id="itBaseMask" maskUnits="userSpaceOnUse" x="0" y="0" width="1672" height="941"><rect width="1672" height="941" fill="#fff"/><use href="#itHeadShape" fill="#000"/></mask></defs>'+
      '<path d="M710 332h98v112h-98z" fill="#060a13"/><image href="/img/demos/it-studio.png" width="1672" height="941" mask="url(#itBaseMask)"/>'+
      '<g id="itHumanHead"><image href="/img/demos/it-studio.png" width="1672" height="941" clip-path="url(#itHeadClip)"/></g>'+
      '<g id="itArmBackdrop" opacity="0"><path d="M790 468L812 484L843 525L867 526Q888 520 898 539L901 555L869 562L830 569Q805 570 792 548Z" fill="#070b13"/><path d="M779 485Q781 518 810 564L790 580L775 548Z" fill="url(#itJacketGradient)"/><g clip-path="url(#itArmRimClip)"><image href="/img/demos/it-studio.png" width="1672" height="941" x="-100" y="-5"/></g><g clip-path="url(#itArmDeskClip)"><image href="/img/demos/it-studio.png" width="1672" height="941" x="-100"/></g></g>'+
      '<g clip-path="url(#itScreenClip)"><polygon points="822,359 1112,320 1113,536 819,525" fill="url(#itScreenGradient)"/><g transform="matrix(1 -.11 -.008 1 834 359)"><circle class="it-ubuntu-dot" cx="3" cy="6" r="3.3"/><text class="it-terminal-file" id="itTerminalFile" x="12" y="8"></text><path class="it-terminal-rule" d="M-3 16h277"/><g transform="translate(0 23)"><text class="it-terminal-code" id="itTerminalCode"></text><rect class="it-terminal-cursor" id="itTerminalCursor" width="1.2" height="9"/></g></g></g>'+
      '<g class="it-connections">'+links.map(function(path,i){return '<path class="it-link-track" d="'+path+'"/><path class="it-link-pulse" pathLength="1" style="--it-path-delay:-'+i*.7+'s" d="'+path+'"/>'}).join('')+'</g>'+
      syncIcon(1181,327)+syncIcon(1220,483)+
      rack(1295,[269,299,328,359,398,436,470,509,542],78,-12)+rack(1288,[583,614,644,674],91,-2)+rack(1513,[333,369,404,439,475,511,546,581,617,652],31,12)+
      '<path class="it-floor-light" d="m1280 704 117 7m9-8 70-7m37-8 44-6"/>'+
      '<g class="it-keyboard-lights">'+[0,1,2,3,4,5,6].map(function(n){return '<path style="--it-key-delay:-'+n*.13+'s" d="m'+(890+n*6)+' 556h3"/>'}).join('')+'</g>'+
      '<g id="itUpperArm"><image href="/img/demos/it-studio.png" width="1672" height="941" clip-path="url(#itUpperClip)"/><g id="itForearm"><image href="/img/demos/it-studio.png" width="1672" height="941" clip-path="url(#itForearmClip)"/></g></g>'+
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
  reduced.addEventListener('change',function(){
    if(!active())return;
    if(reduced.matches){stop();elapsed=0;pose();lastLength=-1;renderCode(true)}else start();
  });
  window.RusItDemo={markup:markup,start:start,stop:stop,resume:resume};
})();
