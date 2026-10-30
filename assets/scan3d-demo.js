/* Локальная GLB-модель: сканирование, проявление поверхности и управление обзором. */
(function(){
  'use strict';
  var dialog=document.getElementById('boardDemo');
  if(!dialog)return;
  var reduced=matchMedia('(prefers-reduced-motion:reduce)');
  var modelUrl='/img/models/card-reader.glb';
  var libraries=null,modelPromise=null,view=null,frame=0,lastTime=0,generation=0;
  var scanDuration=3200,revealDuration=650;
  function active(){return dialog.open&&dialog.dataset.demoType==='scan3d'}
  function markup(){
    return '<div class="flow-demo-scene scan-demo-scene" data-scan-state="loading">'+
      '<div class="scan-demo-header"><span><i></i>3D-сканирование</span><span class="scan-demo-status" role="status" aria-live="polite">Подготовка модели</span></div>'+
      '<div class="scan-demo-viewport"><canvas class="scan-demo-canvas" tabindex="0" aria-label="Интерактивная 3D-модель картридера" aria-describedby="scanDemoHint"></canvas><div class="scan-demo-loading"><span></span>Загружаем геометрию</div><div class="scan-demo-corners" aria-hidden="true"></div></div>'+
      '<div class="scan-demo-progress" aria-hidden="true"><i></i></div>'+
      '<div class="scan-demo-footer"><div class="scan-demo-caption"><b>Картридер</b><span id="scanDemoHint">Зажмите и вращайте · Колесо — масштаб</span></div><button type="button" data-scan-reset aria-label="Вернуть исходный ракурс" title="Исходный ракурс" disabled><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m3 8 7-5 7 5v8H3zM8 16v-5h4v5"/></svg></button><button type="button" data-scan-replay disabled><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M16 8a6 6 0 1 0-.5 5M16 3v5h-5"/></svg><span>Повторить</span></button></div></div>';
  }
  function script(url){
    return new Promise(function(resolve,reject){
      var element=document.createElement('script');element.src=url;element.onload=resolve;element.onerror=function(){element.remove();reject(new Error('3D library unavailable'))};document.head.appendChild(element);
    });
  }
  function loadModel(){
    if(!libraries)libraries=Promise.all([
      window.THREE&&THREE.GLTFLoader?Promise.resolve():script('/assets/vendor/GLTFLoader.js?v=r128'),
      window.THREE&&THREE.OrbitControls?Promise.resolve():script('/assets/vendor/OrbitControls.js?v=r128')
    ]).catch(function(error){libraries=null;throw error});
    if(!modelPromise)modelPromise=libraries.then(function(){
      return new Promise(function(resolve,reject){new THREE.GLTFLoader().load(modelUrl,function(gltf){resolve(gltf.scene)},undefined,reject)});
    }).catch(function(error){modelPromise=null;throw error});
    return modelPromise;
  }
  function dispose(){
    stop();if(!view)return;
    view.observer.disconnect();view.controls.dispose();
    view.cleanups.forEach(function(remove){remove()});
    view.materials.forEach(function(material){material.dispose()});
    view.geometries.forEach(function(geometry){geometry.dispose()});
    if(view.environment)view.environment.dispose();
    view.renderer.dispose();view.renderer.forceContextLoss();view=null;
  }
  function studioEnvironment(renderer){
    var room=new THREE.Scene();room.background=new THREE.Color(0x72798c);
    var geometry=new THREE.PlaneGeometry(6,6),material=new THREE.MeshBasicMaterial({color:0xffffff});
    [[-4,3,2],[4,4,-2],[0,6,0]].forEach(function(position){var light=new THREE.Mesh(geometry,material);light.position.set.apply(light.position,position);light.lookAt(0,0,0);room.add(light)});
    var generator=new THREE.PMREMGenerator(renderer),target=generator.fromScene(room,.08);
    generator.dispose();geometry.dispose();material.dispose();return target;
  }
  function create(){
    var host=dialog.querySelector('.scan-demo-scene'),previousCanvas=host.querySelector('canvas'),canvas=previousCanvas.cloneNode(false);
    previousCanvas.replaceWith(canvas);
    var renderer=new THREE.WebGLRenderer({canvas:canvas,alpha:true,antialias:true,powerPreference:'low-power'});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75));
    renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;renderer.localClippingEnabled=true;
    var scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(34,1,.1,50);
    var controls=new THREE.OrbitControls(camera,canvas);
    controls.enableDamping=true;controls.dampingFactor=.09;controls.enablePan=false;controls.rotateSpeed=.65;controls.zoomSpeed=.65;
    controls.minPolarAngle=.15;controls.maxPolarAngle=Math.PI-.15;
    var environment=studioEnvironment(renderer);scene.environment=environment.texture;
    scene.add(new THREE.HemisphereLight(0xe4eaff,0x444361,.9));
    var key=new THREE.DirectionalLight(0xffffff,2);key.position.set(3,5,4);scene.add(key);
    var rim=new THREE.DirectionalLight(0x8294ff,1);rim.position.set(-4,2,-3);scene.add(rim);
    var current={host:host,canvas:canvas,renderer:renderer,scene:scene,camera:camera,controls:controls,environment:environment,materials:[],geometries:[],cleanups:[],elapsed:0,loaded:false,interacted:false,ready:false};
    view=current;
    function resize(){var box=canvas.parentElement.getBoundingClientRect();if(!box.width||!box.height)return;renderer.setSize(box.width,box.height,false);camera.aspect=box.width/box.height;camera.updateProjectionMatrix();if(current.loaded)render(current)}
    current.observer=new ResizeObserver(resize);current.observer.observe(canvas.parentElement);resize();
    function interact(){current.interacted=true;controls.autoRotate=false}
    controls.addEventListener('start',interact);
    controls.addEventListener('change',function(){if(!frame&&active()&&current.loaded)render(current)});
    function keyboard(event){
      if(!current.loaded||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-','Home'].includes(event.key))return;
      event.preventDefault();interact();
      if(event.key==='Home'){resetView(current);return}
      var offset=camera.position.clone().sub(controls.target),spherical=new THREE.Spherical().setFromVector3(offset);
      if(event.key==='ArrowLeft')spherical.theta-=.12;if(event.key==='ArrowRight')spherical.theta+=.12;
      if(event.key==='ArrowUp')spherical.phi-=.1;if(event.key==='ArrowDown')spherical.phi+=.1;
      if(event.key==='+'||event.key==='=')spherical.radius*=.9;if(event.key==='-')spherical.radius*=1.1;
      spherical.phi=Math.max(.15,Math.min(Math.PI-.15,spherical.phi));spherical.radius=Math.max(controls.minDistance,Math.min(controls.maxDistance,spherical.radius));
      camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(spherical));controls.update();render(current);
    }
    canvas.addEventListener('keydown',keyboard);current.cleanups.push(function(){canvas.removeEventListener('keydown',keyboard)});
    var reset=host.querySelector('[data-scan-reset]'),replay=host.querySelector('[data-scan-replay]');
    function repeat(){if(!current.loaded)return;current.elapsed=0;current.ready=false;current.lastPercent=-1;current.interacted=false;resetView(current);paint(current);resume()}
    function resetCamera(){current.interacted=true;resetView(current);render(current)}
    replay.addEventListener('click',repeat);reset.addEventListener('click',resetCamera);
    current.cleanups.push(function(){replay.removeEventListener('click',repeat);reset.removeEventListener('click',resetCamera)});
    return current;
  }
  function resetView(current){
    var radius=current.distance||5.7;
    current.controls.target.set(0,0,0);current.camera.position.set(radius*.56,radius*.36,radius*.75);
    current.controls.update();current.controls.autoRotate=false;
  }
  function mount(current,template){
    var solid=template.clone(true),box=new THREE.Box3().setFromObject(solid),center=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3());
    var scale=2.45/Math.max(size.x,size.y,size.z);solid.scale.multiplyScalar(scale);solid.position.sub(center.multiplyScalar(scale));solid.updateMatrixWorld(true);
    box.setFromObject(solid);current.bottom=box.min.y;current.top=box.max.y;
    current.clip=new THREE.Plane(new THREE.Vector3(0,-1,0),current.bottom-.03);
    solid.traverse(function(node){if(!node.isMesh)return;node.material=(Array.isArray(node.material)?node.material:[node.material]).map(function(material){var copy=material.clone();copy.clippingPlanes=[current.clip];copy.envMapIntensity=.8;current.materials.push(copy);return copy});if(node.material.length===1)node.material=node.material[0]});
    var wireMaterial=new THREE.MeshBasicMaterial({color:0x728bff,wireframe:true,transparent:true,opacity:.16,depthWrite:false});current.materials.push(wireMaterial);
    var wire=solid.clone(true);wire.traverse(function(node){if(node.isMesh)node.material=wireMaterial});
    current.scene.add(solid,wire);current.wire=wire;current.wireMaterial=wireMaterial;
    var positions=[];solid.traverse(function(node){if(!node.isMesh)return;var attribute=node.geometry.getAttribute('position'),step=Math.max(1,Math.ceil(attribute.count/900)),point=new THREE.Vector3();for(var i=0;i<attribute.count;i+=step){point.fromBufferAttribute(attribute,i).applyMatrix4(node.matrixWorld);positions.push(point.x,point.y,point.z)}});
    var pointsGeometry=new THREE.BufferGeometry();pointsGeometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));current.geometries.push(pointsGeometry);
    var pointsMaterial=new THREE.PointsMaterial({color:0xa9bbff,size:.014,transparent:true,opacity:.65,depthWrite:false,blending:THREE.AdditiveBlending});current.materials.push(pointsMaterial);
    current.points=new THREE.Points(pointsGeometry,pointsMaterial);current.scene.add(current.points);
    var beamGeometry=new THREE.PlaneGeometry(3,3),beamMaterial=new THREE.MeshBasicMaterial({color:0x566dff,side:THREE.DoubleSide,transparent:true,opacity:.12,depthWrite:false,blending:THREE.AdditiveBlending});current.geometries.push(beamGeometry);current.materials.push(beamMaterial);
    current.beam=new THREE.Group();var plane=new THREE.Mesh(beamGeometry,beamMaterial);plane.rotation.x=-Math.PI/2;current.beam.add(plane);
    var outlineGeometry=new THREE.EdgesGeometry(beamGeometry),outlineMaterial=new THREE.LineBasicMaterial({color:0x9ab3ff,transparent:true,opacity:.85});current.geometries.push(outlineGeometry);current.materials.push(outlineMaterial);
    var outline=new THREE.LineSegments(outlineGeometry,outlineMaterial);outline.rotation.x=-Math.PI/2;current.beam.add(outline);current.scene.add(current.beam);
    var grid=new THREE.GridHelper(5,24,0x5d74e0,0x485074);grid.position.y=current.bottom-.07;grid.material.transparent=true;grid.material.opacity=.18;current.geometries.push(grid.geometry);current.materials.push(grid.material);current.scene.add(grid);
    var ringGeometry=new THREE.RingGeometry(1.6,1.605,100),ringMaterial=new THREE.MeshBasicMaterial({color:0x7387e8,transparent:true,opacity:.3,side:THREE.DoubleSide});current.geometries.push(ringGeometry);current.materials.push(ringMaterial);
    var ring=new THREE.Mesh(ringGeometry,ringMaterial);ring.rotation.x=-Math.PI/2;ring.position.y=grid.position.y+.01;current.scene.add(ring);
    current.distance=box.getBoundingSphere(new THREE.Sphere()).radius/Math.sin(THREE.MathUtils.degToRad(17))*1.18;
    current.controls.minDistance=current.distance*.5;current.controls.maxDistance=current.distance*1.9;
    current.loaded=true;resetView(current);current.host.querySelector('.scan-demo-loading').hidden=true;
    current.host.querySelectorAll('button').forEach(function(button){button.disabled=false});paint(current);resume();
  }
  function paint(current){
    if(!current.loaded)return;
    if(reduced.matches)current.elapsed=Math.max(current.elapsed,scanDuration+revealDuration);
    var progress=reduced.matches?1:Math.min(1,current.elapsed/scanDuration),reveal=reduced.matches?1:Math.max(0,Math.min(1,(current.elapsed-scanDuration)/revealDuration));
    current.clip.constant=current.bottom-.04+(current.top-current.bottom+.08)*progress;
    current.beam.position.y=current.clip.constant;current.beam.visible=progress<1;
    current.wire.visible=reveal<1;current.points.visible=reveal<1;current.wireMaterial.opacity=.16*(1-reveal);current.points.material.opacity=.65*(1-reveal);
    current.host.style.setProperty('--scan-progress',(progress*100).toFixed(1)+'%');
    var percent=Math.floor(progress*100),phase=progress<1?'scanning':reveal<1?'revealing':'ready';
    if(current.host.dataset.scanState!==phase){current.host.dataset.scanState=phase;current.host.querySelector('.scan-demo-status').textContent=phase==='scanning'?'Сканируем поверхность':phase==='revealing'?'Собираем модель':'Модель готова · 360°'}
    if(percent!==current.lastPercent){current.lastPercent=percent;current.host.querySelector('.scan-demo-progress').setAttribute('data-progress',percent+'%')}
    current.ready=phase==='ready';current.controls.autoRotate=current.ready&&!current.interacted&&!reduced.matches;current.controls.autoRotateSpeed=.4;
  }
  function render(current){current.renderer.render(current.scene,current.camera)}
  function tick(time){
    frame=0;if(!view||!view.loaded||!active()||document.hidden)return;
    var dt=lastTime?Math.min(60,time-lastTime):0;lastTime=time;view.elapsed+=dt;paint(view);view.controls.update();render(view);
    if(!reduced.matches)frame=requestAnimationFrame(tick);
  }
  function stop(){if(frame)cancelAnimationFrame(frame);frame=0;lastTime=0}
  function resume(){
    if(!view||!view.loaded||!active()||document.hidden)return;
    stop();paint(view);render(view);if(!reduced.matches)frame=requestAnimationFrame(tick);
  }
  function start(){
    dispose();var host=dialog.querySelector('.scan-demo-scene'),attempt=++generation;
    host.dataset.scanState='loading';host.style.setProperty('--scan-progress','0%');
    host.querySelector('.scan-demo-status').textContent='Подготовка модели';
    var loading=host.querySelector('.scan-demo-loading');loading.hidden=false;loading.innerHTML='<span></span>Загружаем геометрию';
    host.querySelectorAll('button').forEach(function(button){button.disabled=true});
    if(!window.THREE){failure(host);return}
    loadModel().then(function(template){
      if(attempt!==generation||!host.isConnected||!active())return;
      var current=create();mount(current,template);
    }).catch(function(){if(attempt===generation&&host.isConnected)failure(host)});
  }
  function failure(host){
    if(!host)return;host.dataset.scanState='error';host.querySelector('.scan-demo-status').textContent='Предпросмотр недоступен';
    var loading=host.querySelector('.scan-demo-loading');loading.hidden=false;loading.innerHTML='<b>Не удалось показать 3D-модель</b><a href="'+modelUrl+'" download="card-reader.glb">Скачать модель GLB ↗</a>';
  }
  reduced.addEventListener('change',function(){if(active())resume()});
  window.RusScan3dDemo={markup:markup,start:start,stop:stop,resume:resume};
})();
