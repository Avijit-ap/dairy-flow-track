
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X, Clock, MapPin } from 'lucide-react';

interface Delivery {
  id: string;
  customerName: string;
  address: string;
  product: string;
  quantity: number;
  status: 'pending' | 'delivered' | 'missed' | 'skipped';
  scheduledTime: string;
  area: string;
}

const mockDeliveries: Delivery[] = [
  {
    id: '1',
    customerName: 'Rajesh Kumar',
    address: '123 MG Road, Sector 15',
    product: 'Fresh Milk',
    quantity: 2,
    status: 'pending',
    scheduledTime: '07:00 AM',
    area: 'Sector 15'
  },
  {
    id: '2',
    customerName: 'Priya Sharma',
    address: '456 Park Street, Sector 12',
    product: 'Full Cream Milk',
    quantity: 1,
    status: 'delivered',
    scheduledTime: '07:30 AM',
    area: 'Sector 12'
  },
  {
    id: '3',
    customerName: 'Amit Patel',
    address: '789 Lake View, Sector 18',
    product: 'Toned Milk',
    quantity: 3,
    status: 'missed',
    scheduledTime: '08:00 AM',
    area: 'Sector 18'
  }
];

const DeliveryTable = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>(mockDeliveries);

  const updateDeliveryStatus = (id: string, newStatus: Delivery['status']) => {
    setDeliveries(prev => 
      prev.map(delivery => 
        delivery.id === id ? { ...delivery, status: newStatus } : delivery
      )
    );
  };

  const getStatusBadge = (status: Delivery['status']) => {
    const statusConfig = {
      pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
      delivered: { label: 'Delivered', className: 'bg-green-100 text-green-800' },
      missed: { label: 'Missed', className: 'bg-red-100 text-red-800' },
      skipped: { label: 'Skipped', className: 'bg-gray-100 text-gray-800' }
    };

    const config = statusConfig[status];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="h-5 w-5 mr-2 text-blue-600" />
          Today's Deliveries
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {deliveries.map((delivery) => (
            <div key={delivery.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{delivery.customerName}</h3>
                  {getStatusBadge(delivery.status)}
                </div>
                <p className="text-sm text-gray-600 mb-1">{delivery.address}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  {delivery.scheduledTime} • {delivery.product} ({delivery.quantity}L)
                </div>
              </div>
              
              {delivery.status === 'pending' && (
                <div className="flex space-x-2 ml-4">
                  <Button
                    size="sm"
                    onClick={() => updateDeliveryStatus(delivery.id, 'delivered')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Delivered
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateDeliveryStatus(delivery.id, 'missed')}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Missed
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DeliveryTable;
