// Define properties and interactions for each particle type
const PARTICLE_TYPES = {
    sand: {
        color: "yellow",
        density: 2,
        behavior: "falls", // Behavior keyword for interaction logic
    },
    water: {
        color: "blue",
        density: 1,
        behavior: "flows",
    },
    fire: {
        color: "red",
        density: 0.5,
        behavior: "burns",
    },
    smoke: {
        color: "gray",
        density: 0.1,
        behavior: "rises",
    },
};

export function getParticleProperties(type) {
    return PARTICLE_TYPES[type] || PARTICLE_TYPES.sand; // Default to sand if type is undefined
}

export function handleParticleInteraction(particleA, particleB) {
    const typeA = getParticleProperties(particleA.type);
    const typeB = getParticleProperties(particleB.type);

    // Example interaction: fire burns flammable particles
    if (typeA.behavior === "burns" && typeB.behavior === "falls") {
        // Replace particleB with smoke or remove it
        particleB.type = "smoke";
    }

    // Example interaction: water extinguishes fire
    if (typeA.behavior === "flows" && typeB.behavior === "burns") {
        // Remove fire particle
        particleB.type = null;
    }

    // Add more interactions here
}

class ParticlePhysics {
  constructor() {
    this.particleTypes = {
      sand: {
        density: 1.5,
        heatCapacity: 0.2,
        meltingPoint: 1700, // Celsius
        color: '#e6c229',
        interactions: {
          water: (particle, other) => {
            // Sand gets slightly compacted by water
            particle.velocity.multiplyScalar(0.9);
          }
        }
      },
      water: {
        density: 1.0,
        heatCapacity: 4.186, // High heat capacity
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
      wood: {
        density: 0.5,
        heatCapacity: 1.76,
        ignitionPoint: 260, // Celsius
        color: '#8B4513',
        interactions: {
          fire: (particle, other) => {
            // Wood catches fire and transforms
            if (particle.temperature > particle.ignitionPoint) {
              particle.type = 'fire';
            }
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
      smoke: {
        density: 0.2,
        color: '#808080',
        rises: true
      }
    };
    this.spatialGrid = new Map();
    this.gridCellSize = 0.5; // Adjust based on your particle size
  }

  addToSpatialGrid(particle, position) {
    const cellX = Math.floor(position[0] / this.gridCellSize);
    const cellY = Math.floor(position[1] / this.gridCellSize);
    const cellZ = Math.floor(position[2] / this.gridCellSize);
    const cellKey = `${cellX},${cellY},${cellZ}`;

    if (!this.spatialGrid.has(cellKey)) {
      this.spatialGrid.set(cellKey, []);
    }
    this.spatialGrid.get(cellKey).push(particle);
  }

  // Enhanced simulate method with more complex interactions
  simulate(particles) {
    // Clear spatial grid
    this.spatialGrid.clear();

    // Populate spatial grid
    particles.forEach(particle => {
      this.addToSpatialGrid(particle, particle.position);
    });

    particles.forEach(particle => {
      // Temperature effects
      this.applyTemperatureEffects(particle);
      
      // State changes
      this.checkStateTransitions(particle);
      
      // Advanced interactions with nearby particles
      this.checkAdvancedInteractions(particle);
    });
  }
  // More sophisticated interaction logic
  checkAdvancedInteractions(particle) {
    const nearbyParticles = this.findNearbyParticles(particle);
    
    nearbyParticles.forEach(other => {
      // Complex interaction based on multiple factors
      const interaction = this.particleTypes[particle.type]?.interactions?.[other.type];
      if (interaction) {
        interaction(particle, other);
      }

      // Temperature transfer
      this.transferHeat(particle, other);

      // Potential chemical reactions
      this.checkChemicalReactions(particle, other);
    });
  }
  // Heat transfer between particles
  transferHeat(particleA, particleB) {
    const typeA = this.particleTypes[particleA.type];
    const typeB = this.particleTypes[particleB.type];

    if (typeA && typeB) {
      const heatTransferRate = 0.1;
      const temperatureDiff = particleA.temperature - particleB.temperature;
      
      particleA.temperature -= temperatureDiff * heatTransferRate;
      particleB.temperature += temperatureDiff * heatTransferRate;
    }
  }

  // Potential chemical reactions between particles
  checkChemicalReactions(particleA, particleB) {
    // Example: wood + fire = burning
    if (
      (particleA.type === 'wood' && particleB.type === 'fire') ||
      (particleB.type === 'wood' && particleA.type === 'fire')
    ) {
      const woodParticle = particleA.type === 'wood' ? particleA : particleB;
      woodParticle.type = 'fire';
      woodParticle.temperature += 50;
    }

    // Water + fire = steam
    if (
      (particleA.type === 'water' && particleB.type === 'fire') ||
      (particleB.type === 'water' && particleA.type === 'fire')
    ) {
      const fireParticle = particleA.type === 'fire' ? particleA : particleB;
      fireParticle.type = 'steam';
      fireParticle.temperature -= 20;
    }
  }

  applyTemperatureEffects(particle) {
    // Convection and heat transfer
    const ambientTemp = 20; // Room temperature
    const coolingRate = 0.1;
    
    particle.temperature += (particle.heatSource ? 5 : -coolingRate);
    particle.temperature = Math.max(ambientTemp, particle.temperature);
  }

  checkStateTransitions(particle) {
    const particleType = this.particleTypes[particle.type];
    
    if (particleType.boilingPoint && particle.temperature > particleType.boilingPoint) {
      particle.type = 'steam';
    }
    
    if (particleType.meltingPoint && particle.temperature > particleType.meltingPoint) {
      particle.type = 'lava'; // New type!
    }
  }

  checkInteractions(particle) {
    const nearbyParticles = this.findNearbyParticles(particle);
    
    nearbyParticles.forEach(other => {
      const interaction = this.particleTypes[particle.type]?.interactions?.[other.type];
      if (interaction) {
        interaction(particle, other);
      }
    });
  }

   // Find nearby particles efficiently
   findNearbyParticles(particle, radius = 0.5) {
    const cellX = Math.floor(particle.position[0] / this.gridCellSize);
    const cellY = Math.floor(particle.position[1] / this.gridCellSize);
    const cellZ = Math.floor(particle.position[2] / this.gridCellSize);

    const nearbyParticles = [];
    
    // Check neighboring cells
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dz = -1; dz <= 1; dz++) {
          const cellKey = `${cellX + dx},${cellY + dy},${cellZ + dz}`;
          const cellParticles = this.spatialGrid.get(cellKey) || [];

          cellParticles.forEach(nearParticle => {
            if (nearParticle !== particle) {
              const distance = this.calculateDistance(particle.position, nearParticle.position);
              if (distance <= radius) {
                nearbyParticles.push(nearParticle);
              }
            }
          });
        }
      }
    }

    return nearbyParticles;
  }
  // Distance calculation utility
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