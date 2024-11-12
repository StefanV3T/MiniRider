import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default class Scene {
    constructor() {
        this.renderer = new THREE.WebGLRenderer();
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
        this.setupRenderer();
        this.setupCamera();
        this.setupLights();
        console.log('Scene.js initialized');
    }

    setupRenderer() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
    }

    setupCamera() {
        this.camera.position.set(0, 20, -30);
        this.orbitControls.update();
    }

    setupLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff);
        this.scene.add(ambientLight);
    }

    add(mesh) {
        this.scene.add(mesh);
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}
