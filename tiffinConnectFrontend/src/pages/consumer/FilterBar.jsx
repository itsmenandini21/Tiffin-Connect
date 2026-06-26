import React from 'react';
import { Leaf, Flame, Sparkles, Star, ShieldCheck, Sunrise, Sun, Moon, Clock } from 'lucide-react';

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
    morning: false,
    lunch: false,
    dinner: false,
  };

  const toggle = onFilterToggle || (() => {});

  return (
    <div className="flex flex-col gap-4 mb-8">
      {/* Label/Header for filters */}
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-[#FF7A00]" />
        <h2 className="text-lg font-bold text-[#2D2D2D]">Customize Your Taste</h2>
      </div>

      {/* Responsive Filter Container */}
      <div className="flex flex-wrap gap-x-3 gap-y-4 items-center">
        
        {/* Dietary Group */}
        <div className="flex items-center gap-2 p-1 bg-white/40 backdrop-blur-sm rounded-full border border-white/60 shadow-sm">
          {/* Veg Only */}
          <button
            onClick={() => toggle('vegOnly')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-bold transition-all duration-300 ${
              filters.vegOnly 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30' 
                : 'bg-transparent text-gray-600 hover:bg-white/80'
            }`}
          >
            <Leaf className="w-4 h-4" />
            Veg Only
          </button>

          {/* Non-Veg */}
          <button
            onClick={() => toggle('nonVegOnly')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-bold transition-all duration-300 ${
              filters.nonVegOnly 
                ? 'bg-gradient-to-r from-rose-500 to-red-500 text-white shadow-lg shadow-rose-500/30' 
                : 'bg-transparent text-gray-600 hover:bg-white/80'
            }`}
          >
            <div className={`w-2.5 h-2.5 rounded-full border border-current ${filters.nonVegOnly ? 'bg-white' : 'bg-red-500'}`} />
            Non-Veg
          </button>
        </div>

        {/* Separator */}
        <div className="w-px h-8 bg-gray-300/50 hidden md:block"></div>

        {/* Meal Time Group */}
        <div className="flex items-center gap-2 p-1 bg-white/40 backdrop-blur-sm rounded-full border border-white/60 shadow-sm">
          {/* Morning */}
          <button
            onClick={() => toggle('morning')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-bold transition-all duration-300 ${
              filters.morning 
                ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-lg shadow-amber-500/30' 
                : 'bg-transparent text-gray-600 hover:bg-white/80'
            }`}
          >
            <Sunrise className="w-4 h-4" />
            Breakfast
          </button>

          {/* Lunch */}
          <button
            onClick={() => toggle('lunch')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-bold transition-all duration-300 ${
              filters.lunch 
                ? 'bg-gradient-to-r from-[#FF7A00] to-[#E56700] text-white shadow-lg shadow-[#FF7A00]/30' 
                : 'bg-transparent text-gray-600 hover:bg-white/80'
            }`}
          >
            <Sun className="w-4 h-4" />
            Lunch
          </button>

          {/* Dinner */}
          <button
            onClick={() => toggle('dinner')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-bold transition-all duration-300 ${
              filters.dinner 
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30' 
                : 'bg-transparent text-gray-600 hover:bg-white/80'
            }`}
          >
            <Moon className="w-4 h-4" />
            Dinner
          </button>
        </div>

        {/* Separator */}
        <div className="w-px h-8 bg-gray-300/50 hidden md:block"></div>

        {/* Rating Group */}
        <div className="flex items-center gap-2 p-1 bg-white/40 backdrop-blur-sm rounded-full border border-white/60 shadow-sm">
          {/* High Rated */}
          <button
            onClick={() => toggle('highRated')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-bold transition-all duration-300 ${
              filters.highRated 
                ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-lg shadow-yellow-500/30' 
                : 'bg-transparent text-gray-600 hover:bg-white/80'
            }`}
          >
            <Star className={`w-4 h-4 ${filters.highRated ? 'fill-white' : 'fill-yellow-500 text-yellow-500'}`} />
            Highly Rated (4.5+)
          </button>
        </div>
      </div>
    </div>
  );
}
