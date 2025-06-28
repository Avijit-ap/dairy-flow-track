
import { useState, useEffect } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { Home, BarChart3, Users, Package, MapPin, Bell, User, LogOut, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, userRole, profile, signOut, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const getNavigation = () => {
    const baseNav = [
      { name: 'Dashboard', href: '/', icon: Home, roles: ['admin', 'super_admin', 'agent', 'customer'] }
    ];

    const roleSpecificNav = {
      super_admin: [
        { name: 'Analytics', href: '/analytics', icon: BarChart3 },
        { name: 'Areas & Agents', href: '/areas', icon: MapPin },
        { name: 'Deliveries', href: '/deliveries', icon: Package },
        { name: 'Subscriptions', href: '/subscriptions', icon: Users },
      ],
      admin: [
        { name: 'Analytics', href: '/analytics', icon: BarChart3 },
        { name: 'Areas & Agents', href: '/areas', icon: MapPin },
        { name: 'Deliveries', href: '/deliveries', icon: Package },
        { name: 'Subscriptions', href: '/subscriptions', icon: Users },
      ],
      agent: [
        { name: 'My Deliveries', href: '/deliveries', icon: Package },
        { name: 'My Customers', href: '/subscriptions', icon: Users },
      ],
      customer: [
        { name: 'My Orders', href: '/subscriptions', icon: ShoppingCart },
      ]
    };

    return [...baseNav, ...(roleSpecificNav[userRole as keyof typeof roleSpecificNav] || [])];
  };

  const navigation = getNavigation();

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-blue-100 text-blue-800';
      case 'agent': return 'bg-green-100 text-green-800';
      case 'customer': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Package className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">MilkTrackr</h1>
                <p className="text-sm text-gray-500">Government Milk Delivery System</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              <div className="flex items-center space-x-2">
                <User className="h-6 w-6 text-gray-400" />
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">
                      {profile?.full_name || user.email}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(userRole || '')}`}>
                      {userRole?.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={signOut}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="bg-white shadow-sm w-64 min-h-screen">
          <div className="p-6">
            <div className="space-y-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
