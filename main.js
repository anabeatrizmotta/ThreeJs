import './style.css'
import * as THREE from 'three';

const scene = new THREE.Scene(); // scene == container

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);  // 1 - field of view. 2 - aspect ratio (user's browser window). 3 and 4 - view frustrum, control visible objects relative to the camera

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg')
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);

renderer.render(scene, camera); // render == draw

// -- object -- 

const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
const material = new THREE.MeshStandardMaterial( { color: 0xFF6347 });
const torus = new THREE.Mesh(geometry, material);

scene.add(torus);

// -- light --

const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(4, 4, 12); // x, y, z

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(pointLight, ambientLight);

// Helpers
const lightHelper = new THREE.PointLightHelper(pointLight)
const gridHelper = new THREE.GridHelper(200, 150);
scene.add(lightHelper, gridHelper)

function addStar() {
  const geometry = new THREE.SphereGeometry(0.25, 24, 24);
  const material = new THREE.MeshStandardMaterial({color: 0xffffff})
  const star = new THREE.Mesh(geometry, material);

  const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));

  star.position.set(x, y, z);
  scene.add(star);
}

Array(200).fill().forEach(addStar)

// -- background --
// const backgroundPhoto = new THREE.TextureLoader().load( " some photo ");
// sceme.background = backgroundPhoto;


function moveCamera() {
  const t = document.body.getBoundingClientRect().top;
  torus.rotation.x += 0.05;
  torus.rotation.y += 0.075;
  torus.rotation.z += 0.05;

  camera.position.x = t * -0.0002;
}

document.body.onscroll = moveCamera;
moveCamera();

function animate() {
  requestAnimationFrame(animate);
  
  torus.rotation.x += 0.01;
  torus.rotation.y += 0.005;
  torus.rotation.z += 0.01;

  renderer.render(scene, camera);
}

animate();
