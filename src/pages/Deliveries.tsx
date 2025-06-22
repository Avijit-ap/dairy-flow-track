
import Layout from '@/components/Layout';
import DeliveryTable from '@/components/DeliveryTable';
import DashboardCard from '@/components/DashboardCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Clock, CheckCircle, XCircle } from 'lucide-react';

const Deliveries = () => {
  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Delivery Management</h1>
          <p className="text-gray-600">Track and manage all delivery operations</p>
        </div>

        {/* Delivery Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardCard
            title="Total Today"
            value="147"
            icon={<Package className="h-6 w-6" />}
            subtitle="Scheduled deliveries"
          />
          <DashboardCard
            title="Completed"
            value="138"
            icon={<CheckCircle className="h-6 w-6" />}
            change="94% success rate"
            changeType="positive"
          />
          <DashboardCard
            title="Pending"
            value="9"
            icon={<Clock className="h-6 w-6" />}
            subtitle="In progress"
          />
          <DashboardCard
            title="Missed"
            value="3"
            icon={<XCircle className="h-6 w-6" />}
            change="2% miss rate"
            changeType="neutral"
          />
        </div>

        {/* Delivery Routes Map Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Delivery Routes Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
              <div className="text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Interactive delivery route map</p>
                <p className="text-sm text-gray-500">Map integration would be implemented here</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Table */}
        <DeliveryTable />
      </div>
    </Layout>
  );
};

export default Deliveries;
