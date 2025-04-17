let scene, camera, renderer, controls;
let scroll = 0;
let images = [];

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

  const size = 100;
  const divisions = 50;
  const gridHelper = new THREE.GridHelper(size, divisions, 0xffffff, 0xffffff);
  gridHelper.material.opacity = 0.15;
  gridHelper.material.transparent = true;
  scene.add(gridHelper);

  const particleCount = 1200;
  const particles = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 100;
  }
  particles.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const particleMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1, transparent: true, opacity: 0.3 });
  const pointCloud = new THREE.Points(particles, particleMat);
  scene.add(pointCloud);

  const loader = new THREE.TextureLoader();
  for (let i = 1; i <= 15; i++) {
    loader.load(`images/image${i}.jpg`, (texture) => {
      const geom = new THREE.PlaneGeometry(2.2, 1.5);
      const mat = new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 0 });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 6, -i * 5);
      scene.add(mesh);
      images.push({ mesh, revealed: false });
    });
  }

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.04;
  controls.rotateSpeed = 0.25;
  controls.enableZoom = false;
  controls.enablePan = false;

  window.addEventListener("resize", onWindowResize, false);
  window.addEventListener("wheel", (e) => {
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
  controls.update();
  camera.position.z = scroll;
  const time = Date.now() * 0.001;
  camera.position.x += Math.sin(time * 0.2) * 0.0005;
  camera.position.y += Math.cos(time * 0.2) * 0.0005;

  images.forEach(({ mesh, revealed }) => {
    if (!revealed && Math.abs(camera.position.z - mesh.position.z) < 10) {
      mesh.material.opacity = 1;
      mesh.revealed = true;
    }
  });

  renderer.render(scene, camera);
}