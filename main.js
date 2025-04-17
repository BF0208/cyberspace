
let scene, camera, renderer;
let images = [];
let particles;
let scroll = 0;

const loader = new THREE.TextureLoader();

init();
animate();

function init() {
  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xe0e0e0, 5, 40);

  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 0;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Load images
  for (let i = 1; i <= 15; i++) {
    loader.load(`images/image${i}.jpg`, (texture) => {
      const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 0 });
      const geometry = new THREE.PlaneGeometry(2.2, 1.5);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = (Math.random() - 0.5) * 12;
      mesh.position.y = (Math.random() - 0.5) * 8;
      mesh.position.z = -i * 4;
      scene.add(mesh);
      images.push({ mesh, revealed: false });
    });
  }

  // Particle field
  const particleCount = 1000;
  const positions = [];
  for (let i = 0; i < particleCount; i++) {
    positions.push((Math.random() - 0.5) * 50);
    positions.push((Math.random() - 0.5) * 50);
    positions.push((Math.random() - 1.0) * 100);
  }

  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

  const particleMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1, opacity: 0.4, transparent: true });
  particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles);

  window.addEventListener('resize', onWindowResize, false);
  window.addEventListener('wheel', (e) => {
    scroll += e.deltaY * 0.002;
  });
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  camera.position.z = scroll;
  camera.position.x = Math.sin(Date.now() * 0.0003) * 0.5;
  camera.position.y = Math.cos(Date.now() * 0.0002) * 0.3;

  // Reveal images when nearby
  images.forEach(({ mesh, revealed }) => {
    const distance = Math.abs(camera.position.z - mesh.position.z);
    if (!revealed && distance < 10) {
      gsap.to(mesh.material, { opacity: 1, duration: 2 });
      mesh.revealed = true;
    }
  });

  renderer.render(scene, camera);
}
