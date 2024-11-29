import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useBox } from '@react-three/cannon';
import { Vector3, Color } from 'three';
import ParticlePhysics from '../physics/ParticlePhysics';

// Robust position normalization with extensive error checking
const normalizePosition = (position) => {
    try {
        // Handle various input types
        if (Array.isArray(position)) {
            // Ensure exactly 3 numeric values
            if (position.length !== 3) {
                console.warn('Invalid position array length', position);
                return [0, 0, 0];
            }
            return position.map(coord => 
                !isNaN(parseFloat(coord)) ? parseFloat(coord) : 0
            );
        }
        
        if (position instanceof Vector3) {
            return [
                !isNaN(position.x) ? position.x : 0, 
                !isNaN(position.y) ? position.y : 0, 
                !isNaN(position.z) ? position.z : 0
            ];
        }
        
        if (typeof position === 'object' && position !== null) {
            return [
                !isNaN(parseFloat(position.x || 0)) ? parseFloat(position.x || 0) : 0,
                !isNaN(parseFloat(position.y || 0)) ? parseFloat(position.y || 0) : 0,
                !isNaN(parseFloat(position.z || 0)) ? parseFloat(position.z || 0) : 0
            ];
        }
        
        console.warn('Unhandled position type', position);
        return [0, 0, 0];
    } catch (error) {
        console.error('Error normalizing position', error);
        return [0, 0, 0];
    }
};

const Particle = ({ 
    type = 'sand', 
    position = [0, 0, 0], 
    particleSize = 0.1, 
    temperature = 20 
}) => {
    // Extensive position normalization with error prevention
    const normalizedPosition = useMemo(() => {
        const normalized = normalizePosition(position);
        // Extra check to prevent NaN
        if (normalized.some(isNaN)) {
            console.warn('NaN detected in normalized position', normalized);
            return [0, 0, 0];
        }
        return normalized;
    }, [position]);

    const [particleState, setParticleState] = useState({
        type,
        position: normalizedPosition,
        temperature,
        lifetime: 100,
        velocity: new Vector3(0, 0, 0),
        heatSource: false,
    });

    // Track the latest particle state for simulation
    const particleStateRef = useRef(particleState);

    // Fetch particle properties
    const particleProperties = useMemo(() => 
        ParticlePhysics.getParticleProperties(type), 
        [type]
    );

    // Create a physics-enabled box with NaN prevention
    const [ref] = useBox(() => {
      const safePosition = normalizedPosition.map(
          coord => !isNaN(coord) ? coord : 0
      );
  
      return {
          mass: particleProperties.density || 1,
          position: safePosition,
          args: [
              !isNaN(particleSize) ? particleSize : 0.1, 
              !isNaN(particleSize) ? particleSize : 0.1, 
              !isNaN(particleSize) ? particleSize : 0.1
          ],
          material: {
              friction: 0.5,
              restitution: 0.3,
          },
      };
  });

    // Compute color dynamically based on temperature
    const computeColor = () => {
        try {
            const baseColor = new Color(particleProperties.color || '#808080');
            const temperatureInfluence = Math.min(
                Math.max((particleState.temperature - 20) / 100, 0), 
                1
            );
            return baseColor.lerp(new Color('white'), temperatureInfluence);
        } catch (error) {
            console.error('Color computation error', error);
            return new Color('#808080');
        }
    };

    // Particle simulation logic
    useEffect(() => {
        const updateInterval = setInterval(() => {
            const currentState = { ...particleStateRef.current };

            // Ensure valid position
            currentState.position = normalizePosition(currentState.position);

            // Run the physics simulation
            ParticlePhysics.simulate([currentState]);

            // Update state if changes occurred
            setParticleState(currentState);
            particleStateRef.current = currentState;
        }, 100); // Update every 100ms

        return () => clearInterval(updateInterval);
    }, []);

    // Update color dynamically when temperature or type changes
    useEffect(() => {
        const newProperties = ParticlePhysics.getParticleProperties(particleState.type);
        if (newProperties) {
            setParticleState((prevState) => ({
                ...prevState,
                color: newProperties.color,
            }));
        }
    }, [particleState.type]);

    return (
        <mesh ref={ref} castShadow>
            {/* Particle shape with NaN prevention */}
            <boxGeometry 
                args={[
                    !isNaN(particleSize) ? particleSize : 0.1, 
                    !isNaN(particleSize) ? particleSize : 0.1, 
                    !isNaN(particleSize) ? particleSize : 0.1
                ]} 
            />
            {/* Material with dynamic color */}
            <meshStandardMaterial 
                color={computeColor()} 
                opacity={particleProperties.state === 'gas' ? 0.5 : 1}
                transparent={particleProperties.state === 'gas'}
            />
        </mesh>
    );
};

export default Particle;