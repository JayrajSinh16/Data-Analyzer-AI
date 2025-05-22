import React, { useState, useRef, useEffect } from 'react';

const models = [
  {
    id: 'meta-llama/llama-3.3-8b-instruct:free',
    name: 'Llama',
    provider: 'Meta',
    description: 'Fast reasoning capabilities',
  },
  {
    id: 'microsoft/phi-4-reasoning-plus:free',
    name: 'Phi-4',
    provider: 'Microsoft',
    description: 'Quick responses with good quality',
  },
  {
    id: 'qwen/qwen3-0.6b-04-28:free',
    name: 'Qwen3-0',
    provider: 'Qwen',
    description: 'Fast and cost-effective',
  }
];

const ModelSelector = ({ selectedModel, setSelectedModel }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const selectedModelInfo = models.find(model => model.id === selectedModel);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1.5 rounded-md text-sm"
      >
        <span>{selectedModelInfo?.name || 'Select Model'}</span>
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-60 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
          <div className="py-1 max-h-60 overflow-y-auto">
            {models.map((model) => (
              <button
                key={model.id}
                onClick={() => {
                  setSelectedModel(model.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 hover:bg-gray-700 flex flex-col 
                  ${model.id === selectedModel ? 'bg-violet-600/20 text-violet-300' : 'text-gray-300'}`}
              >
                <span className="font-medium">{model.name}</span>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{model.provider}</span>
                  <span className="text-xs text-gray-500">{model.description}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelSelector;
