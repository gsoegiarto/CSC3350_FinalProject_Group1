import React, { useState } from 'react';
import { Building2 } from 'lucide-react';
import Navigation from './components/Navigation';
import EmployeeManagement from './components/EmployeeManagement';
import EmployeeSearch from './components/EmployeeSearch';
import SalaryAdjustments from './components/SalaryAdjustments';
import Reports from './components/Reports';

function App() {
  const [activeTab, setActiveTab] = useState('employees');

  const renderContent = () => {
    switch (activeTab) {
      case 'employees':
        return <EmployeeManagement />;
      case 'search':
        return <EmployeeSearch />;
      case 'salary':
        return <SalaryAdjustments />;
      case 'reports':
        return <Reports />;
      default:
        return <EmployeeManagement />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <Building2 className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Company Z</h1>
            </div>
          </div>
        </div>
      </header>

      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;