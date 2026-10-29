/* Анимированные примеры: код отображается как текст и не выполняется. */
(function(){
  'use strict';
  var dialog=document.getElementById('boardDemo');
  if(!dialog)return;
  var languages=[
  {
    "id": "react",
    "label": "React",
    "examples": [
      {
        "filename": "OrderCard.jsx",
        "code": "import { useState } from \"react\";\n\nexport default function OrderCard({ order }) {\n  const [confirmed, setConfirmed] = useState(false);\n\n  return (\n    <article className=\"order-card\">\n      <h2>Заказ №{order.id}</h2>\n      <p>{order.customer}</p>\n      <button onClick={() => setConfirmed(true)}>\n        {confirmed ? \"Заказ принят\" : \"Подтвердить\"}\n      </button>\n    </article>\n  );\n}"
      },
      {
        "filename": "ProductList.jsx",
        "code": "import { useEffect, useState } from \"react\";\nexport default function ProductList() {\n  const [products, setProducts] = useState([]);\n  useEffect(() => {\n    fetch(\"/api/products\")\n      .then((response) => response.json())\n      .then(setProducts);\n  }, []);\n\n  return (\n    <ul className=\"catalog\">\n      {products.map((item) => (\n        <li key={item.id}>{item.title}</li>\n      ))}\n    </ul>\n  );\n}"
      }
    ]
  },
  {
    "id": "php",
    "label": "PHP",
    "examples": [
      {
        "filename": "invoice.php",
        "code": "<?php\ndeclare(strict_types=1);\nfunction invoiceTotal(array $items): float\n{\n    $total = 0.0;\n\n    foreach ($items as $item) {\n        $total += $item['price'] * $item['quantity'];\n    }\n\n    return round($total, 2);\n}\n\necho json_encode([\n    'total' => invoiceTotal($order['items']),\n    'currency' => 'RUB',\n]);"
      },
      {
        "filename": "create-order.php",
        "code": "<?php\ndeclare(strict_types=1);\n\nfunction createOrder(PDO $db, string $client): int\n{\n    $statement = $db->prepare(\n        'INSERT INTO orders (client, status)\n         VALUES (:client, :status)'\n    );\n\n    $statement->execute([\n        'client' => $client,\n        'status' => 'new',\n    ]);\n\n    return (int) $db->lastInsertId();\n}"
      }
    ]
  },
  {
    "id": "node",
    "label": "Node.js",
    "examples": [
      {
        "filename": "server.mjs",
        "code": "import { createServer } from \"node:http\";\n\nconst server = createServer((request, response) => {\n  response.writeHead(200, {\n    \"Content-Type\": \"application/json; charset=utf-8\",\n  });\n\n  response.end(JSON.stringify({\n    service: \"orders\",\n    status: \"ready\",\n    timestamp: new Date().toISOString(),\n  }));\n});\n\nserver.listen(3000, () => {\n  console.log(\"Сервис заказов запущен\");\n});"
      },
      {
        "filename": "order-events.mjs",
        "code": "import { EventEmitter } from \"node:events\";\n\nconst orders = new EventEmitter();\n\norders.on(\"created\", (order) => {\n  console.log(\"Новый заказ:\", order.id);\n});\n\norders.on(\"confirmed\", (order) => {\n  console.log(\"Передать на склад:\", order.id);\n});\n\nconst order = { id: 1042, status: \"new\" };\n\norders.emit(\"created\", order);\norders.emit(\"confirmed\", order);"
      }
    ]
  },
  {
    "id": "javascript",
    "label": "JavaScript",
    "examples": [
      {
        "filename": "checkout.js",
        "code": "const form = document.querySelector(\"[data-checkout]\");\n\nform?.addEventListener(\"submit\", async (event) => {\n  event.preventDefault();\n\n  const values = Object.fromEntries(new FormData(form));\n  const response = await fetch(\"/api/orders\", {\n    method: \"POST\",\n    headers: { \"Content-Type\": \"application/json\" },\n    body: JSON.stringify(values),\n  });\n\n  if (response.ok) {\n    form.reset();\n    document.querySelector(\"[data-success]\").hidden = false;\n  }\n});"
      },
      {
        "filename": "cart.js",
        "code": "const cart = [\n  { title: \"Модуль CRM\", price: 12000, quantity: 1 },\n  { title: \"Настройка обмена\", price: 8500, quantity: 2 },\n];\n\nconst total = cart.reduce((sum, item) => {\n  return sum + item.price * item.quantity;\n}, 0);\n\nconst currency = new Intl.NumberFormat(\"ru-RU\", {\n  style: \"currency\",\n  currency: \"RUB\",\n});\n\ndocument.querySelector(\"[data-total]\").textContent =\n  currency.format(total);"
      }
    ]
  },
  {
    "id": "react-native",
    "label": "React Native",
    "examples": [
      {
        "filename": "OrderScreen.jsx",
        "code": "import { useState } from \"react\";\nimport { View, Text, Pressable } from \"react-native\";\n\nexport default function OrderScreen() {\n  const [accepted, setAccepted] = useState(false);\n\n  return (\n    <View style={{ padding: 24, gap: 16 }}>\n      <Text>Заказ №1042</Text>\n      <Pressable onPress={() => setAccepted(true)}>\n        <Text>\n          {accepted ? \"В работе\" : \"Принять заказ\"}\n        </Text>\n      </Pressable>\n    </View>\n  );\n}"
      },
      {
        "filename": "TaskList.jsx",
        "code": "import { FlatList, Text, View } from \"react-native\";\nconst tasks = [\n  { id: \"crm\", title: \"Настроить воронку\" },\n  { id: \"sync\", title: \"Подключить обмен\" },\n];\nexport default function TaskList() {\n  return (\n    <FlatList\n      data={tasks}\n      keyExtractor={(item) => item.id}\n      renderItem={({ item }) => (\n        <View style={{ padding: 16 }}><Text>{item.title}</Text></View>\n      )}\n    />\n  );\n}"
      }
    ]
  },
  {
    "id": "python",
    "label": "Python",
    "examples": [
      {
        "filename": "order.py",
        "code": "from dataclasses import dataclass\nfrom decimal import Decimal\n\n@dataclass\nclass OrderItem:\n    title: str\n    price: Decimal\n    quantity: int = 1\n\ndef order_total(items):\n    return sum(\n        (item.price * item.quantity for item in items),\n        start=Decimal(\"0\"),\n    )\n\nitems = [OrderItem(\"Настройка CRM\", Decimal(\"12000\"))]\nprint(order_total(items))"
      },
      {
        "filename": "workflow.py",
        "code": "import asyncio\n\nasync def sync_with(service, order):\n    await asyncio.sleep(0.1)\n    return {\"service\": service, \"order\": order[\"id\"]}\n\nasync def process_order(order):\n    return await asyncio.gather(\n        sync_with(\"crm\", order),\n        sync_with(\"accounting\", order),\n        sync_with(\"warehouse\", order),\n    )\n\norder = {\"id\": 1042, \"status\": \"new\"}\nresults = asyncio.run(process_order(order))\nprint(results)"
      }
    ]
  },
  {
    "id": "onec",
    "label": "1С · BSL",
    "examples": [
      {
        "filename": "РасчётЗаказа.bsl",
        "code": "Функция РассчитатьИтог(СтрокиЗаказа) Экспорт\n    Итого = 0;\n\n    Для Каждого Товар Из СтрокиЗаказа Цикл\n        Стоимость = Товар.Цена * Товар.Количество;\n        Итого = Итого + Стоимость;\n    КонецЦикла;\n\n    Возврат Окр(Итого, 2);\nКонецФункции\n\nПроцедура ОбновитьЗаказ(Заказ) Экспорт\n    Заказ.Сумма = РассчитатьИтог(Заказ.Товары);\n    Сообщить(\"Сумма заказа пересчитана\");\nКонецПроцедуры"
      },
      {
        "filename": "ОбменДанными.bsl",
        "code": "Функция ПодготовитьСобытие(Номер, Сумма) Экспорт\n    Событие = Новый Структура;\n    Событие.Вставить(\"Номер\", Номер);\n    Событие.Вставить(\"Сумма\", Сумма);\n    Событие.Вставить(\"Статус\", \"Новый\");\n\n    Возврат Событие;\nКонецФункции\n\nПроцедура ПоказатьРезультат(Событие) Экспорт\n    Если Событие.Сумма > 0 Тогда\n        Сообщить(\"Заказ готов к обмену\");\n    Иначе\n        Сообщить(\"Проверьте сумму заказа\");\n    КонецЕсли;\nКонецПроцедуры"
      }
    ]
  },
  {
    "id": "typescript",
    "label": "TypeScript",
    "examples": [
      {
        "filename": "orders.ts",
        "code": "type OrderStatus = \"new\" | \"confirmed\" | \"shipped\";\n\ninterface Order {\n  id: number;\n  customer: string;\n  total: number;\n  status: OrderStatus;\n}\n\nfunction confirmOrder(order: Order): Order {\n  return { ...order, status: \"confirmed\" };\n}\n\nconst order = confirmOrder({\n  id: 1042, customer: \"Вектор\",\n  total: 12000, status: \"new\",\n});"
      },
      {
        "filename": "api-client.ts",
        "code": "interface Product {\n  id: number;\n  title: string;\n  stock: number;\n}\n\nasync function getProducts(): Promise<Product[]> {\n  const response = await fetch(\"/api/products\");\n\n  if (!response.ok) {\n    throw new Error(\"Каталог временно недоступен\");\n  }\n\n  return response.json();\n}\nconst products = await getProducts();\nconst available = products.filter((item) => item.stock > 0);"
      }
    ]
  },
  {
    "id": "go",
    "label": "Go",
    "examples": [
      {
        "filename": "main.go",
        "code": "package main\n\nimport \"fmt\"\ntype Order struct {\n    ID       int\n    Customer string\n    Total    float64\n}\n\nfunc main() {\n    order := Order{\n        ID: 1042, Customer: \"Вектор\", Total: 12000,\n    }\n\n    fmt.Printf(\"Заказ №%d: %.2f RUB\\n\",\n        order.ID, order.Total)\n}"
      },
      {
        "filename": "server.go",
        "code": "package main\nimport (\n    \"encoding/json\"\n    \"net/http\"\n)\nfunc main() {\n    http.HandleFunc(\"/api/status\", func(\n        w http.ResponseWriter, r *http.Request,\n    ) {\n        w.Header().Set(\"Content-Type\", \"application/json\")\n        json.NewEncoder(w).Encode(map[string]string{\n            \"status\": \"ready\",\n        })\n    })\n\n    http.ListenAndServe(\":8080\", nil)\n}"
      }
    ]
  },
  {
    "id": "sql",
    "label": "SQL",
    "examples": [
      {
        "filename": "sales-report.sql",
        "code": "SELECT\n    customers.name AS client,\n    COUNT(orders.id) AS order_count,\n    SUM(orders.total) AS revenue\nFROM customers\nJOIN orders\n    ON orders.customer_id = customers.id\nWHERE orders.status = 'confirmed'\nGROUP BY\n    customers.id,\n    customers.name\nORDER BY revenue DESC\nLIMIT 10;"
      },
      {
        "filename": "stock-summary.sql",
        "code": "WITH stock_summary AS (\n    SELECT\n        category,\n        SUM(quantity) AS units,\n        SUM(price * quantity) AS value\n    FROM inventory\n    GROUP BY category\n)\nSELECT category, units, ROUND(value, 2) AS total\nFROM stock_summary\nWHERE units > 0\nORDER BY total DESC\nLIMIT 8;"
      }
    ]
  }
];
  var reduced=matchMedia('(prefers-reduced-motion:reduce)');
  var bag=[],lastLanguage='',variants={},current=null,source='',position=0,fraction=0,frame=0,lastTime=0,autoScroll=true;
  var nextTimer=0,nextDelay=2000,nextStarted=0;
  try{lastLanguage=sessionStorage.getItem('ri_code_language')||''}catch(e){}
  var keywords={};
  ('async await const let var function return import from export default new if else throw try catch class extends for of in switch case break true false null undefined typeof instanceof def with as lambda self none and or not elif except finally yield package func type struct range defer go select map chan nil error public private protected static echo foreach endfor endif use namespace fn declare readonly interface string number boolean void select from where group by order desc asc limit join on insert into values update set returning sum count coalesce as begin end функция конецфункции процедура конецпроцедуры экспорт перем далее возврат новый если тогда иначе конецесли для каждого из цикл конеццикла истина ложь неопределено попытка исключение конецпопытки и или не').split(' ').forEach(function(word){keywords[word]=true});
  var tokenPattern=/\/\*[\s\S]*?(?:\*\/|$)|<!--[\s\S]*?(?:-->|$)|\/\/[^\n]*|--[^\n]*|#[^\n]*|"(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?|\x60(?:\\.|[^\x60\\])*\x60?|<\/?[\p{L}][\p{L}\p{N}:.-]*|\b\d+(?:\.\d+)?\b|[\p{L}_$][\p{L}\p{N}_$]*/gu;
  function $(selector){return dialog.querySelector(selector)}
  function escape(text){return String(text).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function active(){return dialog.open&&dialog.dataset.demoType==='sites'}
  function stop(){
    cancelAnimationFrame(frame);frame=0;lastTime=0;
    if(nextTimer){
      clearTimeout(nextTimer);nextTimer=0;
      nextDelay=Math.max(0,nextDelay-(performance.now()-nextStarted));
    }
  }
  function scheduleNext(){
    if(!active()||document.hidden||nextTimer)return;
    nextStarted=performance.now();
    nextTimer=setTimeout(function(){
      nextTimer=0;nextDelay=0;
      if(active()&&!document.hidden)start();
    },nextDelay);
  }
  function highlight(text){
    var html='',end=0,match;tokenPattern.lastIndex=0;
    while((match=tokenPattern.exec(text))){
      html+=escape(text.slice(end,match.index));
      var token=match[0],kind='';end=match.index+token.length;
      if(/^(\/\/|\/\*|<!--|--|#)/.test(token))kind='comment';
      else if(/^["']/.test(token)||token.charCodeAt(0)===96)kind='string';
      else if(token[0]==='<')kind='tag';
      else if(/^\d/.test(token))kind='number';
      else if(keywords[token.toLocaleLowerCase('ru')])kind='keyword';
      else if(/^\s*\(/.test(text.slice(end)))kind='function';
      else if(/^[A-ZА-ЯЁ]/.test(token))kind='type';
      html+=kind?'<span class="code-token-'+kind+'">'+escape(token)+'</span>':escape(token);
    }
    return html+escape(text.slice(end));
  }
  function choose(){
    if(!bag.length){
      bag=languages.slice();
      for(var i=bag.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),item=bag[i];bag[i]=bag[j];bag[j]=item}
      if(bag.length>1&&bag[0].id===lastLanguage){var first=bag.shift();bag.push(first)}
    }
    var language=bag.shift(),previous=variants[language.id];
    var variant=previous===undefined?Math.floor(Math.random()*language.examples.length):(previous+1)%language.examples.length;
    variants[language.id]=variant;lastLanguage=language.id;
    try{sessionStorage.setItem('ri_code_language',lastLanguage)}catch(e){}
    return {language:language,example:language.examples[variant]};
  }
  function render(){
    var text=source.slice(0,position),count=text.split('\n').length;
    $('.code-demo-source').innerHTML=highlight(text)+'<span class="code-demo-caret" aria-hidden="true"></span>';
    $('.code-demo-numbers').textContent=Array.from({length:count},function(_,i){return i+1}).join('\n');
    if(autoScroll){var body=$('.code-demo-body');body.scrollTop=body.scrollHeight}
    var complete=position>=source.length;
    $('.code-demo-scene').classList.toggle('is-typing',!complete);
    $('.code-demo-status').textContent=complete?source.split('\n').length+' строк · демонстрационный код':'Набираем код…';
  }
  function finish(keepTail){
    if(!current||!active())return;
    stop();position=source.length;render();
    if(!keepTail&&autoScroll)$('.code-demo-body').scrollTop=0;
    var announcement=$('#flowDemoAnnouncement');if(announcement)announcement.textContent='Пример '+current.language.label+' показан полностью.';
    scheduleNext();
  }
  function tick(time){
    frame=0;if(!active()||document.hidden)return;
    fraction+=Math.min(lastTime?time-lastTime:16,80)*.16;lastTime=time;
    var advance=Math.floor(fraction);fraction-=advance;
    if(advance){position=Math.min(source.length,position+advance);render()}
    if(position>=source.length){finish(true);return}
    frame=requestAnimationFrame(tick);
  }
  function resume(){
    if(!active()||document.hidden||frame||!current)return;
    if(position>=source.length){scheduleNext();return}
    if(reduced.matches){finish();return}
    lastTime=0;frame=requestAnimationFrame(tick);
  }
  function start(){
    stop();if(!languages.length||!active())return;
    current=choose();source=current.example.code;position=0;fraction=0;autoScroll=true;nextDelay=2000;
    var scene=$('.code-demo-scene');scene.dataset.language=current.language.id;
    $('.code-demo-language').textContent=current.language.label;
    $('.code-demo-filename').textContent=current.example.filename;
    $('.code-demo-body').setAttribute('aria-label','Пример кода: '+current.language.label);
    $('.code-demo-body').scrollTop=0;$('.code-demo-body').scrollLeft=0;
    render();
    var announcement=$('#flowDemoAnnouncement');if(announcement)announcement.textContent='Новый пример: '+current.language.label+'.';
    if(reduced.matches)finish();else resume();
  }
  function markup(){
    return '<div class="flow-demo-scene code-demo-scene"><div class="code-demo-header"><span class="code-demo-dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="code-demo-filename"></span><span class="code-demo-language"></span></div>'+
      '<div class="code-demo-body" role="region" aria-label="Пример кода" tabindex="0"><div class="code-demo-numbers" aria-hidden="true"></div><pre class="code-demo-pre"><code class="code-demo-source"></code></pre></div>'+
      '<div class="code-demo-footer"><span class="code-demo-status"></span></div></div>';
  }
  dialog.addEventListener('wheel',function(e){if(active()&&e.target.closest('.code-demo-body'))autoScroll=false},{passive:true});
  reduced.addEventListener('change',function(){if(active()){if(reduced.matches)finish();else resume()}});
  window.RusCodeDemo={markup:markup,start:start,stop:stop,resume:resume};
})();

