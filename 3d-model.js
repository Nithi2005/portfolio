import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js';

// Setup scene
const scene = new THREE.Scene();

// Setup camera
const camera = new THREE.PerspectiveCamera(15, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 15;

// Setup renderer
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.outputEncoding = THREE.sRGBEncoding;

const container = document.getElementById('optimus-3d-container');
container.appendChild(renderer.domElement);

// Add lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 2);
dirLight.position.set(5, 5, 5);
scene.add(dirLight);

const blueLight = new THREE.PointLight(0x00f2fe, 4, 15);
blueLight.position.set(-2, 1, 2);
scene.add(blueLight);

let model;
let mixer;

// Load GLTF Model (using RobotExpressive as standard proxy till you insert final Optimus GLB)
const loader = new GLTFLoader();
loader.load('optimus.glb', function(gltf) {
    model = gltf.scene;

    // Center and scale model to ensure it always fits well regardless of inherent GLB size
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3()).length();
    const center = box.getCenter(new THREE.Vector3());

    model.position.x += (model.position.x - center.x);
    model.position.y += (model.position.y - center.y);
    model.position.z += (model.position.z - center.z);
    
    // Scale fitting
    const scale = 5.0 / size;
    model.scale.set(scale, scale, scale);

    // Initial position for Hero
    model.position.set(2.0, -0.2, 0); // slightly right
    model.rotation.set(0, -0.4, 0);  // slightly angled

    scene.add(model);

    // Play animation if available
    if (gltf.animations && gltf.animations.length) {
        mixer = new THREE.AnimationMixer(model);
        // Grab Walking or Idle
        const targetAnim = gltf.animations.find(a => a.name.toLowerCase().includes('idle')) || gltf.animations[0];
        if(targetAnim) {
            mixer.clipAction(targetAnim).play();
        }
    }

    // Show container
    setTimeout(() => {
        container.classList.add('loaded');
        setupScrollAnimation();
    }, 2500); // Sync with loading overlay duration
}, undefined, function (error) {
    console.error("Error loading glb:", error);
});

// Render loop
const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);
    if (mixer) {
        mixer.update(clock.getDelta());
    }
    // Auto slight floating
    if (model) {
        model.position.y += Math.sin(clock.getElapsedTime() * 2) * 0.0015; 
    }
    renderer.render(scene, camera);
}
animate();

// Resize handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// GSAP ScrollTrigger Sequence natively mapping 3D mesh coordinates
function setupScrollAnimation() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    
    // Assuming GSAP is loaded globally via CDN in index.html
    const tl = window.gsap.timeline({
        scrollTrigger: {
            trigger: ".portfolio-scroll-section",
            start: "top center",
            end: "bottom center",
            scrub: 1.5
        }
    });

    // Move model to the left and rotate it to face content
    tl.to(model.position, {
        x: -2.5,
        y: 0.5,
        z: 3.5,
        duration: 1
    }, 0);

    tl.to(model.rotation, {
        x: 0,
        y: 0.8,
        z: 0,
        duration: 1
    }, 0);
}
