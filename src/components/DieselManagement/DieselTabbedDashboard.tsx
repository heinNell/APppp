import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs';
import DieselDashboard from './DieselDashboard';
import DieselAnalysis from './DieselAnalysis';
import FuelAlertsTab from './FuelAlertsTab';
import FuelReconciliationTab from './FuelReconciliationTab';
import { useAppContext } from '../../context/AppContext';
import { Fuel, FileText, BarChart3, Flag } from 'lucide-react';

const DieselTabbedDashboard: React.FC = () => {
  const { dieselRecords } = useAppContext();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Diesel Management</h1>
        <p className="text-gray-600">Track, analyze, and manage diesel consumption across your fleet</p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Fuel className="w-4 h-4" />
            <span>Diesel Overview</span>
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            <span>Analysis & Trends</span>
          </TabsTrigger>
          <TabsTrigger value="flags" className="flex items-center gap-2">
            <Flag className="w-4 h-4" />
            <span>Fuel Alerts</span>
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>Fuel Reconciliation</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <DieselDashboard />
        </TabsContent>

        <TabsContent value="analysis" className="mt-6">
          <DieselAnalysis dieselRecords={dieselRecords} />
        </TabsContent>

        <TabsContent value="flags" className="mt-6">
          <FuelAlertsTab />
        </TabsContent>

        <TabsContent value="logs" className="mt-6">
          <FuelReconciliationTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DieselTabbedDashboard;