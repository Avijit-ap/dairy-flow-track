
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDataSimulation } from '@/hooks/useDataSimulation';
import { Play, Trash2, Database } from 'lucide-react';

const DataControls = () => {
  const { simulateDeliveries, clearAllData, isSimulating } = useDataSimulation();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Data Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
      </CardContent>
    </Card>
  );
};

export default DataControls;
