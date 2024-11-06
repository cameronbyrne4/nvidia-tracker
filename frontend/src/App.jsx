// src/App.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { format, isWithinInterval, subWeeks } from 'date-fns';
import { ArrowUpCircle, Clock, MessageCircle, Search, Bell, Menu } from "lucide-react";

function App() {
  const [mentions, setMentions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filterRecentMentions = (mentions) => {
    const twoWeeksAgo = subWeeks(new Date(), 2);
    return mentions.filter(mention => 
      isWithinInterval(new Date(mention.timestamp), {
        start: twoWeeksAgo,
        end: new Date()
      })
    );
  };

  useEffect(() => {
    const fetchMentions = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8000/mentions');
        const filteredMentions = filterRecentMentions(response.data.mentions);
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex items-center justify-between h-16">
            <div className="text-xl font-bold">NVIDIA Mentions Tracker</div>
            <div className="hidden md:flex items-center space-x-4">
              <a href="#" className="text-sm font-medium hover:text-blue-600">Dashboard</a>
              <a href="#" className="text-sm font-medium hover:text-blue-600">Analytics</a>
              <a href="#" className="text-sm font-medium hover:text-blue-600">Settings</a>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <Search className="h-5 w-5" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <Bell className="h-5 w-5" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Welcome to NVIDIA Mentions Tracker</h1>
        <p className="text-lg text-gray-600 mb-8">
          Stay updated with the latest NVIDIA mentions across Reddit. Track discussions, analyze trends, and make informed investment decisions.
        </p>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Quick Search</h2>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search mentions..."
              className="flex-1 max-w-sm px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Search
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Recent Mentions</h2>
            <p className="text-sm text-gray-600">Tracking mentions across Reddit</p>
          </div>

          <div className="divide-y">
            {mentions.map((mention) => (
              <div key={mention.post_id} className="p-6">
                <a
                  href={mention.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-lg font-medium block mb-2"
                >
                  {mention.title}
                </a>

                <div className="flex items-center gap-4 text-sm text-gray-600">
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
            ))}
          </div>
        </div>
      </main>

      <footer className="bg-white border-t py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          © 2024 NVIDIA Mentions Tracker. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default App;