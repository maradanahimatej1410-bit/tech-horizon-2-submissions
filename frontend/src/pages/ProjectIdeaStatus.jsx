import { useState } from 'react';
import { Search, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { useToast } from '../components/Toast';

export default function ProjectIdeaStatus() {
  const { addToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [ideaData, setIdeaData] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      addToast('Please enter your Team ID or Team Name.', 'warning');
      return;
    }

    setLoading(true);
    setIdeaData(null);
    try {
      const response = await fetch(`/api/project-idea/status/${encodeURIComponent(searchQuery.trim())}`);
      if (!response.ok) {
        throw new Error('No registration found matching the Team ID or Name.');
      }
      const data = await response.json();
      setIdeaData(data);
      addToast('Status loaded successfully!', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (statusVal) => {
    switch (statusVal) {
      case 'Verified':
        return <CheckCircle className="text-emerald-500 w-5 h-5 flex-shrink-0" />;
      case 'Pending Review':
      case 'Submitted':
        return <Clock className="text-amber-500 w-5 h-5 flex-shrink-0" />;
      case 'Rejected':
      default:
        return <XCircle className="text-rose-500 w-5 h-5 flex-shrink-0" />;
    }
  };

  const getStatusBadgeClass = (statusVal) => {
    switch (statusVal) {
      case 'Verified':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'Pending Review':
      case 'Submitted':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'Rejected':
      default:
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
    }
  };

  return (
    <div className="bg-[#0b0f19] bg-grid min-h-screen pb-20 px-4">
      <div className="max-w-4xl mx-auto pt-10">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-white">Project Idea Status</h1>
          <p className="text-gray-400 mt-2">Track the review progress of your submitted Google Drive presentations</p>
        </div>

        <div className="space-y-8 max-w-2xl mx-auto">
          {/* Query Form */}
          <div className="glass rounded-2xl p-6 border border-slate-800/80 shadow-xl">
            <h2 className="text-base font-bold text-white mb-2">Check Submission Review Status</h2>
            <p className="text-xs text-gray-400 mb-6">Enter your Unique Team ID or registered Team Name to search.</p>
            
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase">Team ID / Team Name *</label>
                <input
                  type="text"
                  required
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. TH26-0001 or Code Hackers"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold p-3 rounded-xl transition-all shadow-md flex items-center justify-center space-x-2"
              >
                <Search size={16} />
                <span>{loading ? 'Searching Database...' : 'Search Status'}</span>
              </button>
            </form>
          </div>

          {/* Results card */}
          {ideaData && (
            <div className="glass rounded-2xl p-6 border border-slate-800/80 space-y-6 animate-fadeIn shadow-2xl">
              <div className="flex justify-between items-center border-b border-slate-900 pb-4">
                <div>
                  <h3 className="text-lg font-black text-white">{ideaData.team_name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Lead: <span className="font-semibold text-gray-300">{ideaData.lead_name}</span></p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-500 block uppercase font-bold">Team ID</span>
                  <span className="text-blue-500 font-extrabold text-lg">{ideaData.id}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-900/60 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase block font-bold">Submission Status</span>
                    <span className="text-xs font-bold text-white mt-0.5 block">{ideaData.idea_submission_status}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${
                    ideaData.idea_submission_status === 'Submitted' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }`}>
                    {ideaData.idea_submission_status}
                  </span>
                </div>

                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-900/60 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase block font-bold">Verification Status</span>
                    <span className="text-xs font-bold text-white mt-0.5 block">{ideaData.project_idea_verification_status}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(ideaData.project_idea_verification_status)}
                    <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${getStatusBadgeClass(ideaData.project_idea_verification_status)}`}>
                      {ideaData.project_idea_verification_status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/30 rounded-xl p-4 border border-slate-900 text-xs space-y-2 text-gray-400">
                <div className="flex justify-between">
                  <span>Selected Theme</span>
                  <span className="text-gray-300 font-bold">{ideaData.selected_theme}</span>
                </div>
                <div className="flex justify-between">
                  <span>Team Size</span>
                  <span className="text-gray-300 font-bold">{ideaData.team_size} Members</span>
                </div>
              </div>

              {/* Remarks if Rejected */}
              {ideaData.project_idea_verification_status === 'Rejected' && (
                <div className="bg-rose-500/10 border-l-4 border-rose-500 p-4 rounded-r-xl text-left text-xs">
                  <span className="font-bold text-rose-400 block mb-1 flex items-center space-x-1">
                    <AlertCircle size={14} />
                    <span>Organizer Remarks:</span>
                  </span>
                  <span className="text-gray-300 block leading-relaxed mt-1">
                    {ideaData.project_idea_remarks || "Presentation incomplete or Drive link accessibility permissions invalid."}
                  </span>
                  <span className="text-[10px] text-gray-500 block mt-2">
                    Please correct the submission on the Project Idea Submission page or contact support if you need assistance.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
