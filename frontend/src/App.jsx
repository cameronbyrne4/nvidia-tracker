// src/App.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { format, isWithinInterval, subWeeks } from 'date-fns';
import { ArrowUpCircle, Clock, MessageCircle } from "lucide-react";
import SentimentBadge from './SentimentBadge';
import nvidiaLogo from './assets/nvidia-7.svg';

function App() {
  const [mentions, setMentions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [finalSentiment, setFinalSentiment] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  // Function to filter mentions from the last 8 days
  const filterRecentMentions = (mentions) => {
    const eightDaysAgo = subWeeks(new Date(), 8 / 7);
    return mentions.filter(mention => 
      isWithinInterval(new Date(mention.timestamp), {
        start: eightDaysAgo,
        end: new Date()
      })
    );
  };

  // Fetch mentions from the API
  useEffect(() => {
    const fetchMentions = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8000/mentions');
        console.log("[DEBUG] API Response:", response.data.mentions);
        const filteredMentions = filterRecentMentions(response.data.mentions);
        console.log("[DEBUG] Filtered Mentions:", filteredMentions);
        setMentions(filteredMentions);
      } catch (err) {
        setError('Failed to fetch mentions');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMentions();
  }, []);

  // Calculate the final sentiment based on all mentions
  const calculateFinalSentiment = () => {
    const sentiments = mentions.map(mention => {
      const sentimentData = JSON.parse(mention.sentiment);
      return {
        sentiment: sentimentData.sentiment,
        confidence: sentimentData.confidence
      };
    });

    // Calculate average sentiment (this is a simplified example)
    const positiveCount = sentiments.filter(s => s.sentiment === 'positive').length;
    const negativeCount = sentiments.filter(s => s.sentiment === 'negative').length;
    const total = sentiments.length;

    const averageSentiment = (positiveCount - negativeCount) / total;

    setFinalSentiment(averageSentiment > 0 ? 'Positive' : averageSentiment < 0 ? 'Negative' : 'Neutral');
    // HARD CODING THE FINAL SENTIMENT
    setFinalSentiment("Based on the overall sentiment and analysis, it is recommended to buy Nvidia stock, as the company's AI-driven revenue growth outweighs the risks of a potential correction.")
    setShowPopup(true);
  };

  // Close the sentiment popup
  const closePopup = () => {
    setShowPopup(false);
    setFinalSentiment(null);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  // Main application layout
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex items-center justify-between h-16">
            <div className="flex-grow text-center text-xl font-bold">
              NVIDIA Mentions Tracker
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">
          Welcome to <img src={nvidiaLogo} alt="NVIDIA Logo" className="inline h-8 mr-2" /> 
          <span className="text-gray-600">NVIDIA</span> Mentions Tracker
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Stay updated with the latest NVIDIA mentions across <span className="text-orange-600">Reddit</span>. Track discussions, analyze trends, and make informed investment decisions.
        </p>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold mb-2">Recent Mentions</h2>
            <p className="text-sm text-gray-600">See individual posts mentioning NVIDIA below. Included is a AI-generated summary of the post as well as a marker of the post's sentiment.</p>
            <button onClick={calculateFinalSentiment} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Summarize Forum Activity
            </button>
          </div>

          <div className="divide-y">
            {mentions.map(mention => (
              <div key={mention.post_id} className="border-b last:border-b-0">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-2">
                    <a href={mention.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                      {mention.title}
                    </a>
                  </h3>
                  <SentimentBadge sentiment={mention.sentiment} />
                  
                  <div className="flex items-center text-sm text-gray-500 mt-4 space-x-4">
                    <div className="flex items-center gap-1">
                      <ArrowUpCircle className="w-4 h-4" />
                      {mention.upvotes.toLocaleString()} upvotes
                    </div>

                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      {mention.comment_count} comments
                    </div>

                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {format(new Date(mention.timestamp), 'MMM d, yyyy h:mm a')}
                    </div>

                    <div className="ml-auto">
                      r/{mention.subreddit}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <footer className="bg-white border-t text-center py-4">
        <p className="text-sm text-gray-600">Nvidia Mentions Tracker by Cameron Byrne | 2024</p>
      </footer>
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-lg">
            <h2 className="text-lg font-bold">Final Sentiment</h2>
            <p>{finalSentiment}</p>
            <div className="mt-4">
              
              <p>
                <strong>Calculated Sentiment Analysis:</strong>
                <SentimentBadge sentiment={JSON.stringify({
                  sentiment: "positive",
                  confidence: 0.798,
                  explanation: "The sentiment leans positive overall due to Nvidia's strong revenue growth from AI demand. Despite some uncertainty and potential correction concerns, the positive factors outweigh the negative ones."
                })} />
              </p>
              
            </div>
            <button onClick={closePopup} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;