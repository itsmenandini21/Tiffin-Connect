import React from 'react';
import { Leaf, Flame, Sparkles, Star, ShieldCheck } from 'lucide-react';

export default function FilterBar({ activeFilters, onFilterToggle }) {
  // ==========================================
  // JAVASCRIPT LOGIC PLACEHOLDER
  // ==========================================
  // TODO ( Nandini ): Here is how your filter object will look!
  // In your parent component (ConsumerDashboard.jsx), you will maintain a state like:
  // const [activeFilters, setActiveFilters] = useState({
  //   vegOnly: false,
  //   nonVegOnly: false,
  //   highRated: false,
  //   spicyLevel: '', // 'mild', 'medium', 'spicy'
  // });
  //
  // And this function will toggle them:
  // const handleFilterToggle = (key) => {
  //   setActiveFilters(prev => ({ ...prev, [key]: !prev[key] }));
  // };
  // ==========================================

  // For testing styling, if no props are passed, fallback to empty defaults:
  const filters = activeFilters || {
    vegOnly: false,
    nonVegOnly: false,
    highRated: false,
    spicyLevel: '',
  };

  const toggle = onFilterToggle || (() => {});

  return (
    <div className="flex flex-col gap-4 mb-8">
      {/* Label/Header for filters */}
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-orange-500" />
        <h2 className="text-lg font-bold text-gray-800">Customize Your Taste</h2>
      </div>

      {/* Responsive Filter Container */}
      <div className="flex flex-wrap gap-3 items-center">
        
        {/* Veg Only Filter Pill */}
        <button
          onClick={() => toggle('vegOnly')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs md:text-sm font-bold border transition-all duration-300 ${
            filters.vegOnly 
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 border-emerald-500 text-white shadow-md shadow-emerald-100' 
              : 'bg-white border-gray-200 text-gray-600 hover:border-emerald-300 hover:text-emerald-600'
          }`}
        >
          <Leaf className="w-4 h-4" />
          <span>Veg Only</span>
        </button>

        {/* Non-Veg Filter Pill */}
        <button
          onClick={() => toggle('nonVegOnly')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs md:text-sm font-bold border transition-all duration-300 ${
            filters.nonVegOnly 
              ? 'bg-gradient-to-r from-rose-500 to-red-500 border-rose-500 text-white shadow-md shadow-rose-100' 
              : 'bg-white border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-600'
          }`}
        >
          <div className="w-2.5 h-2.5 rounded-full bg-red-600 border border-white" />
          <span>Non-Veg</span>
        </button>

        {/* High Rated (4.5+) Filter Pill */}
        <button
          onClick={() => toggle('highRated')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs md:text-sm font-bold border transition-all duration-300 ${
            filters.highRated 
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 border-orange-500 text-white shadow-md shadow-orange-100' 
              : 'bg-white border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-600'
          }`}
        >
          <Star className="w-4 h-4 fill-current" />
          <span>Highly Rated (4.5+)</span>
        </button>

        {/* Divider */}
        <div className="hidden sm:block h-6 w-px bg-gray-200 mx-1" />

        {/* Spicy Filter Options */}
        <div className="flex gap-2 items-center">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider hidden md:inline">Spice:</span>
          
          {/* Mild */}
          <button
            onClick={() => toggle('mildSpice')}
            className={`px-3.5 py-2 rounded-full text-xs md:text-sm font-bold border transition-all duration-300 ${
              filters.mildSpice 
                ? 'bg-orange-50 border-orange-400 text-orange-700 font-extrabold' 
                : 'bg-white border-gray-200 text-gray-600 hover:border-orange-200 hover:text-orange-500'
            }`}
          >
            Mild 🍲
          </button>

          {/* Medium */}
          <button
            onClick={() => toggle('mediumSpice')}
            className={`px-3.5 py-2 rounded-full text-xs md:text-sm font-bold border transition-all duration-300 ${
              filters.mediumSpice 
                ? 'bg-orange-100 border-orange-500 text-orange-800 font-extrabold' 
                : 'bg-white border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-500'
            }`}
          >
            Medium 🌶️
          </button>

          {/* Spicy */}
          <button
            onClick={() => toggle('hotSpice')}
            className={`px-3.5 py-2 rounded-full text-xs md:text-sm font-bold border transition-all duration-300 ${
              filters.hotSpice 
                ? 'bg-red-50 border-red-500 text-red-700 font-extrabold shadow-sm' 
                : 'bg-white border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-500'
            }`}
          >
            Spicy 🌶️🌶️
          </button>
        </div>

      </div>
    </div>
  );
}
