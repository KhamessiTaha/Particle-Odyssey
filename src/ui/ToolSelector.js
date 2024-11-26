import React from 'react';

const ToolSelector = ({ selectedTool, onToolSelect }) => {
  const tools = ['sand', 'water', 'stone', 'fire'];

  return (
    <div className="flex flex-col items-center py-4">
      {tools.map(tool => (
        <button
          key={tool}
          className={`mb-2 p-2 rounded ${
            selectedTool === tool 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-700 text-gray-300'
          }`}
          onClick={() => onToolSelect(tool)}
        >
          {tool}
        </button>
      ))}
    </div>
  );
};

export default ToolSelector;