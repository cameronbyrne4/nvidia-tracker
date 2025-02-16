import React from 'react';
import { Card, Metric, Text } from "@tremor/react";
import { TrendingUp, TrendingDown, BarChart2, DollarSign } from 'lucide-react';

const StockMetrics = ({ stockData }) => {
  if (!stockData || stockData.length === 0) return null;

  const latestData = stockData[stockData.length - 1];
  const previousData = stockData[stockData.length - 2];
  
  const calculateChange = () => {
    const change = ((latestData.price - previousData.price) / previousData.price) * 100;
    return change.toFixed(2);
  };

  const change = calculateChange();
  const isPositive = parseFloat(change) >= 0;

  return (
    <div className="md:col-span-1">
      <Card className="p-6 shadow-lg rounded-xl bg-gradient-to-br from-white to-gray-50">
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <Text className="text-gray-600 font-medium">Current Price</Text>
            <div className="flex items-center">
              <DollarSign className="w-4 h-4 text-gray-400 mr-1" />
              <Metric className="text-2xl">${latestData.price.toFixed(2)}</Metric>
            </div>
          </div>

          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <Text className="text-gray-600 font-medium">24h Change</Text>
            <div className="flex items-center">
              {isPositive ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <Metric className={`text-2xl ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {change}%
              </Metric>
            </div>
          </div>

          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <Text className="text-gray-600 font-medium">Volume</Text>
            <div className="flex items-center">
              <BarChart2 className="w-4 h-4 text-gray-400 mr-1" />
              <Metric className="text-2xl">
                {(latestData.volume / 1000000).toFixed(2)}M
              </Metric>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Text className="text-gray-600 font-medium">Market Cap</Text>
            <div className="flex items-center">
              <DollarSign className="w-4 h-4 text-gray-400 mr-1" />
              <Metric className="text-2xl">
                {((latestData.price * latestData.volume) / 1000000000).toFixed(2)}B
              </Metric>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StockMetrics;