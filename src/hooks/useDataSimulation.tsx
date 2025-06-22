
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useDataSimulation = () => {
  const [isSimulating, setIsSimulating] = useState(false);
  const { toast } = useToast();

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

  const clearAllData = async () => {
    try {
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

  return {
    simulateDeliveries,
    clearAllData,
    isSimulating
  };
};
