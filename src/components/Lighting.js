import React from 'react';

function Lighting() {
    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} castShadow />
        </>
    );
}

export default Lighting;
