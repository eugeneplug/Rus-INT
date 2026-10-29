/* Интерактивные окна направлений: первый сценарий — демо счетов 1С. */
(function(){
  'use strict';
  var trigger=document.querySelector('[data-board-demo="onec"]');
  var dialog=document.getElementById('boardDemo');
  if(!trigger||!dialog)return;

  var paths={
    close:'M5 5l10 10M15 5 5 15',
    home:'M3 9l7-6 7 6M5 8v9h10V8M8 17v-6h4v6',
    sales:'M3 15V9M8 15V5M13 15V8M17 15H2M3 6l5-3 5 2 4-3',
    users:'M7 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6M2 17v-2a5 5 0 0 1 10 0v2M13 4a3 3 0 0 1 0 6M15 12a4 4 0 0 1 3 4v1',
    reports:'M3 2v15h15M7 13V9M11 13V5M15 13V7',
    star:'m10 2 2.5 5 5.5.8-4 3.9.9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-3.9L7.5 7z',
    search:'M14 8a6 6 0 1 1-12 0 6 6 0 0 1 12 0M12.5 12.5 18 18',
    plus:'M10 3v14M3 10h14',
    download:'M10 2v10M6 8l4 4 4-4M3 13v4h14v-4'
  };
  function icon(name){return '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="'+paths[name]+'"/></svg>'}
  function esc(value){return String(value).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function money(value){return new Intl.NumberFormat('ru-RU',{minimumFractionDigits:2,maximumFractionDigits:2}).format(value)+' ₽'}
  function date(value){return value.split('-').reverse().join('.')}
  function today(){var d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}

  var seed=[
    ['2026-10-20','МеталлПром',115700,'pending','РУСИНТЕГРАЦИЯ'],
    ['2026-10-20','ТехноДеталь',214740,'paid','Торговый дом'],
    ['2026-10-21','ЛогистикПлюс',68810,'paid','РУСИНТЕГРАЦИЯ'],
    ['2026-10-22','СтройСервис',81100,'pending','Торговый дом'],
    ['2026-10-23','Северная линия',100420,'paid','РУСИНТЕГРАЦИЯ'],
    ['2026-10-24','ПромСнаб',92665,'pending','РУСИНТЕГРАЦИЯ'],
    ['2026-10-25','МеталлПром',11090,'paid','Торговый дом'],
    ['2026-10-26','ТехноДеталь',52990,'pending','РУСИНТЕГРАЦИЯ'],
    ['2026-10-27','ЛогистикПлюс',109160,'paid','Торговый дом']
  ];
  function initialRows(){return seed.map(function(r,i){return {id:i+1,number:'0000-'+String(573+i).padStart(6,'0'),date:r[0],customer:r[1],amount:r[2],status:r[3],org:r[4],note:'Услуги по договору'}})}
  var rows=initialRows(),nextId=rows.length+1;
  var state={view:'sales',query:'',customer:'',org:'',status:'',descending:true,favorite:false};
  var built=false,editorOpen=false,editId=null,editorReturn=null,previousFocus=null,wasLocked=false;
  var closeTimer=0,toastTimer=0,highlight=0;
  function $(selector){return dialog.querySelector(selector)}
  function clearFilters(){state.query='';state.customer='';state.org='';state.status=''}
  function filtered(){
    var query=state.query.trim().toLocaleLowerCase('ru');
    return rows.filter(function(r){
      return (!query||(r.number+' '+r.customer+' '+r.org+' '+r.note).toLocaleLowerCase('ru').includes(query))&&
        (!state.customer||r.customer===state.customer)&&(!state.org||r.org===state.org)&&(!state.status||r.status===state.status);
    }).sort(function(a,b){return (a.date.localeCompare(b.date)||a.id-b.id)*(state.descending?-1:1)});
  }
  function status(r){return '<span class="demo-status'+(r.status==='paid'?' demo-status--paid':'')+'">'+(r.status==='paid'?'Оплачен':'К оплате')+'</span>'}
  function options(list,selected){return list.map(function(v){return '<option value="'+esc(v)+'"'+(v===selected?' selected':'')+'>'+esc(v)+'</option>'}).join('')}
  function notify(text){
    clearTimeout(toastTimer);var el=$('.demo-toast');el.textContent=text;el.classList.add('is-visible');
    toastTimer=setTimeout(function(){el.classList.remove('is-visible')},2400);
  }

  function build(){
    if(built)return;built=true;
    dialog.innerHTML='<div class="demo-shell">'+
      '<header class="demo-appbar"><span class="demo-brand" aria-hidden="true">1С</span>'+
      '<div class="demo-app-name"><b>Учёт и управление</b><small>Рабочее пространство бизнеса</small></div>'+
      '<span class="demo-tag">Интерактивное демо</span>'+
      '<button class="demo-icon-btn" type="button" data-demo-close aria-label="Закрыть демонстрацию">'+icon('close')+'</button></header>'+
      '<div class="demo-layout"><aside class="demo-sidebar"><span class="demo-eyebrow">Рабочая область</span>'+
      '<nav class="demo-nav" aria-label="Разделы демонстрации">'+
      [['dashboard','home','Главное'],['sales','sales','Продажи'],['customers','users','Контрагенты'],['reports','reports','Отчёты']].map(function(n){return '<button type="button" data-demo-view="'+n[0]+'">'+icon(n[1])+'<span>'+n[2]+'</span></button>'}).join('')+'</nav>'+
      '<button type="button" class="demo-favorite-link" data-demo-favorite-link hidden>★ Счета покупателям</button>'+
      '<div class="demo-sidebar-foot"><b>1С под ваши процессы</b><p>Учёт, продажи и склад в одной системе.</p><a href="/services/onec/">О направлении ↗</a>'+
      '<button type="button" class="demo-reset" data-demo-reset>Сбросить демо</button></div></aside>'+
      '<div class="demo-workspace"><main class="demo-main"></main>'+
      '<div class="demo-editor-layer" hidden><section class="demo-editor" aria-labelledby="demoEditorTitle"></section></div></div></div>'+
      '<footer class="demo-statusbar"><span><i></i>Демонстрационные данные · изменения только в этом окне</span><span>Esc — закрыть окно</span></footer>'+
      '<div class="demo-toast" role="status" aria-live="polite"></div></div>';
  }

  function head(title,breadcrumb,favorite){
    return '<div class="demo-view-head"><div><div class="demo-breadcrumb">'+breadcrumb+'</div><h2 id="demoTitle">'+title+'</h2></div>'+
      (favorite?'<button type="button" class="demo-icon-btn demo-favorite'+(state.favorite?' is-saved':'')+'" data-demo-favorite aria-label="'+(state.favorite?'Удалить счета из избранного':'Добавить счета в избранное')+'" aria-pressed="'+state.favorite+'">'+icon('star')+'</button>':'')+'</div>';
  }
  function renderSales(){
    $('.demo-main').innerHTML='<div class="demo-view-enter">'+head('Счета покупателям','Продажи / Документы',true)+
      '<div class="demo-toolbar"><button type="button" class="demo-action demo-action--primary" data-demo-create>'+icon('plus')+'Создать счёт</button>'+
      '<button type="button" class="demo-action" data-demo-export>'+icon('download')+'Экспорт</button>'+
      '<label class="demo-search">'+icon('search')+'<input id="demoSearch" type="search" aria-label="Поиск по счетам" placeholder="Номер, контрагент или назначение" autocomplete="off" value="'+esc(state.query)+'"></label></div>'+
      '<div class="demo-filters"><label class="demo-field">Контрагент<select id="demoCustomer"><option value="">Все контрагенты</option>'+options(Array.from(new Set(rows.map(function(r){return r.customer}))).sort(),state.customer)+'</select></label>'+
      '<label class="demo-field">Организация<select id="demoOrg"><option value="">Все организации</option>'+options(['РУСИНТЕГРАЦИЯ','Торговый дом'],state.org)+'</select></label>'+
      '<label class="demo-field">Статус<select id="demoStatus"><option value="">Все счета</option><option value="pending"'+(state.status==='pending'?' selected':'')+'>К оплате</option><option value="paid"'+(state.status==='paid'?' selected':'')+'>Оплачен</option></select></label></div>'+
      '<div class="demo-table-wrap"><table class="demo-table"><caption class="sr-only">Счета покупателям. Откройте номер счёта, чтобы изменить его.</caption><thead><tr>'+
      '<th id="demoDateHeading"><button type="button" data-demo-sort>Дата <span id="demoSortArrow" aria-hidden="true"></span></button></th><th>Номер</th><th>Контрагент</th><th class="demo-money">Сумма</th><th>Статус</th></tr></thead><tbody id="demoRows"></tbody></table></div>'+
      '<div class="demo-table-foot"><span id="demoCount"></span><span>Итого<strong id="demoTotal" class="demo-money"></strong></span></div>'+
      '<p class="demo-hint">Откройте любой счёт, измените его или создайте новый. <button type="button" data-demo-clear style="color:var(--acc)">Сбросить фильтры ↗</button></p></div>';
    updateRows();
  }
  function rowHtml(r){return '<tr data-invoice="'+r.id+'"'+(highlight===r.id?' class="demo-row-new"':'')+'><td>'+date(r.date)+'</td><td><button type="button" class="demo-number" data-invoice="'+r.id+'" aria-label="Открыть счёт '+r.number+'">'+r.number+'</button></td><td>'+esc(r.customer)+'</td><td class="demo-money">'+money(r.amount)+'</td><td>'+status(r)+'</td></tr>'}
  function updateRows(){
    var list=filtered();
    $('#demoRows').innerHTML=list.length?list.map(rowHtml).join(''):'<tr><td class="demo-empty" colspan="5">Счета не найдены. Измените запрос или сбросьте фильтры.</td></tr>';
    $('#demoCount').textContent='Показано '+list.length+' из '+rows.length;
    $('#demoTotal').textContent=money(list.reduce(function(total,r){return total+r.amount},0));
    $('#demoDateHeading').setAttribute('aria-sort',state.descending?'descending':'ascending');
    $('#demoSortArrow').textContent=state.descending?'↓':'↑';
  }
  function metrics(){
    var total=rows.reduce(function(s,r){return s+r.amount},0),paid=rows.filter(function(r){return r.status==='paid'}).reduce(function(s,r){return s+r.amount},0);
    return '<div class="demo-metrics">'+[['Выставлено счетов',money(total),rows.length+' документов'],['Оплачено',money(paid),'Оплаты от покупателей'],['Ожидает оплаты',money(total-paid),'Контроль дебиторской задолженности']].map(function(m){return '<div class="demo-metric"><span>'+m[0]+'</span><b class="demo-money">'+m[1]+'</b><small>'+m[2]+'</small></div>'}).join('')+'</div>';
  }
  function renderDashboard(){
    var last=rows.slice().sort(function(a,b){return b.date.localeCompare(a.date)||b.id-a.id}).slice(0,4);
    $('.demo-main').innerHTML='<div class="demo-view-enter">'+head('Всё под контролем','Главное / Обзор бизнеса')+metrics()+
      '<h3 class="demo-section-title">Последние счета</h3><div class="demo-table-wrap"><table class="demo-table"><caption class="sr-only">Последние счета</caption><thead><tr><th>Дата</th><th>Номер</th><th>Контрагент</th><th class="demo-money">Сумма</th><th>Статус</th></tr></thead><tbody>'+last.map(rowHtml).join('')+'</tbody></table></div>'+
      '<button class="demo-action" style="margin-top:18px" type="button" data-demo-view="sales">Все счета ↗</button></div>';
  }
  function renderCustomers(){
    var names=Array.from(new Set(rows.map(function(r){return r.customer}))).sort();
    $('.demo-main').innerHTML='<div class="demo-view-enter">'+head('Контрагенты','Справочники / Покупатели')+
      '<p class="demo-hint" style="margin-bottom:20px">Выберите компанию, чтобы посмотреть её счета.</p><div class="demo-contact-grid">'+names.map(function(name){var list=rows.filter(function(r){return r.customer===name});return '<button class="demo-contact" type="button" data-demo-customer="'+esc(name)+'"><b>'+esc(name)+'</b><span>Документов: '+list.length+'</span><em>'+money(list.reduce(function(s,r){return s+r.amount},0))+' ↗</em></button>'}).join('')+'</div></div>';
  }
  function renderReports(){
    $('.demo-main').innerHTML='<div class="demo-view-enter">'+head('Продажи в цифрах','Отчёты / Оплаты покупателей')+metrics()+'<h3 class="demo-section-title">Оплаты по организациям</h3>'+
      ['РУСИНТЕГРАЦИЯ','Торговый дом'].map(function(org){var list=rows.filter(function(r){return r.org===org}),total=list.reduce(function(s,r){return s+r.amount},0),paid=list.filter(function(r){return r.status==='paid'}).reduce(function(s,r){return s+r.amount},0);return '<article class="demo-report"><div class="demo-report-head"><b>'+org+'</b><span class="demo-money">'+money(total)+'</span></div><div class="demo-report-track"><span class="demo-report-paid" style="--paid:'+(total?Math.round(paid/total*100):0)+'%"></span></div><small>Оплачено '+money(paid)+' из '+money(total)+'</small></article>'}).join('')+'</div>';
  }
  function render(){
    dialog.querySelectorAll('.demo-nav [data-demo-view]').forEach(function(b){var active=b.dataset.demoView===state.view;b.classList.toggle('is-active',active);if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
    $('[data-demo-favorite-link]').hidden=!state.favorite;
    ({sales:renderSales,dashboard:renderDashboard,customers:renderCustomers,reports:renderReports}[state.view])();
    $('.demo-main').scrollTop=0;
  }

  function openEditor(id,source){
    var row=rows.find(function(r){return r.id===id});editId=row?row.id:null;
    editorReturn=source&&source.matches('tr')?source.querySelector('button'):source||document.activeElement;editorOpen=true;
    $('.demo-main').inert=true;$('.demo-sidebar').inert=true;
    var r=row||{date:today(),customer:'',org:'РУСИНТЕГРАЦИЯ',amount:'',status:'pending',note:''};
    $('.demo-editor').innerHTML='<div class="demo-editor-head"><div><div class="demo-breadcrumb">'+(row?'Редактирование документа':'Новый документ')+'</div><h3 id="demoEditorTitle">'+(row?'Счёт № '+row.number:'Новый счёт')+'</h3></div><button class="demo-icon-btn" type="button" data-editor-close aria-label="Закрыть счёт">'+icon('close')+'</button></div>'+
      '<form class="demo-editor-form"><label class="demo-field">Контрагент<input name="customer" value="'+esc(r.customer)+'" placeholder="Название компании" required maxlength="80" autocomplete="off"></label>'+
      '<label class="demo-field">Организация<select name="org">'+options(['РУСИНТЕГРАЦИЯ','Торговый дом'],r.org)+'</select></label>'+
      '<label class="demo-field">Дата счёта<input name="date" type="date" value="'+r.date+'" required min="2000-01-01" max="2099-12-31"></label>'+
      '<label class="demo-field">Сумма, ₽<input name="amount" type="number" value="'+r.amount+'" placeholder="0" min="0.01" max="999999999" step="0.01" required></label>'+
      '<label class="demo-field">Статус<select name="status"><option value="pending"'+(r.status==='pending'?' selected':'')+'>К оплате</option><option value="paid"'+(r.status==='paid'?' selected':'')+'>Оплачен</option></select></label>'+
      '<label class="demo-field">Назначение<textarea name="note" maxlength="240" placeholder="Например: настройка учёта в 1С">'+esc(r.note)+'</textarea></label>'+
      '<div class="demo-editor-actions"><button type="submit" class="demo-action demo-action--primary">'+(row?'Сохранить':'Создать счёт')+'</button><button type="button" class="demo-action" data-editor-close>Отмена</button></div></form>';
    $('.demo-editor-layer').hidden=false;
    $('.demo-editor [name="customer"]').focus({preventScroll:true});
  }
  function closeEditor(restore){
    if(!editorOpen)return;editorOpen=false;
    $('.demo-editor-layer').hidden=true;$('.demo-main').inert=false;$('.demo-sidebar').inert=false;
    if(restore!==false&&editorReturn&&editorReturn.isConnected)editorReturn.focus({preventScroll:true});
  }

  function open(){
    if(dialog.open)return;
    clearTimeout(closeTimer);build();state.view='sales';render();
    previousFocus=document.activeElement;wasLocked=document.body.classList.contains('lock');
    document.body.classList.add('lock');dialog.classList.remove('is-closing');dialog.showModal();
    void dialog.offsetWidth;dialog.classList.add('is-active');
    $('[data-demo-close]').focus({preventScroll:true});
  }
  function close(){
    if(!dialog.open||dialog.classList.contains('is-closing'))return;
    closeEditor(false);dialog.classList.remove('is-active');dialog.classList.add('is-closing');
    closeTimer=setTimeout(function(){dialog.close()},matchMedia('(prefers-reduced-motion:reduce)').matches?0:160);
  }
  trigger.addEventListener('click',open);
  dialog.addEventListener('close',function(){
    clearTimeout(closeTimer);clearTimeout(toastTimer);dialog.classList.remove('is-active','is-closing');
    if($('.demo-toast'))$('.demo-toast').classList.remove('is-visible');
    if(!wasLocked)document.body.classList.remove('lock');
    if(previousFocus&&previousFocus.isConnected)previousFocus.focus({preventScroll:true});
  });
  dialog.addEventListener('cancel',function(e){e.preventDefault();if(editorOpen)closeEditor();else close()});
  dialog.addEventListener('keydown',function(e){
    if(e.key!=='Tab')return;
    var host=editorOpen?$('.demo-editor'):dialog;
    var focusable=Array.from(host.querySelectorAll('button,input,select,textarea,a[href]')).filter(function(el){return !el.disabled&&!el.closest('[inert]')&&el.getClientRects().length>0});
    var first=focusable[0],last=focusable[focusable.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
  });
  dialog.addEventListener('click',function(e){
    if(e.target===dialog){close();return}
    var button=e.target.closest('button,[data-invoice]');if(!button)return;
    if(button.hasAttribute('data-demo-close')){close();return}
    if(button.hasAttribute('data-editor-close')){closeEditor();return}
    if(button.hasAttribute('data-demo-view')){closeEditor(false);state.view=button.dataset.demoView;render();return}
    if(button.hasAttribute('data-demo-create')){openEditor(null,button);return}
    if(button.hasAttribute('data-invoice')){openEditor(Number(button.dataset.invoice),button);return}
    if(button.hasAttribute('data-demo-favorite')){
      state.favorite=!state.favorite;button.classList.toggle('is-saved',state.favorite);button.setAttribute('aria-pressed',state.favorite);button.setAttribute('aria-label',state.favorite?'Удалить счета из избранного':'Добавить счета в избранное');
      $('[data-demo-favorite-link]').hidden=!state.favorite;notify(state.favorite?'Счета добавлены в избранное':'Счета удалены из избранного');return;
    }
    if(button.hasAttribute('data-demo-favorite-link')){state.view='sales';render();return}
    if(button.hasAttribute('data-demo-customer')){clearFilters();state.customer=button.dataset.demoCustomer;state.view='sales';render();return}
    if(button.hasAttribute('data-demo-sort')){state.descending=!state.descending;updateRows();return}
    if(button.hasAttribute('data-demo-clear')){clearFilters();renderSales();return}
    if(button.hasAttribute('data-demo-reset')){rows=initialRows();nextId=rows.length+1;highlight=0;clearFilters();state.view='sales';state.favorite=false;state.descending=true;render();notify('Демо возвращено к исходным данным');return}
    if(button.hasAttribute('data-demo-export')){
      var list=filtered();if(!list.length){notify('Нет счетов для экспорта');return}
      function cell(v){v=String(v);if(/^[=+\-@\t\r]/.test(v))v="'"+v;return '"'+v.replace(/"/g,'""')+'"'}
      var csv='\uFEFF'+[['Дата','Номер','Контрагент','Организация','Сумма','Статус']].concat(list.map(function(r){return [r.date,r.number,r.customer,r.org,r.amount,r.status==='paid'?'Оплачен':'К оплате']})).map(function(r){return r.map(cell).join(';')}).join('\r\n');
      var url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'}));
      var a=document.createElement('a');a.href=url;a.download='demo-scheta.csv';dialog.appendChild(a);a.click();a.remove();
      setTimeout(function(){URL.revokeObjectURL(url)},1000);notify('Демо-счета выгружены в CSV');
    }
  });
  dialog.addEventListener('input',function(e){
    if(e.target.id==='demoSearch'){state.query=e.target.value;updateRows()}
    if(e.target.name==='customer')e.target.setCustomValidity('');
  });
  dialog.addEventListener('change',function(e){
    var key={demoCustomer:'customer',demoOrg:'org',demoStatus:'status'}[e.target.id];
    if(key){state[key]=e.target.value;updateRows()}
  });
  dialog.addEventListener('submit',function(e){
    if(!e.target.matches('.demo-editor-form'))return;e.preventDefault();
    var form=e.target,values=new FormData(form),customer=String(values.get('customer')).trim();
    if(!customer){form.elements.customer.setCustomValidity('Укажите название контрагента.');form.elements.customer.reportValidity();return}
    var existing=rows.find(function(r){return r.id===editId}),id=existing?existing.id:nextId++;
    var updated={id:id,number:existing?existing.number:'0000-'+String(572+id).padStart(6,'0'),customer:customer,org:String(values.get('org')),date:String(values.get('date')),amount:Number(values.get('amount')),status:String(values.get('status')),note:String(values.get('note')).trim()};
    if(existing)rows[rows.indexOf(existing)]=updated;else rows.push(updated);
    closeEditor(false);highlight=id;clearFilters();state.view='sales';state.descending=true;render();
    var saved=$('button[data-invoice="'+id+'"]');if(saved)saved.focus({preventScroll:true});
    notify(existing?'Изменения в демо-счёте сохранены':'Демо-счёт создан');
  });
})();
