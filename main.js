import './style.css';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

const scene = new THREE.Scene(); // scene == container
const textureLoader = new THREE.TextureLoader();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);  // 1 - field of view. 2 - aspect ratio (user's browser window). 3 and 4 - view frustrum, control visible objects relative to the camera
camera.position.z = 15;

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
  antialias: true
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.5, 0.8, 0.85);
composer.addPass(bloomPass);

const moon = createMoon();
scene.add(moon);

const sunLight = new THREE.DirectionalLight(0xffffff, 3);
sunLight.position.set(0, 0, -20);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 4096;
sunLight.shadow.mapSize.height = 4096;
sunLight.shadow.camera.near = 0.1;
sunLight.shadow.camera.far = 50;
scene.add(sunLight);

const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);

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
  
  moon.rotation.y += 0.001;

  composer.render();
}

function createMoon() {
  const textures = {
    surface: textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg'),
    normal: textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_normal_1024.jpg'),
    displacement: textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_displacement_1024.jpg')
  };

  const geometry = new THREE.SphereGeometry(5, 138, 138);
  const material = new THREE.MeshStandardMaterial({
    map: textures.surface,
    normalMap: textures.normal,
    displacementMap: textures.displacement,
    displacementScale: 0.2,
    roughness: 0.9,
    metalness: 0.0
  });

  const moon = new THREE.Mesh(geometry, material);
  moon.castShadow = true;
  moon.receiveShadow = true;
  return moon;
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
    new THREE.PointsMaterial({ color: 0xFFFFFF, size: 0.2 })
  );
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

animate();