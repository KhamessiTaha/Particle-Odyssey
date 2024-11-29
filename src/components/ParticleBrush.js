import React, { useState, useCallback, useEffect } from 'react';
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
    brushSize: 1,
    particleVariation: 0.2
  },
  onClearParticles // New prop for clearing particles
}) => {
  const [particles, setParticles] = useState([]);
  const { camera, raycaster, mouse } = useThree();

  const MAX_PARTICLES = 5000;

  // Safely compute intersection point
  const computeIntersectionPoint = useCallback(() => {
    try {
      const groundPlane = new Plane(new Vector3(0, 1, 0), 0);
      raycaster.setFromCamera(mouse, camera);

      const intersectionPoint = new Vector3();
      if (raycaster.ray.intersectPlane(groundPlane, intersectionPoint)) {
        return intersectionPoint;
      }
      return null;
    } catch (error) {
      console.error('Intersection computation error', error);
      return null;
    }
  }, [camera, raycaster, mouse]);

  const handleParticleSpawn = useCallback((event) => {
    const intersectionPoint = computeIntersectionPoint();
    
    if (!intersectionPoint) {
      console.warn('Could not compute intersection point');
      return;
    }

    const newParticles = [];
    const spawnCount = Math.min(settings.spawnRate, MAX_PARTICLES - particles.length);

    for (let i = 0; i < spawnCount; i++) {
      // Ensure safe offset computation
      const offset = new Vector3(
        (Math.random() - 0.5) * settings.brushSize, 
        0, 
        (Math.random() - 0.5) * settings.brushSize
      );
      
      const particlePosition = intersectionPoint.clone().add(offset);

      // Robust parameter variation
      const safeTemperatureVariation = !isNaN(settings.particleVariation) 
        ? (Math.random() - 0.5) * settings.particleVariation * 20 
        : 0;
      const safeSizeVariation = !isNaN(settings.particleVariation) 
        ? (Math.random() - 0.5) * settings.particleVariation * 0.05 
        : 0;

      newParticles.push({
        id: `${Date.now()}-${i}`,
        type: tool,
        position: [
          particlePosition.x,
          particlePosition.y,
          particlePosition.z
        ],
        particleSize: Math.max(0.01, settings.particleSize + safeSizeVariation),
        temperature: Math.max(0, settings.temperature + safeTemperatureVariation)
      });
    }

    setParticles(prev => {
      const updatedParticles = [...prev, ...newParticles];
      return updatedParticles.slice(-MAX_PARTICLES);
    });
  }, [tool, settings, particles.length, computeIntersectionPoint]);

  // Add cleanup mechanism
  useEffect(() => {
    if (onClearParticles) {
      return () => {
        onClearParticles();
      };
    }
  }, [onClearParticles]);

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
    </group>
  );
};

export default React.memo(ParticleBrush);