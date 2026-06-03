import React from 'react';
import { ShoppingBag, DollarSign, Coffee, Utensils, Users } from 'lucide-react';

export default function OverviewTab({ menus, setEditingMenu, setMenuToDelete, onViewSubscribers, setActiveTab }) {
  
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

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-orange-50 rounded-2xl">
            <ShoppingBag className="w-8 h-8 text-orange-500"/>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Active Subscriptions</p>
            <p className="text-3xl font-extrabold text-gray-900">{totalActiveSubscribers}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-green-50 rounded-2xl">
            <DollarSign className="w-8 h-8 text-green-500"/>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Monthly Revenue</p>
            <p className="text-3xl font-extrabold text-gray-900">₹{monthlyRevenue.toLocaleString('en-IN')}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-blue-50 rounded-2xl">
            <Coffee className="w-8 h-8 text-blue-500"/>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Active Menus</p>
            <p className="text-3xl font-extrabold text-gray-900">{menus.length}</p>
          </div>
        </div>
      </div>

      {/* Conditional Rendering for Menus */}
      {menus.length > 0 ? (
        <div className="mt-6 space-y-4">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Your Active Menus</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {menus.map((menu) => (
              <div 
                key={menu._id} 
                className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100 flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
              >
                {/* Decorative background shape */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-50 to-amber-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
                
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-extrabold text-xl text-gray-900 mb-2">{menu.title}</h4>
                    <div className="flex gap-2">
                      <span className="px-2.5 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-lg border border-orange-200">
                        {menu.foodType}
                      </span>
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-lg border border-amber-200">
                        {menu.shift}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="px-3 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-extrabold rounded-xl shadow-md shadow-orange-100">
                      ₹{menu.pricePerMeal} <span className="text-xs font-medium opacity-90">/meal</span>
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-4 flex-1">{menu.description}</p>
                
                {/* Dynamic Subscribers Metrics Strip */}
                <div className="grid grid-cols-3 gap-2 p-2 bg-slate-50 border border-slate-100/50 rounded-2xl text-[10px] font-bold text-center mb-4">
                  <div className="flex flex-col items-center justify-center p-1 bg-white rounded-xl shadow-inner border border-slate-100/50">
                    <span className="text-gray-400 font-extrabold text-[9px] uppercase">Active</span>
                    <span className="text-orange-600 font-black text-sm">{menu.activeSubscribersCount || 0}</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-1 bg-white rounded-xl shadow-inner border border-slate-100/50">
                    <span className="text-gray-400 font-extrabold text-[9px] uppercase">Deliver Today</span>
                    <span className="text-emerald-600 font-black text-sm">{menu.deliverTodayCount || 0}</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-1 bg-white rounded-xl shadow-inner border border-slate-100/50">
                    <span className="text-gray-400 font-extrabold text-[9px] uppercase">Skipped Today</span>
                    <span className="text-rose-600 font-black text-sm">{menu.skippedTodayCount || 0}</span>
                  </div>
                </div>

                {/* Weekly Menu Display */}
                <div className="mb-4 bg-gray-50/80 p-3 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Utensils className="w-3 h-3"/> Weekly Menu Plan
                  </p>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                      const meal = menu.weeklyMenu?.[day];
                      if (!meal) return null;
                      return (
                        <div key={day} className="flex-shrink-0 bg-white border border-gray-100 px-3 py-2 rounded-xl min-w-[110px] shadow-sm">
                          <span className="text-[10px] font-bold text-orange-500 uppercase">{day.slice(0,3)}</span>
                          <p className="text-xs font-bold text-gray-800 mt-0.5 truncate">{meal}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 flex justify-between text-sm items-center gap-2">
                  <span className="text-gray-500 font-bold bg-gray-50 border border-gray-100 px-2.5 py-1.5 rounded-xl shrink-0">
                    Per Meal: <span className="text-gray-900">₹{menu.pricePerMeal}</span>
                  </span>
                  
                  <div className="flex gap-1.5 items-center flex-1 justify-end">
                    <button 
                      onClick={() => onViewSubscribers(menu)} 
                      className="text-orange-600 font-bold bg-orange-50 hover:bg-orange-100 border border-orange-100 hover:border-orange-200 px-3 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1 text-xs"
                      title="View Active Subscribers list"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Subscribers</span>
                    </button>
                    
                    <button 
                      onClick={() => setEditingMenu(menu)} 
                      className="text-gray-500 font-bold hover:text-orange-600 hover:bg-orange-50 border border-gray-200 hover:border-orange-200 px-3 py-2 rounded-xl transition-all text-xs"
                    >
                      Edit
                    </button>
                    
                    <button 
                      onClick={() => setMenuToDelete(menu._id)} 
                      className="text-red-500 font-bold hover:text-white hover:bg-red-500 border border-red-200 hover:border-red-500 px-3 py-2 rounded-xl transition-all text-xs"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="col-span-1 md:col-span-3 bg-white p-12 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-center text-center mt-6">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <Utensils className="w-12 h-12 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No menus created yet</h3>
          <p className="text-gray-500 max-w-md mb-6">You haven't added any tiffin services to your kitchen. Create your first menu to start receiving orders!</p>
          <button 
            onClick={() => setActiveTab('add-menu')} 
            className="bg-white border-2 border-orange-500 text-orange-600 px-6 py-3 rounded-xl font-bold hover:bg-orange-50 transition-all"
          >
            Create your first menu
          </button>
        </div>
      )}
    </div>
  );
}
