
let scene, camera, renderer;
let images = [];

init();
animate();

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const loader = new THREE.TextureLoader();
  const imagePaths = ['images/image1.jpg', 'images/image2.jpg', 'images/image3.jpg', 'images/image4.jpg', 'images/image5.jpg'];

  imagePaths.forEach((path) => {
    loader.load(path, (texture) => {
      const geometry = new THREE.PlaneGeometry(1.5, 1);
      const material = new THREE.MeshBasicMaterial({ map: texture });
      const plane = new THREE.Mesh(geometry, material);
      plane.position.x = (Math.random() - 0.5) * 10;
      plane.position.y = (Math.random() - 0.5) * 6;
      plane.position.z = (Math.random() - 0.5) * 10;
      scene.add(plane);
      images.push(plane);
    });
  });

  window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  const time = Date.now() * 0.0005;
  camera.position.x = Math.sin(time) * 5;
  camera.position.z = Math.cos(time) * 5;
  camera.lookAt(scene.position);
  renderer.render(scene, camera);
}
