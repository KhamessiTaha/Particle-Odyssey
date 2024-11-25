import React from 'react';
import { usePlane } from '@react-three/cannon';

function Ground() {
    // Static physics-enabled ground plane
    const [ref] = usePlane(() => ({
        rotation: [-Math.PI / 2, 0, 0], // Rotate plane to be horizontal
        position: [0, -5, 0], // Place it slightly below the origin
    }));

    return (
        <mesh ref={ref} receiveShadow>
            <planeGeometry args={[100, 100]} />
            <meshStandardMaterial color="green" />
        </mesh>
    );
}

export default Ground;
