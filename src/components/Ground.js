import React, { useMemo } from 'react';
import { usePlane } from '@react-three/cannon';
import { MeshReflectorMaterial } from '@react-three/drei';
import * as THREE from 'three';
import PropTypes from 'prop-types';

const Ground = React.memo(({ 
  size = 20, 
  color = "#2c2c2c", 
  metalness = 0.4, 
  roughness = 0.7,
  mirror = 0.5,
  position = [0, 0, 0],
  receiveShadow = true
}) => {
  // Memoize plane creation to prevent unnecessary re-renders
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0], // Horizontal plane
    position: position,
    type: 'Static' // Explicitly set as a static body for performance
  }));

  // Create a subtle grid texture
  const gridTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d');
    
    // Background
    context.fillStyle = color;
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Grid lines
    context.strokeStyle = 'rgba(255,255,255,0.1)';
    context.lineWidth = 1;
    
    const gridSize = 20;
    const step = canvas.width / gridSize;
    
    for (let x = 0; x <= gridSize; x++) {
      context.beginPath();
      context.moveTo(x * step, 0);
      context.lineTo(x * step, canvas.height);
      context.stroke();
    }
    
    for (let y = 0; y <= gridSize; y++) {
      context.beginPath();
      context.moveTo(0, y * step);
      context.lineTo(canvas.width, y * step);
      context.stroke();
    }
    
    return new THREE.CanvasTexture(canvas);
  }, [color]);

  return (
    <mesh 
      ref={ref} 
      receiveShadow={receiveShadow}
      // Add some subtle elevation to prevent z-fighting
      position={[position[0], position[1] - 0.001, position[2]]}
    >
      <planeGeometry args={[size, size, 32, 32]} />
      <MeshReflectorMaterial
        color={color}
        metalness={metalness}
        roughness={roughness}
        blur={[1000, 400]}
        resolution={512}
        mirror={mirror}
        map={gridTexture} // Add the grid texture
        depthWrite={true}
        transparent={false}
        side={THREE.DoubleSide} // Ensure visibility from both sides
      />
    </mesh>
  );
});

// Add prop types for better development experience
Ground.propTypes = {
  size: PropTypes.number,
  color: PropTypes.string,
  metalness: PropTypes.number,
  roughness: PropTypes.number,
  mirror: PropTypes.number,
  position: PropTypes.arrayOf(PropTypes.number),
  receiveShadow: PropTypes.bool
};

export default Ground;