
let scene, camera, renderer;
let images = [];
let scrollY = 0;

init();
animate();

function init() {
  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xe0e0e0, 5, 20);

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 0;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const loader = new THREE.TextureLoader();
  const imagePaths = ['images/image1.jpg', 'images/image2.jpg', 'images/image3.jpg', 'images/image4.jpg', 'images/image5.jpg'];

  imagePaths.forEach((path, i) => {
    loader.load(path, (texture) => {
      const geometry = new THREE.PlaneGeometry(1.5, 1);
      const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 0 });
      const plane = new THREE.Mesh(geometry, material);
      plane.position.x = (Math.random() - 0.5) * 10;
      plane.position.y = (Math.random() - 0.5) * 6;
      plane.position.z = -i * 6 - 5;
      scene.add(plane);
      images.push({ mesh: plane, revealed: false });
    });
  });

  setTimeout(() => {
    renderer.domElement.style.opacity = 1;
  }, 500);

  window.addEventListener('resize', onWindowResize, false);
  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
  });
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  const scrollProgress = scrollY / 1000;
  camera.position.z = scrollProgress * 10;

  const time = Date.now() * 0.001;
  camera.position.x += Math.sin(time * 0.3) * 0.0015;
  camera.position.y += Math.cos(time * 0.2) * 0.0015;

  images.forEach(({ mesh, revealed }) => {
    // Gentle floating motion
    mesh.position.y += Math.sin(time + mesh.position.x) * 0.0003;

    // Fade in when near camera
    const distance = camera.position.z - mesh.position.z;
    if (!revealed && distance > -2 && distance < 8) {
      gsap.to(mesh.material, { opacity: 1, duration: 2 });
      mesh.revealed = true;
    }
  });

  renderer.render(scene, camera);
}
