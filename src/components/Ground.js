import React from 'react';
import { usePlane } from '@react-three/cannon';
import { MeshReflectorMaterial } from '@react-three/drei';

const Ground = () => {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0], // Ensure the plane is horizontal
    position: [0, 0, 0]
  }));

  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[20, 20]} />
      <MeshReflectorMaterial
        color="#2c2c2c"
        metalness={0.4}
        roughness={0.7}
        blur={[1000, 400]}
        resolution={512}
        mirror={0.5}
      />
    </mesh>
  );
};

export default Ground;