import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Calendar, MessageSquare, ChevronDown, ChevronUp, Loader2, Inbox, ShoppingBag, Crown, TrendingUp, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReviewsTab({ menus }) {
  const [selectedMenuId, setSelectedMenuId] = useState('');
  const [loading, setLoading] = useState(false);
  const [campaignReviews, setCampaignReviews] = useState([]);
  const [expandedCampaigns, setExpandedCampaigns] = useState({});

  // Performance data for all menus
  const [menuPerformance, setMenuPerformance] = useState([]);
  const [loadingPerformance, setLoadingPerformance] = useState(true);

  // Auto-select first menu
  useEffect(() => {
    if (menus && menus.length > 0) {
      if (!selectedMenuId || !menus.find(m => m._id === selectedMenuId)) {
        setSelectedMenuId(menus[0]._id);
      }
    }
  }, [menus, selectedMenuId]);

  const activeMenu = menus.find(m => m._id === selectedMenuId);

  // 1. Fetch performance data for all menus in parallel to draw comparison charts
  useEffect(() => {
    const fetchAllPerformance = async () => {
      if (!menus || menus.length === 0) return;
      try {
        setLoadingPerformance(true);
        const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
        
        const perfData = await Promise.all(
          menus.map(async (menu) => {
            try {
              const res = await fetch(`${API_URL}/review/getAll/${menu._id}`, {
                headers: {
                  "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
              });
              const data = await res.json();
              if (res.ok) {
                const allRatings = data.flatMap(c => c.reviews.map(r => r.rating));
                const avg = allRatings.length > 0
                  ? Number((allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length).toFixed(1))
                  : 0.0;
                return {
                  _id: menu._id,
                  title: menu.title,
                  shift: menu.shift,
                  averageRating: avg,
                  totalReviews: allRatings.length
                };
              }
            } catch (err) {
              console.error(`Error fetching reviews for menu ${menu._id}:`, err);
            }
            return {
              _id: menu._id,
              title: menu.title,
              shift: menu.shift,
              averageRating: 0.0,
              totalReviews: 0
            };
          })
        );
        
        setMenuPerformance(perfData);
      } catch (err) {
        console.error("Error fetching performance data:", err);
      } finally {
        setLoadingPerformance(false);
      }
    };

    fetchAllPerformance();
  }, [menus]);

  // 2. Fetch specific reviews for selected menu
  useEffect(() => {
    const fetchReviews = async () => {
      if (!selectedMenuId) return;
      try {
        setLoading(true);
        const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
        const response = await fetch(`${API_URL}/review/getAll/${selectedMenuId}`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        });
        const data = await response.json();
        if (response.ok) {
          setCampaignReviews(data);
          
          if (data.length > 0) {
            setExpandedCampaigns({ [data[0].campaignId]: true });
          } else {
            setExpandedCampaigns({});
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
  }, [selectedMenuId]);

  if (menus.length === 0) {
    return (
      <div className="bg-white p-12 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-dashed border-gray-200">
          <Inbox className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">No Active Menus</h3>
        <p className="text-gray-500 mt-2 max-w-sm">Create a menu in the dashboard to start collecting reviews.</p>
      </div>
    );
  }

  // Calculate sorted performance for comparative graph
  const sortedPerformance = [...menuPerformance].sort((a, b) => b.averageRating - a.averageRating);
  const bestService = sortedPerformance.length > 0 && sortedPerformance[0].averageRating > 0
    ? sortedPerformance[0]
    : null;

  const activeMenuPerf = menuPerformance.find(p => p._id === selectedMenuId);
  const overallAvg = activeMenuPerf?.averageRating.toFixed(1) || "0.0";
  const totalReviewsCount = activeMenuPerf?.totalReviews || 0;

  const toggleExpand = (campaignId) => {
    setExpandedCampaigns(prev => ({
      ...prev,
      [campaignId]: !prev[campaignId]
    }));
  };

  const handleDeleteReview = async (reviewId, campaignId) => {
    if (!window.confirm("Are you sure you want to remove this review? This action cannot be undone.")) {
      return;
    }
    
    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
      const response = await fetch(`${API_URL}/review/delete/${reviewId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      const data = await response.json();
      if (response.ok) {
        toast.success("Review removed successfully");
        
        // Update local reviews list
        setCampaignReviews(prev => 
          prev.map(campaign => {
            if (campaign.campaignId === campaignId) {
              return {
                ...campaign,
                reviews: campaign.reviews.filter(r => r.reviewId !== reviewId)
              };
            }
            return campaign;
          }).filter(campaign => campaign.reviews.length > 0)
        );

        // Fetch performance data again to update leaderboard
        if (menus && menus.length > 0) {
          const perfRes = await fetch(`${API_URL}/review/getAll/${selectedMenuId}`, {
            headers: {
              "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
          });
          const perfData = await perfRes.json();
          if (perfRes.ok) {
            const allRatings = perfData.flatMap(c => c.reviews.map(r => r.rating));
            const avg = allRatings.length > 0
              ? Number((allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length).toFixed(1))
              : 0.0;
              
            setMenuPerformance(prev => 
              prev.map(p => p._id === selectedMenuId ? { ...p, averageRating: avg, totalReviews: allRatings.length } : p)
            );
          }
        }
      } else {
        toast.error(data.message || "Failed to delete review");
      }
    } catch (err) {
      console.error("Error deleting review:", err);
      toast.error("Could not connect to the server");
    }
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
    <div className="space-y-8">
      
      {/* Selector and Grid Layout wrapper */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Tiffin Performance Analytics (Leaderboard & Comparative bar chart) */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 space-y-6">
          <div>
            <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-500" /> Menu Performance
            </h3>
            <p className="text-xs text-gray-400 font-semibold mt-0.5">Compare ratings across your active tiffin services.</p>
          </div>

          {loadingPerformance ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-2">
              <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
              <span className="text-[10px] font-bold text-gray-400">Comparing menus...</span>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Highlight Best Service */}
              {bestService ? (
                <button
                  onClick={() => setSelectedMenuId(bestService._id)}
                  className={`w-full text-left bg-gradient-to-br from-amber-500/10 to-orange-500/10 border p-4 rounded-2xl flex items-center justify-between gap-4 transition-all duration-300 hover:shadow-sm hover:scale-[1.01] ${
                    bestService._id === selectedMenuId
                      ? 'border-amber-400 ring-2 ring-amber-400/20 shadow-sm'
                      : 'border-amber-200 hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-amber-200 shrink-0">
                      <Crown className="w-5 h-5 fill-white text-white" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] uppercase tracking-wider font-extrabold text-amber-700 bg-amber-200/50 px-2 py-0.5 rounded-md border border-amber-200">
                        Top Rated Tiffin 🏆
                      </span>
                      <h4 className="text-xs font-black text-gray-800 mt-1.5 truncate max-w-[150px]">{bestService.title}</h4>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-base font-black text-amber-600">{bestService.averageRating}</span>
                    <span className="text-[10px] text-gray-400 font-bold">/5.0</span>
                  </div>
                </button>
              ) : (
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-center">
                  <span className="text-[10px] font-bold text-gray-400">No comparative statistics available yet.</span>
                </div>
              )}

              {/* Leaderboard Progress Bars */}
              <div className="space-y-3">
                <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider px-1">
                  Rankings Leaderboard
                </label>
                
                {sortedPerformance.map((item, index) => {
                  const isSelected = item._id === selectedMenuId;
                  return (
                    <button
                      key={item._id}
                      onClick={() => setSelectedMenuId(item._id)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-300 flex flex-col gap-2 group ${
                        isSelected
                          ? 'bg-orange-50/40 border-orange-200 shadow-sm'
                          : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-extrabold text-gray-800 flex items-center gap-1.5 truncate max-w-[170px]">
                          <span className="text-[10px] text-gray-400 font-black">#{index + 1}</span>
                          {item.title}
                        </span>
                        <span className="font-black text-orange-600 flex items-center gap-0.5 shrink-0">
                          {item.averageRating > 0 ? `${item.averageRating} ★` : 'No ratings'}
                        </span>
                      </div>
                      
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${item.averageRating > 0 ? (item.averageRating / 5) * 100 : 0}%` }}
                        />
                      </div>
                      
                      <div className="flex justify-between items-center text-[9px] font-bold text-gray-400">
                        <span className="uppercase">{item.shift} Shift</span>
                        <span>{item.totalReviews} reviews</span>
                      </div>
                    </button>
                  );
                })}
              </div>

            </div>
          )}
        </div>

        {/* Right Column: Detailed Reviews list for selected menu */}
        <div className="xl:col-span-2 space-y-6">
          {activeMenu && (
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 space-y-6">
              
              {/* Detailed Header Info */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-gray-100">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-orange-600 bg-orange-100 px-2.5 py-0.5 rounded-full">
                    {activeMenu.shift} Service 🍱
                  </span>
                  <h2 className="text-xl font-black text-gray-800 tracking-tight mt-2">
                    {activeMenu.title}
                  </h2>
                  <p className="text-xs font-bold text-gray-400 mt-0.5">
                    Viewing ratings and feedback campaigns details for this selection.
                  </p>
                </div>

                <div className="flex gap-3 shrink-0">
                  <div className="bg-amber-50 border border-amber-100 px-3.5 py-2.5 rounded-2xl flex items-center gap-2.5">
                    <div className="w-10 h-10 bg-amber-500 text-white rounded-xl flex items-center justify-center font-black text-sm shadow-md shadow-amber-200">
                      <span>{overallAvg}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-0.5">
                        {renderStars(Math.round(Number(overallAvg)))}
                      </div>
                      <span className="text-[9px] text-amber-800 font-extrabold">Average score</span>
                    </div>
                  </div>

                  <div className="bg-orange-50 border border-orange-100 px-3.5 py-2.5 rounded-2xl flex items-center gap-2.5">
                    <div className="w-10 h-10 bg-orange-500 text-white rounded-xl flex items-center justify-center font-black text-sm shadow-md shadow-orange-200">
                      <span>{totalReviewsCount}</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-orange-950">Responses</p>
                      <span className="text-[9px] text-orange-600 font-extrabold">Active total</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Collapsible Reviews List */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-3">
                  <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                  <p className="text-sm font-semibold text-gray-500">Loading reviews...</p>
                </div>
              ) : campaignReviews.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <span className="text-4xl">💭</span>
                  <h4 className="text-base font-bold text-gray-800">No reviews received yet</h4>
                  <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
                    Once subscribers answer your feedback questions, their responses and comments will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {campaignReviews.map((campaign) => {
                    const isExpanded = !!expandedCampaigns[campaign.campaignId];
                    const campRatings = campaign.reviews.map(r => r.rating);
                    const campAvg = campRatings.length > 0 
                      ? (campRatings.reduce((sum, r) => sum + r, 0) / campRatings.length).toFixed(1) 
                      : "0.0";

                    return (
                      <div 
                        key={campaign.campaignId} 
                        className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm transition-all duration-300 hover:shadow-md"
                      >
                        {/* Accordion Header */}
                        <button
                          onClick={() => toggleExpand(campaign.campaignId)}
                          className="w-full p-5 flex justify-between items-start gap-4 bg-slate-50/50 hover:bg-slate-50 transition-colors text-left border-b border-gray-100"
                        >
                          <div className="space-y-1.5 flex-1">
                            <h4 className="text-sm font-black text-gray-800 leading-snug">
                              "{campaign.question}"
                            </h4>
                            <div className="flex flex-wrap gap-2 items-center text-[10px] font-bold text-gray-400">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {new Date(campaign.campaignDate).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </span>
                              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                              <span className="text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-md border border-orange-100">
                                {campaign.reviews.length} responses
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3.5 shrink-0">
                            <div className="flex items-center gap-1 bg-amber-500 text-white px-2.5 py-0.5 rounded-lg text-xs font-black shadow-sm">
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

                        {/* Accordion Content */}
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25 }}
                              className="divide-y divide-gray-100 overflow-hidden"
                            >
                              <div className="p-5 space-y-4 bg-white">
                                {campaign.reviews.length === 0 ? (
                                  <p className="text-xs text-gray-400 italic text-center py-2">
                                    Feedback is active, but no responses submitted yet.
                                  </p>
                                ) : (
                                  campaign.reviews.map((rev) => (
                                    <div key={rev.reviewId} className="py-3 first:pt-0 last:pb-0 space-y-2">
                                      <div className="flex justify-between items-center">
                                        <span className="text-xs font-extrabold text-gray-800">
                                          {rev.userName}
                                        </span>
                                        <div className="flex items-center gap-2.5">
                                          {renderStars(rev.rating)}
                                          <span className="text-[9px] text-gray-400 font-bold">
                                            {new Date(rev.date).toLocaleDateString('en-IN', {
                                              day: 'numeric',
                                              month: 'short'
                                            })}
                                          </span>
                                          <button
                                            onClick={() => handleDeleteReview(rev.reviewId, campaign.campaignId)}
                                            className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded-lg transition-colors ml-1"
                                            title="Remove Review"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </div>
                                      
                                      {rev.comment ? (
                                        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex gap-2 items-start">
                                          <MessageSquare className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                          <p className="text-xs font-semibold text-gray-600 leading-relaxed italic">
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
          )}
        </div>

      </div>
    </div>
  );
}
