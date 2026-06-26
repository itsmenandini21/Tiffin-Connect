import React from 'react';
import { Star, MapPin, Award, ArrowRight, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function KitchenCard({ kitchen, onViewMenu, onSubscribe, onViewReviews, isSubscribed }) {
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
    shift: rawItem.shift || "All Day",
    deliveryTime: (rawItem.startTime && rawItem.endTime) ? `${rawItem.startTime} - ${rawItem.endTime}` : "Timings not set",
    rating: (rawItem.rating !== undefined && rawItem.rating !== null) ? rawItem.rating : 0,
    ordersCount: (rawItem.ordersCount !== undefined && rawItem.ordersCount !== null) ? rawItem.ordersCount : 0,
    providerId: {
      name: rawItem.providerId?.name || "Chef Sunita Sharma",
      address: rawItem.providerId?.address
        ? (typeof rawItem.providerId.address === 'object'
            ? `${rawItem.providerId.address.city || ''}, ${rawItem.providerId.address.state || ''}`
            : rawItem.providerId.address)
        : "Sector 62, Noida"
    },
    menu: rawItem.weeklyMenu || rawItem.menu,
    coverImage: rawItem.coverImage || null,
    menuImages: rawItem.menuImages || []
  };

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white/60 shadow-[0_8px_30px_rgba(255,122,0,0.04)] hover:border-[#FF7A00]/30 hover:shadow-[0_20px_40px_rgba(255,122,0,0.12)] hover:bg-white/95 overflow-hidden transition-all duration-300 flex flex-col h-full"
    >
      
      {/* Top Banner (Cover Image or Fallback Gradient) */}
      <div 
        className="relative h-36 bg-gradient-to-br from-[#FF7A00]/10 via-[#FF7A00]/5 to-transparent flex items-center justify-center overflow-hidden bg-cover bg-center"
        style={item.coverImage ? { backgroundImage: `url(${item.coverImage})` } : {}}
      >
        
        {/* Abstract shapes in card banner if no cover image */}
        {!item.coverImage && (
          <>
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#FF7A00]/10 rounded-full blur-xl" />
            <div className="absolute -left-6 -top-6 w-20 h-20 bg-amber-500/5 rounded-full blur-xl" />
            {/* Large Decorative Icon/Emoji */}
            <span className="text-5xl select-none filter drop-shadow-[0_8px_16px_rgba(255,122,0,0.1)]">
              {item.isVeg ? "🥗" : "🍛"}
            </span>
          </>
        )}
        
        {/* Dark overlay for text readability if cover image exists */}
        {item.coverImage && (
          <div className="absolute inset-0 bg-black/20" />
        )}

        {/* Veg/Non-Veg absolute badge */}
        <div className="absolute top-4 left-4">
          {item.isVeg ? (
            <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-extrabold uppercase bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
              Pure Veg
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-500/10 text-rose-500 border border-rose-500/20 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              Non-Veg Options
            </span>
          )}
        </div>

        {/* Dynamic Pricing absolute badge */}
        <div className="absolute top-4 right-4 bg-[#FF7A00] text-white px-3.5 py-1.5 rounded-full text-xs font-black shadow-md border border-[#FF7A00]/25">
          ₹{item.price}<span className="text-[10px] font-bold text-orange-100">/meal</span>
        </div>

      </div>

      {/* Card Content Details */}
      <div className="p-6 flex flex-col flex-grow">
        
        {/* Kitchen Title & Cuisine Category */}
        <div className="mb-2">
          <div className="flex gap-2">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#FF7A00] bg-[#FF7A00]/10 border border-[#FF7A00]/15 px-3 py-1 rounded-full">
              {item.cuisineType || "Homestyle"}
            </span>
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-gray-600 bg-gray-100 border border-gray-200 px-3 py-1 rounded-full">
              {item.shift} • {item.deliveryTime}
            </span>
          </div>
          <h3 className="text-xl font-black text-[#2D2D2D] mt-3 truncate hover:text-[#FF7A00] transition-colors">
            {item.serviceName}
          </h3>
        </div>

        {/* Chef's Name */}
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#6B7280] mb-3.5">
          <User className="w-3.5 h-3.5 text-[#FF7A00]" />
          <span>By {item.providerId?.name || "Home Chef"}</span>
        </div>

        {/* Short Description */}
        <p className="text-[#6B7280] text-xs md:text-sm font-medium leading-relaxed mb-4 flex-grow line-clamp-2">
          {item.description}
        </p>

        {/* Divider */}
        <div className="border-t border-[#FF7A00]/10 my-4" />

        {/* Rating and Distance Location Grid */}
        <div className="flex items-center justify-between mb-5">
          
          {/* Star Rating Badge (Clickable for reviews) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onViewReviews) onViewReviews(kitchen);
            }}
            className="flex items-center gap-1.5 hover:bg-[#FF7A00]/5 p-1 -m-1 rounded-xl transition-all border border-transparent hover:border-[#FF7A00]/15 group text-left"
            title="Read ratings and reviews"
          >
            <div className="p-1 bg-amber-100 rounded-lg group-hover:bg-amber-250 transition-colors">
              <Star className="w-3.5 h-3.5 text-amber-600 fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-extrabold text-[#2D2D2D] flex items-center gap-1">
                {item.rating > 0 ? item.rating : "New"}
                <span className="text-[9px] font-bold text-[#FF7A00] underline decoration-dotted underline-offset-2">Reviews</span>
              </span>
              <span className="text-[9px] font-bold text-[#6B7280]">
                {item.ordersCount > 0 ? `(${item.ordersCount} orders)` : "(No orders yet)"}
              </span>
            </div>
          </button>

          {/* Location Badge */}
          <div className="flex items-center gap-1 text-[#6B7280] max-w-[120px]">
            <MapPin className="w-3.5 h-3.5 text-[#FF7A00] shrink-0" />
            <span className="text-xs font-semibold truncate">{item.providerId?.address || "Noida"}</span>
          </div>

        </div>

        {/* Actions Grid (Weekly Menu & Subscribe) */}
        <div className="flex gap-3">
          <button
            onClick={() => onViewMenu(item)}
            className="flex-1 py-3 rounded-xl border-2 border-[#FF7A00]/20 hover:border-[#FF7A00] text-[#FF7A00] hover:bg-[#FF7A00]/5 font-bold text-xs flex items-center justify-center gap-1.5 transition-all duration-300"
          >
            <span>Weekly Menu</span>
          </button>
          
          {isSubscribed ? (
            <button
              disabled
              className="flex-1 py-3 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-not-allowed shadow-[0_4px_14px_rgba(34,197,94,0.05)]"
            >
              <span>Subscribed</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
            </button>
          ) : (
            <button
              onClick={() => onSubscribe(item)}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#E56700] hover:from-[#E56700] hover:to-[#FF7A00] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-[0_4px_14px_rgba(255,122,0,0.15)] hover:shadow-[0_6px_20px_rgba(255,122,0,0.25)] transition-all duration-300 group"
            >
              <span>Subscribe</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
            </button>
          )}
        </div>

      </div>

    </motion.div>
  );
}
