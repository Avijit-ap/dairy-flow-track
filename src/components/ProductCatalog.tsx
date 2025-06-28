
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Package } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const ProductCatalog = () => {
  const { user, userRole } = useAuth();
  const { toast } = useToast();

  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const { data: inventory } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory')
        .select(`
          *,
          products (name)
        `);
      if (error) throw error;
      return data;
    },
    enabled: userRole === 'admin' || userRole === 'super_admin',
  });

  const createSubscription = async (productId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          product_id: productId,
          quantity: 1,
          status: 'active',
          delivery_days: ['monday', 'wednesday', 'friday']
        });

      if (error) throw error;

      toast({
        title: "Subscription Created",
        description: "Your milk subscription has been set up successfully!",
      });
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: "Subscription Failed",
        description: "Failed to create subscription. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Product Catalog</h2>
          <p className="text-gray-600">Choose from our fresh milk products</p>
        </div>
        <Package className="h-8 w-8 text-blue-600" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products?.map((product) => {
          const productInventory = inventory?.find(inv => inv.product_id === product.id);
          const stockLevel = productInventory?.stock_quantity || 0;
          const reservedQty = productInventory?.reserved_quantity || 0;
          const availableStock = stockLevel - reservedQty;

          return (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <Badge variant="secondary">{product.type}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-blue-600">
                    ₹{product.price}
                  </span>
                  <span className="text-sm text-gray-500">
                    per {product.unit}
                  </span>
                </div>

                {(userRole === 'admin' || userRole === 'super_admin') && (
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Stock:</span>
                      <span className={stockLevel > 50 ? 'text-green-600' : 'text-orange-600'}>
                        {stockLevel} units
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Reserved:</span>
                      <span>{reservedQty} units</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Available:</span>
                      <span className={availableStock > 0 ? 'text-green-600' : 'text-red-600'}>
                        {availableStock} units
                      </span>
                    </div>
                  </div>
                )}

                {userRole === 'customer' && (
                  <Button 
                    onClick={() => createSubscription(product.id)}
                    className="w-full"
                    disabled={availableStock <= 0}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {availableStock > 0 ? 'Subscribe Now' : 'Out of Stock'}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {products?.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No products available</p>
            <p className="text-sm text-gray-500">Check back later for new products</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProductCatalog;
