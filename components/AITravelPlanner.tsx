import React, { useState, useCallback } from 'react';
import { generateTravelPlan } from '../services/geminiService';
import { AITravelPlan } from '../types';

const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
  </div>
);

const AITravelPlanner: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [plan, setPlan] = useState<AITravelPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGeneratePlan = useCallback(async () => {
    if (!prompt.trim()) {
      setError('Please describe your dream trip.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setPlan(null);
    try {
      const generatedPlan = await generateTravelPlan(prompt);
      setPlan(generatedPlan);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [prompt]);
  
  const renderPlan = () => {
    if (!plan) return null;

    return (
      <div className="mt-6 bg-gray-900 p-6 rounded-lg shadow-inner animate-fade-in">
        <h3 className="text-2xl font-bold text-white mb-4">{plan.title}</h3>
        <div className="space-y-6">
          {plan.itinerary.map((day) => (
            <div key={day.day} className="border-l-4 border-teal-500 pl-4">
              <h4 className="text-xl font-semibold text-teal-400">Day {day.day}: {day.title}</h4>
              <p className="text-gray-300 mt-1 mb-3">{day.description}</p>
              <ul className="space-y-2 list-disc list-inside">
                {day.activities.map((activity, index) => (
                  <li key={index} className="text-gray-200">
                    <span className="font-semibold">{activity.name}:</span> {activity.description}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <section className="bg-gray-800 rounded-xl p-8 mb-12 shadow-lg border border-gray-700">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
          Craft Your Perfect Trip with AI
        </h2>
        <p className="mt-4 text-lg text-gray-300">
          Tell us what you're dreaming of, and our AI will create a personalized itinerary for you.
        </p>
      </div>
      <div className="mt-8 max-w-2xl mx-auto">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., 'A 3-day romantic getaway in Paris focused on art, food, and hidden gems.'"
          className="w-full h-24 p-4 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
          disabled={isLoading}
        />
        <button
          onClick={handleGeneratePlan}
          disabled={isLoading}
          className="mt-4 w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          {isLoading ? <LoadingSpinner /> : 'Generate Plan'}
        </button>
        {error && <p className="mt-2 text-center text-red-500">{error}</p>}
      </div>
      {renderPlan()}
    </section>
  );
};

export default AITravelPlanner;