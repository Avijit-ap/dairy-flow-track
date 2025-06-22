
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const deliveryData = [
  { name: 'Mon', delivered: 120, missed: 8, total: 128 },
  { name: 'Tue', delivered: 115, missed: 12, total: 127 },
  { name: 'Wed', delivered: 132, missed: 6, total: 138 },
  { name: 'Thu', delivered: 128, missed: 9, total: 137 },
  { name: 'Fri', delivered: 142, missed: 5, total: 147 },
  { name: 'Sat', delivered: 138, missed: 7, total: 145 },
  { name: 'Sun', delivered: 125, missed: 10, total: 135 },
];

const areaData = [
  { name: 'Sector 15', value: 35, color: '#3B82F6' },
  { name: 'Sector 12', value: 28, color: '#10B981' },
  { name: 'Sector 18', value: 22, color: '#F59E0B' },
  { name: 'Sector 21', value: 15, color: '#EF4444' },
];

const AnalyticsChart = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Weekly Delivery Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Delivery Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={deliveryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="delivered" stackId="a" fill="#10B981" name="Delivered" />
              <Bar dataKey="missed" stackId="a" fill="#EF4444" name="Missed" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Delivery Success Rate Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Success Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={deliveryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value, name) => [`${((Number(value) / 140) * 100).toFixed(1)}%`, 'Success Rate']} />
              <Line 
                type="monotone" 
                dataKey="delivered" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Area Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Deliveries by Area</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={areaData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {areaData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {areaData.map((area, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded-full mr-3"
                    style={{ backgroundColor: area.color }}
                  />
                  <span className="font-medium">{area.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{area.value} deliveries</div>
                  <div className="text-sm text-gray-500">
                    {((area.value / 100) * 100).toFixed(0)}% success rate
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsChart;
