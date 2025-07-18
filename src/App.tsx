// Import React and routing components
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Lazy load workshop pages
import RequestPartsPage from "./pages/workshop/request-parts";
import VehicleInspectionPage from "./pages/workshop/vehicle-inspection";
import CreatePurchaseOrderPage from "./pages/workshop/create-purchase-order";
import InspectionHistoryPage from "./pages/workshop/inspections";

// Context Providers
import { AppProvider } from "./context/AppContext";
import { SyncProvider } from "./context/SyncContext";
import { TyreStoresProvider } from "./context/TyreStoresContext";
import { TripProvider } from "./context/TripContext";
import { DriverBehaviorProvider } from "./context/DriverBehaviorContext";

// Core Components
import ErrorBoundary from "./components/ErrorBoundary";
import Layout from './components/layout/Layout';
import TripFormModal from "./components/TripManagement/TripFormModal";
import FirestoreConnectionError from "./components/ui/FirestoreConnectionError";

// Utilities
import { getConnectionStatus, onConnectionStatusChanged } from "./utils/firebaseConnectionHandler";
import { Trip } from "./types";

// Import Generic Placeholder Page
import GenericPlaceholderPage from "./pages/GenericPlaceholderPage";

// Main Pages
import DashboardPage from "./pages/DashboardPage";
import NotificationsPage from "./pages/NotificationsPage";
import SettingsPage from "./pages/SettingsPage";
import MapTestPage from "./pages/MapTestPage";
import WorkshopPage from "./pages/WorkshopPage";
import FleetAnalyticsPage from "./pages/FleetAnalyticsPage";

// Trip Management Pages
import TripManagementPage from "./pages/trips/TripManagementPage";
import ActiveTripsPage from "./pages/trips/ActiveTripsPage";
import TripTimelinePage from "./pages/trips/TripTimelinePage";
import RoutePlanningPage from "./pages/trips/RoutePlanningPage";
import RouteOptimizationPage from "./pages/trips/RouteOptimizationPage";
import LoadPlanningPage from "./pages/trips/LoadPlanningPage";
import TripCalendarPage from "./pages/trips/TripCalendarPage";
import AddTripPage from "./pages/trips/AddTripPage";
import FleetLocationMapPage from "./pages/trips/FleetLocationMapPage";

// Invoice Management Pages
import InvoiceManagementPage from "./pages/invoices/InvoiceManagementPage";
import InvoiceTemplatesPage from "./pages/invoices/InvoiceTemplates";

// Diesel Management Pages
import DieselManagementPage from "./pages/diesel/DieselManagementPage";
import AddFuelEntryPage from "./pages/diesel/AddFuelEntry";

// Customer Management Pages
import ClientManagementPage from "./pages/clients/ClientManagementPage";
import AddNewCustomer from "./pages/clients/AddNewCustomer";
import ActiveCustomers from "./pages/clients/ActiveCustomers";
import CustomerReports from "./pages/clients/CustomerReports";

// Driver Management Pages
import DriverManagementPage from "./pages/drivers/DriverManagementPage";
import AddNewDriver from "./pages/drivers/AddNewDriver";
import DriverProfiles from "./pages/drivers/DriverProfiles";

// Compliance Management Pages
import ComplianceManagementPage from "./pages/compliance/ComplianceManagementPage";
import ReportNewIncidentPage from "./pages/compliance/ReportNewIncidentPage";
import IncidentManagement from "./pages/compliance/IncidentManagement";

// Tyre Management Pages
import TyreManagementPage from "./pages/tyres/TyreManagementPage";
import TyreInspection from "./pages/tyres/inspection";
import TyreInventory from "./pages/tyres/inventory";
import TyreReports from "./pages/tyres/reports";
import AddNewTyrePage from "./pages/tyres/add-new-tyre";

// Inventory Management Pages
import InventoryPage from "./pages/inventory/InventoryPage";
import ReceivePartsPage from "./pages/inventory/receive-parts";
import PartsInventoryPage from "./pages/inventory/PartsInventoryPage";

// Wialon Pages
import WialonDashboard from './pages/wialon/WialonDashboard';
import WialonUnitsPage from './pages/wialon/WialonUnitsPage';
import WialonConfigPage from './pages/wialon/WialonConfigPage';
// Workshop Components
import FleetTable from "./components/Workshop Management/FleetTable";
import JobCardManagement from "./components/Workshop Management/JobCardManagement";
import JobCardKanbanBoard from "./components/Workshop Management/JobCardKanbanBoard";
import InspectionManagement from "./components/Workshop Management/InspectionManagement";
import InspectionForm from "./components/Workshop Management/InspectionForm";
import FaultTracking from "./components/Workshop Management/FaultTracking";
import TyreManagement from "./components/TyreManagement/TyreManagement";
import WorkshopAnalyticsComp from "./components/Workshop Management/WorkshopAnalytics";
import PartsOrdering from "./components/Workshop Management/PartsOrdering";
import QRGenerator from "./components/Workshop Management/QRGenerator";
import QRCodeBatchGenerator from "./components/Workshop Management/QRCodeBatchGenerator";
import DriverInspectionForm from "./components/Workshop Management/DriverInspectionForm";
import InspectionHistory from "./components/Workshop Management/InspectionHistory";

// Feature Components
import ActiveTrips from "./components/TripManagement/ActiveTrips"; 
import CompletedTrips from "./components/TripManagement/CompletedTrips";
import FlagsInvestigations from "./components/Flags/FlagsInvestigations";
import CurrencyFleetReport from "./components/InvoiceManagement/CurrencyFleetReport";
import TripDashboard from "./components/TripManagement/TripDashboard";
import InvoiceAgingDashboard from "./components/InvoiceManagement/InvoiceAgingDashboard";
import CustomerRetentionDashboard from "./components/Performance/CustomerRetentionDashboard";
import ActionLog from "./components/ComplianceSafety/ActionLog";
import MapsView from "./components/maps/MapsView";

// Invoice Management Components
import InvoiceDashboard from "./components/InvoiceManagement/InvoiceDashboard";
import InvoiceBuilder from "./components/InvoiceManagement/InvoiceBuilder";
import InvoiceApprovalFlow from "./components/InvoiceManagement/InvoiceApprovalFlow";
import TaxReportExport from "./components/InvoiceManagement/TaxReportExport";

// Diesel Management Components
import DieselDashboardComponent from "./components/DieselManagement/DieselDashboardComponent";
import FuelLogs from "./components/DieselManagement/FuelLogs";
import FuelCardManager from "./components/DieselManagement/FuelCardManager";
import FuelEfficiencyReport from "./components/DieselManagement/FuelEfficiencyReport";
import FuelTheftDetection from "./components/DieselManagement/FuelTheftDetection";
import CarbonFootprintCalc from "./components/DieselManagement/CarbonFootprintCalc";
import DriverFuelBehavior from "./components/DieselManagement/DriverFuelBehavior";

// Driver Management Components
import DriverDashboard from "./components/DriverManagement/DriverDashboard";
import DriverBehaviorEvents from "./components/DriverManagement/DriverBehaviorEvents";

// Customer Management Components
import RetentionMetrics from "./components/CustomerManagement/RetentionMetrics";
import ClientNetworkMap from "./components/CustomerManagement/ClientNetworkMap";

// Compliance & Safety Components
import ComplianceDashboard from "./components/ComplianceSafety/ComplianceDashboard";

// Fleet Analytics Components
import AnalyticsDashboard from "./components/FleetAnalytics/AnalyticsDashboard";

// Inventory Components
import StockManager from "./components/Inventory Management/StockManager";
import InventoryDashboard from "./components/Inventory Management/InventoryDashboard";
import PurchaseOrderTracker from "./components/Inventory Management/PurchaseOrderTracker";
import VendorScorecard from "./components/Inventory Management/VendorScorecard";
import IndirectCostBreakdown from "./components/Inventory Management/IndirectCostBreakdown";

// Invoice Pages
import PendingInvoicesPage from "./pages/invoices/PendingInvoices";
import PaidInvoicesPage from "./pages/invoices/PaidInvoices";

// Main App component with Router implementation
const App: React.FC = () => {
  const [connectionError, setConnectionError] = useState<Error | null>(
    getConnectionStatus().status === 'error' ? getConnectionStatus().error : null
  );
  // State variables for trip form management
  const [editingTrip, setEditingTrip] = useState<Trip | undefined>(undefined);
  const [showTripForm, setShowTripForm] = useState(false);
  
  // Handler functions for trip form
  const handleSetEditingTrip = (trip: Trip | undefined) => {
    setEditingTrip(trip);
  };
  
  const handleShowTripForm = (show: boolean) => {
    setShowTripForm(show);
  };

  // Listen for connection status changes
  useEffect(() => {
    const unsubscribe = onConnectionStatusChanged((status, error) => {
      if (status === 'error') {
        setConnectionError(error || new Error('Unknown connection error'));
      } else if (status === 'connected') {
        setConnectionError(null);
      }
    });
    
    // Set a default user in localStorage to bypass authentication
    if (!localStorage.getItem('user')) {
      localStorage.setItem('user', 'bypass_user@example.com');
    }
    
    return unsubscribe;
  }, []);

  return (
    <ErrorBoundary>
      <AppProvider>
        <SyncProvider>
          <TyreStoresProvider>
            <TripProvider>
              <DriverBehaviorProvider>
                {connectionError && (
                  <div className="fixed top-0 left-0 right-0 z-50 p-4">
                    <FirestoreConnectionError error={connectionError} />
                  </div>
                )}
                <Router>
                  <Routes>
                    <Route
                      element={
                        <Layout
                          setEditingTrip={handleSetEditingTrip}
                          setShowTripForm={handleShowTripForm}
                        />
                      }
                    >
                      {/* Main Navigation */}
                      <Route path="/" element={<DashboardPage />} />
                      <Route path="/dashboard" element={<DashboardPage />} />
                      {/* Trip Management Section */}
                      <Route path="/trips" element={<TripManagementPage />} />
                      <Route path="/trips/active" element={<ActiveTripsPage />} />
                      <Route path="/trips/timeline" element={<TripTimelinePage />} />
                      <Route path="/trips/planning" element={<RoutePlanningPage />} />
                      <Route path="/trips/optimization" element={<RouteOptimizationPage />} />
                      <Route path="/trips/load-planning" element={<LoadPlanningPage />} />
                      <Route path="/trips/calendar" element={<TripCalendarPage />} />
                      <Route path="/trips/add" element={<AddTripPage />} />
                      <Route path="/trips/map" element={<FleetLocationMapPage />} />
                      <Route path="/trips/active-dashboard" element={<ActiveTrips />} />
                      <Route path="/trips/completed-dashboard" element={<CompletedTrips />} />
                      <Route path="/trips/flags" element={<FlagsInvestigations />} />
                      <Route path="/trips/dashboard" element={<TripDashboard />} />

                      {/* Invoice Management Section */}
                      <Route path="/invoices" element={<InvoiceManagementPage />} />
                      <Route path="/invoices/templates" element={<InvoiceTemplatesPage />} />
                      <Route path="/invoices/dashboard" element={<InvoiceDashboard />} />
                      <Route path="/invoices/builder" element={<InvoiceBuilder />} />
                      <Route path="/invoices/approval" element={<InvoiceApprovalFlow />} />
                      <Route path="/invoices/tax-export" element={<TaxReportExport />} />
                      <Route path="/invoices/pending" element={<PendingInvoicesPage />} />
                      <Route path="/invoices/paid" element={<PaidInvoicesPage />} />

                      {/* Diesel Management Section */}
                      <Route path="/diesel" element={<DieselManagementPage />} />
                      <Route path="/diesel/add-fuel" element={<AddFuelEntryPage />} />
                      <Route path="/diesel/dashboard" element={<DieselDashboardComponent />} />
                      <Route path="/diesel/logs" element={<FuelLogs />} />
                      <Route path="/diesel/card-manager" element={<FuelCardManager />} />
                      <Route path="/diesel/theft-detection" element={<FuelTheftDetection />} />
                      <Route path="/diesel/carbon-footprint" element={<CarbonFootprintCalc />} />
                      <Route path="/diesel/driver-behavior" element={<DriverFuelBehavior />} />

                      {/* ...existing routes... */}
                      <Route path="/diesel/costs" element={<GenericPlaceholderPage title="Cost Analysis" />} />
                      <Route path="/diesel/efficiency" element={<FuelEfficiencyReport />} />
                      <Route path="/diesel/theft-detection" element={<FuelTheftDetection />} />
                      <Route path="/diesel/carbon-tracking" element={<CarbonFootprintCalc />} />
                      <Route path="/diesel/budget" element={<GenericPlaceholderPage title="Budget Planning" />} />
                      <Route path="/diesel/driver-behavior" element={<DriverFuelBehavior />} />
                      
                      {/* Customer Management Section */}
                      <Route path="/clients" element={<ClientManagementPage />} />
                      <Route path="/clients/new" element={<AddNewCustomer />} />
                      <Route path="/clients/active" element={<ActiveCustomers />} />
                      <Route path="/clients/reports" element={<CustomerReports />} />
                      <Route path="/customers/retention" element={<RetentionMetrics />} />
                      <Route path="/clients/relationships" element={<ClientNetworkMap />} />
                      <Route path="/clients/network" element={<ClientNetworkMap />} />
                      
                      {/* Driver Management Section */}
                      <Route path="/drivers" element={<DriverManagementPage />} />
                      <Route path="/drivers/new" element={<AddNewDriver />} />
                      <Route path="/drivers/profiles" element={<DriverProfiles />} />
                      <Route path="/drivers/profiles/:id" element={<GenericPlaceholderPage title="Driver Details" />} />
                      <Route path="/drivers/profiles/:id/edit" element={<GenericPlaceholderPage title="Edit Driver" />} />
                      <Route path="/drivers/licenses" element={<GenericPlaceholderPage title="License Management" />} />
                      <Route path="/drivers/training" element={<GenericPlaceholderPage title="Training Records" />} />
                      <Route path="/drivers/performance" element={<GenericPlaceholderPage title="Performance Analytics" />} />
                      <Route path="/drivers/scheduling" element={<GenericPlaceholderPage title="Driver Scheduling" />} />
                      <Route path="/drivers/hours" element={<GenericPlaceholderPage title="Hours of Service" />} />
                      <Route path="/drivers/violations" element={<GenericPlaceholderPage title="Driver Violations" />} />
                      <Route path="/drivers/rewards" element={<GenericPlaceholderPage title="Driver Rewards" />} />
                      <Route path="/drivers/behavior" element={<DriverBehaviorEvents />} />
                      <Route path="/drivers/safety-scores" element={<GenericPlaceholderPage title="Safety Scores" />} />
                      <Route path="/drivers/dashboard" element={<DriverDashboard />} />
                      
                      {/* Compliance & Safety Section */}
                      <Route path="/compliance" element={<ComplianceManagementPage />} />
                      <Route path="/compliance/dot" element={<GenericPlaceholderPage title="DOT Compliance" />} />
                      <Route path="/compliance/safety-inspections" element={<GenericPlaceholderPage title="Safety Inspections" />} />
                      <Route path="/compliance/incidents" element={<IncidentManagement />} />
                      <Route path="/compliance/incidents/new" element={<ReportNewIncidentPage />} />
                      <Route path="/compliance/incidents/:id" element={<GenericPlaceholderPage title="Incident Details" />} />
                      <Route path="/compliance/incidents/:id/edit" element={<GenericPlaceholderPage title="Edit Incident" />} />
                      <Route path="/compliance/training" element={<GenericPlaceholderPage title="Safety Training" />} />
                      <Route path="/compliance/audits" element={<GenericPlaceholderPage title="Audit Management" />} />
                      <Route path="/compliance/violations" element={<GenericPlaceholderPage title="Violation Tracking" />} />
                      <Route path="/compliance/insurance" element={<GenericPlaceholderPage title="Insurance Management" />} />
                      <Route path="/compliance/dashboard" element={<ComplianceDashboard />} />
                      
                      {/* Fleet Analytics Section */}
                      <Route path="/analytics" element={<FleetAnalyticsPage />} />
                      <Route path="/analytics/kpi" element={<GenericPlaceholderPage title="KPI Overview" />} />
                      <Route path="/analytics/predictive" element={<GenericPlaceholderPage title="Predictive Analytics" />} />
                      <Route path="/analytics/costs" element={<GenericPlaceholderPage title="Cost Analysis" />} />
                      <Route path="/analytics/roi" element={<GenericPlaceholderPage title="ROI Reports" />} />
                      <Route path="/analytics/benchmarks" element={<GenericPlaceholderPage title="Performance Benchmarks" />} />
                      <Route path="/analytics/custom-reports" element={<GenericPlaceholderPage title="Custom Reports" />} />
                      <Route path="/analytics/custom-reports/new" element={<GenericPlaceholderPage title="Create Custom Report" />} />
                      <Route path="/analytics/insights" element={<GenericPlaceholderPage title="Analytics Insights" />} />
                      <Route path="/analytics/vehicle-performance" element={<GenericPlaceholderPage title="Vehicle Performance" />} />
                      <Route path="/analytics/dashboard" element={<AnalyticsDashboard />} />
                      
                      {/* Workshop Section */}
                      <Route path="/workshop" element={<WorkshopPage />} />
                      <Route path="/workshop/fleet-setup" element={<FleetTable />} />
                      <Route path="/workshop/qr-generator" element={<QRGenerator />} />
                      <Route path="/workshop/qr-generator/batch" element={<QRCodeBatchGenerator />} />
                      <Route path="/workshop/driver-inspection" element={<DriverInspectionForm />} />
                      <Route path="/workshop/inspection-history" element={<InspectionHistory />} />
                      
                      {/* Inspections Routes */}
                      <Route path="/workshop/inspections" element={<InspectionHistoryPage />} />
                      <Route path="/workshop/inspections/new" element={<InspectionForm onBack={() => {}} />} />
                      <Route path="/workshop/inspections/active" element={<InspectionManagement status="active" />} />
                      <Route path="/workshop/inspections/completed" element={<InspectionManagement status="completed" />} />
                      <Route path="/workshop/inspections/templates" element={<GenericPlaceholderPage title="Inspection Templates" />} />
                      
                      {/* Job Cards Routes */}
                      <Route path="/workshop/job-cards" element={<JobCardManagement />} />
                      <Route path="/workshop/job-cards/kanban" element={<JobCardKanbanBoard />} />
                      <Route path="/workshop/job-cards/open" element={<JobCardManagement activeTab="open" />} />
                      <Route path="/workshop/job-cards/completed" element={<JobCardManagement activeTab="completed" />} />
                      <Route path="/workshop/job-cards/templates" element={<GenericPlaceholderPage title="Job Card Templates" />} />
                      
                      {/* Faults Routes */}
                      <Route path="/workshop/faults" element={<FaultTracking />} />
                      <Route path="/workshop/faults/new" element={<GenericPlaceholderPage title="Report New Fault" />} />
                      <Route path="/workshop/faults/critical" element={<GenericPlaceholderPage title="Critical Faults" />} />
                      
                      {/* Tyre Management Routes */}
                      <Route path="/workshop/tyres" element={<TyreManagement />} />
                      <Route path="/workshop/tyres/inventory" element={<TyreManagement activeTab="inventory" />} />
                      <Route path="/workshop/tyres/stores" element={<TyreManagement activeTab="stores" />} />
                      <Route path="/workshop/tyres/fleet" element={<TyreManagement activeTab="position" />} />
                      <Route path="/workshop/tyres/history" element={<TyreManagement activeTab="inspection" />} />
                      <Route path="/workshop/tyres/performance" element={<TyreManagement activeTab="analytics" />} />
                      <Route path="/workshop/tyres/add" element={<TyreManagement activeTab="add" />} />
                      <Route path="/workshop/tyres/management" element={<TyreManagementPage />} />
                      
                      {/* Inventory Management Routes */}
                      <Route path="/workshop/stock-alerts" element={<GenericPlaceholderPage title="Stock Alerts" />} />
                      <Route path="/workshop/parts-ordering" element={<PartsOrdering />} />
                      <Route path="/workshop/request-parts" element={<RequestPartsPage />} />
                      <Route path="/workshop/vehicle-inspection" element={<VehicleInspectionPage />} />
                      <Route path="/workshop/create-purchase-order" element={<CreatePurchaseOrderPage />} />
                      <Route path="/workshop/work-orders" element={<GenericPlaceholderPage title="Work Orders" />} />
                      <Route path="/workshop/purchase-orders" element={<PurchaseOrderTracker />} />
                      <Route path="/workshop/vendors" element={<VendorScorecard />} />
                      <Route path="/workshop/inventory" element={<InventoryDashboard />} />
                      <Route path="/workshop/stock" element={<StockManager />} />
                      <Route path="/workshop/indirect-costs" element={<IndirectCostBreakdown />} />
                      
                      {/* Analytics & Reports */}
                      <Route path="/workshop/analytics" element={<WorkshopAnalyticsComp />} />
                      <Route path="/workshop/reports" element={<GenericPlaceholderPage title="Workshop Reports" />} />
                      <Route path="/workshop/reports/costs" element={<GenericPlaceholderPage title="Cost Analysis Reports" />} />
                      
                      {/* Standalone Tyres Management Section */}
                      <Route path="/tyres" element={<TyreManagementPage />} />
                      <Route path="/tyres/dashboard" element={<TyreManagementPage />} />
                      <Route path="/tyres/inspection" element={<TyreInspection />} />
                      <Route path="/tyres/inventory" element={<TyreInventory />} />
                      <Route path="/tyres/reports" element={<TyreReports />} />
                      <Route path="/tyres/add-new" element={<AddNewTyrePage />} />
                      
                      {/* Standalone Inventory Management Section */}
                      <Route path="/inventory" element={<InventoryPage />} />
                      <Route path="/inventory/dashboard" element={<InventoryPage />} />
                      <Route path="/inventory/stock" element={<StockManager />} />
                      <Route path="/inventory/parts" element={<PartsInventoryPage />} />
                      <Route path="/inventory/reports" element={<GenericPlaceholderPage title="Inventory Reports" />} />
                      <Route path="/inventory/receive-parts" element={<ReceivePartsPage />} />
                      
                      {/* Fleet Management Section */}
                      <Route path="/fleet" element={<GenericPlaceholderPage title="Fleet Management" />} />
                      <Route path="/driver-behavior" element={<DriverBehaviorEvents />} />
                      <Route path="/diesel-dashboard" element={<GenericPlaceholderPage title="Legacy Diesel Dashboard" />} />
                      <Route path="/missed-loads" element={<GenericPlaceholderPage title="Missed Loads Tracker" />} />
                      {/* Map view is now integrated into FleetManagementPage */}
                      <Route path="/map-test" element={<MapTestPage />} />
                      <Route path="/maps" element={<MapsView />} />
                      
                      {/* Wialon Integration Routes */}
                      <Route path="/wialon" element={<WialonDashboard />} />
                      <Route path="/wialon/dashboard" element={<WialonDashboard />} />
                      <Route path="/wialon/units" element={<WialonUnitsPage />} />
                      <Route path="/wialon/config" element={<WialonConfigPage />} />
                      
                      <Route path="/action-log" element={<ActionLog />} />
                      
                      {/* Reports Section */}
                      <Route path="/reports" element={<CurrencyFleetReport />} />
                      <Route path="/invoice-aging" element={<InvoiceAgingDashboard />} />
                      <Route path="/customer-retention" element={<CustomerRetentionDashboard />} />
                      
                      {/* System Section */}
                      <Route path="/notifications" element={<NotificationsPage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      
                      {/* Fallback */}
                      <Route path="*" element={<DashboardPage />} />
                    </Route>
                  </Routes>
                </Router>
                
                {/* Trip Form Modal */}
                <TripFormModal
                  isOpen={showTripForm}
                  onClose={() => setShowTripForm(false)}
                  editingTrip={editingTrip}
                />
              </DriverBehaviorProvider>
            </TripProvider>
          </TyreStoresProvider>
        </SyncProvider>
      </AppProvider>
    </ErrorBoundary>
  );
};

export default App;
