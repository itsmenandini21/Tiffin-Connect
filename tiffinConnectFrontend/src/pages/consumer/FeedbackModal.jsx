import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageSquare, X, Loader2, ChefHat } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FeedbackModal({ feedback, onSubmit, onClose }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a star rating");
      return;
    }

    try {
      setSubmitting(true);
      const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
      
      const payload = {
        feedbackId: feedback._id,
        tiffinServiceId: feedback.tiffinServiceId,
        rating,
        comment: comment.trim()
      };

      const response = await fetch(`${API_URL}/review/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("Thank you for your feedback!");
        onSubmit(feedback._id); // Notify parent component to pop this feedback from the queue
      } else {
        toast.error(data.message || "Failed to submit review");
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not connect to the server");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
      />

      {/* Modal card */}
      <motion.div
        initial={{ scale: 0.95, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 30, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 250 }}
        className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-[#FF7A00]/10 p-8 z-10 overflow-hidden flex flex-col gap-6"
      >
        {/* Top decorative gradient bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#FF7A00] to-[#E56700]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-[#6B7280] hover:bg-[#FFF8F1] hover:text-[#FF7A00] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Section */}
        <div className="flex flex-col items-center text-center space-y-3 mt-4">
          <div className="p-4 bg-[#FF7A00]/10 rounded-2xl shadow-inner border border-[#FF7A00]/15">
            <ChefHat className="w-8 h-8 text-[#FF7A00] animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl font-black text-[#2D2D2D] tracking-tight">Your Chef is Asking! 🍱</h3>
            <p className="text-xs text-[#6B7280] font-bold mt-1">Please spare a moment to rate today's meal.</p>
          </div>
        </div>

        {/* Question Bubble */}
        <div className="bg-[#FF7A00]/5 border border-[#FF7A00]/10 p-5 rounded-2xl text-center shadow-inner">
          <p className="text-sm font-extrabold text-[#FF7A00] leading-relaxed italic">
            "{feedback.question}"
          </p>
        </div>

        {/* Interactive Rating Area */}
        <form onSubmit={handleSubmit} className="space-y-6 flex flex-col">
          
          {/* Star Selection Row */}
          <div className="flex justify-center items-center gap-3">
            {[1, 2, 3, 4, 5].map((star) => {
              const isActive = star <= (hoverRating || rating);
              return (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="transition-all transform hover:scale-125 focus:outline-none"
                >
                  <Star
                    className={`w-9 h-9 transition-all ${
                      isActive
                        ? 'fill-amber-400 text-amber-400 drop-shadow-md'
                        : 'text-gray-200'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Comment input textarea */}
          <div className="relative">
            <div className="absolute top-3.5 left-3 pointer-events-none">
              <MessageSquare className="w-4.5 h-4.5 text-[#6B7280]" />
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows="3"
              className="w-full pl-10 pr-4 py-3 bg-white border border-[#FF7A00]/20 rounded-2xl focus:ring-2 focus:ring-[#FF7A00] focus:border-[#FF7A00] outline-none text-xs font-semibold leading-relaxed transition-all resize-none placeholder:text-[#6B7280]/60 text-[#2D2D2D]"
              placeholder="Any suggestions for improvement? (e.g. Less spicy, more salt, delicious Paneer...) (Optional)"
            ></textarea>
          </div>

          {/* Action Row */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 bg-[#FFF8F1] hover:bg-[#FF7A00]/5 text-[#6B7280] font-bold rounded-2xl text-xs border border-[#FF7A00]/10 transition-colors"
            >
              Skip
            </button>
            <button
              type="submit"
              disabled={rating === 0 || submitting}
              className="flex-1 py-3.5 bg-gradient-to-r from-[#FF7A00] to-[#E56700] hover:from-[#E56700] hover:to-[#FF7A00] disabled:opacity-40 text-white font-bold rounded-2xl text-xs shadow-lg shadow-[#FF7A00]/10 flex items-center justify-center gap-2 transition-all"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit Feedback 🧡</span>
              )}
            </button>
          </div>

        </form>
      </motion.div>
    </div>
  );
}
