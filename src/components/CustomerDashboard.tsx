
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Clock, CheckCircle, MapPin, Phone } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const CustomerDashboard = () => {
  const { user, profile } = useAuth();

  const { data: subscriptions } = useQuery({
    queryKey: ['customer-subscriptions', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          products (name, price, unit)
        `)
        .eq('user_id', user?.id)
        .eq('status', 'active');
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: recentDeliveries } = useQuery({
    queryKey: ['customer-deliveries', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deliveries')
        .select(`
          *,
          subscriptions!inner (
            user_id,
            products (name)
          )
        `)
        .eq('subscriptions.user_id', user?.id)
        .order('delivery_date', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'missed': return 'bg-red-100 text-red-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'missed': return <Package className="h-4 w-4" />;
      case 'scheduled': return <Clock className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Welcome, {profile?.full_name || 'Customer'}!
              </h2>
              <p className="text-gray-600 mt-1">
                Track your milk deliveries and manage subscriptions
              </p>
              {profile?.address && (
                <div className="flex items-center mt-2 text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-1" />
                  {profile.address}
                </div>
              )}
            </div>
            <Package className="h-12 w-12 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      {/* Active Subscriptions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Active Subscriptions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {subscriptions && subscriptions.length > 0 ? (
            <div className="space-y-4">
              {subscriptions.map((subscription) => (
                <div key={subscription.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{subscription.products?.name}</h3>
                    <p className="text-sm text-gray-500">
                      {subscription.quantity} {subscription.products?.unit} • 
                      ₹{subscription.products?.price} per {subscription.products?.unit}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Delivery days: {subscription.delivery_days?.join(', ')}
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    {subscription.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No active subscriptions</p>
              <p className="text-sm text-gray-500">Visit our product catalog to start ordering</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Deliveries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Deliveries
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentDeliveries && recentDeliveries.length > 0 ? (
            <div className="space-y-3">
              {recentDeliveries.map((delivery) => (
                <div key={delivery.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(delivery.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(delivery.status)}
                        {delivery.status}
                      </div>
                    </Badge>
                    <div>
                      <p className="font-medium">{delivery.subscriptions?.products?.name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(delivery.delivery_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {delivery.delivered_at && (
                    <p className="text-xs text-gray-400">
                      Delivered at {new Date(delivery.delivered_at).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No deliveries yet</p>
              <p className="text-sm text-gray-500">Your delivery history will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Agent Contact Info */}
      {profile?.assigned_agent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Your Delivery Agent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{profile.assigned_agent.full_name}</p>
                <p className="text-sm text-gray-500">{profile.assigned_agent.phone}</p>
              </div>
              <Button variant="outline" size="sm">
                Contact Agent
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CustomerDashboard;
