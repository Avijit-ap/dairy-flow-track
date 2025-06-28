
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useDataSimulation } from '@/hooks/useDataSimulation';
import { useDummyData } from '@/hooks/useDummyData';
import { Play, Trash2, Database, Settings, Zap, Square, Plus } from 'lucide-react';

const DataControls = () => {
  const { 
    simulateDeliveries, 
    clearAllData, 
    isSimulating,
    isRealTimeActive,
    startRealTimeSimulation,
    stopRealTimeSimulation,
    createSampleData
  } = useDataSimulation();
  
  const { createDummyData, isCreating } = useDummyData();
  const [simulationEnabled, setSimulationEnabled] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Data Management & Testing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Simulation Toggle */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Settings className="h-4 w-4 text-gray-600" />
            <Label htmlFor="simulation-toggle" className="text-sm font-medium">
              Enable Testing Tools
            </Label>
          </div>
          <Switch
            id="simulation-toggle"
            checked={simulationEnabled}
            onCheckedChange={setSimulationEnabled}
          />
        </div>
        
        {simulationEnabled && (
          <>
            {/* Dummy Data Creation */}
            <div className="p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-pink-50">
              <div className="mb-3">
                <h3 className="font-medium text-gray-900">Create Test Data</h3>
                <p className="text-xs text-gray-600">
                  Create realistic test data for comprehensive testing
                </p>
              </div>
              
              <Button 
                onClick={createDummyData}
                disabled={isCreating}
                className="w-full mb-2"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                {isCreating ? 'Creating...' : 'Create Comprehensive Test Data'}
              </Button>
            </div>

            {/* Real-Time Simulation */}
            <div className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-medium text-gray-900">Real-Time Simulation</h3>
                  <p className="text-xs text-gray-600">
                    Automatically creates and updates delivery data in real-time
                  </p>
                </div>
                <div className={`h-3 w-3 rounded-full ${isRealTimeActive ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
              </div>
              
              {!isRealTimeActive ? (
                <Button 
                  onClick={startRealTimeSimulation}
                  className="w-full"
                  variant="default"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Start Real-Time Simulation
                </Button>
              ) : (
                <Button 
                  onClick={stopRealTimeSimulation}
                  className="w-full"
                  variant="destructive"
                >
                  <Square className="h-4 w-4 mr-2" />
                  Stop Real-Time Simulation
                </Button>
              )}
            </div>

            {/* Manual Data Generation */}
            <div className="space-y-2">
              <Button 
                onClick={createSampleData}
                className="w-full"
                variant="outline"
              >
                <Database className="h-4 w-4 mr-2" />
                Create Sample Products & Areas
              </Button>

              <Button 
                onClick={simulateDeliveries} 
                disabled={isSimulating}
                className="w-full"
                variant="outline"
              >
                <Play className="h-4 w-4 mr-2" />
                {isSimulating ? 'Simulating...' : 'Generate Delivery Data'}
              </Button>
            </div>
            
            <Button 
              onClick={clearAllData}
              variant="destructive"
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All Data
            </Button>
            
            <div className="text-xs text-gray-500 space-y-1">
              <p><strong>Test Data:</strong> Creates realistic users, areas, products and subscriptions</p>
              <p><strong>Real-Time:</strong> Continuously updates delivery statuses every 5-10 seconds</p>
              <p><strong>Manual:</strong> Create sample data and deliveries on demand</p>
              <p><strong>Clear:</strong> Reset all simulation data to start fresh</p>
            </div>
          </>
        )}
        
        {!simulationEnabled && (
          <p className="text-xs text-gray-500 text-center py-4">
            Toggle the switch above to access testing and simulation tools.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default DataControls;
