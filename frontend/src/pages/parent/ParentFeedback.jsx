import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getFeedback, submitFeedback, getTeachers, getSubjects } from '../../services/api';
import { StatusBadge } from '../../components/common/Badge';
import { MessageSquare, Star, Send, CheckCircle2, User, Sparkles } from 'lucide-react';

export const ParentFeedback = () => {
  const { user } = useAuth();
  const linkedStudents = user?.students || [];

  const [feedbacks, setFeedbacks] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [form, setForm] = useState({
    studentId: linkedStudents[0]?._id || linkedStudents[0] || '',
    teacherId: '',
    subjectId: '',
    category: 'Academic',
    rating: 5,
    message: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [fRes, tRes, sRes] = await Promise.all([
        getFeedback(),
        getTeachers(),
        getSubjects(),
      ]);
      setFeedbacks(fRes.data);
      setTeachers(tRes.data);
      setSubjects(sRes.data);

      if (tRes.data.length > 0) {
        setForm((prev) => ({
          ...prev,
          teacherId: tRes.data[0]._id,
          subjectId: sRes.data[0]?._id || '',
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.message.trim()) return;

    try {
      setSubmitting(true);
      setSuccessMsg('');
      await submitFeedback(form);
      setSuccessMsg('Your feedback has been delivered to the teacher!');
      setForm((prev) => ({ ...prev, message: '' }));
      const updatedFRes = await getFeedback();
      setFeedbacks(updatedFRes.data);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting feedback');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <MessageSquare className="w-7 h-7 text-indigo-600" />
          Teacher Feedback & Inquiry Channel
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Direct communication line with your child's teachers regarding academic progress and guidance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Feedback Submission Form */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b pb-3">
            <Send className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-800">Submit Teacher Feedback</h3>
          </div>

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {/* Child Selection */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Select Child *</label>
              <select
                value={form.studentId}
                onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
              >
                {linkedStudents.map((child) => (
                  <option key={child._id || child} value={child._id || child}>
                    {child.firstName ? `${child.firstName} ${child.lastName}` : 'Child'} ({child.studentId})
                  </option>
                ))}
              </select>
            </div>

            {/* Teacher Selection */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Select Teacher *</label>
              <select
                value={form.teacherId}
                onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
              >
                {teachers.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name} ({t.designation || 'Teacher'})
                  </option>
                ))}
              </select>
            </div>

            {/* Subject Selection */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Subject (Optional)</label>
              <select
                value={form.subjectId}
                onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              >
                <option value="">General (No specific subject)</option>
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="Academic">Academic Performance</option>
                <option value="Behavioral">Behavioral Observation</option>
                <option value="Attendance">Attendance Concern</option>
                <option value="Doubt / Question">Subject Doubt / Question</option>
                <option value="General">General Inquiry</option>
              </select>
            </div>

            {/* Star Rating */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Rating (1 to 5 Stars)</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setForm({ ...form, rating: star })}
                    className="p-1 focus:outline-none"
                  >
                    <Star
                      className={`w-5 h-5 transition-colors ${
                        star <= form.rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300 hover:text-amber-200'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-amber-700 ml-2">{form.rating} / 5</span>
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Feedback Message *</label>
              <textarea
                rows="4"
                required
                placeholder="Type your message, appreciation or inquiry for the teacher..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Sending...' : 'Send Feedback'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Previous Feedback History & Replies */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-800 border-b pb-3">
              Communication History & Faculty Responses ({feedbacks.length})
            </h3>

            {loading ? (
              <p className="text-xs text-slate-400 text-center py-8">Loading communications...</p>
            ) : feedbacks.length > 0 ? (
              <div className="space-y-4">
                {feedbacks.map((fb) => (
                  <div
                    key={fb._id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                  >
                    <div className="flex items-start justify-between flex-wrap gap-2 text-xs">
                      <div>
                        <span className="font-bold text-slate-900 block">
                          To: {fb.teacher?.name} ({fb.teacher?.designation || 'Teacher'})
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Regarding: {fb.student?.firstName} {fb.student?.lastName} • {fb.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                          {[...Array(fb.rating || 5)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                        <StatusBadge status={fb.status} />
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed italic bg-white p-3 rounded-lg border border-slate-100">
                      "{fb.message}"
                    </p>

                    {/* Teacher reply block */}
                    {fb.reply ? (
                      <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-lg text-xs space-y-1">
                        <span className="text-[11px] font-bold text-indigo-900 block">
                          Faculty Response:
                        </span>
                        <p className="text-indigo-950 font-medium">{fb.reply}</p>
                        <span className="text-[10px] text-indigo-400 block pt-1">
                          Replied on {fb.repliedAt ? new Date(fb.repliedAt).toLocaleDateString() : ''}
                        </span>
                      </div>
                    ) : (
                      <p className="text-[11px] text-amber-700 italic">
                        Waiting for faculty review and response.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-8">
                No previous messages found. Submit your first feedback using the form.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentFeedback;
