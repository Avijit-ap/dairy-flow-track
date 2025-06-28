import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

type UserRole = 'customer' | 'agent';

const Auth = () => {
  const { user, signIn, signUp, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');
  const [selectedAgent, setSelectedAgent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch available agents for customer signup
  const { data: agents } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'agent');
      
      if (!userRoles) return [];

      // Fetch profiles for each agent
      const agentsWithProfiles = await Promise.all(
        userRoles.map(async (userRole) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', userRole.user_id)
            .single();
          
          return {
            user_id: userRole.user_id,
            profile
          };
        })
      );

      return agentsWithProfiles;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn(email, password);
    } catch (error) {
      console.error('Sign in error:', error);
    }
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await signUp(email, password, {
        full_name: fullName,
        role: selectedRole,
        assignedAgent: selectedRole === 'customer' ? selectedAgent : undefined
      });
      
      if (error) {
        console.error('Sign up error:', error);
      }
    } catch (error) {
      console.error('Sign up error:', error);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl w-full">
        {/* App Description */}
        <Card className="lg:order-1">
          <CardHeader>
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <Package className="h-8 w-8 text-white" />
              </div>
              <div className="ml-3">
                <CardTitle className="text-2xl">MilkTrackr</CardTitle>
                <p className="text-gray-600">Government Milk Delivery System</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Welcome to MilkTrackr</h3>
              <p className="text-gray-600">
                Your comprehensive milk delivery management solution designed to streamline operations 
                from subscription management to delivery tracking.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium">For Customers</h4>
                  <p className="text-sm text-gray-600">Manage your milk subscriptions, track deliveries, and communicate with your assigned delivery agent.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium">For Delivery Agents</h4>
                  <p className="text-sm text-gray-600">View assigned deliveries, update delivery status, and manage your daily routes efficiently.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium">For Administrators</h4>
                  <p className="text-sm text-gray-600">Complete oversight with analytics, user management, area assignments, and operational insights.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Getting Started:</strong> Sign up as a customer to manage your milk deliveries, 
                or contact an administrator for agent access.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Authentication Form */}
        <Card className="lg:order-2">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Get Started</CardTitle>
            <p className="text-gray-600">Sign in to your account or create a new one</p>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Account Type</Label>
                    <Select value={selectedRole} onValueChange={(value: UserRole) => setSelectedRole(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="customer">Customer</SelectItem>
                        <SelectItem value="agent">Delivery Agent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {selectedRole === 'customer' && agents && agents.length > 0 && (
                    <div className="space-y-2">
                      <Label htmlFor="agent">Choose Your Delivery Agent</Label>
                      <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an agent" />
                        </SelectTrigger>
                        <SelectContent>
                          {agents.map((agent) => (
                            <SelectItem key={agent.user_id} value={agent.user_id}>
                              {agent.profile?.full_name || 'Unknown Agent'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Creating Account...' : 'Sign Up'}
                  </Button>
                  
                  {selectedRole === 'agent' && (
                    <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded">
                      Agent accounts require approval. You'll receive an email once your account is activated.
                    </p>
                  )}
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
