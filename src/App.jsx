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
      // Step 1: Search for recent news about the customer
      const searchResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4000,
          messages: [{
            role: 'user',
            content: `Search for the latest news and developments about ${customerName}. Focus on: business challenges, digital transformation initiatives, technology investments, operational issues, customer experience problems, IT modernization, regulatory challenges, and growth initiatives. Provide 5-7 key recent news items or developments.`
          }],
          tools: [{
            type: 'web_search_20250305',
            name: 'web_search'
          }]
        })
      });

      const searchData = await searchResponse.json();
      
      // Extract the news content from Claude's response
      let newsContent = '';
      for (const block of searchData.content) {
        if (block.type === 'text') {
          newsContent += block.text + '\n';
        }
      }

      // Step 2: Analyze for ServiceNow opportunities
      const analysisResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4000,
          messages: [{
            role: 'user',
            content: `Based on this news about ${customerName}:

${newsContent}

Analyze this information and provide a structured response in the following JSON format (respond ONLY with valid JSON, no markdown):

{
  "newsItems": [
    {
      "headline": "brief headline",
      "summary": "2-3 sentence summary",
      "source": "source if mentioned"
    }
  ],
  "opportunities": [
    {
      "area": "ServiceNow product area (e.g., ITSM, CSM, HRSD, AI Search, etc.)",
      "insight": "specific opportunity based on the news",
      "reasoning": "why this makes sense for this customer"
    }
  ],
  "keyTakeaway": "One paragraph executive summary of the situation and ServiceNow's potential value"
}

Focus on concrete opportunities based on actual challenges, initiatives, or changes mentioned in the news.`
          }]
        })
      });

      const analysisData = await analysisResponse.json();
      
      // Parse the JSON response
      let analysisText = '';
      for (const block of analysisData.content) {
        if (block.type === 'text') {
          analysisText += block.text;
        }
      }

      // Clean up the response - remove markdown code blocks if present
      analysisText = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const parsedResults = JSON.parse(analysisText);
      setResults(parsedResults);

    } catch (err) {
      console.error('Error:', err);
      setError('Failed to analyze customer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress =
