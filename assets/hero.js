/* Объёмная шестерня в схеме. На мобильных WebGL не запускается. */
(function(){
  'use strict';
  var board=document.querySelector('.integration-board');
  var canvas=document.getElementById('boardGear');
  if(!board||!canvas||typeof THREE==='undefined')return;

  var desktop=matchMedia('(min-width:945px)');
  var reduced=matchMedia('(prefers-reduced-motion:reduce)');
  var renderer=null,scene,camera,root,gear;
  var frame=0,visible=false,failed=false,lastTime=0,elapsed=0;

  function create(){
    if(renderer||failed)return;
    try{
      renderer=new THREE.WebGLRenderer({canvas:canvas,alpha:true,antialias:true,powerPreference:'low-power'});
      renderer.setPixelRatio(Math.min(devicePixelRatio,2));
      renderer.outputEncoding=THREE.sRGBEncoding;
      scene=new THREE.Scene();
      camera=new THREE.PerspectiveCamera(35,1,.1,30);
      camera.position.z=4.2;
      scene.add(new THREE.AmbientLight(0xcbd5ff,1.1));
      var key=new THREE.DirectionalLight(0xffffff,2.3);
      key.position.set(-3,4,5);scene.add(key);
      var rim=new THREE.DirectionalLight(0x7086ff,1.8);
      rim.position.set(3,-2,2);scene.add(rim);

      var shape=new THREE.Shape(),teeth=12,step=Math.PI*2/teeth,points=[];
      for(var i=0;i<teeth;i++){
        var a=i*step;
        [[-.35,.79],[-.2,1.04],[.2,1.04],[.35,.79]].forEach(function(p){
          points.push([Math.cos(a+p[0]*step)*p[1],Math.sin(a+p[0]*step)*p[1]]);
        });
      }
      shape.moveTo(points[0][0],points[0][1]);
      points.slice(1).forEach(function(p){shape.lineTo(p[0],p[1])});
      shape.closePath();
      var hole=new THREE.Path();hole.absarc(0,0,.32,0,Math.PI*2,true);shape.holes.push(hole);
      var geometry=new THREE.ExtrudeGeometry(shape,{
        depth:.34,bevelEnabled:true,bevelThickness:.035,bevelSize:.035,bevelSegments:2,curveSegments:24
      });
      geometry.center();
      var face=new THREE.MeshStandardMaterial({color:0xdbe0f3,metalness:.55,roughness:.32});
      var side=new THREE.MeshStandardMaterial({color:0x5269ef,metalness:.45,roughness:.35});
      gear=new THREE.Group();
      gear.add(new THREE.Mesh(geometry,[face,side]));
      gear.add(new THREE.LineSegments(new THREE.EdgesGeometry(geometry,32),
        new THREE.LineBasicMaterial({color:0xa7b5ff,transparent:true,opacity:.22})));
      root=new THREE.Group();root.add(gear);scene.add(root);
      root.rotation.set(-.45,-.5,0);gear.rotation.z=.15;
      resize();
      board.classList.add('board-gear-ready');
    }catch(e){failed=true;destroy()}
  }

  function resize(){
    if(!renderer)return;
    var size=canvas.getBoundingClientRect();
    if(!size.width||!size.height)return;
    renderer.setSize(size.width,size.height,false);
    camera.aspect=size.width/size.height;camera.updateProjectionMatrix();
    renderer.render(scene,camera);
  }

  function stop(){cancelAnimationFrame(frame);frame=0;lastTime=0}
  function destroy(){
    stop();board.classList.remove('board-gear-ready');
    if(!renderer)return;
    if(scene)scene.traverse(function(object){
      if(object.geometry)object.geometry.dispose();
      if(object.material)(Array.isArray(object.material)?object.material:[object.material]).forEach(function(m){m.dispose()});
    });
    renderer.dispose();renderer=null;
  }

  function draw(time){
    frame=0;
    if(!renderer)return;
    if(lastTime)elapsed+=Math.min((time-lastTime)/1000,.05);
    lastTime=time;
    gear.rotation.z=.15+elapsed*.55;
    root.rotation.y=-.5+Math.sin(elapsed*.4)*.2;
    renderer.render(scene,camera);
    frame=requestAnimationFrame(draw);
  }

  function sync(){
    stop();
    if(!desktop.matches){destroy();return}
    if(!visible||document.hidden)return;
    create();
    if(renderer){resize();if(!reduced.matches)frame=requestAnimationFrame(draw)}
  }

  new IntersectionObserver(function(entries){visible=entries[0].isIntersecting;sync()},{threshold:.01}).observe(board);
  new ResizeObserver(resize).observe(canvas);
  desktop.addEventListener('change',sync);
  reduced.addEventListener('change',sync);
  document.addEventListener('visibilitychange',sync);
  addEventListener('pagehide',destroy);
  addEventListener('pageshow',sync);
})();
