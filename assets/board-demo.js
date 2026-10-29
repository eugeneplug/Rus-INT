/* Самостоятельная демонстрация документооборота в окне направления. */
(function(){
  'use strict';
  var trigger=document.querySelector('[data-board-demo="onec"]');
  var dialog=document.getElementById('boardDemo');
  if(!trigger||!dialog)return;
  var reduced=matchMedia('(prefers-reduced-motion:reduce)');
  var docs=[
    {title:'Заказ №1042',done:'проведён'},
    {title:'Счёт №771',done:'проведён'},
    {title:'Накладная №88',done:'проведена'},
    {title:'Поступление на склад',done:'принято'},
    {title:'Платёж от клиента',done:'получен'},
    {title:'Реализация №1043',done:'проведена'}
  ];
  var documentIcon='<svg viewBox="0 0 18 20" aria-hidden="true"><path d="M4 1h6l5 5v13H3V1zM10 1v5h5M6 10h6M6 13h6M6 16h4"/></svg>';
  var check='<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m3 8 3 3 7-7"/></svg>';
  var arrow='<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 15 15 5M6 5h9v9"/></svg>';
  var built=false,states=[],previousFocus=null,wasLocked=false,consult=false;
  var stepTimer=0,finishTimer=0,closeTimer=0,processing=-1;
  function $(selector){return dialog.querySelector(selector)}
  function stop(){clearTimeout(stepTimer);clearTimeout(finishTimer);stepTimer=0;finishTimer=0}
  function build(){
    if(built)return;built=true;
    dialog.innerHTML='<div class="flow-demo-shell">'+
      '<button class="flow-demo-close" type="button" data-demo-close aria-label="Закрыть окно"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15"/></svg></button>'+
      '<span class="flow-demo-eyebrow">Направление</span><h2 class="flow-demo-title" id="demoTitle">Внедрение 1С</h2>'+
      '<div class="flow-demo-scene" role="group" aria-label="Демонстрация автоматической обработки документов"><div class="flow-demo-window">'+
      '<div class="flow-demo-bar"><span class="flow-demo-dots" aria-hidden="true"><i></i><i></i></span><span>Документы</span><span class="flow-demo-live">Автоматический обмен</span></div>'+
      '<div class="flow-demo-list">'+docs.map(function(doc,i){return '<button class="flow-doc" type="button" data-demo-doc="'+i+'"><span class="flow-doc-icon">'+documentIcon+'</span><span class="flow-doc-title">'+doc.title+'</span><span class="flow-doc-status"></span></button>'}).join('')+'</div>'+
      '<div class="flow-demo-bottom"><span class="flow-demo-count"></span><button type="button" class="flow-demo-restart" data-demo-restart><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M13 6a5 5 0 1 0 0 4M13 2v4H9"/></svg>Повторить</button></div></div></div>'+
      '<p class="flow-demo-description">Учёт, в котором любую цифру можно проверить до накладной или платежа. Связываем продажи, склад и финансы — без повторного ввода данных и ручных сверок.</p>'+
      '<p class="flow-demo-note">Демонстрационная версия. Иллюстрация процесса автоматизации от РУСИНТЕГРАЦИИ.</p>'+
      '<div class="flow-demo-actions"><a class="flow-demo-action flow-demo-action--primary" href="/services/onec/"><span>Смотреть направление</span><i>'+arrow+'</i></a>'+
      '<button class="flow-demo-action" type="button" data-demo-consult><span>Обсудить проект</span><i>'+arrow+'</i></button></div>'+
      '<p class="sr-only" id="flowDemoAnnouncement" role="status" aria-live="polite"></p></div>';
  }
  function update(){
    dialog.querySelectorAll('[data-demo-doc]').forEach(function(button,i){
      if(button.dataset.flowState===states[i])return;
      button.dataset.flowState=states[i];
      var running=states[i]==='running',done=states[i]==='done';
      var label=done?docs[i].done:running?'обработка':'в очереди';
      button.classList.toggle('is-running',running);button.classList.toggle('is-done',done);
      button.querySelector('.flow-doc-status').innerHTML=(running?'<span class="flow-doc-spinner" aria-hidden="true"></span>':done?check:'')+'<span>'+label+'</span>';
      button.setAttribute('aria-label',docs[i].title+'. '+label+'. Нажмите, чтобы повторить обработку.');
    });
    $('.flow-demo-count').textContent='Обработано '+states.filter(function(state){return state==='done'}).length+' из '+docs.length;
  }
  function reset(){
    stop();processing=-1;states=docs.map(function(){return reduced.matches?'done':'waiting'});update();
    $('#flowDemoAnnouncement').textContent='';
    if(!reduced.matches&&!document.hidden)stepTimer=setTimeout(next,500);
  }
  function next(){
    if(!dialog.open||reduced.matches||document.hidden)return;
    var index=states.indexOf('waiting');
    if(index<0){stepTimer=setTimeout(reset,2000);return}
    process(index,false);
  }
  function process(index,manual){
    stop();
    if(processing>=0){
      states[processing]='waiting';update();
      if(processing===index)void dialog.querySelector('[data-demo-doc="'+index+'"]').offsetWidth;
    }
    processing=index;states[index]='running';update();
    finishTimer=setTimeout(function(){
      states[index]='done';processing=-1;update();
      if(manual)$('#flowDemoAnnouncement').textContent=docs[index].title+': '+docs[index].done+'.';
      if(dialog.open&&!reduced.matches&&!document.hidden)stepTimer=setTimeout(next,200);
    },reduced.matches?0:1000);
  }
  function open(){
    if(dialog.open)return;
    clearTimeout(closeTimer);consult=false;build();
    previousFocus=document.activeElement;wasLocked=document.body.classList.contains('lock');
    document.body.classList.add('lock');dialog.classList.remove('is-closing');dialog.showModal();
    void dialog.offsetWidth;dialog.classList.add('is-active');dialog.scrollTop=0;
    reset();$('[data-demo-close]').focus({preventScroll:true});
  }
  function close(){
    if(!dialog.open||dialog.classList.contains('is-closing'))return;
    stop();dialog.classList.remove('is-active');dialog.classList.add('is-closing');
    closeTimer=setTimeout(function(){dialog.close()},reduced.matches?0:160);
  }
  trigger.addEventListener('click',open);
  dialog.addEventListener('close',function(){
    stop();clearTimeout(closeTimer);dialog.classList.remove('is-active','is-closing');
    if(!wasLocked)document.body.classList.remove('lock');
    if(consult){
      consult=false;var button=document.querySelector('.board-cta[data-go]');
      if(button){button.click();var topic=document.getElementById('p4');if(topic){topic.value='внедрение 1С';topic.dispatchEvent(new Event('change',{bubbles:true}))}}
    }else if(previousFocus&&previousFocus.isConnected)previousFocus.focus({preventScroll:true});
  });
  dialog.addEventListener('cancel',function(e){e.preventDefault();close()});
  dialog.addEventListener('keydown',function(e){
    if(e.key!=='Tab')return;
    var controls=Array.from(dialog.querySelectorAll('button,a[href]')).filter(function(el){return !el.disabled&&el.getClientRects().length>0});
    var first=controls[0],last=controls[controls.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
  });
  dialog.addEventListener('click',function(e){
    if(e.target===dialog||e.target.closest('[data-demo-close]')){close();return}
    if(e.target.closest('[data-demo-consult]')){consult=true;close();return}
    if(e.target.closest('[data-demo-restart]')){reset();return}
    var button=e.target.closest('[data-demo-doc]');if(button)process(Number(button.dataset.demoDoc),true);
  });
  reduced.addEventListener('change',function(){if(dialog.open)reset()});
  document.addEventListener('visibilitychange',function(){
    if(!dialog.open||reduced.matches)return;
    if(document.hidden){stop();if(processing>=0){states[processing]='waiting';processing=-1;update()}}
    else next();
  });
})();
