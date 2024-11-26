import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useBox } from '@react-three/cannon';
import { Vector3, Color } from 'three';
import ParticlePhysics from '../physics/ParticlePhysics';

const Particle = ({ 
  type, 
  position, 
  particleSize = 0.1, 
  temperature = 20 
}) => {
  const [particleState, setParticleState] = useState({
    type,
    temperature,
    lifetime: 100,
    velocity: new Vector3(0, 0, 0)
  });

  // Use a ref to track the latest particle state
  const particleStateRef = useRef(particleState);

  const particleProperties = useMemo(() => 
    ParticlePhysics.particleTypes[type] || 
    ParticlePhysics.particleTypes.sand, 
    [type]
  );

  const [ref] = useBox(() => ({
    mass: particleProperties.density,
    position: position,
    args: [particleSize, particleSize, particleSize],
    material: {
      friction: 0.5,
      restitution: 0.3
    }
  }));

  // Dynamic color based on temperature
  const computeColor = () => {
    const baseColor = new Color(particleProperties.color);
    const temperatureInfluence = (particleState.temperature - 20) / 100;
    return baseColor.lerp(new Color('white'), temperatureInfluence);
  };

  // State and interaction logic
  useEffect(() => {
    const updateInterval = setInterval(() => {
      // Create a copy of the current state to modify
      const updatedState = { ...particleStateRef.current };

      // Simulate particle behavior
      ParticlePhysics.simulate([updatedState]);

      // Update the state if there are changes
      setParticleState(updatedState);
      particleStateRef.current = updatedState;
    }, 100);

    return () => clearInterval(updateInterval);
  }, []);

  return (
    <mesh ref={ref} castShadow>
      <boxGeometry args={[particleSize, particleSize, particleSize]} />
      <meshStandardMaterial 
        color={computeColor()} 
        opacity={particleProperties.state === 'gas' ? 0.5 : 1}
        transparent={particleProperties.state === 'gas'}
      />
    </mesh>
  );
};

export default Particle;