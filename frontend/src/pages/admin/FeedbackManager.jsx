import React, { useState, useEffect } from 'react';
import { getFeedback, replyFeedback } from '../../services/api';
import { StatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { MessageSquare, Star, Reply, CheckCircle2, User, Clock, Filter } from 'lucide-react';

export const FeedbackManager = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [replyModalFeedback, setReplyModalFeedback] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  useEffect(() => {
    fetchFeedbacks();
  }, [statusFilter]);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const res = await getFeedback({ status: statusFilter });
      setFeedbacks(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReply = (item) => {
    setReplyModalFeedback(item);
    setReplyText(item.reply || '');
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      setSubmittingReply(true);
      await replyFeedback(replyModalFeedback._id, { reply: replyText });
      setReplyModalFeedback(null);
      setReplyText('');
      fetchFeedbacks();
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting reply');
    } finally {
      setSubmittingReply(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <MessageSquare className="w-7 h-7 text-indigo-600" />
            Parent - Teacher Communication & Feedback
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Institutional overview of parent queries, academic suggestions, ratings, and faculty responses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
          >
            <option value="">All Feedback ({feedbacks.length})</option>
            <option value="Pending">Pending Only</option>
            <option value="Replied">Replied Only</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs">Loading feedback threads...</div>
        ) : feedbacks.length > 0 ? (
          feedbacks.map((fb) => (
            <div
              key={fb._id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                    {fb.parent?.name?.charAt(0) || 'P'}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {fb.parent?.name || 'Parent'} ({fb.parent?.relationship || 'Guardian'})
                    </h4>
                    <p className="text-xs text-slate-500">
                      Student: <strong className="text-slate-700">{fb.student?.firstName} {fb.student?.lastName}</strong> ({fb.student?.studentId})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < (fb.rating || 5) ? 'fill-current text-amber-400' : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                    {fb.category}
                  </span>
                  <StatusBadge status={fb.status} />
                </div>
              </div>

              {/* Message */}
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-xs text-slate-700 leading-relaxed">
                <p>{fb.message}</p>
                <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-2">
                  <span>To Teacher: <strong className="text-slate-600">{fb.teacher?.name}</strong></span>
                  {fb.subject && <span>• Subject: <strong className="text-slate-600">{fb.subject?.name}</strong></span>}
                  <span>• {new Date(fb.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Reply if exists */}
              {fb.reply ? (
                <div className="bg-indigo-50/60 border border-indigo-100 p-4 rounded-xl text-xs space-y-1.5 ml-4">
                  <div className="flex items-center justify-between text-[11px] font-bold text-indigo-950">
                    <span>Response from {fb.teacher?.name}:</span>
                    <span className="text-indigo-400 text-[10px]">
                      {fb.repliedAt ? new Date(fb.repliedAt).toLocaleDateString() : ''}
                    </span>
                  </div>
                  <p className="text-indigo-900 leading-relaxed">{fb.reply}</p>
                </div>
              ) : (
                <div className="flex justify-end">
                  <button
                    onClick={() => handleOpenReply(fb)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-colors"
                  >
                    <Reply className="w-3.5 h-3.5" />
                    <span>Reply to Parent</span>
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="p-12 text-center text-slate-400 text-xs">No feedback records found.</div>
        )}
      </div>

      {replyModalFeedback && (
        <Modal
          isOpen={!!replyModalFeedback}
          onClose={() => setReplyModalFeedback(null)}
          title={`Reply to ${replyModalFeedback.parent?.name}`}
          subtitle={`Regarding student ${replyModalFeedback.student?.firstName} ${replyModalFeedback.student?.lastName}`}
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleSubmitReply} className="space-y-4 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-700">
              <span className="font-bold text-[10px] uppercase text-slate-400 block mb-1">
                Parent's Message
              </span>
              <p>"{replyModalFeedback.message}"</p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Your Response *</label>
              <textarea
                rows="4"
                required
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your response to the parent..."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t">
              <button
                type="button"
                onClick={() => setReplyModalFeedback(null)}
                className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingReply}
                className="px-5 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow"
              >
                {submittingReply ? 'Sending...' : 'Send Reply'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default FeedbackManager;
