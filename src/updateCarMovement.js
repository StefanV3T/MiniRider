import * as CANNON from 'cannon-es';

function updateCarMovement(deltaTime, carBody) {
    if (!carBody) return;

    // Apply forward and backward forces
    if (keys.w) {
        const forward = new CANNON.Vec3(
            Math.sin(carBody.quaternion.y) * forwardVelocity * deltaTime,
            0,
            Math.cos(carBody.quaternion.y) * forwardVelocity * deltaTime
        );
        carBody.position.vadd(forward, carBody.position);
    }
    if (keys.s) {
        const backward = new CANNON.Vec3(
            -Math.sin(carBody.quaternion.y) * forwardVelocity * deltaTime,
            0,
            -Math.cos(carBody.quaternion.y) * forwardVelocity * deltaTime
        );
        carBody.position.vadd(backward, carBody.position);
    }

    // Apply rotation for turning
    if (keys.a) {
        carBody.quaternion.y += turnSpeed * deltaTime;
    }
    if (keys.d) {
        carBody.quaternion.y -= turnSpeed * deltaTime;
    }

    // Sync the Three.js car mesh with the physics body
    if (carMesh) {
        carMesh.position.copy(carBody.position);
        carMesh.quaternion.copy(carBody.quaternion);
    }
}

export default updateCarMovement();