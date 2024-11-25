import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/cannon';
import Ground from '../components/Ground';
import Particle from '../components/Particle';
import Lighting from '../components/Lighting';

function SandboxPage() {
    const [particles, setParticles] = useState([]);

    // Handle mouse click to spawn particles
    const handleCanvasClick = (event) => {
        const { clientX, clientY } = event;

        // Convert 2D mouse position to 3D space
        const x = (clientX / window.innerWidth) * 20 - 10; // Map X to -10 to 10
        const z = (clientY / window.innerHeight) * 20 - 10; // Map Z to -10 to 10

        // Add new particle to the state
        setParticles([...particles, { position: [x, 5, z], type: "sand" }]);
    };

    return (
        <Canvas shadows onClick={handleCanvasClick}>
            <Lighting />
            <Physics>
                <Ground />
                {particles.map((particle, index) => (
                    <Particle key={index} position={particle.position} type={particle.type} />
                ))}
            </Physics>
        </Canvas>
    );
}

export default SandboxPage;
