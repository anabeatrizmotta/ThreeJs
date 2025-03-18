import './style.css';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene(); // scene == container
const textureLoader = new THREE.TextureLoader();

const textureURL = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/17271/lroc_color_poles_1k.jpg";
const displacementURL = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/17271/ldem_3_8bit.jpg";

const texture = textureLoader.load(textureURL);
const displacementMap = textureLoader.load(displacementURL);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 10;

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
  antialias: true
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false;
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.rotateSpeed = 0.5;
controls.zoomSpeed = 1.0;
controls.minDistance = 4;
controls.maxDistance = 20;

// bloom Effect
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.3, 0.8, 0.6);
composer.addPass(bloomPass);

// moon
const moonGeometry = new THREE.SphereGeometry(2, 128, 128);
const moonMaterial = new THREE.MeshPhongMaterial({
  color: 0xffffff,
  map: texture,
  displacementMap: displacementMap,
  displacementScale: 0.1,
  bumpMap: displacementMap,
  bumpScale: 0.1,
  reflectivity: 0,
  shininess: 0
});

const moon = new THREE.Mesh(moonGeometry, moonMaterial);
moon.rotation.x = 3.1415 * 0.02;
moon.rotation.y = 3.1415 * 1.54;
scene.add(moon);


const light = new THREE.DirectionalLight(0xFFFFFF, 1);
light.position.set(-100, 10, 50);
scene.add(light);

const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.1);
hemisphereLight.color.setHSL(0.6, 1, 0.6);
hemisphereLight.groundColor.setHSL(0.095, 1, 0.75);
hemisphereLight.position.set(0, 0, 0);
scene.add(hemisphereLight);

const stars = createStarField();
scene.add(stars);

// controles do mouse
let mouseX = 0, mouseY = 0;
document.addEventListener('mousemove', (e) => {
  mouseX = (e.clientX / window.innerWidth) * 2 - 1;
  mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
});

function animate() {
  requestAnimationFrame(animate);

  // camera com mouse
  const targetX = mouseX * 10;
  const targetY = mouseY * 10;
  camera.position.x += (targetX - camera.position.x) * 0.05;
  camera.position.y += (targetY - camera.position.y) * 0.05;
  
  camera.lookAt(moon.position);
  controls.update();

  moon.rotation.y += 0.002;
  moon.rotation.x += 0.0001;

  composer.render();
}

function createStarField() {
  const geometry = new THREE.BufferGeometry();
  const vertices = [];
  
  for(let i = 0; i < 10000; i++) {
    vertices.push(
      THREE.MathUtils.randFloatSpread(2000),
      THREE.MathUtils.randFloatSpread(2000),
      THREE.MathUtils.randFloatSpread(2000)
    );
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({ color: 0xFFFFFF, size: 0.25 })
  );
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

animate();