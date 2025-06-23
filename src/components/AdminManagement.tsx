
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { UserPlus, Users, Mail } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const AdminManagement = () => {
  const { inviteAgent } = useAuth();
  const [agentEmail, setAgentEmail] = useState('');
  const [agentName, setAgentName] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  // Fetch all users with roles
  const { data: users, refetch } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          role,
          profiles!inner(full_name, phone, assigned_agent_id)
        `);
      return data || [];
    }
  });

  const handleInviteAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInviting(true);
    
    const { error } = await inviteAgent(agentEmail, agentName);
    
    if (!error) {
      setAgentEmail('');
      setAgentName('');
      refetch();
    }
    
    setIsInviting(false);
  };

  const agentUsers = users?.filter(u => u.role === 'agent') || [];
  const customerUsers = users?.filter(u => u.role === 'customer') || [];

  return (
    <div className="space-y-6">
      {/* Invite New Agent */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Invite New Agent
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInviteAgent} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="agentName">Agent Name</Label>
                <Input
                  id="agentName"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="agentEmail">Agent Email</Label>
                <Input
                  id="agentEmail"
                  type="email"
                  value={agentEmail}
                  onChange={(e) => setAgentEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button type="submit" disabled={isInviting}>
              <Mail className="h-4 w-4 mr-2" />
              {isInviting ? 'Sending Invitation...' : 'Send Magic Link'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* User Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Delivery Agents ({agentUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {agentUsers.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No agents registered yet</p>
              ) : (
                agentUsers.map((agent) => (
                  <div key={agent.user_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{agent.profiles?.full_name || 'Unknown'}</p>
                      <p className="text-sm text-gray-600">{agent.profiles?.phone || 'No phone'}</p>
                    </div>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      Agent
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Customers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Customers ({customerUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {customerUsers.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No customers registered yet</p>
              ) : (
                customerUsers.map((customer) => (
                  <div key={customer.user_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{customer.profiles?.full_name || 'Unknown'}</p>
                      <p className="text-xs text-gray-600">
                        Agent: {customer.profiles?.assigned_agent_id ? 'Assigned' : 'None'}
                      </p>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      Customer
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminManagement;
