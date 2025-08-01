import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { TyreInventory } from './TyreInventory';
import { BarChart3, List, Map, Gauge, ClipboardCheck, PieChart } from 'lucide-react';

// Placeholder for components that may not be implemented yet
const PlaceholderComponent = ({ title }: { title: string }) => (
  <div className="p-6 bg-gray-50 rounded-lg">
    <h3 className="text-xl font-bold mb-4">{title}</h3>
    <p>This component is currently under development</p>
  </div>
);

interface TyreManagementProps {
  activeTab?: string;
}

const TyreManagement: React.FC<TyreManagementProps> = ({ activeTab = 'inventory' }) => {
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [selectedTab, setSelectedTab] = useState<string>(activeTab);

  // Update selected tab when prop changes
  useEffect(() => {
    if (activeTab) {
      setSelectedTab(activeTab);
    }
  }, [activeTab]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Tyre Management System</h2>
        <p className="text-gray-600">Comprehensive tyre tracking, maintenance, and analytics</p>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <PieChart className="w-4 h-4" />
            <span>Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="vehicle-view" className="flex items-center gap-2">
            <Map className="w-4 h-4" />
            <span>Vehicle View</span>
          </TabsTrigger>
          <TabsTrigger value="inspection" className="flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4" />
            <span>Inspection</span>
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <List className="w-4 h-4" />
            <span>Inventory</span>
          </TabsTrigger>
          <TabsTrigger value="stores" className="flex items-center gap-2">
            <Gauge className="w-4 h-4" />
            <span>Stores</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            <span>Reports</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <PlaceholderComponent title="Tyre Dashboard" />
        </TabsContent>

        <TabsContent value="vehicle-view" className="space-y-4">
          <PlaceholderComponent title="Vehicle Tyre View" />
        </TabsContent>

        <TabsContent value="inspection" className="space-y-4">
          <PlaceholderComponent title="Tyre Inspection" />
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <TyreInventory />
        </TabsContent>

        <TabsContent value="stores" className="space-y-4">
          <div className="p-6 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-bold mb-4">Tyre Stores</h3>
            <p>Manage tyre storage and transfers between locations</p>
            <p className="text-sm text-gray-500 mt-2">This feature is under development</p>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <PlaceholderComponent title="Tyre Reports" />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TyreManagement;
