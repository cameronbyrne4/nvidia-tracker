import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, Title, Text } from "@tremor/react";
import StockMetrics from './StockMetrics';

const StockChart = () => {
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const response = await axios.get('http://localhost:8000/stock-data');
        const formattedData = response.data.map(item => ({
          date: new Date(item.date).toLocaleDateString(),
          price: parseFloat(item.close),
          volume: parseInt(item.volume)
        }));
        setStockData(formattedData);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch stock data');
        setLoading(false);
      }
    };

    fetchStockData();
  }, []);

  if (loading) return <div>Loading stock data...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="md:col-span-2">
        <Card className="p-4 shadow-lg rounded-xl">
          <Title>NVIDIA (NVDA) Stock Performance</Title>
          <Text>Last 100 trading days</Text>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={stockData}
              margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => value.split('/')[1] + '/' + value.split('/')[2]}
              />
              <YAxis 
                yAxisId="left" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${value}`}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="price"
                stroke="#76B900"
                strokeWidth={2}
                dot={false}
                name="Stock Price"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="volume"
                stroke="#8884d8"
                strokeWidth={2}
                dot={false}
                name="Volume"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
      <StockMetrics stockData={stockData} />
    </div>
  );
};

export default StockChart;