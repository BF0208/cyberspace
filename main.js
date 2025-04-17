
import * as THREE from 'https://cdn.skypack.dev/three@0.154.0';
import { GLTFLoader } from 'https://cdn.skypack.dev/three/examples/jsm/loaders/GLTFLoader.js';

let camera, scene, renderer;
let clock = new THREE.Clock();
let images = [];
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let INTERSECTED = null;
let scrollZ = 0;
let targetZ = 0;
let dragging = false;
let dragStart = { x: 0, y: 0 };
let cameraTarget = new THREE.Vector3();
let glowGrid;
const loader = new THREE.TextureLoader();

init();
animate();

function init() {
  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xc4c4c4, 10, 100);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 0;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Light
  const light = new THREE.AmbientLight(0xffffff, 1);
  scene.add(light);

  // Volumetric grid
  const gridMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.1, transparent: true });
  const gridGroup = new THREE.Group();

  for (let x = -50; x <= 50; x += 5) {
    for (let y = -50; y <= 50; y += 5) {
      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x, y, -50),
        new THREE.Vector3(x, y, 50)
      ]);
      const line = new THREE.Line(geometry, gridMaterial);
      gridGroup.add(line);
    }
  }
  scene.add(gridGroup);

  // Load placeholder images
  for (let i = 1; i <= 10; i++) {
    loader.load(`images/image${i}.jpg`, texture => {
      const geometry = new THREE.PlaneGeometry(3, 2);
      const material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          tex: { value: texture }
        },
        vertexShader: document.getElementById('vertexShader').textContent,
        fragmentShader: document.getElementById('fragmentShader').textContent,
        transparent: true
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 30, Math.random() * -100);
      mesh.userData.originalPosition = mesh.position.clone();
      images.push(mesh);
      scene.add(mesh);
    });
  }

  window.addEventListener('resize', onWindowResize);
  document.addEventListener('wheel', onScroll);
  document.addEventListener('pointerdown', onPointerDown);
  document.addEventListener('pointermove', onPointerMove);
  document.addEventListener('pointerup', () => dragging = false);
  document.addEventListener('click', onClick);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onScroll(event) {
  targetZ += event.deltaY * 0.05;
}

function onPointerDown(event) {
  dragging = true;
  dragStart.x = event.clientX;
  dragStart.y = event.clientY;
}

function onPointerMove(event) {
  if (dragging) {
    camera.position.x += (event.clientX - dragStart.x) * 0.01;
    camera.position.y -= (event.clientY - dragStart.y) * 0.01;
    dragStart.x = event.clientX;
    dragStart.y = event.clientY;
  }

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
}

function onClick() {
  if (INTERSECTED) {
    cameraTarget.copy(INTERSECTED.position);
  }
}

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  const elapsed = clock.getElapsedTime();

  // Animate shader
  images.forEach(img => {
    if (img.material.uniforms.time) {
      img.material.uniforms.time.value = elapsed;
    }
    // Always look at camera
    img.lookAt(camera.position);
  });

  // Raycast hover
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(images);
  INTERSECTED = intersects.length > 0 ? intersects[0].object : null;

  if (INTERSECTED) {
    INTERSECTED.scale.set(1.05, 1.05, 1.05);
  }
  images.forEach(obj => {
    if (obj !== INTERSECTED) obj.scale.set(1, 1, 1);
  });

  // Smooth scroll
  scrollZ += (targetZ - scrollZ) * 0.05;
  camera.position.z = scrollZ;

  // Smooth camera target move
  camera.position.lerp(cameraTarget, 0.05);

  renderer.render(scene, camera);
}
