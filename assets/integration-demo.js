/* Интерактивная демонстрация обмена. Все связи и события остаются в браузере. */
(function(){
  'use strict';
  var dialog=document.getElementById('boardDemo');
  if(!dialog)return;
  var reduced=matchMedia('(prefers-reduced-motion:reduce)');
  var view=null,frame=0,lastTime=0,sequence=0;
  var systems=[
    {id:'site',name:'Сайт',detail:'Заказы и обращения',side:1,x:4,y:12,icon:'<rect x="3" y="5" width="26" height="21" rx="4"/><path d="M3 11h26M8 8h.1M12 8h.1m0 8-4 3 4 3m8-6 4 3-4 3"/>'},
    {id:'crm',name:'Битрикс24',detail:'Клиенты и сделки',side:-1,x:68,y:12,icon:'<circle cx="16" cy="10" r="4"/><path d="M8 26v-3a8 8 0 0 1 16 0v3M4 11l2 2 3-4m14 0 2 2 4-4"/>'},
    {id:'onec',name:'1С',detail:'Учёт и документы',side:1,x:4,y:65,icon:'<path d="M7 10h4v14m-6 0h12M25 10a8 8 0 1 0 0 14M24 14a4 4 0 1 0 0 6"/>'},
    {id:'stock',name:'Склад',detail:'Товары и остатки',side:-1,x:68,y:65,icon:'<path d="m16 3 12 7v13l-12 7-12-7V10zM4 10l12 7 12-7M16 17v13M10 7l12 7v5"/>'}
  ];
  var names={};systems.forEach(function(system){names[system.id]=system.name});
  var messages={site:'Заказ передан',crm:'Сделка обновлена',onec:'Документ проведён',stock:'Остатки обновлены'};
  var exchanges={
    'crm:site':'Заказы и клиенты',
    'onec:site':'Заказы и счета',
    'site:stock':'Каталог и остатки',
    'crm:onec':'Сделки и документы',
    'crm:stock':'Заказы и резервы',
    'onec:stock':'Товары и документы'
  };
  function active(){return dialog.open&&dialog.dataset.demoType==='integration'}
  function markup(){
    return '<div class="flow-demo-scene integration-demo-scene is-empty">'+
      '<div class="link-demo-canvas" role="group" aria-label="Конструктор интеграций" aria-describedby="integrationDemoHelp">'+
      '<svg class="link-demo-wires" viewBox="0 0 600 340" preserveAspectRatio="none" aria-label="Созданные связи"><defs><filter id="linkDemoGlow" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="3"/></filter></defs><path class="link-demo-guide" fill="none"/><g class="link-demo-edges"></g><path class="link-demo-draft" fill="none" hidden/></svg>'+
      '<div class="link-demo-center" aria-hidden="true"><span></span><svg viewBox="0 0 40 40"><path d="M12 12h16L20 28z"/><circle cx="12" cy="12" r="3"/><circle cx="28" cy="12" r="3"/><circle cx="20" cy="28" r="3"/></svg></div>'+
      systems.map(function(system){return '<button type="button" class="link-demo-node link-demo-node--'+system.id+'" data-link-node="'+system.id+'" style="--link-x:'+system.x+'%;--link-y:'+system.y+'%;--link-delay:'+systems.indexOf(system)*.06+'s" aria-label="'+system.name+'. Выбрать систему для соединения" aria-pressed="false"><span class="link-demo-node-icon" aria-hidden="true"><svg viewBox="0 0 32 32">'+system.icon+'</svg></span><span class="link-demo-node-name">'+system.name+'</span><span class="link-demo-node-detail" aria-hidden="true">'+system.detail+'</span><span class="link-demo-node-activity" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span><span class="link-demo-port" aria-hidden="true"><i></i></span><span class="link-demo-receive" aria-hidden="true"></span></button>'}).join('')+
      '</div><div class="link-demo-bottom"><span class="link-demo-hint">Зажмите разъём и соедините две системы</span><span class="link-demo-count" aria-hidden="true"></span><button type="button" class="link-demo-clear" data-link-clear aria-label="Очистить все связи" disabled><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M16 8a6 6 0 1 0-.5 5M16 3v5h-5"/></svg></button></div>'+
      '<p class="sr-only" id="integrationDemoHelp">Перетащите разъём одной системы к другой или выберите две системы последовательными нажатиями. Нажмите на линию, чтобы удалить связь. Escape отменяет выбор.</p></div>';
  }
  function key(a,b){return [a,b].sort().join(':')}
  function announce(message){var live=dialog.querySelector('#flowDemoAnnouncement');if(live)live.textContent=message}
  function point(clientX,clientY){var rect=view.canvas.getBoundingClientRect();return {x:(clientX-rect.left)/rect.width*600,y:(clientY-rect.top)/rect.height*340}}
  function port(id){var box=view.nodes[id].button.querySelector('.link-demo-port').getBoundingClientRect();return point(box.left+box.width/2,box.top+box.height/2)}
  function curve(a,b){
    var start=port(a),end=typeof b==='string'?port(b):b;
    var sideA=view.nodes[a].side,sideB=typeof b==='string'?view.nodes[b].side:-sideA;
    var reach=sideA===sideB?125:Math.max(60,Math.min(125,Math.abs(end.x-start.x)*.46));
    return [start,{x:start.x+sideA*reach,y:start.y},{x:end.x+sideB*reach,y:end.y},end];
  }
  function path(points){return 'M'+points[0].x+','+points[0].y+'C'+points[1].x+','+points[1].y+' '+points[2].x+','+points[2].y+' '+points[3].x+','+points[3].y}
  function position(points,t){var u=1-t;return {x:u*u*u*points[0].x+3*u*u*t*points[1].x+3*u*t*t*points[2].x+t*t*t*points[3].x,y:u*u*u*points[0].y+3*u*u*t*points[1].y+3*u*t*t*points[2].y+t*t*t*points[3].y}}
  function setPacket(packet,points,t){var p=position(points,t);packet.setAttribute('transform','translate('+p.x.toFixed(2)+' '+p.y.toFixed(2)+')')}
  function geometry(){
    if(!view||!view.canvas.getBoundingClientRect().width)return;
    view.edges.forEach(function(edge){edge.points=curve(edge.a,edge.b);var d=path(edge.points);edge.element.querySelectorAll('path').forEach(function(element){element.setAttribute('d',d)})});
    view.guide.setAttribute('d',path(curve('site','crm')));
    if(view.pointer)draft(view.pointer.x,view.pointer.y);
  }
  function hint(message){view.hint.textContent=message|| (view.selected?'Теперь выберите вторую систему':view.edges.length?'Новая связь — между системами. Удалить — нажмите линию.':'Зажмите разъём и соедините две системы')}
  function refresh(){
    var count=view.edges.length;view.host.classList.toggle('is-empty',!count);view.clear.disabled=!count;
    view.count.textContent=count?count+' '+(count===1?'связь':count<5?'связи':'связей'):'';
    Object.keys(view.nodes).forEach(function(id){
      var node=view.nodes[id],connected=view.edges.some(function(edge){return edge.a===id||edge.b===id});
      node.button.classList.toggle('is-connected',connected);node.button.classList.toggle('is-selected',view.selected===id);
      node.button.classList.toggle('is-available',!!view.selected&&view.selected!==id);node.button.setAttribute('aria-pressed',String(view.selected===id));
    });
  }
  function select(id){view.selected=id;view.pointer=null;view.draft.hidden=true;refresh();hint()}
  function release(){
    if(!view||!view.drag)return;
    var drag=view.drag;view.drag=null;
    var button=view.nodes[drag.from].button;button.classList.remove('is-drag-source');
    if(button.hasPointerCapture(drag.id))button.releasePointerCapture(drag.id);
  }
  function cancel(){
    if(!view)return;
    if(view.drag&&view.drag.moved)view.suppressClickUntil=performance.now()+350;
    release();view.selected=null;view.pointer=null;view.draft.hidden=true;view.host.classList.remove('is-dragging');
    Object.keys(view.nodes).forEach(function(id){view.nodes[id].button.classList.remove('is-drop-target')});refresh();hint();
  }
  function target(x,y,from){
    var found=null;
    systems.forEach(function(system){
      if(system.id===from)return;
      var button=view.nodes[system.id].button,rect=button.getBoundingClientRect(),socket=button.querySelector('.link-demo-port').getBoundingClientRect();
      var dx=x-socket.left-socket.width/2,dy=y-socket.top-socket.height/2;
      if((x>=rect.left-5&&x<=rect.right+5&&y>=rect.top-5&&y<=rect.bottom+5)||dx*dx+dy*dy<34*34)found=system.id;
    });return found;
  }
  function draft(x,y){
    var from=view.drag?view.drag.from:view.selected;if(!from)return;
    var to=target(x,y,from),end=point(x,y);end.x=Math.max(-10,Math.min(610,end.x));end.y=Math.max(-10,Math.min(350,end.y));
    view.draft.hidden=false;view.draft.setAttribute('d',path(curve(from,to||end)));view.draft.classList.toggle('is-snapped',!!to);
    Object.keys(view.nodes).forEach(function(id){view.nodes[id].button.classList.toggle('is-drop-target',id===to)});
  }
  function pulse(id,message){
    var node=view.nodes[id];node.until=view.elapsed+650;node.textUntil=view.elapsed+1700;node.button.classList.add('is-receiving');
    node.detail.textContent=message||messages[id];
    if(reduced.matches){node.button.classList.remove('is-receiving');node.detail.textContent='Обмен подключён'}
  }
  function connect(a,b){
    if(a===b)return;
    var id=key(a,b);
    if(view.edges.some(function(edge){return edge.id===id})){cancel();hint('Эти системы уже связаны');announce(names[a]+' и '+names[b]+': связь уже работает.');return}
    var points=curve(a,b),element=document.createElementNS('http://www.w3.org/2000/svg','g');
    element.setAttribute('class','link-demo-wire');element.setAttribute('data-link-edge',id);element.setAttribute('role','button');element.setAttribute('tabindex','0');element.setAttribute('aria-label',names[a]+' и '+names[b]+'. Удалить связь');
    var d=path(points);
    element.innerHTML='<path class="link-demo-wire-shadow" d="'+d+'"/><path class="link-demo-wire-glow" d="'+d+'"/><path class="link-demo-wire-line" pathLength="1" d="'+d+'"/><g class="link-demo-packet"><circle r="6" class="link-demo-packet-halo"/><circle r="2.5"/></g><g class="link-demo-packet link-demo-packet--return"><circle r="5" class="link-demo-packet-halo"/><circle r="2"/></g><path class="link-demo-wire-hit" d="'+d+'"/>';
    view.layer.appendChild(element);
    var edge={id:id,a:a,b:b,element:element,points:points,packets:element.querySelectorAll('.link-demo-packet'),age:0,period:2500+(sequence++%4)*170,forwardCycle:0,returnCycle:0};
    view.edges.push(edge);setPacket(edge.packets[0],points,0);setPacket(edge.packets[1],points,1);
    cancel();pulse(a,'Связь установлена');pulse(b,'Связь установлена');hint(names[a]+' ↔ '+names[b]+' · '+exchanges[id]);announce('Связь создана: '+names[a]+' и '+names[b]+'.');
    resume();
  }
  function remove(id,focus){
    var index=view.edges.findIndex(function(edge){return edge.id===id});if(index<0)return;
    var edge=view.edges.splice(index,1)[0];edge.element.remove();refresh();hint();
    [edge.a,edge.b].forEach(function(nodeId){var node=view.nodes[nodeId];node.detail.textContent=node.defaultDetail;node.button.classList.remove('is-receiving');node.until=0;node.textUntil=0});
    announce('Связь удалена: '+names[edge.a]+' и '+names[edge.b]+'.');if(focus)view.nodes[edge.a].button.focus({preventScroll:true});
    if(!view.edges.length)stopFrame();
  }
  function paint(dt){
    view.elapsed+=dt;
    view.edges.forEach(function(edge){
      edge.age+=dt;var progress=(edge.age%edge.period)/edge.period,forwardCycle=Math.floor(edge.age/edge.period),returnCycle=Math.floor((edge.age+edge.period*.47)/edge.period);
      setPacket(edge.packets[0],edge.points,progress);setPacket(edge.packets[1],edge.points,1-((edge.age+edge.period*.47)%edge.period)/edge.period);
      if(forwardCycle!==edge.forwardCycle){edge.forwardCycle=forwardCycle;pulse(edge.b)}
      if(returnCycle!==edge.returnCycle){edge.returnCycle=returnCycle;pulse(edge.a)}
    });
    Object.keys(view.nodes).forEach(function(id){var node=view.nodes[id];if(node.until&&view.elapsed>=node.until){node.until=0;node.button.classList.remove('is-receiving')}if(node.textUntil&&view.elapsed>=node.textUntil){node.textUntil=0;node.detail.textContent=node.defaultDetail}});
  }
  function tick(time){
    frame=0;if(!view||!active()||document.hidden||reduced.matches)return;
    var dt=lastTime?Math.min(80,time-lastTime):0;lastTime=time;paint(dt);
    if(view.edges.length)frame=requestAnimationFrame(tick);
  }
  function stopFrame(){if(frame)cancelAnimationFrame(frame);frame=0;lastTime=0}
  function stop(){stopFrame();if(view){view.host.classList.add('is-paused');cancel()}}
  function resume(){
    if(!view||!active()||document.hidden)return;
    stopFrame();view.host.classList.remove('is-paused');paint(0);
    if(view.edges.length&&!reduced.matches)frame=requestAnimationFrame(tick);
  }
  function start(){
    stop();if(view){view.observer.disconnect();view.cleanups.forEach(function(cleanup){cleanup()})}
    var host=dialog.querySelector('.integration-demo-scene');
    view={host:host,canvas:host.querySelector('.link-demo-canvas'),layer:host.querySelector('.link-demo-edges'),draft:host.querySelector('.link-demo-draft'),guide:host.querySelector('.link-demo-guide'),hint:host.querySelector('.link-demo-hint'),count:host.querySelector('.link-demo-count'),clear:host.querySelector('[data-link-clear]'),nodes:{},edges:[],selected:null,drag:null,pointer:null,suppressClickUntil:0,elapsed:0,cleanups:[]};
    view.layer.replaceChildren();
    systems.forEach(function(system){var button=host.querySelector('[data-link-node="'+system.id+'"]');view.nodes[system.id]={button:button,detail:button.querySelector('.link-demo-node-detail'),defaultDetail:system.detail,side:system.side,until:0,textUntil:0};button.classList.remove('is-receiving','is-drag-source','is-drop-target');view.nodes[system.id].detail.textContent=system.detail});
    function listen(element,event,handler,options){element.addEventListener(event,handler,options);view.cleanups.push(function(){element.removeEventListener(event,handler,options)})}
    listen(view.canvas,'pointerdown',function(event){
      var button=event.target.closest('[data-link-node]');if(!button||event.button!==0||event.isPrimary===false||view.drag)return;
      event.preventDefault();button.focus({preventScroll:true});view.drag={id:event.pointerId,from:button.dataset.linkNode,x:event.clientX,y:event.clientY,moved:false};button.setPointerCapture(event.pointerId);
    });
    listen(view.canvas,'pointermove',function(event){
      if(view.drag){
        if(event.pointerId!==view.drag.id)return;
        if(!view.drag.moved&&Math.hypot(event.clientX-view.drag.x,event.clientY-view.drag.y)<5)return;
        view.drag.moved=true;view.selected=view.drag.from;view.nodes[view.drag.from].button.classList.add('is-drag-source');view.host.classList.add('is-dragging');refresh();hint('Отпустите разъём над другой системой');
      }else if(!view.selected)return;
      view.pointer={x:event.clientX,y:event.clientY};draft(event.clientX,event.clientY);
    });
    listen(view.canvas,'pointerup',function(event){
      if(!view.drag||view.drag.id!==event.pointerId)return;
      var from=view.drag.from,moved=view.drag.moved,to=moved?target(event.clientX,event.clientY,from):null;release();
      if(moved){view.suppressClickUntil=performance.now()+350;cancel();if(to)connect(from,to)}
    });
    listen(view.canvas,'pointercancel',function(){cancel()});
    listen(view.canvas,'lostpointercapture',function(){if(view.drag)cancel()});
    listen(view.canvas,'pointerleave',function(){if(!view.drag){view.draft.hidden=true;view.pointer=null}});
    listen(view.canvas,'click',function(event){
      if(event.detail>0&&performance.now()<view.suppressClickUntil){view.suppressClickUntil=0;event.preventDefault();event.stopPropagation();return}
      var node=event.target.closest('[data-link-node]'),edge=event.target.closest('[data-link-edge]');
      if(node){var id=node.dataset.linkNode;if(view.selected&&view.selected!==id)connect(view.selected,id);else select(view.selected===id?null:id)}
      else if(edge)remove(edge.getAttribute('data-link-edge'),true);
    });
    listen(view.canvas,'keydown',function(event){
      if(event.key==='Escape'&&(view.drag||view.selected)){event.preventDefault();event.stopPropagation();cancel();return}
      if(event.key==='Tab'&&view.drag)cancel();
      var edge=event.target.closest('[data-link-edge]');if(edge&&['Enter',' ','Delete','Backspace'].includes(event.key)){event.preventDefault();remove(edge.getAttribute('data-link-edge'),true)}
    });
    listen(view.clear,'click',function(){cancel();view.edges.slice().forEach(function(edge){remove(edge.id,false)});announce('Все связи очищены.')});
    listen(window,'blur',function(){if(view.drag)cancel()});
    view.observer=new ResizeObserver(geometry);view.observer.observe(view.canvas);geometry();refresh();hint();resume();
  }
  reduced.addEventListener('change',function(){if(active())resume()});
  window.RusIntegrationDemo={markup:markup,start:start,stop:stop,resume:resume};
})();
