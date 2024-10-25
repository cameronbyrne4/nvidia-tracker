// src/App.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

function App() {
  const [mentions, setMentions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMentions = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8000/mentions');
        setMentions(response.data.mentions);
      } catch (err) {
        setError('Failed to fetch mentions');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMentions();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">NVIDIA Mentions Tracker</h1>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Recent Mentions</h2>
            <p className="mt-1 text-sm text-gray-500">Tracking mentions across Reddit</p>
          </div>
          
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {mentions.map((mention) => (
                <li key={mention.post_id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <a 
                        href={mention.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-lg font-medium text-blue-600 hover:text-blue-800"
                      >
                        {mention.title}
                      </a>
                      <span className="text-sm text-gray-500">
                        r/{mention.subreddit}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-500 flex gap-4">
                      <span>⬆️ {mention.upvotes} upvotes</span>
                      <span>💬 {mention.comment_count} comments</span>
                      <span>🕒 {format(new Date(mention.timestamp), 'MMM d, yyyy h:mm a')}</span>
                    </div>
                    
                    {mention.content && (
                      <p className="text-gray-600 mt-1 line-clamp-2">
                        {mention.content}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;