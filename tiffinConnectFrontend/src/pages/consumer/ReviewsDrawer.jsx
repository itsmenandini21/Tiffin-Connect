import React, { useState, useEffect } from 'react';
import { X, Star, Loader } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ReviewsDrawer({ kitchen, onClose }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (kitchen?._id) {
      const fetchReviews = async () => {
        setLoading(true);
        try {
          const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
          const token = localStorage.getItem("token");
          const response = await fetch(`${API_URL}/review/public/${kitchen._id}`, {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });
          const data = await response.json();
          if (response.ok) {
            setReviews(data);
          } else {
            console.error("Failed to fetch reviews:", data.message);
          }
        } catch (err) {
          console.error("Error fetching reviews:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchReviews();
    }
  }, [kitchen?._id]);

  // Fallback rating stats
  const ratingVal = kitchen?.rating || 4.8;
  const totalReviewsCount = reviews.length || kitchen?.ordersCount || 50;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Translucent overlay backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
      />

      {/* Side Drawer Panel */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 350, damping: 32 }}
        className="relative w-full max-w-md h-full bg-white/95 backdrop-blur-md shadow-2xl border-l border-gray-150 flex flex-col z-10 overflow-hidden"
      >
        {/* Header section */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-orange-50/50 to-amber-50/30">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-orange-600 bg-orange-100 px-2.5 py-0.5 rounded-full">
              Customer Feedbacks
            </span>
            <h2 className="text-xl font-black text-gray-800 tracking-tight mt-1.5 truncate max-w-[280px]">
              {kitchen?.serviceName || "Kitchen Reviews"}
            </h2>
            <p className="text-[11px] text-gray-400 font-bold">🧑‍🍳 Managed by {kitchen?.providerId?.name || "Expert Home Chef"}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-orange-50 hover:text-orange-600 text-gray-400 transition-colors shadow-sm focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Reviews Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Star breakdown details card */}
          <div className="grid grid-cols-3 gap-4 items-center bg-slate-50 border border-slate-100 p-5 rounded-2xl">
            <div className="text-center border-r border-slate-200 py-1 flex flex-col items-center justify-center">
              <h4 className="text-4xl font-black text-gray-800">{ratingVal}</h4>
              <div className="flex gap-0.5 my-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < Math.floor(ratingVal) ? 'text-amber-500 fill-amber-500' : 'text-gray-200'
                    }`}
                  />
                ))}
              </div>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-1">
                {totalReviewsCount} ratings
              </p>
            </div>

            <div className="col-span-2 space-y-1.5 text-[10px] font-bold text-gray-500 pl-2">
              {/* 5 Star */}
              <div className="flex items-center gap-2">
                <span className="w-9 shrink-0">5 Star</span>
                <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '85%' }} />
                </div>
                <span className="w-6 text-right text-gray-400">85%</span>
              </div>
              {/* 4 Star */}
              <div className="flex items-center gap-2">
                <span className="w-9 shrink-0">4 Star</span>
                <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '10%' }} />
                </div>
                <span className="w-6 text-right text-gray-400">10%</span>
              </div>
              {/* 3 Star */}
              <div className="flex items-center gap-2">
                <span className="w-9 shrink-0">3 Star</span>
                <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '3%' }} />
                </div>
                <span className="w-6 text-right text-gray-400">3%</span>
              </div>
              {/* 2 Star */}
              <div className="flex items-center gap-2">
                <span className="w-9 shrink-0">2 Star</span>
                <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '2%' }} />
                </div>
                <span className="w-6 text-right text-gray-400">2%</span>
              </div>
            </div>
          </div>

          {/* Reviews list */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader className="w-7 h-7 text-orange-500 animate-spin" />
              <p className="text-xs text-gray-400 font-bold">Loading public reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 bg-gray-50/50 rounded-2xl border border-gray-100/60 space-y-2">
              <span className="text-3xl">🍲</span>
              <h4 className="text-sm font-bold text-gray-700">No public reviews yet</h4>
              <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
                This kitchen has not received any feedback campaign reviews yet. Be the first to subscribe and share your experience!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev) => {
                const userInitial = rev.userName?.charAt(0).toUpperCase() || "A";
                return (
                  <div key={rev.reviewId} className="p-4.5 rounded-2xl border border-gray-100 bg-white hover:border-orange-100/50 transition-all flex gap-3.5 items-start shadow-sm">
                    {/* User Initials Avatar */}
                    <div className="w-9 h-9 rounded-xl bg-orange-100/60 text-orange-700 font-extrabold text-xs flex items-center justify-center shrink-0">
                      {userInitial}
                    </div>
                    
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2 flex-wrap">
                        <div className="min-w-0">
                          <h5 className="text-xs font-black text-gray-800 truncate">{rev.userName}</h5>
                          <div className="flex gap-0.5 mt-0.5">
                            {[...Array(5)].map((_, index) => (
                              <Star
                                key={index}
                                className={`w-2.5 h-2.5 ${
                                  index < rev.rating ? 'text-amber-500 fill-amber-500' : 'text-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-[9px] text-gray-400 font-semibold shrink-0">
                          {new Date(rev.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                        </span>
                      </div>

                      {/* Question badge tag */}
                      <div className="text-[9px] uppercase font-extrabold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-100/40 inline-block truncate max-w-full">
                        For: "{rev.question}"
                      </div>

                      {/* Comment text */}
                      <p className="text-xs text-gray-600 font-medium leading-relaxed italic bg-slate-50/60 p-2.5 rounded-xl border border-slate-100/50 mt-1.5">
                        "{rev.comment}"
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
