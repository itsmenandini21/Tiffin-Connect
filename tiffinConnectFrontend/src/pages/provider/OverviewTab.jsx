import React, { useState, useEffect } from 'react';
import { ShoppingBag, DollarSign, Coffee, Utensils, Users, Star, Search } from 'lucide-react';

export default function OverviewTab({ menus, setEditingMenu, setMenuToDelete, setActiveTab }) {
  
  // Calculate dynamic stats from menus data
  const totalActiveSubscribers = menus.reduce((sum, menu) => sum + (menu.activeSubscribersCount || 0), 0);
  
  // Calculate monthly revenue dynamically using pricePerMeal * plan days (7 or 30) for each subscriber
  const monthlyRevenue = menus.reduce((sum, menu) => {
    const menuRevenue = (menu.subscribers || []).reduce((subSum, sub) => {
      if (sub.status !== 'active') return subSum;
      const planDays = sub.planType === 'weekly' ? 7 : 30;
      return subSum + (menu.pricePerMeal || 0) * planDays;
    }, 0);
    return sum + menuRevenue;
  }, 0);

  const [todayStats, setTodayStats] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMenus = menus.filter(menu => 
    menu.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    menu.foodType?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  useEffect(() => {
    const fetchTodayStats = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/subscription/todayStats`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setTodayStats(data);
        }
      } catch (err) {
        console.error("Failed to fetch today's stats", err);
      }
    };
    fetchTodayStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/90 backdrop-blur-md p-6 rounded-[2rem] border border-orange-100/50 shadow-[0_8px_30px_rgb(251,146,60,0.02)] flex items-center gap-4 hover:shadow-[0_15px_40px_rgba(251,146,60,0.06)] hover:border-orange-200/50 transition-all duration-300">
          <div className="p-4 bg-orange-50/80 border border-orange-100/50 rounded-2xl">
            <ShoppingBag className="w-8 h-8 text-orange-500"/>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Active Subscriptions</p>
            <p className="text-3xl font-black text-gray-900">{totalActiveSubscribers}</p>
          </div>
        </div>
        
        <div className="bg-white/90 backdrop-blur-md p-6 rounded-[2rem] border border-orange-100/50 shadow-[0_8px_30px_rgb(251,146,60,0.02)] flex items-center gap-4 hover:shadow-[0_15px_40px_rgba(251,146,60,0.06)] hover:border-orange-200/50 transition-all duration-300">
          <div className="p-4 bg-emerald-50/80 border border-emerald-100/50 rounded-2xl">
            <DollarSign className="w-8 h-8 text-emerald-500"/>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Monthly Revenue</p>
            <p className="text-3xl font-black text-gray-900">₹{monthlyRevenue.toLocaleString('en-IN')}</p>
          </div>
        </div>
        
        <div className="bg-white/90 backdrop-blur-md p-6 rounded-[2rem] border border-orange-100/50 shadow-[0_8px_30px_rgb(251,146,60,0.02)] flex items-center gap-4 hover:shadow-[0_15px_40px_rgba(251,146,60,0.06)] hover:border-orange-200/50 transition-all duration-300">
          <div className="p-4 bg-amber-50/80 border border-amber-100/50 rounded-2xl">
            <Coffee className="w-8 h-8 text-amber-500"/>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Active Services</p>
            <p className="text-3xl font-black text-gray-900">{menus.length}</p>
          </div>
        </div>
      </div>

      {/* Conditional Rendering for Menus and Insights Sidebar */}
      {menus.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Active Menus Column (Takes up 2 parts of grid) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-col mb-6 gap-5">
              {/* Search Bar */}
              <div className="relative w-full sm:w-72 shrink-0">
                  <input
                    type="text"
                    placeholder="Search services..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-orange-200 rounded-xl text-sm font-semibold text-gray-800 shadow-sm focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all placeholder:font-medium placeholder:text-gray-400"
                  />
                  <Search className="w-4 h-4 text-orange-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
              
              <h3 className="text-2xl font-black text-gray-900 font-sans tracking-tight">Your Active Services</h3>
            </div>

            {filteredMenus.length === 0 ? (
              <div className="bg-white/50 p-8 rounded-[2rem] border border-orange-100/50 text-center">
                <p className="text-gray-500 font-bold">No services found matching "{searchQuery}"</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredMenus.map((menu) => (
                <div 
                  key={menu._id} 
                  className="bg-white/90 backdrop-blur-md p-6 rounded-[2rem] border border-orange-100/60 shadow-[0_8px_30px_rgb(251,146,60,0.02)] flex flex-col hover:shadow-[0_20px_50px_rgba(251,146,60,0.08)] hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden group"
                >
                  {/* Decorative background shape */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-50 to-amber-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
                  
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-extrabold text-xl text-gray-900 mb-2">{menu.title}</h4>
                      <div className="flex gap-2">
                        <span className="px-2.5 py-1 bg-orange-100/60 text-orange-700 text-xs font-bold rounded-lg border border-orange-200/40">
                          {menu.foodType}
                        </span>
                        <span className="px-2.5 py-1 bg-amber-100/60 text-amber-700 text-xs font-bold rounded-lg border border-amber-200/40">
                          {menu.shift}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="px-3 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-extrabold rounded-xl shadow-[0_4px_14px_rgba(249,115,22,0.25)]">
                        ₹{menu.pricePerMeal} <span className="text-xs font-medium opacity-90">/meal</span>
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-650 font-medium mb-4 flex-grow leading-relaxed">{menu.description}</p>
                  
                  {/* Dynamic Subscribers Metrics Strip */}
                  <div className="grid grid-cols-3 gap-2.5 p-2 bg-orange-50/30 border border-orange-100/40 rounded-2xl text-[10px] font-bold text-center mb-4">
                    <div className="flex flex-col items-center justify-center p-1.5 bg-white/80 rounded-xl shadow-sm border border-orange-100/30">
                      <span className="text-gray-400 font-extrabold text-[9px] uppercase">Active</span>
                      <span className="text-orange-600 font-black text-sm">{menu.activeSubscribersCount || 0}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-1.5 bg-white/80 rounded-xl shadow-sm border border-orange-100/30">
                      <span className="text-gray-400 font-extrabold text-[9px] uppercase">Deliver Today</span>
                      <span className="text-emerald-600 font-black text-sm">{menu.deliverTodayCount || 0}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-1.5 bg-white/80 rounded-xl shadow-sm border border-orange-100/30">
                      <span className="text-gray-400 font-extrabold text-[9px] uppercase">Skipped Today</span>
                      <span className="text-rose-600 font-black text-sm">{menu.skippedTodayCount || 0}</span>
                    </div>
                  </div>

                  {/* Weekly Menu Display */}
                  <div className="mb-4 bg-orange-50/30 p-3 rounded-2xl border border-orange-100/40">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Utensils className="w-3 h-3 text-orange-500"/> Weekly Menu Plan
                    </p>
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                      {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                        const meal = menu.weeklyMenu?.[day];
                        if (!meal) return null;
                        return (
                          <div key={day} className="flex-shrink-0 bg-white border border-orange-100/20 px-3 py-2 rounded-xl min-w-[110px] shadow-sm">
                            <span className="text-[10px] font-bold text-orange-500 uppercase">{day.slice(0,3)}</span>
                            <p className="text-xs font-bold text-gray-800 mt-0.5 truncate">{meal}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="border-t border-orange-100/30 pt-4 flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 font-bold bg-orange-50 border border-orange-100/40 px-2.5 py-1.5 rounded-xl shrink-0 text-xs">
                        Per Meal: <span className="text-gray-900">₹{menu.pricePerMeal}</span>
                      </span>
                      
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setEditingMenu(menu)} 
                          className="text-gray-650 font-bold hover:text-orange-600 hover:bg-orange-50/60 border-2 border-orange-500/10 hover:border-orange-500/50 px-4 py-2 rounded-xl transition-all text-xs"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => setMenuToDelete(menu._id)} 
                          className="text-red-500 font-bold hover:text-white hover:bg-red-550 border-2 border-red-500/10 hover:border-red-500 px-4 py-2 rounded-xl transition-all text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                ))}
              </div>
            )}
          </div>

          {/* Today's Insights Sidebar (Takes up 1 part of grid) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white/90 backdrop-blur-md rounded-[2rem] border border-orange-100/50 shadow-[0_8px_30px_rgb(251,146,60,0.03)] overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                <h3 className="text-lg font-black tracking-tight mb-1">Today's Insights</h3>
                <p className="text-xs font-semibold text-white/80">New subscriptions purchased today</p>
              </div>
              
              <div className="p-6">
                {todayStats.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-gray-100">
                      <Star className="w-5 h-5 text-gray-300" />
                    </div>
                    <p className="text-sm font-bold text-gray-400">Loading insights...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {todayStats.map((stat, idx) => (
                      <div key={idx} className="group p-4 bg-slate-50 border border-slate-100 hover:border-orange-200 hover:bg-orange-50/30 rounded-2xl transition-all duration-300">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-sm font-bold text-gray-800 truncate pr-2 group-hover:text-orange-600 transition-colors">
                            {stat.title}
                          </h4>
                          <span className="shrink-0 bg-white shadow-sm border border-orange-100 w-8 h-8 rounded-full flex items-center justify-center font-black text-orange-500 text-sm">
                            {stat.subscribedTodayCount}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-orange-400 to-amber-400 h-1.5 rounded-full" 
                            style={{ width: stat.subscribedTodayCount > 0 ? '100%' : '0%' }}
                          ></div>
                        </div>
                        <p className="text-[10px] text-gray-500 font-bold mt-2">
                          {stat.subscribedTodayCount === 1 ? '1 customer subscribed today' : `${stat.subscribedTodayCount} customers subscribed today`}
                        </p>
                      </div>
                    ))}
                    
                    <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                      <p className="text-[11px] font-bold text-gray-400 mb-1">Total Subscriptions Today</p>
                      <p className="text-2xl font-black text-gray-900">
                        {todayStats.reduce((sum, item) => sum + item.subscribedTodayCount, 0)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
        </div>
      ) : (
        <div className="col-span-1 md:col-span-3 bg-white/90 backdrop-blur-md p-12 rounded-[2rem] shadow-sm border border-orange-100/50 flex flex-col items-center text-center mt-6">
          <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-6">
            <Utensils className="w-12 h-12 text-orange-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No menus created yet</h3>
          <p className="text-gray-550 font-medium max-w-md mb-6">You haven't added any tiffin services to your kitchen. Create your first menu to start receiving orders!</p>
          <button 
            onClick={() => setActiveTab('add-menu')} 
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-6 py-3 rounded-xl font-bold shadow-[0_4px_14px_rgba(249,115,22,0.3)] transition-all"
          >
            Create your first menu
          </button>
        </div>
      )}
    </div>
  );
}
