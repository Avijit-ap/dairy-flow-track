
import { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Package, Calendar, Plus, Edit, Pause, Play } from 'lucide-react';

interface Subscription {
  id: string;
  customerName: string;
  email: string;
  product: string;
  quantity: number;
  frequency: string;
  status: 'active' | 'paused' | 'cancelled';
  startDate: string;
  nextDelivery: string;
  totalValue: number;
}

const mockSubscriptions: Subscription[] = [
  {
    id: '1',
    customerName: 'Rajesh Kumar',
    email: 'rajesh@email.com',
    product: 'Fresh Milk',
    quantity: 2,
    frequency: 'Daily',
    status: 'active',
    startDate: '2024-01-15',
    nextDelivery: '2024-06-23',
    totalValue: 1800
  },
  {
    id: '2',
    customerName: 'Priya Sharma',
    email: 'priya@email.com',
    product: 'Full Cream Milk',
    quantity: 1,
    frequency: 'Daily',
    status: 'active',
    startDate: '2024-02-01',
    nextDelivery: '2024-06-23',
    totalValue: 900
  },
  {
    id: '3',
    customerName: 'Amit Patel',
    email: 'amit@email.com',
    product: 'Toned Milk',
    quantity: 3,
    frequency: 'Alternate Days',
    status: 'paused',
    startDate: '2024-01-20',
    nextDelivery: '2024-06-25',
    totalValue: 1350
  }
];

const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(mockSubscriptions);

  const toggleSubscriptionStatus = (id: string) => {
    setSubscriptions(prev =>
      prev.map(sub =>
        sub.id === id
          ? { ...sub, status: sub.status === 'active' ? 'paused' : 'active' }
          : sub
      )
    );
  };

  const getStatusBadge = (status: Subscription['status']) => {
    const statusConfig = {
      active: { label: 'Active', className: 'bg-green-100 text-green-800' },
      paused: { label: 'Paused', className: 'bg-yellow-100 text-yellow-800' },
      cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-800' }
    };

    const config = statusConfig[status];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center bg-white rounded-lg shadow-sm p-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Subscription Management</h1>
            <p className="text-gray-600">Manage customer subscriptions and delivery schedules</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            New Subscription
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="flex items-center p-6">
              <Users className="h-12 w-12 text-blue-600 mr-4" />
              <div>
                <div className="text-2xl font-bold text-gray-900">1,284</div>
                <div className="text-sm text-gray-600">Total Subscribers</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center p-6">
              <Package className="h-12 w-12 text-green-600 mr-4" />
              <div>
                <div className="text-2xl font-bold text-gray-900">1,156</div>
                <div className="text-sm text-gray-600">Active Subscriptions</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center p-6">
              <Calendar className="h-12 w-12 text-purple-600 mr-4" />
              <div>
                <div className="text-2xl font-bold text-gray-900">₹2,84,560</div>
                <div className="text-sm text-gray-600">Monthly Revenue</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subscriptions List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subscriptions.map((subscription) => (
                <div key={subscription.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold text-gray-900">{subscription.customerName}</h3>
                        {getStatusBadge(subscription.status)}
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">₹{subscription.totalValue}/month</div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{subscription.email}</p>
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <span>{subscription.product} • {subscription.quantity}L</span>
                      <span>{subscription.frequency}</span>
                      <span>Next: {subscription.nextDelivery}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleSubscriptionStatus(subscription.id)}
                    >
                      {subscription.status === 'active' ? (
                        <>
                          <Pause className="h-4 w-4 mr-1" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-1" />
                          Resume
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Subscription Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Popular Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Fresh Milk</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                    <span className="text-sm text-gray-600">65%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Toned Milk</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '25%' }}></div>
                    </div>
                    <span className="text-sm text-gray-600">25%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Full Cream Milk</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '10%' }}></div>
                    </div>
                    <span className="text-sm text-gray-600">10%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subscription Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">New subscriptions this month</span>
                  <span className="font-semibold text-green-600">+84</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Cancelled subscriptions</span>
                  <span className="font-semibold text-red-600">-12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Paused subscriptions</span>
                  <span className="font-semibold text-yellow-600">38</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average subscription value</span>
                  <span className="font-semibold text-gray-900">₹1,247/month</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Subscriptions;
