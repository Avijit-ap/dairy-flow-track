
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useDataSimulation } from '@/hooks/useDataSimulation';
import { Play, Trash2, Database, Settings } from 'lucide-react';

const DataControls = () => {
  const { simulateDeliveries, clearAllData, isSimulating } = useDataSimulation();
  const [simulationEnabled, setSimulationEnabled] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Data Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Simulation Toggle */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Settings className="h-4 w-4 text-gray-600" />
            <Label htmlFor="simulation-toggle" className="text-sm font-medium">
              Enable Simulation Tools
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
            <Button 
              onClick={simulateDeliveries} 
              disabled={isSimulating}
              className="w-full"
            >
              <Play className="h-4 w-4 mr-2" />
              {isSimulating ? 'Simulating...' : 'Simulate Delivery Data'}
            </Button>
            
            <Button 
              onClick={clearAllData}
              variant="destructive"
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All Data
            </Button>
            
            <p className="text-xs text-gray-500">
              Use simulate to create sample delivery records. Clear to reset all user data.
            </p>
          </>
        )}
        
        {!simulationEnabled && (
          <p className="text-xs text-gray-500 text-center py-4">
            Toggle the switch above to access simulation tools for testing.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default DataControls;
