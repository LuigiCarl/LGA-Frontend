import { MessageSquare, Star, Send, X } from 'lucide-react';
import { useState } from 'react';
import { HeaderActions } from './HeaderActions';
import { feedbackAPI } from '../lib/api';

export function Feedback() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject || !message || rating === 0) {
      setError('Please fill in all fields and provide a rating');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await feedbackAPI.submit({
        subject,
        message,
        rating,
      });

      setShowSuccessModal(true);

      // Reset form
      setSubject('');
      setMessage('');
      setRating(0);
    } catch (err: any) {
      console.error('Failed to submit feedback:', err);
      setError(err.response?.data?.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 bg-white dark:bg-[#0A0A0A] border-b border-black/10 dark:border-white/10 px-4 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-3 lg:hidden mb-4">
          <div className="flex items-center gap-3">
            <img 
              src="/icon.png" 
              alt="FinanEase Logo" 
              className="w-10 h-10 object-contain"
            />
            <h1 className="text-[20px] leading-7 text-[#0A0A0A] dark:text-white">FinanEase</h1>
          </div>
          <div className="flex items-center gap-2">
            <HeaderActions />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl leading-8 text-[#0A0A0A] dark:text-white">Send Feedback</h2>
          </div>
          <div className="hidden lg:flex items-center gap-2">
            <HeaderActions />
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 lg:p-8 pb-20 lg:pb-8">
          {/* Info Card */}
          <div className="bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-[12px] lg:rounded-[14px] p-4 lg:p-6 mb-4 lg:mb-6 shadow-lg">
            <h3 className="text-base lg:text-lg text-white mb-1.5 lg:mb-2">
              We'd love to hear from you!
            </h3>
            <p className="text-white/90 text-xs lg:text-sm leading-relaxed">
              Your feedback helps us improve FinanEase. Share your thoughts, suggestions, or
              report any issues you've encountered.
            </p>
          </div>

          {/* Feedback Form */}
          <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
            {/* Rating */}
            <div className="bg-white dark:bg-[#18181B] border border-black/10 dark:border-white/10 rounded-[12px] lg:rounded-[14px] p-4 lg:p-6">
              <label className="block text-sm lg:text-base text-[#0A0A0A] dark:text-white mb-3">
                How would you rate your experience? *
              </label>
              <div className="flex items-center gap-1.5 lg:gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    onMouseEnter={() => setHoveredRating(value)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-transform hover:scale-110 active:scale-95"
                  >
                    <Star
                      className={`w-8 h-8 lg:w-10 lg:h-10 ${
                        value <= (hoveredRating || rating)
                          ? 'fill-[#F59E0B] text-[#F59E0B]'
                          : 'text-[#D4D4D8] dark:text-[#52525B]'
                      }`}
                    />
                  </button>
                ))}
                {rating > 0 && (
                  <span className="ml-2 lg:ml-3 text-xs lg:text-sm text-[#717182] dark:text-[#A1A1AA]">
                    {rating === 5
                      ? 'Excellent!'
                      : rating === 4
                      ? 'Good'
                      : rating === 3
                      ? 'Average'
                      : rating === 2
                      ? 'Fair'
                      : 'Poor'}
                  </span>
                )}
              </div>
            </div>

            {/* Subject */}
            <div className="bg-white dark:bg-[#18181B] border border-black/10 dark:border-white/10 rounded-[12px] lg:rounded-[14px] p-4 lg:p-6">
              <label className="block text-sm lg:text-base text-[#0A0A0A] dark:text-white mb-3">
                Subject *
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Feature Request, Bug Report, General Feedback"
                className="w-full h-11 lg:h-12 px-3 lg:px-4 bg-[#F3F3F5] dark:bg-[#27272A] border border-transparent dark:border-white/10 rounded-[10px] lg:rounded-[12px] text-sm lg:text-base text-[#0A0A0A] dark:text-white placeholder:text-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
                required
              />
            </div>

            {/* Message */}
            <div className="bg-white dark:bg-[#18181B] border border-black/10 dark:border-white/10 rounded-[12px] lg:rounded-[14px] p-4 lg:p-6">
              <label className="block text-sm lg:text-base text-[#0A0A0A] dark:text-white mb-3">
                Your Feedback *
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us what you think..."
                rows={6}
                className="w-full px-3 lg:px-4 py-3 bg-[#F3F3F5] dark:bg-[#27272A] border border-transparent dark:border-white/10 rounded-[10px] lg:rounded-[12px] text-sm lg:text-base text-[#0A0A0A] dark:text-white placeholder:text-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] resize-none"
                required
              />
              <p className="text-xs text-[#717182] dark:text-[#A1A1AA] mt-2">
                {message.length} / 1000 characters
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-[10px] p-3">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full h-11 lg:h-12 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-[10px] lg:rounded-[12px] text-sm lg:text-base text-white flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#6366F1]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              disabled={!subject || !message || rating === 0 || isSubmitting}
            >
              <Send className="w-4 h-4 lg:w-5 lg:h-5" />
              {isSubmitting ? 'Sending...' : 'Send Feedback'}
            </button>
          </form>

          {/* Additional Info */}
          <div className="mt-4 lg:mt-6 p-3 lg:p-4 bg-[#F3F3F5] dark:bg-[#27272A] rounded-[10px] lg:rounded-[12px]">
            <p className="text-xs lg:text-sm text-[#717182] dark:text-[#A1A1AA]">
              <span className="text-[#0A0A0A] dark:text-white">Note:</span> We typically respond to
              feedback within 24-48 hours. For urgent issues, please contact our support team
              directly.
            </p>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#18181B] rounded-[20px] p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-full flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg text-[#0A0A0A] dark:text-white">Feedback Sent!</h3>
              </div>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#F3F3F5] dark:hover:bg-[#27272A] transition-colors"
              >
                <X className="w-5 h-5 text-[#0A0A0A] dark:text-white" />
              </button>
            </div>
            <p className="text-sm text-[#717182] dark:text-[#A1A1AA] mb-6">
              Thank you for your feedback! We appreciate you taking the time to help us improve
              FinanEase. Our team will review your submission and get back to you soon.
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full h-11 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-[12px] text-white hover:shadow-lg hover:shadow-[#6366F1]/30 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
