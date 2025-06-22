
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const DeliveryTable = () => {
  const { userRole, user } = useAuth();

  const { data: deliveries, isLoading } = useQuery({
    queryKey: ['deliveries', userRole, user?.id],
    queryFn: async () => {
      let query = supabase
        .from('deliveries')
        .select(`
          *,
          subscriptions (
            quantity,
            products (name, price),
            profiles (full_name, address)
          )
        `)
        .order('delivery_date', { ascending: false })
        .limit(10);

      // Filter based on user role
      if (userRole === 'agent') {
        query = query.eq('agent_id', user?.id);
      } else if (userRole === 'customer') {
        query = query.eq('subscriptions.user_id', user?.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user && !!userRole
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'missed': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'scheduled': return <Clock className="h-4 w-4 text-blue-600" />;
      default: return <Package className="h-4 w-4 text-gray-600" />;
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

  const updateDeliveryStatus = async (deliveryId: string, status: string) => {
    const { error } = await supabase
      .from('deliveries')
      .update({ 
        status, 
        delivered_at: status === 'delivered' ? new Date().toISOString() : null 
      })
      .eq('id', deliveryId);

    if (!error) {
      // Refetch data
      window.location.reload();
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Deliveries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Recent Deliveries
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!deliveries || deliveries.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No deliveries found</p>
            <p className="text-sm text-gray-500">Use the simulate button to create sample data</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Date</th>
                  <th className="text-left p-3">Customer</th>
                  <th className="text-left p-3">Product</th>
                  <th className="text-left p-3">Quantity</th>
                  <th className="text-left p-3">Status</th>
                  {userRole === 'agent' && <th className="text-left p-3">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {deliveries.map((delivery: any) => (
                  <tr key={delivery.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      {new Date(delivery.delivery_date).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      <div>
                        <p className="font-medium">
                          {delivery.subscriptions?.profiles?.full_name || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {delivery.subscriptions?.profiles?.address || 'No address'}
                        </p>
                      </div>
                    </td>
                    <td className="p-3">
                      <div>
                        <p className="font-medium">
                          {delivery.subscriptions?.products?.name || 'Unknown Product'}
                        </p>
                        <p className="text-sm text-gray-500">
                          ₹{delivery.subscriptions?.products?.price || 0}
                        </p>
                      </div>
                    </td>
                    <td className="p-3">
                      {delivery.subscriptions?.quantity || 1} L
                    </td>
                    <td className="p-3">
                      <Badge className={getStatusColor(delivery.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(delivery.status)}
                          {delivery.status}
                        </div>
                      </Badge>
                    </td>
                    {userRole === 'agent' && (
                      <td className="p-3">
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
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DeliveryTable;
