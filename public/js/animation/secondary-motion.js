import * as THREE from 'three';

/**
 * TELETERM 3D — SECONDARY MOTION & SPRING-DAMPER DYNAMICS SOLVER
 * Eliminates robotic stiffness across hair, ribbons, skirts, and spine.
 * 
 * Semi-Implicit Euler Damped Harmonic Oscillator:
 * F_spring = -k * (theta - theta_rest)
 * F_damping = -c * velocity
 * a = (F_spring + F_damping + F_inertia + F_wind) / mass
 * v = clamp(v + a * dt, -maxVel, maxVel)
 * theta = clamp(theta + v * dt, -maxAngle, maxAngle)
 */
export class SecondaryMotionSolver {
    constructor(model, options = {}) {
        this.model = model;
        this.stiffness = options.stiffness || 140.0; // Spring restorative strength
        this.damping = options.damping || 14.0;     // Energy dissipation factor
        this.maxDisplacement = options.maxDisplacement || 0.42; // Radian limit to prevent unnatural deformation
        
        // Node state tracking: bone.uuid -> { angleX, velX, angleZ, velZ, restRot }
        this.nodes = new Map();
        
        // Character inertia tracking
        this.prevPos = new THREE.Vector3();
        this.velocity = new THREE.Vector3();
        this.acceleration = new THREE.Vector3();
        this.prevRotY = 0;
        this.angularVelocityY = 0;
        
        // Spine follow-through state
        this.spineLagX = 0;
        this.spineLagZ = 0;
        this.spineLagVelX = 0;
        this.spineLagVelZ = 0;

        this.initialized = false;
        this.initBones();
    }

    initBones() {
        if (!this.model) return;
        this.model.traverse((child) => {
            if (child.isBone) {
                const name = child.name;
                const isHair = name.includes('Hair');
                const isRibbon = name.includes('Ribbon');
                const isSkirt = name.includes('Skirt');
                const isAccessory = name.includes('Sleeve') || name.includes('Coat') || name.includes('Tie');

                if (isHair || isRibbon || isSkirt || isAccessory) {
                    const nodeType = isHair ? 'hair' : (isRibbon ? 'ribbon' : (isSkirt ? 'skirt' : 'accessory'));
                    this.nodes.set(child.uuid, {
                        bone: child,
                        type: nodeType,
                        angleX: 0,
                        velX: 0,
                        angleZ: 0,
                        velZ: 0,
                        restRot: { x: child.rotation.x, y: child.rotation.y, z: child.rotation.z },
                        stiffness: isHair ? 180.0 : (isRibbon ? 120.0 : (isSkirt ? 160.0 : 150.0)),
                        damping: isHair ? 18.0 : (isRibbon ? 10.0 : (isSkirt ? 16.0 : 14.0)),
                        mass: isHair ? 0.35 : (isRibbon ? 0.2 : (isSkirt ? 0.65 : 0.5))
                    });
                }
            }
        });
        this.initialized = true;
    }

    /**
     * Updates physics simulation step with analytical timestep clamping
     * @param {number} delta - Frame delta in seconds
     * @param {THREE.Vector3} currentPos - Current world position of avatar root
     * @param {number} currentRotY - Current avatar facing angle in radians
     * @param {number} windIntensity - World wind strength
     */
    update(delta, currentPos, currentRotY = 0, windIntensity = 0.5) {
        if (!this.initialized || delta <= 0.0001) return;
        
        // Clamp delta to prevent spiral of death during hitching/lag
        const dt = Math.min(delta, 0.05);

        // 1. Calculate linear avatar velocity and acceleration for inertia
        if (currentPos) {
            const dx = (currentPos.x - this.prevPos.x) / dt;
            const dz = (currentPos.z - this.prevPos.z) / dt;
            
            const ax = (dx - this.velocity.x) / dt;
            const az = (dz - this.velocity.z) / dt;

            this.acceleration.set(ax, 0, az);
            this.velocity.set(dx, 0, dz);
            this.prevPos.copy(currentPos);
        }

        // 2. Calculate angular turning velocity
        let dRot = currentRotY - this.prevRotY;
        while (dRot > Math.PI) dRot -= Math.PI * 2;
        while (dRot < -Math.PI) dRot += Math.PI * 2;
        this.angularVelocityY = THREE.MathUtils.lerp(this.angularVelocityY, dRot / dt, Math.min(1.0, dt * 10.0));
        this.prevRotY = currentRotY;

        // 3. Environmental wind oscillation (soft natural breath and gusts)
        const time = performance.now() * 0.001;
        const windSwayX = Math.sin(time * 2.2) * 0.04 * windIntensity + Math.sin(time * 5.7) * 0.02 * windIntensity;
        const windSwayZ = Math.cos(time * 1.8) * 0.03 * windIntensity;

        // 4. Update Spine Follow-Through (natural torso damping when stopping or turning)
        const targetSpineLagX = THREE.MathUtils.clamp(-this.velocity.z * 0.015, -0.08, 0.08);
        const targetSpineLagZ = THREE.MathUtils.clamp(-this.angularVelocityY * 0.025, -0.12, 0.12);
        
        const fSpineX = -120.0 * (this.spineLagX - targetSpineLagX) - 15.0 * this.spineLagVelX;
        this.spineLagVelX += fSpineX * dt;
        this.spineLagX += this.spineLagVelX * dt;

        const fSpineZ = -100.0 * (this.spineLagZ - targetSpineLagZ) - 14.0 * this.spineLagVelZ;
        this.spineLagVelZ += fSpineZ * dt;
        this.spineLagZ += this.spineLagVelZ * dt;

        // 5. Update each registered secondary bone
        for (const [uuid, node] of this.nodes) {
            const b = node.bone;
            if (!b) continue;

            // Inertial force opposed to movement and centrifugal spin
            const inertiaForceX = -this.acceleration.z * 0.02 * node.mass;
            const inertiaForceZ = (this.angularVelocityY * 0.035 * node.mass) - (this.acceleration.x * 0.02 * node.mass);

            // Total forces
            const forceX = -node.stiffness * node.angleX - node.damping * node.velX + inertiaForceX + windSwayX;
            const forceZ = -node.stiffness * node.angleZ - node.damping * node.velZ + inertiaForceZ + windSwayZ;

            // Semi-implicit Euler
            node.velX += (forceX / node.mass) * dt;
            node.velZ += (forceZ / node.mass) * dt;

            // Velocity clamp
            node.velX = THREE.MathUtils.clamp(node.velX, -2.5, 2.5);
            node.velZ = THREE.MathUtils.clamp(node.velZ, -2.5, 2.5);

            node.angleX += node.velX * dt;
            node.angleZ += node.velZ * dt;

            // Displacement clamp
            node.angleX = THREE.MathUtils.clamp(node.angleX, -this.maxDisplacement, this.maxDisplacement);
            node.angleZ = THREE.MathUtils.clamp(node.angleZ, -this.maxDisplacement, this.maxDisplacement);

            // Apply directly onto bone orientation relative to rest rotation
            b.rotation.x = node.restRot.x + node.angleX;
            b.rotation.z = node.restRot.z + node.angleZ;
        }
    }

    /**
     * Returns subtle spine follow-through rotation offsets to blend with retargeter
     */
    getSpineFollowThrough() {
        return {
            pitch: this.spineLagX,
            roll: this.spineLagZ,
            turnLag: this.angularVelocityY * 0.012
        };
    }
}
