import React from 'react';
import { useSphere } from '@react-three/cannon';

function Particle({ position, type = "default" }) {
    // Use physics-enabled sphere for the particle
    const [ref] = useSphere(() => ({
        mass: 1,
        position,
        args: [0.5], // Radius of the sphere
    }));

    // Define material based on particle type
    const getColor = () => {
        switch (type) {
            case "sand":
                return "yellow";
            case "water":
                return "blue";
            case "fire":
                return "red";
            case "smoke":
                return "gray";
            default:
                return "white";
        }
    };

    return (
        <mesh ref={ref} castShadow>
            <sphereGeometry args={[0.5, 32, 32]} />
            <meshStandardMaterial color={getColor()} />
        </mesh>
    );
}

export default Particle;
