
import { useState, useEffect } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { Home, BarChart3, Users, Package, MapPin, Bell, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, userRole, signOut, loading } = useAuth();
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

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home, roles: ['admin', 'distributor', 'agent', 'customer'] },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, roles: ['admin'] },
    { name: 'Areas & Agents', href: '/areas', icon: MapPin, roles: ['admin', 'distributor'] },
    { name: 'Deliveries', href: '/deliveries', icon: Package, roles: ['admin', 'agent'] },
    { name: 'Subscriptions', href: '/subscriptions', icon: Users, roles: ['admin', 'customer', 'distributor'] },
  ];

  const filteredNavigation = navigation.filter(item => 
    userRole && item.roles.includes(userRole)
  );

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
                <h1 className="text-xl font-bold text-gray-900">MilkTrack Pro</h1>
                <p className="text-sm text-gray-500">Delivery Management System</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              <div className="flex items-center space-x-2">
                <User className="h-6 w-6 text-gray-400" />
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {userRole || 'User'} - {user.email}
                </span>
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
              {filteredNavigation.map((item) => {
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
