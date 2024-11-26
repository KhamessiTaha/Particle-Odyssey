import React from 'react';

const ControlPanel = ({ 
  settings = {
    gravity: -9.8,
    particleSize: 0.1,
    temperature: 20,
    spawnRate: 10,
    brushSize: 1,
    particleVariation: 0.2
  }, 
  onSettingsChange 
}) => {
  const updateSettings = (key, value) => {
    onSettingsChange({
      ...settings,
      [key]: parseFloat(value)
    });
  };

  return (
    <div className="bg-gray-800 text-white p-4 space-y-4">
      <h2 className="text-xl mb-4">Simulation Controls</h2>
      
      {/* Existing controls */}
      <div>
        <label className="block mb-2">Gravity</label>
        <input 
          type="range"
          min="-20"
          max="0"
          step="0.1"
          value={settings.gravity ?? -9.8}
          onChange={(e) => updateSettings('gravity', e.target.value)}
          className="w-full"
        />
        <span>{(settings.gravity ?? -9.8).toFixed(1)} m/s²</span>
      </div>

      <div>
        <label className="block mb-2">Particle Size</label>
        <input 
          type="range"
          min="0.05"
          max="0.2"
          step="0.01"
          value={settings.particleSize ?? 0.1}
          onChange={(e) => updateSettings('particleSize', e.target.value)}
          className="w-full"
        />
        <span>{(settings.particleSize ?? 0.1).toFixed(2)} m</span>
      </div>

      <div>
        <label className="block mb-2">Temperature</label>
        <input 
          type="range"
          min="0"
          max="100"
          step="1"
          value={settings.temperature ?? 20}
          onChange={(e) => updateSettings('temperature', e.target.value)}
          className="w-full"
        />
        <span>{(settings.temperature ?? 20).toFixed(1)}°C</span>
      </div>

      {/* New controls */}
      <div>
        <label className="block mb-2">Spawn Rate</label>
        <input 
          type="range"
          min="1"
          max="50"
          step="1"
          value={settings.spawnRate ?? 10}
          onChange={(e) => updateSettings('spawnRate', e.target.value)}
          className="w-full"
        />
        <span>{settings.spawnRate ?? 10} particles/click</span>
      </div>

      <div>
        <label className="block mb-2">Brush Size</label>
        <input 
          type="range"
          min="0.1"
          max="2"
          step="0.1"
          value={settings.brushSize ?? 1}
          onChange={(e) => updateSettings('brushSize', e.target.value)}
          className="w-full"
        />
        <span>{(settings.brushSize ?? 1).toFixed(1)} m</span>
      </div>

      <div>
        <label className="block mb-2">Particle Variation</label>
        <input 
          type="range"
          min="0"
          max="0.5"
          step="0.05"
          value={settings.particleVariation ?? 0.2}
          onChange={(e) => updateSettings('particleVariation', e.target.value)}
          className="w-full"
        />
        <span>{(settings.particleVariation ?? 0.2).toFixed(2)}</span>
      </div>
    </div>
  );
};

export default ControlPanel;
