import React from 'react';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GreetingHeader({ searchVal, onSearchChange }) {
  // Dynamic greeting based on current system hour:
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: "Good morning", icon: "🍳" };
    if (hour < 17) return { text: "Good afternoon", icon: "🍱" };
    if (hour < 21) return { text: "Good evening", icon: "🍲" };
    return { text: "Late night cravings", icon: "🌙" };
  };

  const greeting = getGreeting();

  // Load dynamic username from localStorage:
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userName = storedUser.name ? storedUser.name.split(" ")[0] : "Nandini";

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#FF7A00] to-[#E56700] px-6 py-12 md:p-16 shadow-2xl shadow-[#FF7A00]/20 mb-8 border border-[#FF7A00]/30">
      
      {/* Background Texture for Header */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-20 mix-blend-color-burn" 
        style={{ 
          backgroundImage: "url('/bg-pattern.png')", 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
        }} 
      />

      {/* Background Decorative Mesh Glow Spheres */}
      <div className="absolute right-0 top-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 z-0" />
      <div className="absolute left-1/3 bottom-0 w-60 h-60 bg-amber-300/10 rounded-full blur-2xl pointer-events-none -ml-20 -mb-20 z-0" />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        
        {/* Dynamic Greeting Title */}
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4"
        >
          {greeting.text}, <span className="underline decoration-amber-300 decoration-wavy underline-offset-4">{userName}</span>! {greeting.icon}
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-orange-50/95 text-base md:text-lg font-medium mb-8 max-w-xl mx-auto"
        >
          Fresh, hygienic, and authentic home-cooked meals prepared with love by certified local chefs.
        </motion.p>

        {/* Glowing Search Bar Container */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="relative max-w-2xl mx-auto"
        >
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5.5 w-5.5 text-[#6B7280]" />
          </div>
          
          <input
            type="text"
            value={searchVal || ""}
            onChange={(e) => onSearchChange(e.target.value)} // TODO: Connect to search state in ConsumerDashboard!
            placeholder="Search by kitchen, chef, location (sector), or cuisine..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white text-[#2D2D2D] placeholder-[#6B7280] border border-[#FF7A00]/10 shadow-lg focus:outline-none focus:ring-4 focus:ring-[#FF7A00]/10 focus:border-[#FF7A00]/40 text-sm md:text-base font-medium transition-all duration-300"
          />

          {/* Micro-glow ring under input */}
          <div className="absolute inset-0 rounded-2xl ring-2 ring-white/10 pointer-events-none" />
        </motion.div>

      </div>

    </div>
  );
}
