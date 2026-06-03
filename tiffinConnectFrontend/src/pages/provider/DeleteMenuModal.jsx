import React from 'react';
import { motion } from 'framer-motion';
import { Utensils } from 'lucide-react';

export default function DeleteMenuModal({ menuToDelete, setMenuToDelete, handleDeleteMenu }) {
  if (!menuToDelete) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-[2rem] shadow-2xl p-8 max-w-sm w-full text-center"
      >
        <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Utensils className="w-10 h-10 text-orange-500" />
        </div>
        <h3 className="text-2xl font-extrabold text-gray-900 mb-2">Delete Menu?</h3>
        <p className="text-gray-500 mb-8">Are you sure you want to remove this tiffin service? This action cannot be undone.</p>
        <div className="flex gap-4">
          <button 
            onClick={() => setMenuToDelete(null)} 
            className="flex-1 py-3 text-gray-700 font-bold bg-gray-50 hover:bg-gray-100 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={handleDeleteMenu} 
            className="flex-1 py-3 text-white font-bold bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg hover:shadow-xl hover:-translate-y-0.5 rounded-xl transition-all"
          >
            Yes, Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
}
