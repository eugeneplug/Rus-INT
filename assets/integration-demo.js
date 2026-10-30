/* Автоматическая иллюстрация обмена между системами. */
(function(){
  'use strict';
  var dialog=document.getElementById('boardDemo');
  if(!dialog)return;
  var reduced=matchMedia('(prefers-reduced-motion:reduce)');
  var view=null,frame=0,lastTime=0;
  var systems=[
    {id:'site',name:'Сайт',detail:'Заказы и обращения',side:1,x:4,y:12,icon:'<rect x="3" y="5" width="26" height="21" rx="4"/><path d="M3 11h26M8 8h.1M12 8h.1m0 8-4 3 4 3m8-6 4 3-4 3"/>'},
    {id:'crm',name:'Битрикс24',detail:'Клиенты и сделки',side:-1,x:68,y:12,icon:'<circle cx="16" cy="10" r="4"/><path d="M8 26v-3a8 8 0 0 1 16 0v3M4 11l2 2 3-4m14 0 2 2 4-4"/>'},
    {id:'onec',name:'1С',detail:'Учёт и документы',side:1,x:4,y:65,icon:'<path d="M7 10h4v14m-6 0h12M25 10a8 8 0 1 0 0 14M24 14a4 4 0 1 0 0 6"/>'},
    {id:'stock',name:'Склад',detail:'Товары и остатки',side:-1,x:68,y:65,icon:'<path d="m16 3 12 7v13l-12 7-12-7V10zM4 10l12 7 12-7M16 17v13M10 7l12 7v5"/>'}
  ];
  var pairs=[['site','crm'],['crm','onec'],['onec','stock'],['site','stock'],['site','onec'],['crm','stock']];
  var messages={site:'Заказ передан',crm:'Сделка обновлена',onec:'Документ проведён',stock:'Остатки обновлены'};
  var drawDuration=660;
  function active(){return dialog.open&&dialog.dataset.demoType==='integration'}
  function markup(){
    return '<div class="flow-demo-scene integration-demo-scene"><div class="link-demo-canvas" role="img" aria-label="Анимация автоматического обмена заказами, документами и остатками между сайтом, Битрикс24, 1С и складом">'+
      '<svg class="link-demo-wires" viewBox="0 0 600 340" preserveAspectRatio="none" aria-hidden="true"><defs><filter id="linkDemoGlow" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="3"/></filter></defs><g class="link-demo-edges"></g></svg>'+
      '<div class="link-demo-center" aria-hidden="true"><span></span><svg viewBox="0 0 40 40"><path d="M12 12h16L20 28z"/><circle cx="12" cy="12" r="3"/><circle cx="28" cy="12" r="3"/><circle cx="20" cy="28" r="3"/></svg></div>'+
      systems.map(function(system,index){return '<div class="link-demo-node link-demo-node--'+system.id+'" data-link-node="'+system.id+'" style="--link-x:'+system.x+'%;--link-y:'+system.y+'%;--link-delay:'+index*.06+'s"><span class="link-demo-node-icon" aria-hidden="true"><svg viewBox="0 0 32 32">'+system.icon+'</svg></span><span class="link-demo-node-name">'+system.name+'</span><span class="link-demo-node-detail">'+system.detail+'</span><span class="link-demo-node-activity" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span><span class="link-demo-port" aria-hidden="true"><i></i></span><span class="link-demo-receive" aria-hidden="true"></span></div>'}).join('')+'</div></div>';
  }
  function port(id){
    var rect=view.canvas.getBoundingClientRect(),box=view.nodes[id].element.querySelector('.link-demo-port').getBoundingClientRect();
    return {x:(box.left+box.width/2-rect.left)/rect.width*600,y:(box.top+box.height/2-rect.top)/rect.height*340};
  }
  function curve(a,b){
    var start=port(a),end=port(b),sideA=view.nodes[a].side,sideB=view.nodes[b].side;
    var reach=sideA===sideB?125:Math.max(60,Math.min(125,Math.abs(end.x-start.x)*.46));
    return [start,{x:start.x+sideA*reach,y:start.y},{x:end.x+sideB*reach,y:end.y},end];
  }
  function path(points){return 'M'+points[0].x+','+points[0].y+'C'+points[1].x+','+points[1].y+' '+points[2].x+','+points[2].y+' '+points[3].x+','+points[3].y}
  function setPacket(packet,points,t){
    var u=1-t,x=u*u*u*points[0].x+3*u*u*t*points[1].x+3*u*t*t*points[2].x+t*t*t*points[3].x,y=u*u*u*points[0].y+3*u*u*t*points[1].y+3*u*t*t*points[2].y+t*t*t*points[3].y;
    packet.setAttribute('transform','translate('+x.toFixed(2)+' '+y.toFixed(2)+')');
  }
  function geometry(){
    if(!view||!view.canvas.getBoundingClientRect().width)return;
    view.edges.forEach(function(edge){edge.points=curve(edge.a,edge.b);var d=path(edge.points);edge.element.querySelectorAll('path').forEach(function(element){element.setAttribute('d',d)})});
    paint(0);
  }
  function pulse(id){
    if(reduced.matches)return;
    var node=view.nodes[id];node.until=view.elapsed+900;node.textUntil=view.elapsed+1700;
    node.element.classList.add('is-receiving');node.detail.textContent=messages[id];
  }
  function edge(a,b,index){
    var element=document.createElementNS('http://www.w3.org/2000/svg','g');element.setAttribute('class','link-demo-wire');element.setAttribute('data-link-edge',[a,b].sort().join(':'));element.style.opacity='0';
    element.innerHTML='<path class="link-demo-wire-shadow" pathLength="1"/><path class="link-demo-wire-glow" pathLength="1"/><path class="link-demo-wire-line" pathLength="1"/><g class="link-demo-packets"><g class="link-demo-packet"><circle r="6" class="link-demo-packet-halo"/><circle r="2.5"/></g><g class="link-demo-packet link-demo-packet--return"><circle r="5" class="link-demo-packet-halo"/><circle r="2"/></g></g>';
    view.layer.appendChild(element);
    return {a:a,b:b,element:element,points:curve(a,b),packetLayer:element.querySelector('.link-demo-packets'),packets:element.querySelectorAll('.link-demo-packet'),start:260+index*380,period:2500+index%4*170,activated:false,lastReveal:-1,forwardCycle:0,returnCycle:0};
  }
  function paint(dt){
    if(!view)return;
    view.elapsed+=dt;if(reduced.matches)view.elapsed=Math.max(view.elapsed,3000);
    view.edges.forEach(function(edge){
      var local=view.elapsed-edge.start,reveal=Math.max(0,Math.min(1,local/drawDuration));
      if(reveal!==edge.lastReveal){
        edge.lastReveal=reveal;edge.element.style.opacity=String(Math.min(1,reveal*3));edge.element.style.setProperty('--link-unrevealed',Math.pow(1-reveal,3).toFixed(4));
        edge.packetLayer.style.opacity=reveal===1?'1':'0';
      }
      if(reveal<1)return;
      if(!edge.activated){edge.activated=true;view.nodes[edge.a].element.classList.add('is-connected');view.nodes[edge.b].element.classList.add('is-connected');pulse(edge.a);pulse(edge.b)}
      var age=local-drawDuration,progress=(age%edge.period)/edge.period,forwardCycle=Math.floor(age/edge.period),returnCycle=Math.floor((age+edge.period*.47)/edge.period);
      setPacket(edge.packets[0],edge.points,progress);setPacket(edge.packets[1],edge.points,1-((age+edge.period*.47)%edge.period)/edge.period);
      if(forwardCycle!==edge.forwardCycle){edge.forwardCycle=forwardCycle;pulse(edge.b)}
      if(returnCycle!==edge.returnCycle){edge.returnCycle=returnCycle;pulse(edge.a)}
    });
    Object.keys(view.nodes).forEach(function(id){var node=view.nodes[id];if(node.until&&view.elapsed>=node.until){node.until=0;node.element.classList.remove('is-receiving')}if(node.textUntil&&view.elapsed>=node.textUntil){node.textUntil=0;node.detail.textContent=node.defaultDetail}});
  }
  function tick(time){
    frame=0;if(!view||!active()||document.hidden||reduced.matches)return;
    var dt=lastTime?Math.min(80,time-lastTime):0;lastTime=time;paint(dt);frame=requestAnimationFrame(tick);
  }
  function stop(){if(frame)cancelAnimationFrame(frame);frame=0;lastTime=0;if(view)view.host.classList.add('is-paused')}
  function resume(){
    if(!view||!active()||document.hidden)return;
    stop();view.host.classList.remove('is-paused');paint(0);if(!reduced.matches)frame=requestAnimationFrame(tick);
  }
  function start(){
    stop();if(view)view.observer.disconnect();
    var host=dialog.querySelector('.integration-demo-scene');
    view={host:host,canvas:host.querySelector('.link-demo-canvas'),layer:host.querySelector('.link-demo-edges'),nodes:{},edges:[],elapsed:0};view.layer.replaceChildren();
    systems.forEach(function(system){var element=host.querySelector('[data-link-node="'+system.id+'"]');element.classList.remove('is-connected','is-receiving');view.nodes[system.id]={element:element,detail:element.querySelector('.link-demo-node-detail'),defaultDetail:system.detail,side:system.side,until:0,textUntil:0};view.nodes[system.id].detail.textContent=system.detail});
    view.edges=pairs.map(function(pair,index){return edge(pair[0],pair[1],index)});
    view.observer=new ResizeObserver(geometry);view.observer.observe(view.canvas);geometry();resume();
  }
  reduced.addEventListener('change',function(){if(active())resume()});
  window.RusIntegrationDemo={markup:markup,start:start,stop:stop,resume:resume};
})();
