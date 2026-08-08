import * as THREE from 'https://unpkg.com/three@0.164.1/build/three.module.js';
import { CIRCUITS, DEFAULT_CIRCUIT_ID } from './game-data.js';

const canvas = document.getElementById('apex3d');
const speedEl = document.getElementById('speed');
const lapEl = document.getElementById('lap');
const viewEl = document.getElementById('view');
const statusEl = document.getElementById('status');

const activeCircuit = CIRCUITS[DEFAULT_CIRCUIT_ID] || CIRCUITS.harbour;
statusEl.textContent = activeCircuit.name.toUpperCase();

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x07111f);
scene.fog = new THREE.FogExp2(0x07111f, 0.0085);
const camera = new THREE.PerspectiveCamera(64, 1, 0.1, 2200);
scene.add(new THREE.HemisphereLight(0xddeaff, 0x26351f, 1.25));
const sun = new THREE.DirectionalLight(0xfff1d0, 2.7);
sun.position.set(-140, 260, 130);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.near = 1;
sun.shadow.camera.far = 620;
sun.shadow.camera.left = -240;
sun.shadow.camera.right = 240;
sun.shadow.camera.top = 240;
sun.shadow.camera.bottom = -240;
scene.add(sun);

const raw = activeCircuit.ctrl;
const SCALE = 0.17;
const OFFSET = new THREE.Vector3(-270, 0, -250);
const curve = new THREE.CatmullRomCurve3(raw.map(([x,y]) => new THREE.Vector3(x*SCALE+OFFSET.x,0,y*SCALE+OFFSET.z)), true, 'catmullrom', 0.45);
const ROAD_W = 18;
const SAMPLES = 640;
const keys = new Set();
const cars = [];
let view = 'CHASE';
let camPos = new THREE.Vector3(0,40,-70);
let camTarget = new THREE.Vector3();

const track = buildTrack();
scene.add(track);
scene.add(buildWorld(activeCircuit));

const player = createCar(0x39d2c0, 0x0e5a52, true);
Object.assign(player, {progress:0.01, speed:0, maxSpeed:118, lap:1, lateral:0, steer:0, last:0});
scene.add(player.mesh);
cars.push(player);
[[0xe8443a,0x6a1a14,.045,.92],[0x3a7fe8,0x10316e,.11,.97],[0xf0c860,0x7a5410,.19,.89],[0x9a5ae8,0x3c1a6e,.29,.94],[0x3ecf6e,0x0f5e2c,.39,.9]].forEach(([a,b,p,pace])=>{
  const r = createCar(a,b,false);
  Object.assign(r,{progress:p,speed:64+pace*20,maxSpeed:112,pace,lateral:0,steer:0,last:p});
  scene.add(r.mesh); cars.push(r);
});

addEventListener('keydown', e => { keys.add(e.key.toLowerCase()); if(e.key.toLowerCase()==='v') cycleView(); });
addEventListener('keyup', e => keys.delete(e.key.toLowerCase()));
addEventListener('resize', resize);
resize();
const clock = new THREE.Clock();
requestAnimationFrame(loop);

function buildTrack(){
  const group = new THREE.Group();
  const pos=[], col=[], idx=[];
  const c1 = new THREE.Color(0x252a31), c2 = new THREE.Color(0x303741);
  for(let i=0;i<=SAMPLES;i++){
    const t=i/SAMPLES, p=curve.getPointAt(t), tan=curve.getTangentAt(t).normalize(), n=new THREE.Vector3(-tan.z,0,tan.x).normalize();
    const crown=.35*Math.sin(t*Math.PI*12), l=p.clone().addScaledVector(n,ROAD_W/2), r=p.clone().addScaledVector(n,-ROAD_W/2);
    l.y=r.y=crown; pos.push(l.x,l.y,l.z,r.x,r.y,r.z);
    const cc=i%18<9?c1:c2; col.push(cc.r,cc.g,cc.b,cc.r,cc.g,cc.b);
  }
  for(let i=0;i<SAMPLES;i++){const a=i*2; idx.push(a,a+1,a+2,a+1,a+3,a+2);}
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
  geo.setIndex(idx); geo.computeVertexNormals();
  const road=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.86,metalness:.02}));
  road.receiveShadow=true; group.add(road);
  group.add(makeKerbs()); group.add(makeRails()); group.add(makeStartLine());
  return group;
}

function makeKerbs(){
  const g=new THREE.Group(), red=new THREE.MeshStandardMaterial({color:0xd93a32,roughness:.78}), white=new THREE.MeshStandardMaterial({color:0xe7e4dc,roughness:.78});
  const box=new THREE.BoxGeometry(2.6,.24,.95);
  for(let i=0;i<SAMPLES;i+=10){
    const t=i/SAMPLES, p=curve.getPointAt(t), tan=curve.getTangentAt(t).normalize(), n=new THREE.Vector3(-tan.z,0,tan.x).normalize();
    for(const side of [-1,1]){const k=new THREE.Mesh(box,(i/10)%2?red:white); k.position.copy(p).addScaledVector(n,side*(ROAD_W/2+.9)); k.position.y=.3; k.rotation.y=Math.atan2(tan.x,tan.z); k.castShadow=true; k.receiveShadow=true; g.add(k);}
  }
  return g;
}

function makeRails(){
  const g=new THREE.Group(), mat=new THREE.MeshStandardMaterial({color:0x88909b,metalness:.35,roughness:.48}), postMat=new THREE.MeshStandardMaterial({color:0x20242c,roughness:.65});
  const railGeo=new THREE.BoxGeometry(1.6,1,.55), postGeo=new THREE.CylinderGeometry(.18,.18,2.2,8);
  const points=[];
  for(let i=0;i<=SAMPLES;i+=14){const t=i/SAMPLES, p=curve.getPointAt(t), tan=curve.getTangentAt(t).normalize(), n=new THREE.Vector3(-tan.z,0,tan.x).normalize(); points.push(p.clone().addScaledVector(n,ROAD_W/2+4.5),p.clone().addScaledVector(n,-ROAD_W/2-4.5));}
  for(const p of points){const post=new THREE.Mesh(postGeo,postMat); post.position.set(p.x,1.1,p.z); post.castShadow=true; g.add(post);}
  for(let i=0;i<points.length-2;i+=2){for(const o of [0,1]){const a=points[i+o], b=points[i+2+o], mid=a.clone().lerp(b,.5), len=a.distanceTo(b); const rail=new THREE.Mesh(railGeo,mat); rail.scale.x=len/1.6; rail.position.set(mid.x,1.65,mid.z); rail.rotation.y=Math.atan2(b.x-a.x,b.z-a.z)+Math.PI/2; rail.castShadow=true; g.add(rail);}}
  return g;
}

function makeStartLine(){
  const g=new THREE.Group(), a=new THREE.MeshStandardMaterial({color:0xf0f2f4}), b=new THREE.MeshStandardMaterial({color:0x111318}), geo=new THREE.BoxGeometry(1.2,.05,1.2);
  const p=curve.getPointAt(.002), tan=curve.getTangentAt(.002).normalize(), n=new THREE.Vector3(-tan.z,0,tan.x).normalize();
  for(let row=0;row<2;row++)for(let col=-7;col<=7;col++){const tile=new THREE.Mesh(geo,(row+col)%2?a:b); tile.position.copy(p).addScaledVector(n,col*1.18).addScaledVector(tan,row*1.18); tile.position.y=.55; tile.rotation.y=Math.atan2(tan.x,tan.z); g.add(tile);}
  return g;
}

function buildWorld(circuit){
  const g=new THREE.Group();
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(1200,1200),new THREE.MeshStandardMaterial({color:0x18351d,roughness:.95}));
  ground.rotation.x=-Math.PI/2; ground.position.y=-.06; ground.receiveShadow=true; g.add(ground);
  const water=new THREE.Mesh(new THREE.PlaneGeometry(380,260),new THREE.MeshStandardMaterial({color:0x123f66,roughness:.38,metalness:.05}));
  water.rotation.x=-Math.PI/2; water.position.set(-120,-.03,25); g.add(water);
  const cityMat=new THREE.MeshStandardMaterial({color:0x1a2331,roughness:.8});
  for(let i=0;i<38;i++){const h=8+Math.random()*36, b=new THREE.Mesh(new THREE.BoxGeometry(7+Math.random()*10,h,7+Math.random()*10),cityMat); b.position.set(-260+i*14+Math.random()*5,h/2,-300-Math.random()*35); b.castShadow=true; g.add(b);}
  addCircuitLandmark(g, circuit);
  const treeMat=new THREE.MeshStandardMaterial({color:0x254b2a,roughness:.8}), trunkMat=new THREE.MeshStandardMaterial({color:0x5a3d24,roughness:.8});
  for(let i=0;i<SAMPLES;i+=18){const t=i/SAMPLES,p=curve.getPointAt(t),tan=curve.getTangentAt(t).normalize(),n=new THREE.Vector3(-tan.z,0,tan.x).normalize(),side=i%36===0?1:-1, spot=p.clone().addScaledVector(n,side*(ROAD_W/2+24+Math.random()*22)); const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.45,.6,4,7),trunkMat); trunk.position.set(spot.x,2,spot.z); trunk.castShadow=true; g.add(trunk); const crown=new THREE.Mesh(new THREE.ConeGeometry(3.1+Math.random()*1.6,8+Math.random()*5,9),treeMat); crown.position.set(spot.x,8,spot.z); crown.castShadow=true; g.add(crown);}
  const mMat=new THREE.MeshStandardMaterial({color:0x46566a,roughness:.9});
  for(let i=0;i<9;i++){const peak=new THREE.Mesh(new THREE.ConeGeometry(36+i*5,55+i*7,4),mMat); peak.position.set(-320+i*80,20,-430-(i%2)*35); peak.rotation.y=Math.PI/4; g.add(peak);}
  return g;
}

function addCircuitLandmark(g, circuit){
  const matStone = new THREE.MeshStandardMaterial({color:0xb9ad93,roughness:.78});
  const matRoof = new THREE.MeshStandardMaterial({color:0x2a4034,roughness:.68});
  const base = new THREE.Mesh(new THREE.BoxGeometry(46,10,20), matStone);
  base.position.set(-55,5,-95); base.castShadow=true; g.add(base);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(28,13,4), matRoof);
  roof.position.set(-55,18,-95); roof.rotation.y=Math.PI/4; roof.castShadow=true; g.add(roof);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(8,18,10), matRoof);
  dome.position.set(-55,24,-95); dome.scale.y=.62; dome.castShadow=true; g.add(dome);
  const label = circuit.name || 'Harbour Circuit';
  console.info(`Apex Canada 3D loaded circuit: ${label}`);
}

function createCar(primary,secondary,isPlayer){
  const g=new THREE.Group(), paint=new THREE.MeshStandardMaterial({color:primary,metalness:.2,roughness:.35}), dark=new THREE.MeshStandardMaterial({color:0x080a0f,metalness:.15,roughness:.55}), acc=new THREE.MeshStandardMaterial({color:secondary,metalness:.25,roughness:.45}), rubber=new THREE.MeshStandardMaterial({color:0x050505,roughness:.78});
  const add=(mesh,x,y,z)=>{mesh.position.set(x,y,z); mesh.castShadow=true; g.add(mesh); return mesh;};
  add(new THREE.Mesh(new THREE.BoxGeometry(3.2,.7,6.2),paint),0,.9,0);
  add(new THREE.Mesh(new THREE.BoxGeometry(1.25,.38,5.4),paint),0,.72,3.8);
  const cockpit=add(new THREE.Mesh(new THREE.SphereGeometry(.65,18,10),dark),0,1.24,.6); cockpit.scale.set(1,.46,1.25);
  add(new THREE.Mesh(new THREE.BoxGeometry(.25,1.1,2.2),acc),0,1.52,-1.6);
  add(new THREE.Mesh(new THREE.BoxGeometry(6.4,.18,.7),acc),0,.35,6.4);
  add(new THREE.Mesh(new THREE.BoxGeometry(6,.28,.72),dark),0,1.55,-3.9);
  const wheelGeo=new THREE.CylinderGeometry(.82,.82,.56,18); wheelGeo.rotateZ(Math.PI/2);
  for(const x of [-2.4,2.4])for(const z of [2.8,-2.55])add(new THREE.Mesh(wheelGeo,rubber),x,.55,z);
  const halo=add(new THREE.Mesh(new THREE.TorusGeometry(.95,.055,8,32,Math.PI*1.3),dark),0,1.45,.65); halo.rotation.x=Math.PI/2; halo.rotation.z=Math.PI*.85;
  if(isPlayer){const glow=new THREE.PointLight(primary,.9,18); glow.position.set(0,1.6,-2.8); g.add(glow);}
  return {mesh:g,isPlayer};
}

function updateCar(car,dt){
  if(car.isPlayer){
    const throttle=keys.has('arrowup')||keys.has('w'), brake=keys.has('arrowdown')||keys.has('s'), left=keys.has('arrowleft')||keys.has('a'), right=keys.has('arrowright')||keys.has('d'), boost=keys.has('shift');
    if(throttle)car.speed+=(boost?48:33)*dt; else car.speed-=10*dt; if(brake)car.speed-=38*dt;
    car.speed=THREE.MathUtils.clamp(car.speed,0,boost?car.maxSpeed*1.13:car.maxSpeed);
    car.steer=THREE.MathUtils.lerp(car.steer,(left?-1:0)+(right?1:0),1-Math.pow(.001,dt));
    car.lateral+=car.steer*dt*(10+car.speed*.035); car.lateral*=Math.pow(.22,dt); car.lateral=THREE.MathUtils.clamp(car.lateral,-6.2,6.2);
  }else{
    const target=car.maxSpeed*car.pace*(.86+.08*Math.sin(performance.now()*.0004+car.progress*12)); car.speed=THREE.MathUtils.lerp(car.speed,target,.8*dt); car.lateral=Math.sin(performance.now()*.0006+car.progress*32)*2.2;
  }
  car.last=car.progress; car.progress=(car.progress+(car.speed*dt)/1850)%1; if(car.isPlayer&&car.progress<car.last)car.lap++;
  const p=curve.getPointAt(car.progress), tan=curve.getTangentAt(car.progress).normalize(), n=new THREE.Vector3(-tan.z,0,tan.x).normalize(), pos=p.clone().addScaledVector(n,car.lateral);
  pos.y=.45+.2*Math.sin(car.progress*Math.PI*12); car.mesh.position.copy(pos); car.mesh.rotation.y=Math.atan2(tan.x,tan.z)-car.steer*.12;
  for(const child of car.mesh.children)if(child.geometry&&child.geometry.type==='CylinderGeometry')child.rotation.x+=car.speed*dt*.06;
}

function updateCamera(dt){
  const p=player.mesh.position, f=curve.getTangentAt(player.progress).normalize(), r=new THREE.Vector3(f.z,0,-f.x).normalize(); let desired, look;
  if(view==='COCKPIT'){desired=p.clone().addScaledVector(f,3.8).add(new THREE.Vector3(0,2.25,0)); look=p.clone().addScaledVector(f,55).add(new THREE.Vector3(0,2.1,0));}
  else if(view==='BUMPER'){desired=p.clone().addScaledVector(f,6.5).add(new THREE.Vector3(0,.95,0)); look=p.clone().addScaledVector(f,70).add(new THREE.Vector3(0,1.15,0));}
  else{desired=p.clone().addScaledVector(f,-23).addScaledVector(r,-player.steer*2).add(new THREE.Vector3(0,10.5,0)); look=p.clone().addScaledVector(f,36).add(new THREE.Vector3(0,3.2,0));}
  const s=1-Math.pow(.0007,dt); camPos.lerp(desired,s); camTarget.lerp(look,s); camera.position.copy(camPos); camera.lookAt(camTarget); camera.fov=THREE.MathUtils.lerp(camera.fov,view==='CHASE'?62+player.speed*.06:70+player.speed*.035,.05); camera.updateProjectionMatrix();
}

function cycleView(){view=view==='CHASE'?'COCKPIT':view==='COCKPIT'?'BUMPER':'CHASE'; viewEl.textContent=view;}
function resize(){renderer.setSize(innerWidth,innerHeight,false); camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix();}
function loop(){const dt=Math.min(clock.getDelta(),.033); cars.forEach(c=>updateCar(c,dt)); updateCamera(dt); speedEl.textContent=Math.round(player.speed*3.1).toString().padStart(3,'0'); lapEl.textContent=Math.min(player.lap,3); statusEl.textContent = player.lap > 3 ? 'RUN COMPLETE' : activeCircuit.name.toUpperCase(); renderer.render(scene,camera); requestAnimationFrame(loop);}
