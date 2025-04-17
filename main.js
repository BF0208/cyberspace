
import * as THREE from 'https://unpkg.com/three@0.154.0/build/three.module.js';
import { gsap } from 'https://unpkg.com/gsap@3.12.5/index.js';

let scene, camera, renderer;
let scroll = 0;
let images = [];
let isZoomed = false;
let scrollLocked = false;
let targetX = 0, targetY = 0;
let currentX = 0, currentY = 0;
let isDragging = false;
let prevMouse = { x: 0, y: 0 };
let imageGroup;

init();
animate();

function init() {
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0xc4c4c4, 0.05);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(0, 0, 5);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  imageGroup = new THREE.Group();
  scene.add(imageGroup);

  const loader = new THREE.TextureLoader();
  for (let i = 1; i <= 10; i++) {
    loader.load(`images/image${i}.jpg`, (texture) => {
      // Use MeshBasicMaterial for testing
      const mat = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.5), mat);
      mesh.position.set((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 4, -i * 8);
      imageGroup.add(mesh);
      images.push(mesh);
    });
  }

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  window.addEventListener('wheel', (e) => {
    if (!scrollLocked) scroll += e.deltaY * 0.002;
  });

  renderer.domElement.addEventListener('mousedown', (e) => {
    isDragging = true;
    prevMouse = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener('mouseup', () => isDragging = false);
  window.addEventListener('mousemove', (e) => {
    if (!isDragging || scrollLocked) return;
    const dx = e.clientX - prevMouse.x;
    const dy = e.clientY - prevMouse.y;
    targetX -= dx * 0.01;
    targetY += dy * 0.01;
    prevMouse = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener('click', onClick);
}

function onClick(event) {
  if (isZoomed) {
    scrollLocked = false;
    gsap.to(camera.position, {
      x: currentX,
      y: currentY,
      z: scroll,
      duration: 1,
      ease: "power2.inOut"
    });
    isZoomed = false;
    return;
  }

  const mouse = new THREE.Vector2(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(imageGroup.children);
  if (intersects.length > 0) {
    const target = intersects[0].object;
    scrollLocked = true;
    gsap.to(camera.position, {
      x: target.position.x,
      y: target.position.y,
      z: target.position.z + 2,
      duration: 1.2,
      ease: "power2.inOut"
    });
    isZoomed = true;
  }
}

function animate() {
  requestAnimationFrame(animate);

  currentX += (targetX - currentX) * 0.1;
  currentY += (targetY - currentY) * 0.1;

  camera.position.x = currentX;
  camera.position.y = currentY;
  if (!scrollLocked) camera.position.z = scroll;

  const lookZ = scrollLocked ? camera.position.z - 1 : scroll - 1;
  camera.lookAt(new THREE.Vector3(currentX, currentY, lookZ));

  imageGroup.children.forEach(mesh => {
    mesh.lookAt(camera.position);
  });

  renderer.render(scene, camera);
}
