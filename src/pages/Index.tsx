
import Layout from '@/components/Layout';
import DashboardCard from '@/components/DashboardCard';
import DeliveryTable from '@/components/DeliveryTable';
import { Package, Users, MapPin, BarChart3, TrendingUp, AlertCircle } from 'lucide-react';

const Index = () => {
  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
          <p className="text-gray-600">Monitor your milk delivery operations in real-time</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardCard
            title="Total Deliveries Today"
            value="147"
            icon={<Package className="h-6 w-6" />}
            change="+12% from yesterday"
            changeType="positive"
          />
          <DashboardCard
            title="Active Subscriptions"
            value="1,284"
            icon={<Users className="h-6 w-6" />}
            change="+8 new this week"
            changeType="positive"
          />
          <DashboardCard
            title="Coverage Areas"
            value="24"
            icon={<MapPin className="h-6 w-6" />}
            subtitle="Across 6 districts"
          />
          <DashboardCard
            title="Success Rate"
            value="94.2%"
            icon={<BarChart3 className="h-6 w-6" />}
            change="+2.1% this month"
            changeType="positive"
          />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Today's Revenue</h3>
                <p className="text-3xl font-bold">₹24,680</p>
                <p className="text-blue-100 text-sm mt-1">+15% from yesterday</p>
              </div>
              <TrendingUp className="h-12 w-12 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Completed Deliveries</h3>
                <p className="text-3xl font-bold">138</p>
                <p className="text-green-100 text-sm mt-1">9 remaining</p>
              </div>
              <Package className="h-12 w-12 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Pending Issues</h3>
                <p className="text-3xl font-bold">3</p>
                <p className="text-amber-100 text-sm mt-1">Requires attention</p>
              </div>
              <AlertCircle className="h-12 w-12 text-amber-200" />
            </div>
          </div>
        </div>

        {/* Delivery Management */}
        <DeliveryTable />
      </div>
    </Layout>
  );
};

export default Index;
