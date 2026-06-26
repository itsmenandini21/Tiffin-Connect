import React from 'react';
import { Clock } from 'lucide-react';

export default function AddMenuTab({ handleAddMenu, setActiveTab }) {
  return (
    <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100">
      <form className="space-y-8" onSubmit={handleAddMenu}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Basic Details */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Service Title</label>
              <input 
                name="title" 
                required 
                type="text" 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all" 
                placeholder="e.g. Premium North Indian Lunch" 
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Food Type</label>
                <select name="foodType" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none">
                  <option>Veg</option>
                  <option>Non-Veg</option>
                  <option>Vegan</option>
                  <option>Jain</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Shift</label>
                <select name="shift" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none">
                  <option>Lunch</option>
                  <option>Dinner</option>
                  <option>Breakfast</option>
                  <option>All Day</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Start Time</label>
                <input 
                  name="startTime" 
                  required 
                  type="time" 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">End Time</label>
                <input 
                  name="endTime" 
                  required 
                  type="time" 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Price Per Meal (₹)</label>
              <input 
                name="pricePerMeal" 
                required 
                type="number" 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all" 
                placeholder="150" 
              />
            </div>
            
            {/* Compact Photo Uploads */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                📸 Menu Photos
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-orange-50 rounded-xl border border-orange-100">
                  <p className="text-xs font-bold text-gray-700 mb-1">Cover Image</p>
                  <input 
                    type="file" 
                    name="coverImage" 
                    accept="image/*"
                    className="w-full text-[10px] text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200"
                  />
                </div>
                <div className="p-3 bg-orange-50 rounded-xl border border-orange-100">
                  <p className="text-xs font-bold text-gray-700 mb-0.5">Menu Gallery (Up to 5)</p>
                  <p className="text-[9px] font-bold text-orange-600 mb-1 leading-tight">Important: Select all images together at once (Ctrl+Click)</p>
                  <input 
                    type="file" 
                    name="menuImages" 
                    accept="image/*"
                    multiple
                    className="w-full text-[10px] text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Description</label>
              <textarea 
                name="description" 
                required 
                rows="4" 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all resize-none" 
                placeholder="Describe what makes your food special..."
              ></textarea>
            </div>
          </div>

          {/* Weekly Menu Planner */}
          <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500"/> Weekly Menu Plan
            </h3>
            <div className="space-y-3">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                <div key={day} className="flex items-center gap-3">
                  <span className="w-24 text-sm font-semibold text-gray-700">{day}</span>
                  <input 
                    name={day.toLowerCase()} 
                    type="text" 
                    required
                    className="flex-1 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" 
                    placeholder="e.g. Rajma Chawal, Roti, Salad" 
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 flex justify-end gap-4">
          <button 
            type="button" 
            onClick={() => setActiveTab('overview')} 
            className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            Publish Menu
          </button>
        </div>
      </form>
    </div>
  );
}
