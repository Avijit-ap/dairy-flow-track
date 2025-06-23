
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useDataSimulation = () => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [isRealTimeActive, setIsRealTimeActive] = useState(false);
  const { toast } = useToast();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const simulateDeliveries = async () => {
    setIsSimulating(true);
    try {
      // Get all active subscriptions
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('status', 'active');

      // Get agents for random assignment
      const { data: agents } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'agent');

      if (subscriptions && subscriptions.length > 0) {
        const deliveries = [];
        const today = new Date();
        
        for (let i = 0; i < 5; i++) {
          const deliveryDate = new Date(today);
          deliveryDate.setDate(today.getDate() + i);
          
          for (const subscription of subscriptions.slice(0, 10)) { // Limit to 10 subscriptions
            const statuses = ['scheduled', 'delivered', 'missed'];
            const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
            const randomAgent = agents && agents.length > 0 ? 
              agents[Math.floor(Math.random() * agents.length)] : null;
            
            deliveries.push({
              subscription_id: subscription.id,
              agent_id: randomAgent?.user_id || null,
              delivery_date: deliveryDate.toISOString().split('T')[0],
              status: randomStatus,
              delivered_at: randomStatus === 'delivered' ? new Date().toISOString() : null,
              notes: randomStatus === 'missed' ? 'Customer not available' : null
            });
          }
        }

        const { error } = await supabase
          .from('deliveries')
          .insert(deliveries);

        if (error) throw error;

        toast({
          title: "Simulation Complete",
          description: `Created ${deliveries.length} delivery records`,
        });
      }
    } catch (error) {
      console.error('Simulation error:', error);
      toast({
        title: "Simulation Error",
        description: "Failed to create sample deliveries",
        variant: "destructive"
      });
    } finally {
      setIsSimulating(false);
    }
  };

  const createSampleData = async () => {
    try {
      // Create sample products
      const products = [
        { name: 'Whole Milk', type: 'dairy', price: 60, unit: 'liter' },
        { name: 'Skimmed Milk', type: 'dairy', price: 55, unit: 'liter' },
        { name: 'Organic Milk', type: 'dairy', price: 80, unit: 'liter' },
      ];

      const { data: createdProducts, error: productError } = await supabase
        .from('products')
        .upsert(products, { onConflict: 'name' })
        .select();

      if (productError) throw productError;

      // Create sample areas
      const areas = [
        { name: 'Sector 15', district: 'Chandigarh', pincode: '160015' },
        { name: 'Sector 22', district: 'Chandigarh', pincode: '160022' },
        { name: 'Sector 35', district: 'Chandigarh', pincode: '160035' },
      ];

      await supabase.from('areas').upsert(areas, { onConflict: 'name' });

      toast({
        title: "Sample Data Created",
        description: "Products and areas have been set up",
      });

      return createdProducts;
    } catch (error) {
      console.error('Sample data error:', error);
      toast({
        title: "Sample Data Error",
        description: "Failed to create sample data",
        variant: "destructive"
      });
      return null;
    }
  };

  const simulateRealTimeDelivery = async () => {
    try {
      // Get random scheduled delivery
      const { data: scheduledDeliveries } = await supabase
        .from('deliveries')
        .select('*')
        .eq('status', 'scheduled')
        .limit(1);

      if (scheduledDeliveries && scheduledDeliveries.length > 0) {
        const delivery = scheduledDeliveries[0];
        const newStatus = Math.random() > 0.8 ? 'missed' : 'delivered';
        
        await supabase
          .from('deliveries')
          .update({ 
            status: newStatus,
            delivered_at: newStatus === 'delivered' ? new Date().toISOString() : null,
            notes: newStatus === 'missed' ? 'Customer not available' : null
          })
          .eq('id', delivery.id);

        console.log(`Delivery ${delivery.id} updated to ${newStatus}`);
      } else {
        // Create a new delivery if none exist
        const { data: subscriptions } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('status', 'active')
          .limit(1);

        const { data: agents } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'agent')
          .limit(1);

        if (subscriptions && subscriptions.length > 0) {
          const today = new Date().toISOString().split('T')[0];
          await supabase
            .from('deliveries')
            .insert({
              subscription_id: subscriptions[0].id,
              agent_id: agents?.[0]?.user_id || null,
              delivery_date: today,
              status: 'scheduled'
            });
        }
      }
    } catch (error) {
      console.error('Real-time simulation error:', error);
    }
  };

  const startRealTimeSimulation = async () => {
    // First ensure we have sample data
    await createSampleData();
    await simulateDeliveries();
    
    setIsRealTimeActive(true);
    toast({
      title: "Real-Time Simulation Started",
      description: "Delivery status updates will occur every 5-10 seconds",
    });

    // Start interval for real-time updates
    intervalRef.current = setInterval(() => {
      simulateRealTimeDelivery();
    }, Math.random() * 5000 + 5000); // Random interval between 5-10 seconds
  };

  const stopRealTimeSimulation = () => {
    setIsRealTimeActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    toast({
      title: "Real-Time Simulation Stopped",
      description: "No more automatic updates will occur",
    });
  };

  const clearAllData = async () => {
    try {
      // Stop real-time simulation first
      if (isRealTimeActive) {
        stopRealTimeSimulation();
      }

      // Clear deliveries first (due to foreign key constraints)
      await supabase.from('deliveries').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      // Clear subscriptions
      await supabase.from('subscriptions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      // Clear agent assignments
      await supabase.from('agent_assignments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      // Clear inventory
      await supabase.from('inventory').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      toast({
        title: "Data Cleared",
        description: "All user data has been cleared successfully",
      });
    } catch (error) {
      console.error('Clear data error:', error);
      toast({
        title: "Clear Data Error",
        description: "Failed to clear data",
        variant: "destructive"
      });
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    simulateDeliveries,
    clearAllData,
    isSimulating,
    isRealTimeActive,
    startRealTimeSimulation,
    stopRealTimeSimulation,
    createSampleData
  };
};
