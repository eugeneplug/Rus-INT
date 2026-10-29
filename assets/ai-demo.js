/* Живая SVG-сцена поверх исходной иллюстрации. Демо не обращается к ИИ-сервисам. */
(function(){
  'use strict';
  var dialog=document.getElementById('boardDemo');
  if(!dialog)return;
  var reduced=matchMedia('(prefers-reduced-motion:reduce)');
  var frame=0,lastTime=0,elapsed=0,paused=false,burstTimer=0,lastSample=-1,lastLength=-1;
  var samples=[
    ['agent = LocalAgent()','task = queue.next()','','context = docs.search(','    task.question',')','','answer = agent.generate(','    task.prompt,','    context=context',')','task.complete(answer)'].join('\n'),
    ['async def run_pipeline():','    task = await queue.next()','','    result = await model.run(','        prompt=task.prompt,','        data=storage.context()', '    )','','    await storage.save(result)','    await notify.team(','        status="completed"','    )'].join('\n'),
    ['const agent = await AI.local();','const task = queue.next();','','const context = await docs.find(','  task.question',');','','const answer = await agent.run({','  prompt: task.prompt,','  context,','});','await task.complete(answer);'].join('\n')
  ];
  var routes=[
    'M604 256H626Q656 256 656 288V344Q656 380 693 380H723',
    'M790 252V337',
    'M947 253Q932 253 932 278V313Q932 354 900 354H860',
    'M617 441Q629 417 653 417H724',
    'M857 397H1051Q1079 397 1079 425V486',
    'M859 424H897Q938 424 938 462V478Q938 520 982 520H1007',
    'M790 461V483',
    'M827 526H850Q872 526 872 553V557Q872 579 892 579'
  ];
  function $(selector){return dialog.querySelector(selector)}
  function active(){return dialog.open&&dialog.dataset.demoType==='ai'}
  function escape(text){return text.replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function paint(text){
    var parts=text.split(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\b(?:async|await|def|const|return|from|import|if)\b|\b(?:LocalAgent|AI|generate|run|complete|search|find|next|save|team)\b)/g);
    return parts.map(function(part){
      var kind=/^["']/.test(part)?'string':/^(async|await|def|const|return|from|import|if)$/.test(part)?'keyword':/^(LocalAgent|AI|generate|run|complete|search|find|next|save|team)$/.test(part)?'function':'';
      return kind?'<tspan class="ai-code-'+kind+'">'+escape(part)+'</tspan>':escape(part);
    }).join('');
  }
  function renderCode(complete){
    var index=Math.floor(elapsed/9000)%samples.length,code=samples[index];
    var length=complete?code.length:Math.min(code.length,Math.floor((elapsed%9000)*.055));
    if(index===lastSample&&length===lastLength)return;
    lastSample=index;lastLength=length;
    var lines=code.slice(0,length).split('\n');
    $('#aiMonitorCode').innerHTML=lines.map(function(line,i){return '<tspan x="0" y="'+(12+i*12)+'">'+paint(line)+'</tspan>'}).join('');
    var cursor=$('#aiMonitorCursor');
    cursor.setAttribute('x',Math.min(210,lines[lines.length-1].length*5.65));
    cursor.setAttribute('y',(lines.length-1)*12+3);
    $('.ai-demo-scene').dataset.codeSample=String(index);
    $('.ai-demo-scene').dataset.codeLength=String(length);
  }
  function stop(){
    cancelAnimationFrame(frame);frame=0;lastTime=0;clearTimeout(burstTimer);
    var scene=$('.ai-demo-scene');
    if(scene){scene.classList.add('is-suspended');scene.classList.remove('is-boosted')}
  }
  function tick(time){
    frame=0;if(!active()||document.hidden||paused||reduced.matches)return;
    elapsed+=Math.min(lastTime?time-lastTime:16,80);lastTime=time;
    renderCode(false);frame=requestAnimationFrame(tick);
  }
  function controls(){
    var toggle=$('[data-ai-pause]');
    if(!toggle)return;
    toggle.disabled=reduced.matches;toggle.textContent=reduced.matches?'Без анимации':paused?'Продолжить':'Пауза';
    toggle.setAttribute('aria-pressed',String(paused));
    dialog.querySelectorAll('[data-ai-pulse]').forEach(function(button){button.disabled=paused||reduced.matches});
    $('.ai-demo-status').textContent=reduced.matches?'Статичная демонстрация':paused?'Сценарий приостановлен':'Нейронная сеть активна';
  }
  function resume(){
    if(!active()||document.hidden||paused||reduced.matches)return;
    $('.ai-demo-scene').classList.remove('is-suspended');
    controls();
    if(!frame){lastTime=0;frame=requestAnimationFrame(tick)}
  }
  function start(){
    stop();elapsed=0;paused=false;lastSample=-1;lastLength=-1;
    var scene=$('.ai-demo-scene');
    scene.classList.remove('is-paused','is-boosted');scene.classList.add('is-restarting');
    void scene.offsetWidth;scene.classList.remove('is-restarting');
    renderCode(reduced.matches);controls();resume();
  }
  function pulse(){
    if(paused||reduced.matches)return;
    clearTimeout(burstTimer);var scene=$('.ai-demo-scene');
    scene.classList.remove('is-boosted');void scene.offsetWidth;scene.classList.add('is-boosted');
    $('.ai-demo-status').textContent='Демонстрационный импульс отправлен';
    burstTimer=setTimeout(function(){if(active()){scene.classList.remove('is-boosted');controls()}},1800);
  }
  function gear(){
    var points=[],step=Math.PI*2/10;
    for(var i=0;i<10;i++)for(var j=0;j<4;j++){
      var offset=[-.37,-.18,.18,.37][j],r=j===1||j===2?23:18;
      points.push((Math.cos(i*step+offset*step)*r).toFixed(2)+','+(Math.sin(i*step+offset*step)*r).toFixed(2));
    }
    return '<g class="ai-scene-gear"><polygon points="'+points.join(' ')+'"/><circle r="8"/></g>';
  }
  function infoCard(x,y,kind,index){
    var icons={
      doc:'<g class="ai-scene-document"><path class="ai-icon-stroke" d="M-14-20H5l10 10v28h-29zM5-20v10h10"/><path class="ai-scene-doc-lines" d="M-8-7H5M-8 0H7M-8 7H2"/><circle class="ai-scene-doc-badge" cx="13" cy="14" r="7"/><path class="ai-scene-doc-check" pathLength="1" d="m9 14 3 3 6-7"/></g>',
      image:'<rect class="ai-icon-stroke" x="-21" y="-20" width="42" height="39" rx="3"/><path class="ai-scene-image-mountain" d="m-18 15 12-17L3 9l8-11 9 17z"/><circle class="ai-scene-image-sun" cx="-9" cy="-10" r="4"/>',
      data:'<g class="ai-scene-database"><ellipse class="ai-icon-stroke" cy="-14" rx="17" ry="6"/><path class="ai-icon-stroke" d="M-17-14v27c0 9 34 9 34 0v-27"/><path class="ai-scene-db-layer" d="M-17-5c0 9 34 9 34 0"/><path class="ai-scene-db-layer ai-scene-db-layer--second" d="M-17 4c0 9 34 9 34 0"/><circle class="ai-scene-db-packet" cx="10" cy="-8" r="2.5"/></g>',
      gear:gear()
    };
    return '<g class="ai-scene-info" transform="translate('+x+' '+y+')" style="--node-delay:-'+index*.6+'s"><rect class="ai-scene-info-face" width="173" height="86" rx="16"/><g transform="translate(43 43)">'+icons[kind]+'</g>'+
      [38,68,31].map(function(width,i){return '<path class="ai-scene-info-line" d="M78 '+(28+i*15)+'h'+width+'"/><path class="ai-scene-info-sweep" pathLength="1" style="--line-delay:-'+(index*.6+i*.35)+'s" d="M78 '+(28+i*15)+'h'+width+'"/>'}).join('')+'</g>';
  }
  function rack(x,ys,width){
    return ys.map(function(y,i){return '<g class="ai-scene-server-row" style="--rack-delay:-'+(i*.32+x*.001)+'s"><rect class="ai-scene-server-led" x="'+x+'" y="'+(y-5)+'" width="3" height="10" rx="1.5"/><rect class="ai-scene-server-led ai-scene-server-led--right" x="'+(x+width)+'" y="'+(y-6)+'" width="2" height="12" rx="1"/>'+
      [0,1,2,3,4,5,6].map(function(n){return '<rect class="ai-scene-server-data" style="--data-delay:-'+(i*.32+n*.17)+'s" x="'+(x+12+n*5)+'" y="'+(y-1+(n%2))+'" width="2" height="1.5" rx=".5"/>'}).join('')+'</g>'}).join('');
  }
  function images(){
    var panels=[
      '<rect width="80" height="88" fill="url(#aiVisualSky)"/><circle cx="59" cy="22" r="11" fill="#c7d9ff"/><path d="m-5 69 29-40 31 37 16-20 18 42H-5z" fill="#213b85"/><path d="m16 40 8-11 13 16-12-4z" fill="#b7d9ff"/><path d="m-5 78 27-20 35 20 23-13v23H-5z" fill="#3b65bc"/><path d="M0 82q40-14 80 0" fill="none" stroke="#8bd8ff" stroke-width="2"/>',
      '<rect width="80" height="88" fill="url(#aiVisualNight)"/><circle cx="61" cy="20" r="9" fill="#c3ccff"/><path d="M0 84V42h13v42m2 0V29h17v55m3 0V46h12v38m4 0V35h18v49m3 0V51h8v33" fill="#1c2c69"/><path d="M20 36v36M26 36v36M57 42v31M63 42v31" stroke="#829bff" stroke-width="2" stroke-dasharray="3 5"/><path d="M0 86h80" stroke="#a3eaff" stroke-width="2"/>',
      '<rect width="80" height="88" fill="url(#aiVisualNight)"/><ellipse cx="40" cy="72" rx="25" ry="8" fill="#4265ff" opacity=".3"/><path d="m40 17 26 15-26 15-26-15z" fill="#b8d8ff"/><path d="m14 32 26 15v30L14 62z" fill="#3a60ce"/><path d="m40 47 26-15v30L40 77z" fill="#1c3693"/><path d="M40 47v30M14 32l26 15 26-15" fill="none" stroke="#9bdcff" stroke-width="1.5"/><circle cx="40" cy="47" r="3" fill="#e8ff4d"/>',
      '<rect width="80" height="88" fill="url(#aiVisualSky)"/><circle cx="20" cy="22" r="10" fill="#e0dcab"/><path d="M0 64q18-27 41-11T80 47v41H0z" fill="#305c8a"/><path d="M0 71q37-17 80-3v20H0z" fill="#6fafd0"/><path d="M2 80q24-7 73-4M5 85q27-4 57-3" fill="none" stroke="#bee9ed" stroke-width="1"/>'
    ];
    return panels.map(function(panel,i){return '<g class="ai-scene-preview-art'+(i===0?' ai-scene-preview-art--first':'')+'" style="animation-delay:'+([0,-12,-8,-4][i])+'s">'+panel+'</g>'}).join('');
  }
  function markup(){
    return '<div class="flow-demo-scene ai-demo-scene"><div class="ai-scene-stage"><svg class="ai-scene-svg" viewBox="60 58 1384 680" role="img" aria-labelledby="aiSceneTitle aiSceneDescription">'+
      '<title id="aiSceneTitle">ИИ связывает рабочие инструменты в единую систему</title><desc id="aiSceneDescription">На первом мониторе набирается код, на втором меняются изображения. Импульсы соединяют нейросеть, документы, данные и серверы. Шестерёнка вращается, индикаторы оборудования мигают.</desc>'+
      '<defs><linearGradient id="aiCardGradient" x2="1" y2="1"><stop stop-color="#111a32"/><stop offset="1" stop-color="#0b1021"/></linearGradient><linearGradient id="aiVisualSky" x2="0" y2="1"><stop stop-color="#5169bd"/><stop offset="1" stop-color="#13254d"/></linearGradient><linearGradient id="aiVisualNight" x2="0" y2="1"><stop stop-color="#1b2052"/><stop offset="1" stop-color="#090e22"/></linearGradient>'+
      '<clipPath id="aiCodeClip"><polygon points="196,353 417,373 420,536 196,535"/></clipPath><clipPath id="aiPreviewClip"><rect width="80" height="88" rx="4"/></clipPath></defs>'+
      '<image href="/img/demos/ai-studio.png" width="1495" height="790"/>'+
      '<g class="ai-scene-links">'+routes.map(function(path,i){return '<path class="ai-scene-link-track" d="'+path+'"/><path class="ai-scene-link-pulse" pathLength="1" style="--pulse-delay:-'+i*.43+'s;--pulse-duration:'+(2.7+i*.21)+'s" d="'+path+'"/>'}).join('')+'</g>'+
      '<rect class="ai-scene-core-halo" x="729" y="341" width="117" height="116" rx="20"/><rect class="ai-scene-core-light" x="749" y="361" width="79" height="77" rx="13"/>'+
      '<circle class="ai-scene-sync-ring" cx="789" cy="188" r="31"/>'+
      '<g clip-path="url(#aiCodeClip)"><polygon points="196,353 417,373 420,536 196,535" fill="#080e20"/><g transform="matrix(1 .08 .006 1 201 361)"><text class="ai-scene-monitor-code" id="aiMonitorCode"></text><rect class="ai-scene-monitor-cursor" id="aiMonitorCursor" width="1.2" height="10"/></g></g>'+
      '<g transform="matrix(1 -.025 -.005 1 507 379)"><rect width="96" height="164" rx="3" fill="#080e20"/><text class="ai-scene-monitor-label" x="8" y="12">VISION ENGINE</text><g transform="translate(8 23)" clip-path="url(#aiPreviewClip)">'+images()+'</g><rect class="ai-scene-preview-track" x="8" y="120" width="80" height="3" rx="1.5"/><rect class="ai-scene-preview-progress" x="8" y="120" width="80" height="3" rx="1.5"/><text class="ai-scene-monitor-label" x="8" y="137">LOCAL GENERATION</text><path class="ai-scene-preview-wave" d="m8 154 8-7 7 5 9-13 8 9 8-5 8 7 8-11 8 4 8-7"/></g>'+
      rack(1264,[239,299,359,420,479,539],103)+rack(1146,[337,392,448],108)+rack(1079,[519,568,618],95)+
      '<path class="ai-scene-floor-glow" d="m1058 669 119 9m20-33 75-12m15-17 107-17"/>'+
      infoCard(433,193,'doc',0)+infoCard(947,192,'image',1)+infoCard(654,482,'data',2)+infoCard(892,536,'gear',3)+
      '</svg><button type="button" class="ai-scene-core-hit" data-ai-pulse aria-label="Отправить демонстрационный нейронный импульс"></button></div>'+
      '<div class="ai-demo-controls"><span class="ai-demo-status" role="status" aria-live="polite"></span><div><button type="button" data-ai-pulse>Отправить импульс <span aria-hidden="true">↗</span></button><button type="button" data-ai-pause aria-pressed="false">Пауза</button></div></div></div>';
  }
  dialog.addEventListener('click',function(e){
    if(!active())return;
    if(e.target.closest('[data-ai-pulse]'))pulse();
    else if(e.target.closest('[data-ai-pause]')){
      paused=!paused;$('.ai-demo-scene').classList.toggle('is-paused',paused);
      if(paused)stop();else resume();controls();
    }
  });
  reduced.addEventListener('change',function(){
    if(!active())return;
    if(reduced.matches){stop();lastLength=-1;renderCode(true);controls()}else start();
  });
  window.RusAiDemo={markup:markup,start:start,stop:stop,resume:resume};
})();
