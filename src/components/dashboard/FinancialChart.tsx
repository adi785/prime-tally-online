import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useDashboardMetrics } from '@/integrations/supabase/hooks';
import { cn } from '@/lib/utils';

interface FinancialChartProps {
  type: 'bar' | 'line';
  period: 'monthly' | 'quarterly' | 'yearly';
}

export function FinancialChart({ type, period }: FinancialChartProps) {
  const { data: metrics } = useDashboardMetrics();
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    // Generate sample data for the chart
    const generateData = () => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
      
      if (period === 'monthly') {
        return months.map((month, index) => ({
          name: month,
          sales: Math.floor(Math.random() * 200000) + 100000,
          purchases: Math.floor(Math.random() * 150000) + 50000,
          profit: Math.floor(Math.random() * 50000) + 20000,
        }));
      } else if (period === 'quarterly') {
        return quarters.map((quarter, index) => ({
          name: quarter,
          sales: Math.floor(Math.random() * 800000) + 400000,
          purchases: Math.floor(Math.random() * 600000) + 200000,
          profit: Math.floor(Math.random() * 200000) + 50000,
        }));
      } else {
        return [
          {
            name: '2024',
            sales: metrics?.totalSales || 1700000,
            purchases: metrics?.totalPurchases || 1300000,
            profit: (metrics?.totalSales || 0) - (metrics?.totalPurchases || 0) - 150000,
          }
        ];
      }
    };

    setChartData(generateData());
  }, [period, metrics]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-3 rounded-lg shadow-lg">
          <p className="text-sm font-semibold text-foreground mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{entry.dataKey}:</span>
              <span className="font-mono font-semibold text-foreground">
                ₹{entry.value.toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const chartConfig = {
    sales: { label: 'Sales', color: 'hsl(var(--chart-1))' },
    purchases: { label: 'Purchases', color: 'hsl(var(--chart-2))' },
    profit: { label: 'Profit', color: 'hsl(var(--chart-3))' },
  };

  return (
    <div className="bg-card rounded-xl border border-border p-4 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">
          {type === 'bar' ? 'Sales vs Purchases' : 'Financial Trend'} - {period.charAt(0).toUpperCase() + period.slice(1)}
        </h3>
        <div className="flex gap-2">
          <span className="text-xs text-muted-foreground">Sales</span>
          <span className="text-xs text-muted-foreground">Purchases</span>
          <span className="text-xs text-muted-foreground">Profit</span>
        </div>
      </div>
      
      <div className="h-64">
        {type === 'bar' ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--table-border))" />
              <XAxis 
                dataKey="name" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="sales" fill={chartConfig.sales.color} radius={[4, 4, 0, 0]} />
              <Bar dataKey="purchases" fill={chartConfig.purchases.color} radius={[4, 4, 0, 0]} />
              <Bar dataKey="profit" fill={chartConfig.profit.color} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--table-border))" />
              <XAxis 
                dataKey="name" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="sales" 
                stroke={chartConfig.sales.color}
                strokeWidth={2}
                dot={{ fill: chartConfig.sales.color, strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="purchases" 
                stroke={chartConfig.purchases.color}
                strokeWidth={2}
                dot={{ fill: chartConfig.purchases.color, strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="profit" 
                stroke={chartConfig.profit.color}
                strokeWidth={2}
                dot={{ fill: chartConfig.profit.color, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}