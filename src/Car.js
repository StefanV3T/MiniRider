import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as CANNON from 'cannon-es';

export default class Car {
    constructor(modelUrl, position) {
        this.loader = new GLTFLoader();
        this.carMesh = null;
        this.carBody = null;
        this.mixers = [];
        this.forwardVelocity = 15;
        this.turnSpeed = Math.PI / 1.5; // radians per second
        this.init(modelUrl, position);
        console.log('car.js initialized');
    }

    async init(modelUrl, position) {
        this.carMesh = await this.loadModel(modelUrl);
        this.setupPhysics(position);
    }

    async loadModel(url) {
        return new Promise((resolve) => {
            this.loader.load(url, (GLTFScene) => {
                GLTFScene.scene.scale.set(0.01, 0.01, 0.01);
                this.carMesh = GLTFScene.scene;

                if (GLTFScene.animations && GLTFScene.animations.length) {
                    const mixer = new THREE.AnimationMixer(this.carMesh);
                    GLTFScene.animations.forEach((clip) => {
                        const action = mixer.clipAction(clip);
                        action.play();
                    });
                    this.mixers.push(mixer);
                }

                resolve(this.carMesh);
            }, undefined, (error) => {
                console.error('an error had happend while loading model:', error);
            });
        });
    }

    setupPhysics(position) {
        const box = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 1));
        this.carBody = new CANNON.Body({ mass: 1500 });
        this.carBody.addShape(box);
        this.carBody.position.copy(position);
    }

    update() {
        if (this.carMesh && this.carBody) {
            this.carMesh.position.copy(this.carBody.position);
            this.carMesh.quaternion.copy(this.carBody.quaternion);
        }

        this.mixers.forEach((mixer) => mixer.update(1 / 60));
    }

    move(keys, timeStep) {
        if (!this.carBody) return;

        const forward = new CANNON.Vec3(1, 0, 0);
        this.carBody.quaternion.vmult(forward, forward);

        if (keys.w) {
            const movement = forward.scale(this.forwardVelocity * timeStep);
            this.carBody.position.vadd(movement, this.carBody.position);
        }
        if (keys.s) {
            const backward = forward.scale(-this.forwardVelocity * timeStep);
            this.carBody.position.vadd(backward, this.carBody.position);
        }

        const turn = (direction) => {
            const turnQuaternion = new CANNON.Quaternion();
            turnQuaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), direction * this.turnSpeed * timeStep);
            this.carBody.quaternion = this.carBody.quaternion.mult(turnQuaternion);
        };

        if (keys.a) turn(1);
        if (keys.d) turn(-1);
    }
}
