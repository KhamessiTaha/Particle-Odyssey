import React, { useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/cannon';
import { OrbitControls } from '@react-three/drei';

import Ground from '../components/Ground';
import Lighting from '../components/Lighting';
import ParticleBrush from '../components/ParticleBrush';
import ControlPanel from '../ui/ControlPanel';
import ToolSelector from '../ui/ToolSelector';
import InfoPanel from '../ui/InfoPanel';

const SandboxPage = () => {
  const [selectedTool, setSelectedTool] = useState('sand');
  const [simulationSettings, setSimulationSettings] = useState({
    gravity: -9.8,
    particleSize: 0.1,
    spawnRate: 10
  });

  const canvasRef = useRef();

  return (
    <div className="flex h-screen">
      {/* Left Sidebar - Tool Selector */}
      <div className="w-16 bg-gray-800">
        <ToolSelector 
          selectedTool={selectedTool} 
          onToolSelect={setSelectedTool} 
        />
      </div>

      {/* Main Canvas */}
      <div className="flex-grow relative">
        <Canvas 
          ref={canvasRef}
          camera={{ position: [0, 5, 10], fov: 45 }}
          shadows
        >
          <Physics gravity={[0, simulationSettings.gravity, 0]}>
            <Lighting />
            <Ground />
            <ParticleBrush 
              tool={selectedTool} 
              settings={simulationSettings} 
            />
            <OrbitControls />
          </Physics>
        </Canvas>
      </div>

      {/* Right Sidebar - Control Panel */}
      <div className="w-64 bg-gray-800 p-4">
        <ControlPanel 
          settings={simulationSettings}
          onSettingsChange={setSimulationSettings}
        />
        <InfoPanel />
      </div>
    </div>
  );
};

export default SandboxPage;