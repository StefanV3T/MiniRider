import * as CANNON from 'cannon-es';

export default class PhysicsWorld {
    constructor() {
        this.world = new CANNON.World({
            gravity: new CANNON.Vec3(0, -9.81, 0)
        });
        this.contactMaterials = [];
        console.log('PhysicsWorld.js initialized');
    }

    addBody(body) {
        this.world.addBody(body);
    }

    addContactMaterial(materialA, materialB, options) {
        const contactMaterial = new CANNON.ContactMaterial(materialA, materialB, options);
        this.world.addContactMaterial(contactMaterial);
        this.contactMaterials.push(contactMaterial);
    }

    step(timeStep) {
        this.world.step(timeStep);
    }
}
