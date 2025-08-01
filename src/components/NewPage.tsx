import React from 'react';
import { Home, User } from 'lucide-react';

interface NewPageProps {
  onBack: () => void;
  patientData: {
    patientId: string;
    firstName: string;
    lastName: string;
    apXrayImage: string | null;
    latXrayImage: string | null;
  };
}

const NewPage: React.FC<NewPageProps> = ({ onBack, patientData }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="flex items-center justify-between px-8 py-6">
          {/* Left side - Logo and Title */}
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

          {/* Right side - Navigation */}
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
          <h2 className="text-3xl font-semibold text-gray-800">Treatment Plan</h2>
          <div className="flex space-x-4">
            <button
              onClick={onBack}
              className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-2xl border border-gray-300 transition-all duration-300"
            >
              Back
            </button>
            <button
              onClick={() => window.print()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-2xl transition-all duration-300"
            >
              Print Report
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Patient Details */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl p-8 shadow-lg text-white">
              {/* Case Details */}
              <div className="bg-white/20 rounded-2xl p-6 mb-6">
                <h3 className="text-xl font-semibold mb-4">Patient Details</h3>
                <div className="space-y-2 text-sm">
                  <p>Patient ID: <span className="font-medium">{patientData.patientId}</span></p>
                  <p>Name: <span className="font-medium">{patientData.firstName} {patientData.lastName}</span></p>
                  <p>Age: <span className="font-medium">45 years</span></p>
                  <p>Gender: <span className="font-medium">Male</span></p>
                  <p>Date: <span className="font-medium">{new Date().toLocaleDateString()}</span></p>
                </div>
              </div>

              {/* Treatment Summary */}
              <div className="bg-white/20 rounded-2xl p-6">
                <h3 className="text-xl font-semibold mb-4">Treatment Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Bone Segments:</span>
                    <span className="font-medium">2 Annotated</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Implant Type:</span>
                    <span className="font-medium">Plate A</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Calibration:</span>
                    <span className="font-medium">Completed</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="font-medium text-green-300">Ready for Surgery</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Columns - Treatment Plan Visualization */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
              <h3 className="text-2xl font-semibold text-gray-800 mb-6">Pre-operative Planning</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* AP View with Implant */}
                <div className="bg-black rounded-2xl overflow-hidden shadow-lg">
                  <div className="p-4 bg-gray-100">
                    <h4 className="font-semibold text-gray-800">AP View - With Implant Template</h4>
                  </div>
                  <div
                    className="aspect-[3/4] bg-black relative"
                    style={{
                      backgroundImage: patientData.apXrayImage
                        ? `url("${patientData.apXrayImage}")`
                        : 'url("")',
                      backgroundSize: 'contain',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'center',
                    }}
                  >
                    {/* Simulated implant overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-32 h-48 border-2 border-yellow-400 bg-yellow-400/20 rounded-lg"></div>
                    </div>
                  </div>
                </div>

                {/* Lateral View with Implant */}
                <div className="bg-black rounded-2xl overflow-hidden shadow-lg">
                  <div className="p-4 bg-gray-100">
                    <h4 className="font-semibold text-gray-800">Lateral View - With Implant Template</h4>
                  </div>
                  <div
                    className="aspect-[3/4] bg-black relative"
                    style={{
                      backgroundImage: patientData.latXrayImage
                        ? `url("${patientData.latXrayImage}")`
                        : 'url("")',
                      backgroundSize: 'contain',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'center',
                    }}
                  >
                    {/* Simulated implant overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-32 h-48 border-2 border-yellow-400 bg-yellow-400/20 rounded-lg"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Surgical Notes */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Surgical Notes & Recommendations</h4>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <p>Bone segments have been properly annotated and calibrated for accurate measurements.</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <p>Implant template positioned optimally for fracture reduction and stability.</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <p>Pre-operative planning complete. Patient ready for surgical intervention.</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <p>Recommended approach: Standard lateral approach with careful soft tissue handling.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewPage;