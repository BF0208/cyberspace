
import * as THREE from 'https://unpkg.com/three@0.154.0/build/three.module.js';
import { gsap } from 'https://unpkg.com/gsap@3.12.5/index.js';

let scene, camera, renderer, clock;
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

  clock = new THREE.Clock();

  const gridMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.15 });
  const gridSize = 100;
  const divisions = 20;
  const spacing = gridSize / divisions;

  for (let axis = 0; axis < 3; axis++) {
    for (let i = -divisions / 2; i <= divisions / 2; i++) {
      const points = [];
      const offset = i * spacing;
      const p1 = new THREE.Vector3();
      const p2 = new THREE.Vector3();

      if (axis === 0) { p1.set(offset, -gridSize/2, 0); p2.set(offset, gridSize/2, 0); }
      if (axis === 1) { p1.set(-gridSize/2, offset, 0); p2.set(gridSize/2, offset, 0); }
      if (axis === 2) { p1.set(0, offset, -gridSize/2); p2.set(0, offset, gridSize/2); }

      const geometry = new THREE.BufferGeometry().setFromPoints([p1, p2]);
      const line = new THREE.Line(geometry, gridMaterial);
      scene.add(line);
    }
  }

  imageGroup = new THREE.Group();
  scene.add(imageGroup);

  const loader = new THREE.TextureLoader();
  for (let i = 1; i <= 10; i++) {
    loader.load(`images/image${i}.jpg`, (texture) => {
      const material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0.0 },
          texture: { value: texture }
        },
        vertexShader: document.getElementById('vertexShader').textContent,
        fragmentShader: document.getElementById('fragmentShader').textContent,
        transparent: true
      });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.5), material);
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

  const time = clock.getElapsedTime();
  images.forEach(mesh => {
    if (mesh.material.uniforms) {
      mesh.material.uniforms.time.value = time;
    }
    mesh.lookAt(camera.position);
  });

  currentX += (targetX - currentX) * 0.1;
  currentY += (targetY - currentY) * 0.1;

  camera.position.x = currentX;
  camera.position.y = currentY;
  if (!scrollLocked) camera.position.z = scroll;

  const lookZ = scrollLocked ? camera.position.z - 1 : scroll - 1;
  camera.lookAt(new THREE.Vector3(currentX, currentY, lookZ));

  renderer.render(scene, camera);
}
