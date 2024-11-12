import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as CANNON from 'cannon-es';

const renderer = new THREE.WebGLRenderer();
const loader = new GLTFLoader();
const textureLoader = new THREE.TextureLoader();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

renderer.shadowMap.enabled = true;
const ambientLight = new THREE.AmbientLight(0xffffff);
const pointLight = new THREE.PointLight(0xffffff, 2.5, 300, 0);
pointLight.castShadow = true;
pointLight.position.set(-50, 30, 50);
scene.add(ambientLight, pointLight);

const orbit = new OrbitControls(camera, renderer.domElement);

scene.background = new THREE.Color(0x87C1C9);

camera.position.set(0, 20, -30);

orbit.update();

const trees = [
  { x: 20, z: -12, r: 78 },
  { x: -48, z: 27, r: 214 },
  { x: 19, z: -39, r: 32 },
  { x: 5, z: 12, r: 180 },
  { x: -25, z: -31, r: 95 }
];

const trees2 = [
  { x: -29, z: 14, r: 182 },
  { x: 37, z: -42, r: 56 },
  { x: -5, z: 29, r: 310 },
  { x: 44, z: -18, r: 90 },
  { x: -36, z: 36, r: 274 }
]

const stems = [
  { x: -7, z: 22, r: 305 },
  { x: 14, z: -45, r: 58 },
  { x: -31, z: 8, r: 143 },
  { x: 49, z: -10, r: 249 },
  { x: 2, z: 35, r: 37 }
];

const rocks = [
  { x: -33, z: 22, r: 105 },
  { x: 7, z: -19, r: 270 },
  { x: 42, z: 37, r: 85 },
  { x: -8, z: 44, r: 365 },
  { x: 18, z: -5, r: 130 }
];

let carMesh;
let carBody;
let forwardVelocity = 15;
let turnSpeed = Math.PI / 1.5;
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
  const box = new CANNON.Box(new CANNON.Vec3(2.5, .37, 1));
  carBody = new CANNON.Body({
    mass: 1500
  });
  carBody.addShape(box);
  carBody.position.set(0, 1, 0);
  world.addBody(carBody);
});

const world = new CANNON.World({
  gravity: new CANNON.Vec3(0, -9.81, 0)
});

trees.forEach(
  (tree) => {
    AddModel('Models/tree/scene.gltf', 0.02, { x: tree.x, y: 0, z: tree.z }, tree.r);
    addPhysicsBody({ x: tree.x, y: 0, z: tree.z }, 1.5, 10);
  }
);
trees2.forEach((tree) => {
  AddModel('Models/tree_2/scene.gltf', 2, { x: tree.x, y: -4, z: tree.z }, tree.r);
  addPhysicsBody({ x: tree.x, y: 0, z: tree.z }, 1.2, 10);
}
);
stems.forEach((stem) => {
  AddModel('Models/tree_trunk/scene.gltf', 2.5, { x: stem.x, y: 0, z: stem.z }, stem.r);
  addPhysicsBody({ x: stem.x, y: 0, z: stem.z }, 1, 2);
}
);
rocks.forEach((rock) => {
  AddModel('Models/rock/scene.gltf', 5, { x: rock.x, y: 0, z: rock.z }, rock.r)
  addPhysicsBody({ x: rock.x, y: 0, z: rock.z }, .5, .3);
}
);
AddModel('Models/campfire/scene.gltf', 5, { x: -25, y: 0, z: 25 }, 0);

const boxGeo = new THREE.BoxGeometry(2, 2, 2);
const boxMat = new THREE.MeshBasicMaterial({
  color: 0xB8977B,
  wireframe: false
});
const boxMesh = new THREE.Mesh(boxGeo, boxMat);
scene.add(boxMesh);

const sphereGeo = new THREE.SphereGeometry(2);
const sphereMat = new THREE.MeshBasicMaterial({
  color: 0xCAA687,
  wireframe: false
});
const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
scene.add(sphereMesh);

const groundHeight = 100;
const groundTexture = textureLoader.load('assets/img/texture_ground.jpg');
const groundGeo = new THREE.BoxGeometry(100, 100, groundHeight);
const groundMat = new THREE.MeshBasicMaterial({
  color: 0x00C14D,
  map: groundTexture,
  side: THREE.DoubleSide,
  wireframe: false
});
const groundMesh = new THREE.Mesh(groundGeo, groundMat);
groundMesh.receiveShadow = true;
groundMesh.position.set(0, -groundHeight / 2, 0);
scene.add(groundMesh);

const groundPhysMat = new CANNON.Material();
const groundBody = new CANNON.Body({
  //shape: new CANNON.Plane(),
  shape: new CANNON.Box(new CANNON.Vec3(50, 50, groundHeight / 2)),
  type: CANNON.Body.STATIC,
  material: groundPhysMat
});
groundBody.position.set(0, -groundHeight / 2, 0);
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
  d: false,
  r: false
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
  Reset(boxMesh, boxBody, 10);

  sphereMesh.position.copy(sphereBody.position);
  sphereMesh.quaternion.copy(sphereBody.quaternion);
  Reset(sphereMesh, sphereBody, 15);

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
    Reset(carMesh, carBody, 1);
  }
}

function AddModel(modelPath, scale, position, rotation) {
  loader.load(modelPath, (GLTFScene) => {
    const mesh = GLTFScene.scene;
    mesh.scale.set(scale, scale, scale);
    mesh.position.set(position.x, position.y, position.z);
    mesh.rotation.set(0, rotation, 0);

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    if (GLTFScene.animations && GLTFScene.animations.length) {
      const mixer = new THREE.AnimationMixer(mesh);

      GLTFScene.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.play();
      });

      mixers.push(mixer);
    }

    scene.add(mesh);
  });
}

function addPhysicsBody(position, width, height) {
  const shape = new CANNON.Cylinder(width, width, height, 8);
  const body = new CANNON.Body({
    type: CANNON.Body.STATIC,
    color: 0xff0000,
    wireframe: true,
    shape: shape
  });
  body.position.set(position.x, 0, position.z);
  world.addBody(body);
}

function Reset(object, objectBody, height) {
  const resetPosition = new THREE.Vector3(0, height + 5, 0);
  const resetBodyPosition = new CANNON.Vec3(0, height + 5, 0);
  const resetRotation = new THREE.Euler(0, 0, 0);
  const resetBodyRotation = new CANNON.Quaternion(0, 0, 0);
  if (object.position.y < -50) {
    object.position.copy(resetPosition);
    object.rotation.copy(resetRotation);
    objectBody.position.copy(resetBodyPosition);
    objectBody.quaternion.copy(resetBodyRotation);
  }
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// function logModelStructure(object, level = 0) {
//   const indent = "  ".repeat(level);
//   console.log(`${indent}${object.type}: ${object.name} ${object.geometry ? '(has geometry)' : '(no geometry)'}`);
//   object.children.forEach((child) => logModelStructure(child, level + 1));
// }