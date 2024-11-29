import { Vector3 } from 'three';

// Define comprehensive particle type properties
const PARTICLE_TYPES = {
    sand: {
        density: 1.5,
        heatCapacity: 0.2,
        meltingPoint: 1700, // Celsius
        color: '#e6c229',
        state: 'solid',
        interactions: {
            water: (particle, other) => {
                // Sand gets slightly compacted by water
                particle.velocity = particle.velocity || new Vector3(0, 0, 0);
                particle.velocity.multiplyScalar(0.9);
            }
        }
    },
    water: {
        density: 1.0,
        heatCapacity: 4.186,
        boilingPoint: 100, // Celsius
        color: '#4287f5',
        state: 'liquid',
        interactions: {
            fire: (particle, other) => {
                // Water starts to evaporate when near fire
                if (particle.temperature > 80) {
                    particle.type = 'steam';
                }
            }
        }
    },
    steam: {
        density: 0.6,
        heatCapacity: 2.0,
        color: '#ffffff',
        state: 'gas',
        interactions: {
            fire: (particle, other) => {
                // Steam can cool down fire
                other.temperature -= 10;
            }
        }
    },
    fire: {
        density: 0.1,
        heatCapacity: 1.0,
        color: '#FF4500',
        state: 'plasma',
        spread: true,
        interactions: {
            wood: (particle, other) => {
                // Fire spreads to nearby wood
                other.temperature += 20;
            },
            water: (particle, other) => {
                // Water extinguishes fire
                particle.lifetime = 0;
            }
        }
    },
    stone: {
        density: 2.5,
        heatCapacity: 0.8,
        meltingPoint: 1200,
        color: '#808080',
        state: 'solid',
        interactions: {}
    }
};

class ParticlePhysics {
    constructor() {
        this.particleTypes = PARTICLE_TYPES;
        this.spatialGrid = new Map();
        this.gridCellSize = 0.5; // Adjust based on your particle size
    }

    // Safely get particle properties with a default
    getParticleProperties(type) {
        return this.particleTypes[type] || this.particleTypes.sand;
    }

    // Normalize and validate positions
    normalizePosition(position) {
        if (!position || typeof position !== 'object') {
            console.error('Invalid position:', position);
            return [0, 0, 0];
        }
        return [
            typeof position.x === 'number' ? position.x : 0,
            typeof position.y === 'number' ? position.y : 0,
            typeof position.z === 'number' ? position.z : 0
        ];
    }

    addToSpatialGrid(particle, position) {
        const safePosition = this.normalizePosition(position);
        const cellX = Math.floor(safePosition[0] / this.gridCellSize);
        const cellY = Math.floor(safePosition[1] / this.gridCellSize);
        const cellZ = Math.floor(safePosition[2] / this.gridCellSize);
        const cellKey = `${cellX},${cellY},${cellZ}`;

        if (!this.spatialGrid.has(cellKey)) {
            this.spatialGrid.set(cellKey, []);
        }
        this.spatialGrid.get(cellKey).push(particle);
    }

    simulate(particles) {
        if (!Array.isArray(particles) || particles.length === 0) {
            return;
        }

        this.spatialGrid.clear();
        particles = particles.filter(particle => particle.type !== null); // Remove expired particles

        particles.forEach(particle => {
            if (particle && particle.position) {
                this.addToSpatialGrid(particle, particle.position);
            }
        });

        particles.forEach(particle => {
            if (!particle) return;

            this.initializeParticleProperties(particle);
            this.applyTemperatureEffects(particle);
            this.checkStateTransitions(particle);
            this.checkAdvancedInteractions(particle);
        });
    }

    initializeParticleProperties(particle) {
        particle.temperature = particle.temperature || 20;
        particle.lifetime = particle.lifetime || 100;
        particle.velocity = particle.velocity || new Vector3(0, 0, 0);
        particle.heatSource = particle.heatSource || false;
        particle.type = particle.type || 'sand';
    }

    applyTemperatureEffects(particle) {
        const ambientTemp = 20;
        const coolingRate = 0.1;

        particle.temperature += (particle.heatSource ? 5 : -coolingRate);
        particle.temperature = Math.max(ambientTemp, particle.temperature);

        if (particle.temperature > 100 || particle.temperature < 0) {
            particle.lifetime -= 10;
        }
    }

    transitionState(particle, newState) {
        const newProperties = this.getParticleProperties(newState);
        Object.assign(particle, newProperties, { type: newState });
    }

    checkStateTransitions(particle) {
        const particleType = this.getParticleProperties(particle.type);

        if (particleType.boilingPoint && particle.temperature > particleType.boilingPoint) {
            this.transitionState(particle, 'steam');
        }

        if (particleType.meltingPoint && particle.temperature > particleType.meltingPoint) {
            this.transitionState(particle, 'lava');
        }

        particle.lifetime -= 1;
        if (particle.lifetime <= 0) {
            particle.type = null;
        }
    }

    checkAdvancedInteractions(particle) {
        const nearbyParticles = this.findNearbyParticles(particle);

        nearbyParticles.forEach(other => {
            this.transferHeat(particle, other);

            const particleType = this.getParticleProperties(particle.type);
            const interaction = particleType.interactions?.[other.type];

            if (interaction) {
                interaction(particle, other);
            }

            this.checkChemicalReactions(particle, other);
        });
    }

    transferHeat(particleA, particleB) {
        if (!particleA || !particleB) return;

        const heatTransferRate = 0.1;
        const tempDiff = particleA.temperature - particleB.temperature;

        const totalCapacity = particleA.heatCapacity + particleB.heatCapacity;
        const weightA = particleB.heatCapacity / totalCapacity;
        const weightB = particleA.heatCapacity / totalCapacity;

        particleA.temperature -= tempDiff * weightA * heatTransferRate;
        particleB.temperature += tempDiff * weightB * heatTransferRate;
    }

    checkChemicalReactions(particleA, particleB) {
        const REACTIONS = {
            'water-fire': (a, b) => {
                a.type = 'steam';
                a.temperature -= 20;
            },
            'stone-fire': (a, b) => {
                if (a.temperature > 1000) a.type = 'lava';
            }
        };

        const key = `${particleA.type}-${particleB.type}`;
        if (REACTIONS[key]) REACTIONS[key](particleA, particleB);
    }

    findNearbyParticles(particle, radius = 0.5) {
        const safePosition = this.normalizePosition(particle.position);
        const cellX = Math.floor(safePosition[0] / this.gridCellSize);
        const cellY = Math.floor(safePosition[1] / this.gridCellSize);
        const cellZ = Math.floor(safePosition[2] / this.gridCellSize);

        const nearbyParticles = [];
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                for (let dz = -1; dz <= 1; dz++) {
                    const cellKey = `${cellX + dx},${cellY + dy},${cellZ + dz}`;
                    const cellParticles = this.spatialGrid.get(cellKey) || [];
                    nearbyParticles.push(...cellParticles.filter(p => p !== particle));
                }
            }
        }

        return nearbyParticles;
    }

    calculateDistance(pos1, pos2) {
        return Math.sqrt(
            Math.pow(pos1[0] - pos2[0], 2) +
            Math.pow(pos1[1] - pos2[1], 2) +
            Math.pow(pos1[2] - pos2[2], 2)
        );
    }
}

// Create and export an instance of ParticlePhysics
const particlePhysics = new ParticlePhysics();
export default particlePhysics;
