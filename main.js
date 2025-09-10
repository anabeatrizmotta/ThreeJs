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
controls.maxDistance = 2000;

// bloom Effect
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.3, 0.8, 0.6);
composer.addPass(bloomPass);

const EARTH_RADIUS_KM = 6371;
const MOON_RADIUS_KM = 1737;
const EARTH_MOON_DIST_KM = 100000;

const SCALE = 1/1000; 

const earthGeometry = new THREE.SphereGeometry(EARTH_RADIUS_KM * SCALE * 1.5, 64, 64);
const earthTexture = textureLoader.load("https://cdn.jsdelivr.net/gh/mrdoob/three.js@r129/examples/textures/planets/earth_atmos_2048.jpg");
const earthMaterial = new THREE.MeshPhongMaterial({
  map: earthTexture,
  specular: 0x222222,
  shininess: 25,
  bumpScale: 0.05,
});

const earth = new THREE.Mesh(earthGeometry, earthMaterial);
scene.add(earth);

// moon
const moonGeometry = new THREE.SphereGeometry(MOON_RADIUS_KM * SCALE * 1.5, 128, 128);
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
moon.position.set(EARTH_MOON_DIST_KM * SCALE, 0, 0);
scene.add(moon);

earth.position.set(0, 0, 0);

const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
sunLight.position.set(-500, 200, 500);
scene.add(sunLight);

let orbitalAngle = 0;
const orbitalSpeed = (2 * Math.PI) / (27.3 * 24 * 60 * 60); // 27.3 dias em radianos/ms
const moonOrbitRadius = EARTH_MOON_DIST_KM * SCALE;

const stars = createStarField();
scene.add(stars);

// controles do mouse
let mouseX = 0, mouseY = 0;
document.addEventListener('mousemove', (e) => {
  mouseX = (e.clientX / window.innerWidth) * 2 - 1;
  mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
});


let focusOnMoon = false;

// troca de foco
document.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    e.preventDefault();
    focusOnMoon = !focusOnMoon;
    controls.target = focusOnMoon ? moon.position : earth.position;
  }
});

function animate() {
  requestAnimationFrame(animate);

  const now = Date.now();
  orbitalAngle += orbitalSpeed * 100;
  
  moon.position.x = Math.cos(orbitalAngle) * moonOrbitRadius;
  moon.position.z = Math.sin(orbitalAngle) * moonOrbitRadius;
  
  moon.rotation.y = orbitalAngle + Math.PI/2;
  
  earth.rotation.y += 0.002;

  sunLight.position.x = Math.cos(now * 0.0001) * 1000;
  sunLight.position.z = Math.sin(now * 0.0001) * 1000;

  camera.position.x += (mouseX * 15 - camera.position.x) * 0.05;
  camera.position.y += (mouseY * 15 - camera.position.y) * 0.05;

  if (focusOnMoon) {
    camera.lookAt(moon.position);
  } else {
    camera.lookAt(earth.position);
  }

  controls.minDistance = 30;
  controls.maxDistance = 1000;

  controls.update();
  composer.render();
}

function createStarField() {
  const geometry = new THREE.BufferGeometry();
  const vertices = [];
  
  for (let i = 0; i < 10000; i++) {
    vertices.push(
      THREE.MathUtils.randFloatSpread(2000),
      THREE.MathUtils.randFloatSpread(2000),
      THREE.MathUtils.randFloatSpread(2000)
    );
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

  const starTexture = new THREE.TextureLoader().load(
    "https://threejs.org/examples/textures/sprites/circle.png"
  );

  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      map: starTexture,
      color: 0xffffff,
      size: 1.2,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
  );
}


window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

animate();