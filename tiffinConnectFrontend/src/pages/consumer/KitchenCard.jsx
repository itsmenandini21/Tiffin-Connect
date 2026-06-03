import React from 'react';
import { Star, MapPin, Award, ArrowRight, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function KitchenCard({ kitchen, onViewMenu, onSubscribe }) {
  // ==========================================
  // JAVASCRIPT LOGIC PLACEHOLDER
  // ==========================================
  // TODO ( Nandini ): Connect database fields here!
  // In your Express backend, you populated the 'providerId' field, so you have access to:
  // - kitchen.serviceName (e.g. "Annapurna Rasoi")
  // - kitchen.description (e.g. "Delicious ghar jaisa khana...")
  // - kitchen.price (e.g. 110)
  // - kitchen.cuisineType (e.g. "Rajasthani")
  // - kitchen.isVeg (Boolean)
  // - kitchen.providerId.name (Chef's Name)
  // - kitchen.providerId.address (Chef's Location)
  // ==========================================

  // Standardize database fields alongside styling fallback options:
  const rawItem = kitchen || {};
  
  const item = {
    _id: rawItem._id,
    serviceName: rawItem.title || rawItem.serviceName || "Swad ki Rasoi",
    description: rawItem.description || "Pure, high-quality vegetarian meals cooked daily with authentic spices.",
    price: rawItem.pricePerMeal || rawItem.price || 120,
    cuisineType: rawItem.foodType || rawItem.cuisineType || "North Indian",
    isVeg: rawItem.foodType 
      ? ["Veg", "Vegan", "Jain"].includes(rawItem.foodType) 
      : (rawItem.isVeg !== false),
    rating: rawItem.rating || 4.8,
    ordersCount: rawItem.ordersCount || 125,
    providerId: {
      name: rawItem.providerId?.name || "Chef Sunita Sharma",
      address: rawItem.providerId?.address
        ? (typeof rawItem.providerId.address === 'object'
            ? `${rawItem.providerId.address.city || ''}, ${rawItem.providerId.address.state || ''}`
            : rawItem.providerId.address)
        : "Sector 62, Noida"
    },
    menu: rawItem.weeklyMenu || rawItem.menu
  };

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-orange-500/5 overflow-hidden transition-all duration-300 flex flex-col h-full"
    >
      
      {/* Top Banner (Beautiful Gradient + Food Emoji Display) */}
      <div className="relative h-32 bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center overflow-hidden">
        
        {/* Abstract shapes in card banner */}
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-orange-200/40 rounded-full blur-xl" />
        <div className="absolute -left-6 -top-6 w-20 h-20 bg-amber-200/40 rounded-full blur-xl" />
        
        {/* Large Decorative Icon/Emoji */}
        <span className="text-5xl select-none filter drop-shadow-md">
          {item.isVeg ? "🥗" : "🍛"}
        </span>

        {/* Veg/Non-Veg absolute badge */}
        <div className="absolute top-4 left-4">
          {item.isVeg ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Pure Veg
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              Non-Veg Options
            </span>
          )}
        </div>

        {/* Dynamic Pricing absolute badge */}
        <div className="absolute top-4 right-4 bg-gray-900/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-extrabold shadow-md">
          ₹{item.price}<span className="text-[10px] font-medium text-gray-300">/meal</span>
        </div>

      </div>

      {/* Card Content Details */}
      <div className="p-6 flex flex-col flex-grow">
        
        {/* Kitchen Title & Cuisine Category */}
        <div className="mb-2">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full">
            {item.cuisineType || "Homestyle"}
          </span>
          <h3 className="text-lg font-bold text-gray-800 mt-1.5 truncate group-hover:text-orange-600 transition-colors">
            {item.serviceName}
          </h3>
        </div>

        {/* Chef's Name */}
        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 mb-3.5">
          <User className="w-3.5 h-3.5 text-orange-500" />
          <span>By {item.providerId?.name || "Home Chef"}</span>
        </div>

        {/* Short Description */}
        <p className="text-gray-400 text-xs md:text-sm font-medium leading-relaxed mb-4 flex-grow line-clamp-2">
          {item.description}
        </p>

        {/* Divider */}
        <div className="border-t border-gray-100 my-4" />

        {/* Rating and Distance Location Grid */}
        <div className="flex items-center justify-between mb-5">
          
          {/* Star Rating Badge */}
          <div className="flex items-center gap-1">
            <div className="p-1 bg-amber-50 rounded-lg">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
            </div>
            <span className="text-xs md:text-sm font-extrabold text-gray-800">{item.rating || 4.8}</span>
            <span className="text-[10px] font-bold text-gray-400">({item.ordersCount || 50}+ orders)</span>
          </div>

          {/* Location Badge */}
          <div className="flex items-center gap-1 text-gray-500 max-w-[120px]">
            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="text-xs font-semibold truncate">{item.providerId?.address || "Noida"}</span>
          </div>

        </div>

        {/* Actions Grid (Weekly Menu & Subscribe) */}
        <div className="flex gap-3">
          <button
            onClick={() => onViewMenu(item)}
            className="flex-1 py-3 rounded-xl border border-orange-500/30 hover:border-orange-500 text-orange-600 hover:bg-orange-50 font-bold text-xs flex items-center justify-center gap-1.5 transition-all duration-300"
          >
            <span>Weekly Menu</span>
          </button>
          
          <button
            onClick={() => onSubscribe(item)}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-orange-100 hover:shadow-orange-500/25 transition-all duration-300 group"
          >
            <span>Subscribe</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
          </button>
        </div>

      </div>

    </motion.div>
  );
}
