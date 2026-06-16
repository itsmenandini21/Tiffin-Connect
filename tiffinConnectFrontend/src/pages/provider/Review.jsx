import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Calendar, MessageSquare, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Review({ menu, onClose }) {
  const [loading, setLoading] = useState(true);
  const [campaignReviews, setCampaignReviews] = useState([]);
  const [expandedCampaigns, setExpandedCampaigns] = useState({});

  useEffect(() => {
    const fetchReviews = async () => {
      if (!menu) return;
      try {
        setLoading(true);
        const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
        const response = await fetch(`${API_URL}/review/getAll/${menu._id}`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        });
        const data = await response.json();
        if (response.ok) {
          setCampaignReviews(data);
          
          // Auto-expand the first campaign if any exist
          if (data.length > 0) {
            setExpandedCampaigns({ [data[0].campaignId]: true });
          }
        } else {
          toast.error(data.message || "Failed to fetch reviews");
        }
      } catch (err) {
        console.error("Error fetching reviews:", err);
        toast.error("Could not connect to the server");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [menu]);

  if (!menu) return null;

  // Calculate overall rating from all campaign responses
  const allRatings = campaignReviews.flatMap(campaign => campaign.reviews.map(r => r.rating));
  const overallAvg = allRatings.length > 0 
    ? (allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length).toFixed(1) 
    : "0.0";
  const totalReviewsCount = allRatings.length;

  const toggleExpand = (campaignId) => {
    setExpandedCampaigns(prev => ({
      ...prev,
      [campaignId]: !prev[campaignId]
    }));
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5" aria-label={`Rating: ${rating} stars`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3.5 h-3.5 ${
              star <= rating
                ? 'fill-amber-400 text-amber-400'
                : 'text-gray-200'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
      />

      {/* Sliding Drawer Container */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative w-full max-w-lg bg-white h-screen shadow-2xl flex flex-col z-10"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50/30 flex justify-between items-center">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-600 bg-amber-100 px-2.5 py-0.5 rounded-full">
              Customer Feedbacks & Reviews ⭐
            </span>
            <h2 className="text-xl font-black text-gray-800 tracking-tight mt-1 truncate max-w-[320px]">
              {menu.title}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-bold text-gray-400">Overall Rating:</span>
              <div className="flex items-center gap-1 bg-amber-500 text-white px-2 py-0.5 rounded-lg text-xs font-black shadow-sm shadow-amber-200">
                <span>{overallAvg}</span>
                <Star className="w-3 h-3 fill-white text-white" />
              </div>
              <span className="text-[11px] text-gray-400 font-bold">({totalReviewsCount} responses)</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-orange-50 hover:text-orange-600 text-gray-400 transition-colors shadow-sm focus:outline-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-3">
              <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
              <p className="text-sm font-semibold text-gray-500">Loading reviews...</p>
            </div>
          ) : campaignReviews.length === 0 ? (
            <div className="text-center py-20 space-y-3">
              <span className="text-4xl">💭</span>
              <h4 className="text-sm font-bold text-gray-800">No reviews received yet</h4>
              <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
                When you deploy feedback campaigns for this menu option and subscribers respond, their ratings and suggestions will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {campaignReviews.map((campaign) => {
                const isExpanded = !!expandedCampaigns[campaign.campaignId];
                
                // Calculate campaign specific averages
                const campRatings = campaign.reviews.map(r => r.rating);
                const campAvg = campRatings.length > 0 
                  ? (campRatings.reduce((sum, r) => sum + r, 0) / campRatings.length).toFixed(1) 
                  : "0.0";

                return (
                  <div 
                    key={campaign.campaignId} 
                    className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm transition-all duration-300 hover:shadow-md"
                  >
                    {/* Campaign Accordion Header */}
                    <button
                      onClick={() => toggleExpand(campaign.campaignId)}
                      className="w-full p-4 flex justify-between items-start gap-3 bg-slate-50/50 hover:bg-slate-50 transition-colors text-left border-b border-gray-100"
                    >
                      <div className="space-y-1 flex-1">
                        <h4 className="text-sm font-extrabold text-gray-800 leading-snug">
                          {campaign.question}
                        </h4>
                        <div className="flex flex-wrap gap-2 items-center text-[10px] font-bold text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(campaign.campaignDate).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                          <span className="text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100">
                            {campaign.reviews.length} responses
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center gap-1 bg-amber-500 text-white px-2 py-0.5 rounded-lg text-xs font-black shadow-sm">
                          <span>{campAvg}</span>
                          <Star className="w-3 h-3 fill-white text-white" />
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </button>

                    {/* Campaign Reviews List (Accordion Content) */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="divide-y divide-gray-100 overflow-hidden"
                        >
                          <div className="p-4 space-y-3 bg-white">
                            {campaign.reviews.length === 0 ? (
                              <p className="text-xs text-gray-400 italic text-center py-2">
                                Feedback is active, but no responses submitted yet.
                              </p>
                            ) : (
                              campaign.reviews.map((rev) => (
                                <div key={rev.reviewId} className="py-2 first:pt-0 last:pb-0 space-y-1.5">
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs font-extrabold text-gray-800">
                                      {rev.userName}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      {renderStars(rev.rating)}
                                      <span className="text-[9px] text-gray-400 font-semibold">
                                        {new Date(rev.date).toLocaleDateString('en-IN', {
                                          day: 'numeric',
                                          month: 'short'
                                        })}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  {rev.comment ? (
                                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex gap-2 items-start">
                                      <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                      <p className="text-xs font-medium text-gray-600 leading-relaxed italic">
                                        "{rev.comment}"
                                      </p>
                                    </div>
                                  ) : (
                                    <p className="text-[10px] text-gray-400 italic pl-1">No written suggestion provided.</p>
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
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
