
import { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, Plus, Edit } from 'lucide-react';

interface Area {
  id: string;
  name: string;
  pincode: string;
  assignedAgent: string;
  totalCustomers: number;
  activeDeliveries: number;
  status: 'active' | 'inactive';
}

const mockAreas: Area[] = [
  {
    id: '1',
    name: 'Sector 15',
    pincode: '110015',
    assignedAgent: 'Rajesh Kumar',
    totalCustomers: 45,
    activeDeliveries: 38,
    status: 'active'
  },
  {
    id: '2',
    name: 'Sector 12',
    pincode: '110012',
    assignedAgent: 'Priya Sharma',
    totalCustomers: 32,
    activeDeliveries: 28,
    status: 'active'
  },
  {
    id: '3',
    name: 'Sector 18',
    pincode: '110018',
    assignedAgent: 'Amit Patel',
    totalCustomers: 28,
    activeDeliveries: 22,
    status: 'active'
  },
  {
    id: '4',
    name: 'Sector 21',
    pincode: '110021',
    assignedAgent: 'Unassigned',
    totalCustomers: 15,
    activeDeliveries: 0,
    status: 'inactive'
  }
];

const Areas = () => {
  const [areas, setAreas] = useState<Area[]>(mockAreas);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center bg-white rounded-lg shadow-sm p-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Areas & Agent Management</h1>
            <p className="text-gray-600">Manage delivery areas and assign agents</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add New Area
          </Button>
        </div>

        {/* Areas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {areas.map((area) => (
            <Card key={area.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-blue-600 mr-2" />
                    <CardTitle className="text-lg">{area.name}</CardTitle>
                  </div>
                  <Badge className={area.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {area.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500">PIN: {area.pincode}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{area.totalCustomers}</div>
                    <div className="text-xs text-gray-600">Total Customers</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{area.activeDeliveries}</div>
                    <div className="text-xs text-gray-600">Active Deliveries</div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">Assigned Agent:</span>
                    <Button variant="outline" size="sm">
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 text-gray-400 mr-2" />
                    <span className={`text-sm ${area.assignedAgent === 'Unassigned' ? 'text-red-500' : 'text-gray-900'}`}>
                      {area.assignedAgent}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    View Details
                  </Button>
                  <Button 
                    size="sm" 
                    className={`flex-1 ${area.status === 'active' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                  >
                    {area.status === 'active' ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Agent Assignment Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Agent Performance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {areas.filter(area => area.assignedAgent !== 'Unassigned').map((area) => (
                <div key={area.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{area.assignedAgent}</h3>
                      <p className="text-sm text-gray-600">{area.name} • {area.totalCustomers} customers</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      {area.activeDeliveries}/{area.totalCustomers}
                    </div>
                    <div className="text-sm text-gray-500">
                      {((area.activeDeliveries / area.totalCustomers) * 100).toFixed(0)}% active
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Areas;
