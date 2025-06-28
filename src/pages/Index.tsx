
import Layout from '@/components/Layout';
import DashboardCard from '@/components/DashboardCard';
import DeliveryTable from '@/components/DeliveryTable';
import DataControls from '@/components/DataControls';
import AdminManagement from '@/components/AdminManagement';
import CustomerDashboard from '@/components/CustomerDashboard';
import AgentDashboard from '@/components/AgentDashboard';
import ProductCatalog from '@/components/ProductCatalog';
import { Package, Users, MapPin, BarChart3, TrendingUp, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

const Index = () => {
  const { userRole } = useAuth();
  const queryClient = useQueryClient();

  // Fetch dashboard stats for admin/super_admin
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // Get today's deliveries
      const { data: todayDeliveries } = await supabase
        .from('deliveries')
        .select('*')
        .eq('delivery_date', today);

      // Get active subscriptions
      const { data: activeSubscriptions } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('status', 'active');

      // Get areas count
      const { data: areas } = await supabase
        .from('areas')
        .select('id');

      const deliveredToday = todayDeliveries?.filter(d => d.status === 'delivered').length || 0;
      const totalToday = todayDeliveries?.length || 0;
      const successRate = totalToday > 0 ? ((deliveredToday / totalToday) * 100).toFixed(1) : '0';

      return {
        totalDeliveries: totalToday,
        activeSubscriptions: activeSubscriptions?.length || 0,
        areasCount: areas?.length || 0,
        successRate: successRate + '%',
        completedDeliveries: deliveredToday,
        pendingDeliveries: totalToday - deliveredToday
      };
    },
    refetchInterval: 5000,
    enabled: userRole === 'admin' || userRole === 'super_admin'
  });

  // Set up realtime subscription for dashboard updates
  useEffect(() => {
    if (userRole !== 'admin' && userRole !== 'super_admin') return;

    const channel = supabase
      .channel('dashboard-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'deliveries'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, userRole]);

  // Render based on user role
  if (userRole === 'customer') {
    return (
      <Layout>
        <div className="space-y-6">
          <CustomerDashboard />
          <ProductCatalog />
        </div>
      </Layout>
    );
  }

  if (userRole === 'agent') {
    return (
      <Layout>
        <AgentDashboard />
      </Layout>
    );
  }

  // Admin/Super Admin Dashboard
  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {userRole === 'super_admin' ? 'Super Admin Dashboard' : 'Admin Dashboard'}
          </h1>
          <p className="text-gray-600">Monitor your milk delivery operations in real-time</p>
          <div className="mt-2 flex items-center gap-2 text-sm text-blue-600">
            <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
            Real-time updates enabled
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardCard
            title="Total Deliveries Today"
            value={stats?.totalDeliveries || 0}
            icon={<Package className="h-6 w-6" />}
            subtitle="Scheduled for today"
          />
          <DashboardCard
            title="Active Subscriptions"
            value={stats?.activeSubscriptions || 0}
            icon={<Users className="h-6 w-6" />}
            subtitle="Currently active"
          />
          <DashboardCard
            title="Coverage Areas"
            value={stats?.areasCount || 0}
            icon={<MapPin className="h-6 w-6" />}
            subtitle="Service locations"
          />
          <DashboardCard
            title="Success Rate"
            value={stats?.successRate || '0%'}
            icon={<BarChart3 className="h-6 w-6" />}
            subtitle="Today's performance"
          />
        </div>

        {/* Quick Stats and Admin Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Completed Today</h3>
                <p className="text-3xl font-bold">{stats?.completedDeliveries || 0}</p>
                <p className="text-blue-100 text-sm mt-1">Deliveries completed</p>
              </div>
              <TrendingUp className="h-12 w-12 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Pending</h3>
                <p className="text-3xl font-bold">{stats?.pendingDeliveries || 0}</p>
                <p className="text-green-100 text-sm mt-1">Still to deliver</p>
              </div>
              <Package className="h-12 w-12 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Active Areas</h3>
                <p className="text-3xl font-bold">{stats?.areasCount || 0}</p>
                <p className="text-amber-100 text-sm mt-1">Service locations</p>
              </div>
              <MapPin className="h-12 w-12 text-amber-200" />
            </div>
          </div>

          {/* Data Controls - Only show for admin/super_admin */}
          <DataControls />
        </div>

        {/* Admin Management Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Management</h2>
            <p className="text-gray-600">Manage agents, customers, and system data</p>
          </div>
          <AdminManagement />
        </div>

        {/* Product Catalog for Admins */}
        <ProductCatalog />

        {/* Delivery Management */}
        <DeliveryTable />
      </div>
    </Layout>
  );
};

export default Index;
