
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Clock, CheckCircle, XCircle, MapPin, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const AgentDashboard = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: todayDeliveries } = useQuery({
    queryKey: ['agent-deliveries', user?.id],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('deliveries')
        .select(`
          *,
          subscriptions (
            quantity,
            products (name, price),
            profiles (full_name, address, phone)
          )
        `)
        .eq('agent_id', user?.id)
        .eq('delivery_date', today)
        .order('status', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
    refetchInterval: 10000,
  });

  const { data: assignedAreas } = useQuery({
    queryKey: ['agent-areas', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agent_assignments')
        .select(`
          *,
          areas (name, district, pincode)
        `)
        .eq('agent_id', user?.id)
        .eq('is_active', true);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: assignedCustomers } = useQuery({
    queryKey: ['agent-customers', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          areas (name),
          subscriptions!inner (
            id,
            status,
            products (name)
          )
        `)
        .eq('assigned_agent_id', user?.id)
        .eq('subscriptions.status', 'active');
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const updateDeliveryStatus = async (deliveryId: string, status: 'delivered' | 'missed') => {
    try {
      const { error } = await supabase
        .from('deliveries')
        .update({
          status,
          delivered_at: status === 'delivered' ? new Date().toISOString() : null,
          notes: status === 'missed' ? 'Updated by agent' : 'Delivered successfully'
        })
        .eq('id', deliveryId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Delivery marked as ${status}`,
      });

      queryClient.invalidateQueries({ queryKey: ['agent-deliveries'] });
    } catch (error) {
      console.error('Update error:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update delivery status",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'missed': return 'bg-red-100 text-red-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const deliveryStats = todayDeliveries ? {
    total: todayDeliveries.length,
    delivered: todayDeliveries.filter(d => d.status === 'delivered').length,
    scheduled: todayDeliveries.filter(d => d.status === 'scheduled').length,
    missed: todayDeliveries.filter(d => d.status === 'missed').length,
  } : { total: 0, delivered: 0, scheduled: 0, missed: 0 };

  return (
    <div className="space-y-6">
      {/* Agent Welcome */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Good morning, {profile?.full_name || 'Agent'}!
              </h2>
              <p className="text-gray-600 mt-1">
                You have {deliveryStats.scheduled} deliveries scheduled for today
              </p>
            </div>
            <Package className="h-12 w-12 text-green-600" />
          </div>
        </CardContent>
      </Card>

      {/* Daily Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Today</p>
                <p className="text-2xl font-bold">{deliveryStats.total}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Delivered</p>
                <p className="text-2xl font-bold text-green-600">{deliveryStats.delivered}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-orange-600">{deliveryStats.scheduled}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Missed</p>
                <p className="text-2xl font-bold text-red-600">{deliveryStats.missed}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Deliveries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Today's Deliveries
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayDeliveries && todayDeliveries.length > 0 ? (
            <div className="space-y-4">
              {todayDeliveries.map((delivery) => (
                <div key={delivery.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getStatusColor(delivery.status)}>
                          {delivery.status}
                        </Badge>
                        <h3 className="font-medium">
                          {delivery.subscriptions?.profiles?.full_name || 'Unknown Customer'}
                        </h3>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {delivery.subscriptions?.profiles?.address || 'No address'}
                        </div>
                        <p>Product: {delivery.subscriptions?.products?.name} ({delivery.subscriptions?.quantity}L)</p>
                        <p>Phone: {delivery.subscriptions?.profiles?.phone || 'No phone'}</p>
                      </div>
                    </div>
                    {delivery.status === 'scheduled' && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => updateDeliveryStatus(delivery.id, 'delivered')}
                        >
                          Mark Delivered
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateDeliveryStatus(delivery.id, 'missed')}
                        >
                          Mark Missed
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No deliveries scheduled for today</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assigned Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Assigned Areas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {assignedAreas && assignedAreas.length > 0 ? (
              <div className="space-y-2">
                {assignedAreas.map((assignment) => (
                  <div key={assignment.id} className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium">{assignment.areas?.name}</p>
                    <p className="text-sm text-gray-500">
                      {assignment.areas?.district} - {assignment.areas?.pincode}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No areas assigned</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Assigned Customers ({assignedCustomers?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {assignedCustomers && assignedCustomers.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {assignedCustomers.map((customer) => (
                  <div key={customer.id} className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium">{customer.full_name}</p>
                    <p className="text-sm text-gray-500">{customer.phone}</p>
                    <p className="text-xs text-gray-400">
                      {customer.subscriptions[0]?.products?.name} subscription
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No customers assigned</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AgentDashboard;
