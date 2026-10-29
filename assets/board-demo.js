/* Самостоятельные интерактивные иллюстрации направлений. */
(function(){
  'use strict';
  var triggers=document.querySelectorAll('[data-board-demo]');
  var dialog=document.getElementById('boardDemo');
  if(!triggers.length||!dialog)return;
  var active='onec';
  var settings={
    onec:{title:'Внедрение 1С',url:'/services/onec/',topic:'внедрение 1С',description:'Учёт, в котором любую цифру можно проверить до накладной или платежа. Связываем продажи, склад и финансы — без повторного ввода данных и ручных сверок.'},
    bitrix:{title:'Внедрение Битрикс24',url:'/services/bitrix/',topic:'внедрение Битрикс24',description:'Объединяем клиентов, переписку и задачи в одном процессе. Настраиваем CRM под вашу воронку, чтобы команда видела следующий шаг, а обращения не терялись между отделами.'}
  };
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
  var built='',states=[],previousFocus=null,wasLocked=false,consult=false;
  var stepTimer=0,finishTimer=0,closeTimer=0,processing=-1;
  var suite=null,suiteTimer=0,replyTimer=0;
  function $(selector){return dialog.querySelector(selector)}
  function stop(){clearTimeout(stepTimer);clearTimeout(finishTimer);clearTimeout(suiteTimer);clearTimeout(replyTimer);stepTimer=0;finishTimer=0;suiteTimer=0;replyTimer=0}
  function build(){
    if(built===active)return;built=active;
    var config=settings[active];dialog.dataset.demoType=active;
    var scene=active==='bitrix'?suiteMarkup():
      '<div class="flow-demo-scene" role="group" aria-label="Демонстрация автоматической обработки документов"><div class="flow-demo-window">'+
      '<div class="flow-demo-bar"><span class="flow-demo-dots" aria-hidden="true"><i></i><i></i></span><span>Документы</span><span class="flow-demo-live">Автоматический обмен</span></div>'+
      '<div class="flow-demo-list">'+docs.map(function(doc,i){return '<button class="flow-doc" type="button" data-demo-doc="'+i+'"><span class="flow-doc-icon">'+documentIcon+'</span><span class="flow-doc-title">'+doc.title+'</span><span class="flow-doc-status"></span></button>'}).join('')+'</div>'+
      '<div class="flow-demo-bottom"><span class="flow-demo-count"></span><button type="button" class="flow-demo-restart" data-demo-restart><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M13 6a5 5 0 1 0 0 4M13 2v4H9"/></svg>Повторить</button></div></div></div>';
    dialog.innerHTML='<div class="flow-demo-shell">'+
      '<button class="flow-demo-close" type="button" data-demo-close aria-label="Закрыть окно"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15"/></svg></button>'+
      '<span class="flow-demo-eyebrow">Направление</span><h2 class="flow-demo-title" id="demoTitle">'+config.title+'</h2>'+scene+
      '<p class="flow-demo-description">'+config.description+'</p>'+
      '<p class="flow-demo-note">Демонстрационная версия. Иллюстрация процесса автоматизации от РУСИНТЕГРАЦИИ.</p>'+
      '<div class="flow-demo-actions"><a class="flow-demo-action flow-demo-action--primary" href="'+config.url+'"><span>Смотреть направление</span><i>'+arrow+'</i></a>'+
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
    if(active==='bitrix'){resetSuite();return}
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
  function open(type){
    if(dialog.open||!settings[type])return;
    active=type;clearTimeout(closeTimer);consult=false;build();
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
  triggers.forEach(function(trigger){trigger.addEventListener('click',function(){open(trigger.dataset.boardDemo)})});
  dialog.addEventListener('close',function(){
    stop();clearTimeout(closeTimer);dialog.classList.remove('is-active','is-closing');
    if(!wasLocked)document.body.classList.remove('lock');
    if(consult){
      consult=false;var button=document.querySelector('.board-cta[data-go]');
      if(button){button.click();var topic=document.getElementById('p4');if(topic){topic.value=settings[active].topic;topic.dispatchEvent(new Event('change',{bubbles:true}))}}
    }else if(previousFocus&&previousFocus.isConnected)previousFocus.focus({preventScroll:true});
  });
  dialog.addEventListener('cancel',function(e){e.preventDefault();close()});
  dialog.addEventListener('keydown',function(e){
    var tab=e.target.closest('[data-suite-tab]');
    if(tab&&['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){
      e.preventDefault();var names=['crm','chat','tasks'],index=names.indexOf(tab.dataset.suiteTab);
      index=e.key==='Home'?0:e.key==='End'?2:(index+(e.key==='ArrowRight'?1:2))%3;
      showSuiteTab(names[index],true);$('[data-suite-tab="'+names[index]+'"]').focus();return;
    }
    if(e.key!=='Tab')return;
    var controls=Array.from(dialog.querySelectorAll('button,a[href],input')).filter(function(el){return !el.disabled&&el.tabIndex>=0&&el.getClientRects().length>0});
    var first=controls[0],last=controls[controls.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
  });
  dialog.addEventListener('click',function(e){
    if(e.target===dialog||e.target.closest('[data-demo-close]')){close();return}
    if(e.target.closest('[data-demo-consult]')){consult=true;close();return}
    if(e.target.closest('[data-demo-restart]')){reset();return}
    if(active==='bitrix'){
      var tab=e.target.closest('[data-suite-tab]');if(tab){showSuiteTab(tab.dataset.suiteTab,true);return}
      var deal=e.target.closest('[data-suite-move]');if(deal)moveDeal(Number(deal.dataset.suiteMove),true);
      return;
    }
    var button=e.target.closest('[data-demo-doc]');if(button)process(Number(button.dataset.demoDoc),true);
  });
  reduced.addEventListener('change',function(){if(dialog.open){if(active==='bitrix'){clearTimeout(suiteTimer);scheduleSuite()}else reset()}});
  document.addEventListener('visibilitychange',function(){
    if(!dialog.open)return;
    if(active==='bitrix'){
      if(document.hidden){clearTimeout(suiteTimer);clearTimeout(replyTimer)}
      else{scheduleSuite();if(suite.replyPending)scheduleReply()}
      return;
    }
    if(reduced.matches)return;
    if(document.hidden){stop();if(processing>=0){states[processing]='waiting';processing=-1;update()}}
    else next();
  });

  function escape(text){return String(text).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  var stages=['Новые','В работе','Успех'];
  var hints={crm:'Нажмите на сделку, чтобы сменить этап',chat:'Сообщения остаются внутри демонстрации',tasks:'Отметьте выполненные этапы внедрения'};
  function suiteMarkup(){
    return '<div class="flow-demo-scene suite-demo-scene"><div class="flow-demo-window suite-demo-window">'+
      '<div class="flow-demo-bar"><span class="flow-demo-dots" aria-hidden="true"><i></i><i></i></span><span>Рабочее пространство</span><span class="flow-demo-live">Команда на связи</span></div>'+
      '<div class="suite-tabs" role="tablist" aria-label="Сценарии работы">'+[['crm','CRM'],['chat','Чат'],['tasks','Задачи']].map(function(tab){return '<button type="button" role="tab" id="suiteTab-'+tab[0]+'" data-suite-tab="'+tab[0]+'" aria-controls="suitePanel-'+tab[0]+'" aria-selected="false" tabindex="-1">'+tab[1]+'</button>'}).join('')+'</div>'+
      '<div class="suite-views"><section class="suite-view suite-crm" role="tabpanel" id="suitePanel-crm" aria-labelledby="suiteTab-crm"></section>'+
      '<section class="suite-view suite-chat" role="tabpanel" id="suitePanel-chat" aria-labelledby="suiteTab-chat" hidden><div class="suite-channel"><span class="suite-channel-avatar">П</span><span><b>Проектная команда</b><small>Обсуждение внедрения</small></span><i></i></div>'+
      '<div class="suite-chat-log ym-hide-content" role="log" aria-live="off" aria-label="Демонстрационная переписка"></div><form class="suite-chat-form" data-suite-chat-form><input class="ym-disable-keys" name="message" type="text" maxlength="160" placeholder="Напишите демо-сообщение…" aria-label="Демонстрационное сообщение" autocomplete="off" required><button type="submit" aria-label="Отправить демо-сообщение"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m3 3 15 7-15 7 3-7-3-7zM6 10h12"/></svg></button></form></section>'+
      '<section class="suite-view suite-tasks" role="tabpanel" id="suitePanel-tasks" aria-labelledby="suiteTab-tasks" hidden></section></div>'+
      '<div class="flow-demo-bottom"><span class="suite-hint"></span><button type="button" class="flow-demo-restart" data-demo-restart><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M13 6a5 5 0 1 0 0 4M13 2v4H9"/></svg>Сбросить</button></div></div></div>';
  }
  function resetSuite(){
    stop();
    suite={tab:'crm',autoplay:true,replyPending:false,cards:[
      {id:0,title:'Заявка с сайта',client:'ООО «Вектор»',amount:'120 000 ₽',stage:0},
      {id:1,title:'Внедрение CRM',client:'ТехноЛайн',amount:'85 000 ₽',stage:1},
      {id:2,title:'Интеграция с 1С',client:'ПромСнаб',amount:'210 000 ₽',stage:0}
    ],messages:[
      {name:'Анна',text:'Коллеги, заявка уже в CRM. Кто подключится к проекту?'},
      {name:'Вы',text:'Возьму настройку воронки и автоматизации.',own:true},
      {name:'Михаил',text:'Отлично! Задачу на интеграцию добавил в план.'}
    ],tasks:[true,false,false,false]};
    renderCrm();renderMessages();renderTasks();showSuiteTab('crm',false);
    $('#flowDemoAnnouncement').textContent='';scheduleSuite();
  }
  function showSuiteTab(name,manual){
    if(manual){suite.autoplay=false;clearTimeout(suiteTimer)}
    suite.tab=name;
    dialog.querySelectorAll('[data-suite-tab]').forEach(function(tab){var selected=tab.dataset.suiteTab===name;tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1});
    ['crm','chat','tasks'].forEach(function(key){$('#suitePanel-'+key).hidden=key!==name});
    $('.suite-hint').textContent=hints[name];
    if(name==='chat')renderMessages();
  }
  function renderCrm(){
    $('.suite-crm').innerHTML=stages.map(function(stage,index){var cards=suite.cards.filter(function(card){return card.stage===index});return '<div class="suite-lane"><div class="suite-lane-head"><i class="suite-stage-dot suite-stage-dot--'+index+'"></i><span>'+stage+'</span><b>'+cards.length+'</b></div><div class="suite-lane-cards">'+cards.map(function(card){return '<button type="button" class="suite-deal'+(index===2?' is-won':'')+'" data-suite-move="'+card.id+'" aria-label="'+escape(card.title)+'. '+stage+'. '+(index===2?'Начать заново':'Перевести на следующий этап')+'"><b>'+escape(card.title)+'</b><span>'+escape(card.client)+'</span><div><strong>'+card.amount+'</strong><i aria-hidden="true">'+(index===2?'↻':'→')+'</i></div></button>'}).join('')+(!cards.length?'<span class="suite-lane-empty">'+(index===2?'Здесь будут<br>успешные сделки':'Пока нет сделок')+'</span>':'')+'</div></div>'}).join('');
  }
  function moveDeal(id,manual){
    var card=suite.cards.find(function(item){return item.id===id});if(!card)return;
    if(manual){suite.autoplay=false;clearTimeout(suiteTimer)}
    card.stage=(card.stage+1)%3;renderCrm();
    if(manual){$('#flowDemoAnnouncement').textContent=card.title+': '+stages[card.stage]+'.';$('[data-suite-move="'+id+'"]').focus({preventScroll:true})}
  }
  function scheduleSuite(){
    clearTimeout(suiteTimer);
    if(active!=='bitrix'||!suite||!suite.autoplay||suite.tab!=='crm'||!dialog.open||reduced.matches||document.hidden)return;
    suiteTimer=setTimeout(function(){moveDeal(0,false);scheduleSuite()},2600);
  }
  function renderMessages(){
    var log=$('.suite-chat-log');
    log.innerHTML=suite.messages.map(function(message){return '<div class="suite-message'+(message.own?' is-own':'')+'"><span>'+escape(message.name)+'</span><p>'+escape(message.text)+'</p></div>'}).join('');
    log.scrollTop=log.scrollHeight;
  }
  function scheduleReply(){
    clearTimeout(replyTimer);
    replyTimer=setTimeout(function(){
      if(!dialog.open||active!=='bitrix')return;
      suite.replyPending=false;suite.messages.push({name:'Команда · демо',text:'Принято. Следующий шаг закрепим в задачах.'});
      suite.messages=suite.messages.slice(-30);renderMessages();$('#flowDemoAnnouncement').textContent='Получен демонстрационный ответ команды.';
    },reduced.matches?150:900);
  }
  function renderTasks(){
    var titles=['Настроить воронку продаж','Подключить каналы обращений','Связать CRM с 1С','Запустить автоматические напоминания'];
    var count=suite.tasks.filter(Boolean).length;
    $('.suite-tasks').innerHTML='<div class="suite-plan-head"><b>План внедрения</b><span>'+count+' из 4</span></div><div class="suite-progress" role="progressbar" aria-label="Выполнение плана" aria-valuemin="0" aria-valuemax="4" aria-valuenow="'+count+'"><i style="width:'+count*25+'%"></i></div><div class="suite-task-list">'+titles.map(function(title,index){return '<label class="suite-task'+(suite.tasks[index]?' is-done':'')+'"><input type="checkbox" data-suite-task="'+index+'"'+(suite.tasks[index]?' checked':'')+'><span>'+title+'</span><small>'+(suite.tasks[index]?'Готово':'В плане')+'</small></label>'}).join('')+'</div>';
  }
  dialog.addEventListener('change',function(e){
    if(active!=='bitrix'||!e.target.matches('[data-suite-task]'))return;
    var index=Number(e.target.dataset.suiteTask);suite.tasks[index]=e.target.checked;renderTasks();
    $('[data-suite-task="'+index+'"]').focus({preventScroll:true});
    $('#flowDemoAnnouncement').textContent='Выполнено задач: '+suite.tasks.filter(Boolean).length+' из 4.';
  });
  dialog.addEventListener('submit',function(e){
    if(!e.target.matches('[data-suite-chat-form]'))return;e.preventDefault();
    var input=e.target.elements.message,text=input.value.trim().slice(0,160);if(!text){input.focus();return}
    suite.messages.push({name:'Вы',text:text,own:true});suite.messages=suite.messages.slice(-30);suite.replyPending=true;
    input.value='';renderMessages();$('#flowDemoAnnouncement').textContent='Сообщение добавлено в демонстрационную переписку.';
    scheduleReply();input.focus({preventScroll:true});
  });
  dialog.addEventListener('focusin',function(e){
    if(active==='bitrix'&&suite&&e.target.matches('[data-suite-move]')){suite.autoplay=false;clearTimeout(suiteTimer)}
  });
})();
