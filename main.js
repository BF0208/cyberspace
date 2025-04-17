
import * as THREE from 'https://unpkg.com/three@0.154.0/build/three.module.js';
import { gsap } from 'https://unpkg.com/gsap@3.12.5/index.js';

let scene, camera, renderer;
let scroll = 0;
let images = [];
let targetX = 0, targetY = 0;
let currentX = 0, currentY = 0;
let isDragging = false;
let prevMouse = { x: 0, y: 0 };

init();
animate();

function init() {
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0xe0e0e0, 0.05);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 0;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const gridHelper = new THREE.GridHelper(100, 50, 0xffffff, 0xffffff);
  gridHelper.material.opacity = 0.15;
  gridHelper.material.transparent = true;
  scene.add(gridHelper);

  const particles = new THREE.BufferGeometry();
  const particleCount = 1000;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 100;
  }
  particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1, transparent: true, opacity: 0.3 });
  const particleSys = new THREE.Points(particles, particleMat);
  scene.add(particleSys);

  const loader = new THREE.TextureLoader();
  for (let i = 1; i <= 15; i++) {
    loader.load(`images/image${i}.jpg`, (texture) => {
      const mat = new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 0 });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.5), mat);
      mesh.position.set((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 6, -i * 5);
      scene.add(mesh);
      images.push({ mesh, revealed: false });
    });
  }

  window.addEventListener('resize', onWindowResize, false);
  window.addEventListener('wheel', (e) => {
    scroll += e.deltaY * 0.002;
  });

  renderer.domElement.addEventListener('mousedown', (e) => {
    isDragging = true;
    prevMouse = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener('mouseup', () => isDragging = false);

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - prevMouse.x;
    const dy = e.clientY - prevMouse.y;
    targetX -= dx * 0.01;
    targetY += dy * 0.01;
    prevMouse = { x: e.clientX, y: e.clientY };
  });
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  // Easing camera toward target
  currentX += (targetX - currentX) * 0.1;
  currentY += (targetY - currentY) * 0.1;

  camera.position.x = currentX;
  camera.position.y = currentY;
  camera.position.z = scroll;

  const lookAtZ = scroll - 1;
  camera.lookAt(new THREE.Vector3(currentX, currentY, lookAtZ));

  images.forEach(({ mesh, revealed }) => {
    if (!revealed && Math.abs(camera.position.z - mesh.position.z) < 10) {
      mesh.material.opacity = 1;
      mesh.revealed = true;
    }
  });

  renderer.render(scene, camera);
}
