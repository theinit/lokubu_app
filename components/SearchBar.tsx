import React from 'react';
import { ExperienceCategory } from '../types';

interface SearchBarProps {
  onLocationChange: (location: string) => void;
  onCategoryChange: (category: ExperienceCategory) => void;
  locationFilter: string;
  categoryFilter: ExperienceCategory;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onLocationChange,
  onCategoryChange,
  locationFilter,
  categoryFilter,
}) => {
  return (
    <div className="bg-gray-800 p-4 rounded-xl shadow-lg mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <div className="md:col-span-2">
          <label htmlFor="location-search" className="sr-only">Search by location</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>
            <input
              id="location-search"
              type="text"
              placeholder="Search by location (e.g., Kyoto, Ireland)"
              value={locationFilter}
              onChange={(e) => onLocationChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-md focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
        </div>
        <div>
          <label htmlFor="category-select" className="sr-only">Filter by category</label>
          <select
            id="category-select"
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value as ExperienceCategory)}
            className="w-full py-3 px-4 border border-gray-600 bg-gray-700 text-white rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
          >
            {Object.values(ExperienceCategory).map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;