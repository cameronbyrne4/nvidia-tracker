import React from 'react';

const SentimentBadge = ({ sentiment }) => {
  console.log("[DEBUG] Sentiment prop:", sentiment);
  if (!sentiment) return null;
  
  const sentimentData = JSON.parse(sentiment);
  
  const getBadgeColor = (sentiment) => {
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return 'bg-green-100 text-green-800';
      case 'negative':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="mt-2">
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeColor(sentimentData.sentiment)}`}>
        {sentimentData.sentiment}
      </span>
      <p className="text-sm text-gray-600 mt-2">{sentimentData.explanation}</p>
      <p className="text-sm text-gray-500 mt-1">
        Confidence: {sentimentData.confidence.toFixed(2) * 100}%
      </p>
    </div>
  );
};

export default SentimentBadge;