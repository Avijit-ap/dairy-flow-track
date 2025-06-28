
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useDummyData = () => {
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const createDummyData = async () => {
    setIsCreating(true);
    try {
      // Create areas first
      const areas = [
        { name: 'Sector 17', district: 'Chandigarh', pincode: '160017' },
        { name: 'Sector 22', district: 'Chandigarh', pincode: '160022' },
        { name: 'Sector 35', district: 'Chandigarh', pincode: '160035' },
        { name: 'Model Town', district: 'Ludhiana', pincode: '141002' },
        { name: 'Civil Lines', district: 'Ludhiana', pincode: '141001' },
      ];

      const { data: createdAreas } = await supabase
        .from('areas')
        .upsert(areas, { onConflict: 'name' })
        .select();

      // Create products
      const products = [
        { name: 'Fresh Whole Milk', type: 'dairy', price: 65, unit: 'liter' },
        { name: 'Toned Milk', type: 'dairy', price: 55, unit: 'liter' },
        { name: 'Double Toned Milk', type: 'dairy', price: 50, unit: 'liter' },
        { name: 'Organic Milk', type: 'dairy', price: 85, unit: 'liter' },
        { name: 'Buffalo Milk', type: 'dairy', price: 75, unit: 'liter' },
      ];

      const { data: createdProducts } = await supabase
        .from('products')
        .upsert(products, { onConflict: 'name' })
        .select();

      // Create some test user profiles (simulating real users)
      const testProfiles = [
        {
          id: crypto.randomUUID(),
          full_name: 'Test Agent',
          phone: '+91-9876543210',
          address: 'Agent Quarter, Sector 22',
          area_id: createdAreas?.[1]?.id
        },
        {
          id: crypto.randomUUID(),
          full_name: 'Test Customer 1',
          phone: '+91-9876543211',
          address: 'House 123, Sector 17',
          area_id: createdAreas?.[0]?.id
        },
        {
          id: crypto.randomUUID(),
          full_name: 'Test Customer 2',
          phone: '+91-9876543212',
          address: 'House 456, Sector 22',
          area_id: createdAreas?.[1]?.id
        }
      ];

      // Insert test profiles
      await supabase.from('profiles').upsert(testProfiles, { onConflict: 'id' });

      // Create user roles for test profiles
      const testRoles = [
        { user_id: testProfiles[0].id, role: 'agent' },
        { user_id: testProfiles[1].id, role: 'customer' },
        { user_id: testProfiles[2].id, role: 'customer' }
      ];

      await supabase.from('user_roles').upsert(testRoles, { onConflict: 'user_id' });

      // Create subscriptions for test customers
      if (createdProducts && createdProducts.length > 0) {
        const subscriptions = [
          {
            user_id: testProfiles[1].id,
            product_id: createdProducts[0].id,
            quantity: 2,
            status: 'active',
            delivery_days: ['monday', 'wednesday', 'friday']
          },
          {
            user_id: testProfiles[2].id,
            product_id: createdProducts[1].id,
            quantity: 1,
            status: 'active',
            delivery_days: ['tuesday', 'thursday', 'saturday']
          }
        ];

        const { data: createdSubscriptions } = await supabase
          .from('subscriptions')
          .insert(subscriptions)
          .select();

        // Create some sample deliveries
        if (createdSubscriptions && createdSubscriptions.length > 0) {
          const today = new Date().toISOString().split('T')[0];
          const deliveries = [
            {
              subscription_id: createdSubscriptions[0].id,
              agent_id: testProfiles[0].id,
              delivery_date: today,
              status: 'scheduled'
            },
            {
              subscription_id: createdSubscriptions[1].id,
              agent_id: testProfiles[0].id,
              delivery_date: today,
              status: 'delivered',
              delivered_at: new Date().toISOString(),
              notes: 'Delivered successfully'
            }
          ];

          await supabase.from('deliveries').insert(deliveries);
        }
      }

      toast({
        title: "Dummy Data Created",
        description: "Sample data has been successfully created for testing",
      });

    } catch (error) {
      console.error('Error creating dummy data:', error);
      toast({
        title: "Error",
        description: "Failed to create dummy data",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createDummyData,
    isCreating
  };
};
