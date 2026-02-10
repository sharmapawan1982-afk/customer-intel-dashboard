import React, { useState } from 'react';
import { Search, TrendingUp, AlertCircle, Loader2, Newspaper, Lightbulb } from 'lucide-react';

export default function App() {
  const [customerName, setCustomerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const analyzeCustomer = async () => {
    if (!customerName.trim()) {
      setError('Please enter a customer name');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4096,
          messages: [{
            role: 'user',
            content: `Search for the latest news and developments about ${customerName}. Then analyze and provide a JSON response (respond ONLY with valid JSON):

{
  "newsItems": [
    {"headline": "brief headline", "summary": "2-3 sentence summary", "source": "source name"}
  ],
  "opportunities": [
    {"area": "ServiceNow product", "insight": "specific opportunity", "reasoning": "why this makes sense"}
  ],
  "keyTakeaway": "Executive summary paragraph"
}

Find 5-7 news items and 3-5 ServiceNow opportunities based on business challenges, digital transformation, technology investments, operational issues.`
          }],
          tools: [{
            type: 'web_search_20250305',
            name: 'web_search'
          }]
        })
      });

      const data = await response.json();
      
      let fullText = '';
      for (const block of data.content) {
        if (block.type === 'text') {
          fullText += block.text + '\n';
        }
      }

      fullText = fullText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const jsonMatch = fullText.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('No valid response received');
      }
      
      const parsedResults = JSON.parse(jsonMatch[0]);
      setResults(parsedResults);

    } catch (err) {
      console.error('Full error:', err);
      setError(`Analysis failed: ${err.message}. The API may be unavailable in this environment.`);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      analyzeCustomer();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Customer Intelligence Dashboard</h1>
              <p className="text-sm text-gray-600">ServiceNow Opportunity Finder</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Customer Name
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g., HMRC, DWP, British Airways..."
              className="flex-1 px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
              disabled={loading}
            />
            <button
              onClick={analyzeCustomer}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Analyze
                </>
              )}
            </button>
          </div>
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {results && (
          <div className="space-y-6">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
              <h2 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
                <Lightbulb className="w-6 h-6" />
                Executive Summary
              </h2>
              <p className="text-gray-800 leading-relaxed">{results.keyTakeaway}</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-green-600" />
                ServiceNow Opportunities
              </h2>
              <div className="space-y-4">
                {results.opportunities.map((opp, idx) => (
                  <div key={idx} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-green-900 mb-1">{opp.area}</h3>
                        <p className="text-gray-800 mb-2">{opp.insight}</p>
                        <p className="text-sm text-gray-600 italic">{opp.reasoning}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Newspaper className="w-6 h-6 text-blue-600" />
                Recent News & Developments
              </h2>
              <div className="space-y-4">
                {results.newsItems.map((item, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">{item.headline}</h3>
                    <p className="text-gray-700 mb-2">{item.summary}</p>
                    {item.source && (
                      <p className="text-xs text-gray-500">Source: {item.source}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
