import React, { useState, useRef, useEffect } from 'react';
import { Home, User, Download, Printer, Save, ArrowLeft, X, Plus, Minus, RotateCw, Move, ZoomIn, ZoomOut } from 'lucide-react';

interface TreatmentPlanProps {
  onBack: () => void;
  patientData: {
    patientId: string;
    firstName: string;
    lastName: string;
    apXrayImage: string | null;
    latXrayImage: string | null;
  };
}

interface ImplantTemplate {
  id: string;
  name: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  opacity: number;
  visible: boolean;
}

const TreatmentPlan: React.FC<TreatmentPlanProps> = ({ onBack, patientData }) => {
  const [selectedView, setSelectedView] = useState<'ap' | 'lateral'>('ap');
  const [implantTemplates, setImplantTemplates] = useState<ImplantTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showImplantLibrary, setShowImplantLibrary] = useState(false);
  const [measurements, setMeasurements] = useState({
    length: '120mm',
    angle: '15°',
    diameter: '8mm'
  });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLDivElement>(null);

  const implantLibrary = [
    { id: 'plate-1', name: 'Locking Plate 4.5mm', type: 'plate' },
    { id: 'plate-2', name: 'Reconstruction Plate 3.5mm', type: 'plate' },
    { id: 'screw-1', name: 'Cortical Screw 4.5mm', type: 'screw' },
    { id: 'screw-2', name: 'Cancellous Screw 6.5mm', type: 'screw' },
    { id: 'nail-1', name: 'Intramedullary Nail', type: 'nail' },
    { id: 'wire-1', name: 'K-Wire 2.0mm', type: 'wire' }
  ];

  const addImplantTemplate = (implantId: string) => {
    const newTemplate: ImplantTemplate = {
      id: `${implantId}-${Date.now()}`,
      name: implantLibrary.find(i => i.id === implantId)?.name || 'Unknown',
      x: 50,
      y: 50,
      rotation: 0,
      scale: 1,
      opacity: 0.8,
      visible: true
    };
    setImplantTemplates(prev => [...prev, newTemplate]);
    setShowImplantLibrary(false);
  };

  const updateTemplate = (id: string, updates: Partial<ImplantTemplate>) => {
    setImplantTemplates(prev => 
      prev.map(template => 
        template.id === id ? { ...template, ...updates } : template
      )
    );
  };

  const deleteTemplate = (id: string) => {
    setImplantTemplates(prev => prev.filter(template => template.id !== id));
    if (selectedTemplate === id) {
      setSelectedTemplate(null);
    }
  };

  const handleMouseDown = (e: React.MouseEvent, templateId: string) => {
    if (e.button === 0) { // Left click
      setSelectedTemplate(templateId);
      setIsDragging(true);
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const template = implantTemplates.find(t => t.id === templateId);
        if (template) {
          setDragOffset({
            x: e.clientX - rect.left - (template.x * rect.width / 100),
            y: e.clientY - rect.top - (template.y * rect.height / 100)
          });
        }
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && selectedTemplate && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left - dragOffset.x) / rect.width) * 100;
      const y = ((e.clientY - rect.top - dragOffset.y) / rect.height) * 100;
      
      updateTemplate(selectedTemplate, {
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y))
      });
    }

    if (isPanning && canvasRef.current) {
      const deltaX = e.clientX - panStart.x;
      const deltaY = e.clientY - panStart.y;
      setPan(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsPanning(false);
  };

  const handlePanStart = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.ctrlKey)) { // Middle click or Ctrl+Left click
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    }
  };

  const handleZoom = (delta: number) => {
    setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)));
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const exportReport = () => {
    window.print();
  };

  const saveProject = () => {
    const projectData = {
      patientData,
      implantTemplates,
      measurements,
      selectedView,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `treatment-plan-${patientData.patientId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedTemplate) {
        switch (e.key) {
          case 'Delete':
          case 'Backspace':
            deleteTemplate(selectedTemplate);
            break;
          case 'ArrowUp':
            updateTemplate(selectedTemplate, { y: Math.max(0, implantTemplates.find(t => t.id === selectedTemplate)!.y - 1) });
            break;
          case 'ArrowDown':
            updateTemplate(selectedTemplate, { y: Math.min(100, implantTemplates.find(t => t.id === selectedTemplate)!.y + 1) });
            break;
          case 'ArrowLeft':
            updateTemplate(selectedTemplate, { x: Math.max(0, implantTemplates.find(t => t.id === selectedTemplate)!.x - 1) });
            break;
          case 'ArrowRight':
            updateTemplate(selectedTemplate, { x: Math.min(100, implantTemplates.find(t => t.id === selectedTemplate)!.x + 1) });
            break;
        }
      }
      
      if (e.key === 'Escape') {
        setSelectedTemplate(null);
        setShowImplantLibrary(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTemplate, implantTemplates]);

  const renderImplantTemplate = (template: ImplantTemplate) => {
    if (!template.visible) return null;

    return (
      <div
        key={template.id}
        className={`absolute cursor-move transition-all duration-200 ${
          selectedTemplate === template.id ? 'ring-2 ring-blue-500 ring-opacity-75' : ''
        }`}
        style={{
          left: `${template.x}%`,
          top: `${template.y}%`,
          transform: `translate(-50%, -50%) rotate(${template.rotation}deg) scale(${template.scale})`,
          opacity: template.opacity,
          zIndex: selectedTemplate === template.id ? 10 : 5
        }}
        onMouseDown={(e) => handleMouseDown(e, template.id)}
      >
        {/* Render different implant types */}
        {template.name.includes('Plate') && (
          <div className="w-24 h-2 bg-yellow-400 rounded-full shadow-lg border border-yellow-500" />
        )}
        {template.name.includes('Screw') && (
          <div className="w-1 h-8 bg-gray-300 rounded-full shadow-lg border border-gray-400" />
        )}
        {template.name.includes('Nail') && (
          <div className="w-2 h-16 bg-gray-400 rounded-full shadow-lg border border-gray-500" />
        )}
        {template.name.includes('Wire') && (
          <div className="w-0.5 h-12 bg-blue-400 rounded-full shadow-lg" />
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="flex items-center justify-between px-8 py-6">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-3 rounded-lg">
                <span className="text-white text-xl font-bold">Meril</span>
              </div>
              <div>
                <p className="text-gray-500 text-sm">More to Life</p>
              </div>
            </div>
            <h1 className="text-2xl font-semibold text-gray-800 tracking-wide">
              MERIL - ATS
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            <button className="flex flex-col items-center justify-center w-16 h-16 bg-blue-100 hover:bg-blue-200 rounded-full transition-all duration-300">
              <Home size={24} className="text-blue-600" />
              <span className="text-xs text-blue-600 mt-1">Home</span>
            </button>
            
            <button className="flex flex-col items-center justify-center w-16 h-16 bg-gray-100 hover:bg-gray-200 rounded-full transition-all duration-300">
              <User size={24} className="text-gray-600" />
              <span className="text-xs text-gray-600 mt-1">Profile</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-8">
        {/* Header with title and buttons */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-semibold text-gray-800">Pre-operative Treatment Planning</h2>
          <div className="flex space-x-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-2xl border border-gray-300 transition-all duration-300"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>
            <button
              onClick={saveProject}
              className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-2xl transition-all duration-300"
            >
              <Save size={20} />
              <span>Save Project</span>
            </button>
            <button
              onClick={exportReport}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-2xl transition-all duration-300"
            >
              <Printer size={20} />
              <span>Print Report</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[800px]">
          {/* Left Sidebar - Patient Info & Controls */}
          <div className="lg:col-span-1 space-y-6 overflow-y-auto">
            {/* Patient Information */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Patient Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Patient ID:</span>
                  <span className="font-medium">{patientData.patientId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{patientData.firstName} {patientData.lastName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    Planning Complete
                  </span>
                </div>
              </div>
            </div>

            {/* View Selection */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">X-Ray Views</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedView('ap')}
                  className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                    selectedView === 'ap'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  AP View
                </button>
                <button
                  onClick={() => setSelectedView('lateral')}
                  className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                    selectedView === 'lateral'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Lateral View
                </button>
              </div>
            </div>

            {/* Implant Library */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Implant Library</h3>
                <button
                  onClick={() => setShowImplantLibrary(!showImplantLibrary)}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
              
              {showImplantLibrary && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {implantLibrary.map((implant) => (
                    <button
                      key={implant.id}
                      onClick={() => addImplantTemplate(implant.id)}
                      className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm transition-colors"
                    >
                      {implant.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Template Controls */}
            {selectedTemplate && (
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Template Controls</h3>
                  <button
                    onClick={() => deleteTemplate(selectedTemplate)}
                    className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
                
                {(() => {
                  const template = implantTemplates.find(t => t.id === selectedTemplate);
                  if (!template) return null;
                  
                  return (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Rotation: {template.rotation}°
                        </label>
                        <input
                          type="range"
                          min="-180"
                          max="180"
                          value={template.rotation}
                          onChange={(e) => updateTemplate(selectedTemplate, { rotation: Number(e.target.value) })}
                          className="w-full"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Scale: {template.scale.toFixed(1)}x
                        </label>
                        <input
                          type="range"
                          min="0.5"
                          max="2"
                          step="0.1"
                          value={template.scale}
                          onChange={(e) => updateTemplate(selectedTemplate, { scale: Number(e.target.value) })}
                          className="w-full"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Opacity: {Math.round(template.opacity * 100)}%
                        </label>
                        <input
                          type="range"
                          min="0.1"
                          max="1"
                          step="0.1"
                          value={template.opacity}
                          onChange={(e) => updateTemplate(selectedTemplate, { opacity: Number(e.target.value) })}
                          className="w-full"
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="visible"
                          checked={template.visible}
                          onChange={(e) => updateTemplate(selectedTemplate, { visible: e.target.checked })}
                          className="rounded"
                        />
                        <label htmlFor="visible" className="text-sm font-medium text-gray-700">
                          Visible
                        </label>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Measurements */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Measurements</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Length:</span>
                  <span className="font-medium">{measurements.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Angle:</span>
                  <span className="font-medium">{measurements.angle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Diameter:</span>
                  <span className="font-medium">{measurements.diameter}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Canvas Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 h-full flex flex-col">
              {/* Canvas Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h3 className="text-xl font-semibold text-gray-800">
                  {selectedView === 'ap' ? 'Anteroposterior (AP)' : 'Lateral'} View - Treatment Planning
                </h3>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleZoom(-0.1)}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    title="Zoom Out"
                  >
                    <ZoomOut size={16} />
                  </button>
                  <span className="text-sm font-medium text-gray-600 min-w-[60px] text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    onClick={() => handleZoom(0.1)}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    title="Zoom In"
                  >
                    <ZoomIn size={16} />
                  </button>
                  <button
                    onClick={resetView}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                  >
                    Reset View
                  </button>
                </div>
              </div>

              {/* Canvas */}
              <div className="flex-1 relative overflow-hidden bg-black rounded-b-2xl">
                <div
                  ref={canvasRef}
                  className="w-full h-full relative cursor-crosshair"
                  style={{
                    transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                    transformOrigin: 'center center'
                  }}
                  onMouseDown={handlePanStart}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  {/* X-Ray Background */}
                  <div
                    className="w-full h-full bg-black"
                    style={{
                      backgroundImage: selectedView === 'ap' 
                        ? (patientData.apXrayImage ? `url("${patientData.apXrayImage}")` : 'none')
                        : (patientData.latXrayImage ? `url("${patientData.latXrayImage}")` : 'none'),
                      backgroundSize: 'contain',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'center'
                    }}
                  />

                  {/* Implant Templates */}
                  {implantTemplates.map(renderImplantTemplate)}

                  {/* Grid Overlay */}
                  <div className="absolute inset-0 pointer-events-none opacity-20">
                    <svg className="w-full h-full">
                      <defs>
                        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#ffffff" strokeWidth="0.5"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                  </div>

                  {/* Measurement Lines */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <line x1="10%" y1="20%" x2="90%" y2="20%" stroke="#00ff00" strokeWidth="2" strokeDasharray="5,5" />
                    <text x="50%" y="18%" fill="#00ff00" fontSize="12" textAnchor="middle">120mm</text>
                    
                    <line x1="20%" y1="30%" x2="20%" y2="80%" stroke="#ff0000" strokeWidth="2" strokeDasharray="5,5" />
                    <text x="18%" y="55%" fill="#ff0000" fontSize="12" textAnchor="middle" transform="rotate(-90 18% 55%)">85mm</text>
                  </svg>
                </div>

                {/* Canvas Instructions */}
                <div className="absolute bottom-4 left-4 bg-black/70 text-white px-4 py-2 rounded-lg text-sm">
                  <div>Left click: Select template</div>
                  <div>Drag: Move template</div>
                  <div>Ctrl+Click: Pan view</div>
                  <div>Delete: Remove selected</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Template List */}
        {implantTemplates.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Placed Templates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {implantTemplates.map((template) => (
                <div
                  key={template.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedTemplate === template.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-800">{template.name}</h4>
                      <p className="text-sm text-gray-600">
                        Position: ({Math.round(template.x)}, {Math.round(template.y)})
                      </p>
                      <p className="text-sm text-gray-600">
                        Rotation: {template.rotation}° | Scale: {template.scale.toFixed(1)}x
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateTemplate(template.id, { visible: !template.visible });
                        }}
                        className={`p-1 rounded ${
                          template.visible ? 'text-green-600' : 'text-gray-400'
                        }`}
                        title={template.visible ? 'Hide' : 'Show'}
                      >
                        👁
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTemplate(template.id);
                        }}
                        className="p-1 text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TreatmentPlan;