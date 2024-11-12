import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as CANNON from 'cannon-es';

const renderer = new THREE.WebGLRenderer();
const loader = new GLTFLoader();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(ambientLight);

const orbit = new OrbitControls(camera, renderer.domElement);

camera.position.set(0, 20, -30);

orbit.update();

let carMesh;
let carBody;
let forwardVelocity = 15;
let turnSpeed = Math.PI / 1.5;  // radians per second (adjust as necessary)
const mixers = [];
// Load the car model
loader.load('Models/car/scene.gltf', (GLTFScene) => {
    carMesh = GLTFScene.scene;
    GLTFScene.scene.scale.set(0.01, 0.01, 0.01);

    if (GLTFScene.animations && GLTFScene.animations.length) {
        const mixer = new THREE.AnimationMixer(carMesh);

        GLTFScene.animations.forEach((clip) => {
            const action = mixer.clipAction(clip);
            action.play();
        });

        mixers.push(mixer);
    }

    scene.add(carMesh);

    // Create the car's physics body
    const box = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 1));
    carBody = new CANNON.Body({
        mass: 1500,
    });
    carBody.addShape(box);
    carBody.position.set(0, 1, 0);
    world.addBody(carBody);
});

const boxGeo = new THREE.BoxGeometry(2, 2, 2);
const boxMat = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    wireframe: true
});
const boxMesh = new THREE.Mesh(boxGeo, boxMat);
scene.add(boxMesh);

const sphereGeo = new THREE.SphereGeometry(2);
const sphereMat = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    wireframe: true
});
const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
scene.add(sphereMesh);

const groundGeo = new THREE.PlaneGeometry(100, 100);
const groundMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    wireframe: true
});
const groundMesh = new THREE.Mesh(groundGeo, groundMat);
scene.add(groundMesh);

const world = new CANNON.World({
    gravity: new CANNON.Vec3(0, -9.81, 0)
});

const groundPhysMat = new CANNON.Material();

const groundBody = new CANNON.Body({
    //shape: new CANNON.Plane(),
    shape: new CANNON.Box(new CANNON.Vec3(50, 50, 0.1)),
    type: CANNON.Body.STATIC,
    material: groundPhysMat
});
world.addBody(groundBody);
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);

const boxPhysMat = new CANNON.Material();

const boxBody = new CANNON.Body({
    shape: new CANNON.Box(new CANNON.Vec3(1, 1, 1)),
    mass: 1,
    position: new CANNON.Vec3(1, 20, 0),
    material: boxPhysMat
});
world.addBody(boxBody);

boxBody.angularVelocity.set(0, 10, 0);
boxBody.angularDamping = 0.5;

const groundBoxContactMat = new CANNON.ContactMaterial(
    groundPhysMat,
    boxPhysMat,
    { friction: 0.4 }
);

world.addContactMaterial(groundBoxContactMat);

const spherePhysMat = new CANNON.Material();

const sphereBody = new CANNON.Body({
    shape: new CANNON.Sphere(2),
    mass: 10,
    position: new CANNON.Vec3(0, 15, 0),
    material: spherePhysMat
});
world.addBody(sphereBody);

const groundSphereContactMat = new CANNON.ContactMaterial(
    groundPhysMat,
    spherePhysMat,
    { restitution: 0.9 }
);

world.addContactMaterial(groundSphereContactMat);

sphereBody.linearDamping = 0.31;

// Key state tracking
const keys = {
    w: false,
    a: false,
    s: false,
    d: false
};

// Listen for keydown and keyup events
document.addEventListener('keydown', (event) => {
    if (event.key in keys) keys[event.key] = true;
});

document.addEventListener('keyup', (event) => {
    if (event.key in keys) keys[event.key] = false;
});


const timeStep = 1 / 60;

function animate() {
    world.step(timeStep);

    groundMesh.position.copy(groundBody.position);
    groundMesh.quaternion.copy(groundBody.quaternion);

    boxMesh.position.copy(boxBody.position);
    boxMesh.quaternion.copy(boxBody.quaternion);

    sphereMesh.position.copy(sphereBody.position);
    sphereMesh.quaternion.copy(sphereBody.quaternion);

    mixers.forEach((mixer) => mixer.update(timeStep));
    updateCarMovement(timeStep);

    renderer.render(scene, camera);
}

function updateCarMovement(timeStep) {
    if (!carBody) return;

    // Move forward
    if (keys.w) {
        const forward = new CANNON.Vec3(1, 0, 0); // Forward direction in local space
        carBody.quaternion.vmult(forward, forward); // Rotate forward vector by the car's quaternion
        const movement = forward.scale(forwardVelocity * timeStep);
        carBody.position.vadd(movement, carBody.position);
    }

    // Move backward
    if (keys.s) {
        const backward = new CANNON.Vec3(-1, 0, 0); // Backward direction in local space
        carBody.quaternion.vmult(backward, backward); // Rotate backward vector by the car's quaternion
        const movement = backward.scale(forwardVelocity * timeStep);
        carBody.position.vadd(movement, carBody.position);
    }

    // Turn left
    if (keys.a) {
        const turnLeft = new CANNON.Quaternion();
        turnLeft.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), turnSpeed * timeStep);
        carBody.quaternion = carBody.quaternion.mult(turnLeft);
    }

    // Turn right
    if (keys.d) {
        const turnRight = new CANNON.Quaternion();
        turnRight.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -turnSpeed * timeStep);
        carBody.quaternion = carBody.quaternion.mult(turnRight);
    }

    // Sync the car mesh position and orientation with the physics body
    if (carMesh) {
        carMesh.position.copy(carBody.position);
        carMesh.quaternion.copy(carBody.quaternion);
    }
}


renderer.setAnimationLoop(animate);

window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
