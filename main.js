
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.154.0/build/three.module.js';

let scene, camera, renderer, clock;
let imageGroup = new THREE.Group();
let scroll = 0, targetScroll = 0;
let targetX = 0, targetY = 0;
let currentX = 0, currentY = 0;
let isDragging = false;
let dragStart = { x: 0, y: 0 };
let mouse = new THREE.Vector2();
let raycaster = new THREE.Raycaster();
let hovered = null, zoomed = null;

window.addEventListener('DOMContentLoaded', () => {
  init();
  animate();
});

function init() {
  clock = new THREE.Clock();
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0xc4c4c4, 0.05);

  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 500);
  camera.position.z = 0;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  scene.add(imageGroup);

  const loader = new THREE.TextureLoader();
  for (let i = 1; i <= 10; i++) {
    loader.load(`images/image${i}.jpg`, tex => {
      const mat = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0.0 },
          tex: { value: tex }
        },
        vertexShader: document.getElementById("vertexShader").textContent,
        fragmentShader: document.getElementById("fragmentShader").textContent,
        transparent: true
      });

      const geo = new THREE.PlaneGeometry(3, 2);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set((Math.random() - 0.5) * 30, (Math.random() - 0.5) * 20, -i * 10);
      imageGroup.add(mesh);
    });
  }

  const gridMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.08 });
  for (let x = -50; x <= 50; x += 5) {
    for (let y = -50; y <= 50; y += 5) {
      for (let z = -200; z <= 50; z += 5) {
        const geo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(x, y, z),
          new THREE.Vector3(x + 0.01, y + 0.01, z + 0.01)
        ]);
        const line = new THREE.Line(geo, gridMat);
        scene.add(line);
      }
    }
  }

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  window.addEventListener('wheel', e => {
    if (!zoomed) targetScroll += e.deltaY * 0.05;
  });

  window.addEventListener('pointerdown', e => {
    isDragging = true;
    dragStart.x = e.clientX;
    dragStart.y = e.clientY;
  });

  window.addEventListener('pointerup', () => {
    isDragging = false;
  });

  window.addEventListener('pointermove', e => {
    if (isDragging && !zoomed) {
      targetX -= (e.clientX - dragStart.x) * 0.01;
      targetY += (e.clientY - dragStart.y) * 0.01;
      dragStart.x = e.clientX;
      dragStart.y = e.clientY;
    }

    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  window.addEventListener('click', () => {
    if (hovered && !zoomed) {
      gsap.to(camera.position, {
        x: hovered.position.x,
        y: hovered.position.y,
        z: hovered.position.z + 4,
        duration: 1.2,
        ease: "power2.inOut"
      });
      zoomed = hovered;
    } else if (zoomed) {
      zoomed = null;
      gsap.to(camera.position, {
        x: currentX,
        y: currentY,
        z: scroll,
        duration: 1.2,
        ease: "power2.inOut"
      });
    }
  });
}

function animate() {
  requestAnimationFrame(animate);
  const time = clock.getElapsedTime();

  currentX += (targetX - currentX) * 0.1;
  currentY += (targetY - currentY) * 0.1;
  scroll += (targetScroll - scroll) * 0.1;

  if (!zoomed) {
    camera.position.set(currentX, currentY, scroll);
    camera.lookAt(currentX, currentY, scroll - 1);
  }

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(imageGroup.children);
  hovered = intersects.length > 0 ? intersects[0].object : null;

  imageGroup.children.forEach(mesh => {
    mesh.lookAt(camera.position);
    if (mesh.material.uniforms.time) {
      mesh.material.uniforms.time.value = time;
    }
    mesh.scale.set(1, 1, 1);
  });

  if (hovered) {
    hovered.scale.set(1.05, 1.05, 1.05);
  }

  renderer.render(scene, camera);
}
