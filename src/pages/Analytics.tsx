
import Layout from '@/components/Layout';
import AnalyticsChart from '@/components/AnalyticsChart';
import DashboardCard from '@/components/DashboardCard';
import { TrendingUp, TrendingDown, Activity, Target } from 'lucide-react';

const Analytics = () => {
  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Analytics & Insights</h1>
          <p className="text-gray-600">Comprehensive analysis of delivery performance and trends</p>
        </div>

        {/* Analytics Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardCard
            title="Weekly Growth"
            value="+18.2%"
            icon={<TrendingUp className="h-6 w-6" />}
            change="vs last week"
            changeType="positive"
          />
          <DashboardCard
            title="Customer Retention"
            value="92.4%"
            icon={<Target className="h-6 w-6" />}
            change="+3.2% this month"
            changeType="positive"
          />
          <DashboardCard
            title="Avg Delivery Time"
            value="28 min"
            icon={<Activity className="h-6 w-6" />}
            change="-5 min improved"
            changeType="positive"
          />
          <DashboardCard
            title="Missed Deliveries"
            value="5.8%"
            icon={<TrendingDown className="h-6 w-6" />}
            change="-1.2% reduced"
            changeType="positive"
          />
        </div>

        {/* Charts */}
        <AnalyticsChart />

        {/* Insights Panel */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <h3 className="font-medium text-gray-900">Peak Performance</h3>
                  <p className="text-sm text-gray-600">Friday shows the highest delivery success rate at 96.6%</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <h3 className="font-medium text-gray-900">Growing Market</h3>
                  <p className="text-sm text-gray-600">Sector 15 shows 23% increase in new subscriptions</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                <div>
                  <h3 className="font-medium text-gray-900">Attention Needed</h3>
                  <p className="text-sm text-gray-600">Tuesday shows higher missed delivery rates - optimize routes</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div>
                  <h3 className="font-medium text-gray-900">Opportunity</h3>
                  <p className="text-sm text-gray-600">Weekend delivery demand increasing by 15%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Analytics;
