import React, { useState, useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import { Vector3, Plane } from 'three';
import Particle from './Particle';

const ParticleBrush = ({ 
  tool, 
  settings = {
    particleSize: 0.1,
    gravity: -9.8,
    temperature: 20,
    spawnRate: 10,
    brushSize: 1, // New: Area of particle spawning
    particleVariation: 0.2 // New: Randomness in particle properties
  } 
}) => {
  const [particles, setParticles] = useState([]);
  const { camera, raycaster, mouse } = useThree();

  const MAX_PARTICLES = 5000; // Increased max particles

  const handleParticleSpawn = useCallback((event) => {
    const groundPlane = new Plane(new Vector3(0, 1, 0), 0);
    raycaster.setFromCamera(mouse, camera);

    const intersectionPoint = new Vector3();
    if (raycaster.ray.intersectPlane(groundPlane, intersectionPoint)) {
      const newParticles = [];
      const spawnCount = Math.min(settings.spawnRate, MAX_PARTICLES - particles.length);

      for (let i = 0; i < spawnCount; i++) {
        // Spread particles within brush size
        const offset = new Vector3(
          Math.random() * settings.brushSize - settings.brushSize / 2, 
          0, 
          Math.random() * settings.brushSize - settings.brushSize / 2
        );
        
        const particlePosition = intersectionPoint.clone().add(offset);

        // Add variation to particle properties
        const temperatureVariation = (Math.random() - 0.5) * settings.particleVariation * 20;
        const sizeVariation = (Math.random() - 0.5) * settings.particleVariation * 0.05;

        newParticles.push({
          id: `${Date.now()}-${i}`,
          type: tool,
          position: [particlePosition.x, particlePosition.y, particlePosition.z],
          particleSize: settings.particleSize + sizeVariation,
          temperature: settings.temperature + temperatureVariation
        });
      }

      setParticles(prev => {
        const updatedParticles = [...prev, ...newParticles];
        return updatedParticles.slice(-MAX_PARTICLES);
      });
    }
  }, [camera, raycaster, mouse, tool, settings, particles.length]);

  // Optional: Clear particles functionality
  const clearParticles = () => {
    setParticles([]);
  };

  return (
    <group>
      {particles.map(particle => (
        <Particle 
          key={particle.id}
          type={particle.type}
          position={particle.position}
          particleSize={particle.particleSize}
          temperature={particle.temperature}
        />
      ))}
      <mesh 
        onPointerDown={handleParticleSpawn}
        visible={false}
      >
        <planeGeometry args={[20, 20]} />
        <meshBasicMaterial />
      </mesh>
      {/* Optional clear button */}
      <button 
        onClick={clearParticles}
        className="absolute bottom-4 right-4 bg-red-500 text-white p-2 rounded"
      >
        Clear Particles
      </button>
    </group>
  );
};

export default ParticleBrush;