import React from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

export default function EditMenuModal({ editingMenu, setEditingMenu, handleUpdateMenu }) {
  if (!editingMenu) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-extrabold text-gray-900">Edit Menu: {editingMenu.title}</h2>
            <button 
              onClick={() => setEditingMenu(null)} 
              className="p-2 bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <form className="space-y-8" onSubmit={handleUpdateMenu}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Basic Details */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Service Title</label>
                  <input 
                    name="title" 
                    defaultValue={editingMenu.title} 
                    required 
                    type="text" 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all" 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Food Type</label>
                    <select name="foodType" defaultValue={editingMenu.foodType} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none">
                      <option>Veg</option>
                      <option>Non-Veg</option>
                      <option>Vegan</option>
                      <option>Jain</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Shift</label>
                    <select name="shift" defaultValue={editingMenu.shift} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none">
                      <option>Lunch</option>
                      <option>Dinner</option>
                      <option>Breakfast</option>
                      <option>All Day</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Price Per Meal (₹)</label>
                  <input 
                    name="pricePerMeal" 
                    defaultValue={editingMenu.pricePerMeal} 
                    required 
                    type="number" 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Description</label>
                  <textarea 
                    name="description" 
                    defaultValue={editingMenu.description} 
                    required 
                    rows="4" 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all resize-none"
                  ></textarea>
                </div>
              </div>

              {/* Weekly Menu Planner */}
              <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-500"/> Weekly Menu Plan
                </h3>
                <div className="space-y-3">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                    const dbKey = day.toLowerCase();
                    return (
                      <div key={day} className="flex items-center gap-3">
                        <span className="w-24 text-sm font-semibold text-gray-700">{day}</span>
                        <input 
                          name={dbKey} 
                          defaultValue={editingMenu.weeklyMenu?.[dbKey] || ""} 
                          type="text" 
                          className="flex-1 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" 
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-end gap-4">
              <button 
                type="button" 
                onClick={() => setEditingMenu(null)} 
                className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
