import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { Search, CheckCircle, Clock, AlertCircle, XCircle, ArrowRight } from 'lucide-react';

export default function Status() {
  const location = useLocation();
  const { addToast } = useToast();
  
  // Check if we arrived here after a successful registration
  const successState = location.state || {};
  const [isSuccessView, setIsSuccessView] = useState(!!successState.success);

  const [searchQuery, setSearchQuery] = useState(successState.teamId || '');
  const [loading, setLoading] = useState(false);
  const [team, setTeam] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      addToast('Please enter your Team ID or registered Email address.', 'warning');
      return;
    }

    setLoading(true);
    setTeam(null);
    try {
      const response = await fetch(`/api/status/${searchQuery.trim()}`);
      if (!response.ok) {
        throw new Error('No team registration found matching that query.');
      }
      const data = await response.json();
      setTeam(data);
      setIsSuccessView(false); // Switch to normal status view
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (statusVal) => {
    switch (statusVal) {
      case 'Completed':
      case 'Confirmed':
      case 'Approved':
      case 'Submitted':
        return <CheckCircle className="text-emerald-500 w-5 h-5 flex-shrink-0" />;
      case 'Pending':
      case 'Under Review':
        return <Clock className="text-amber-500 w-5 h-5 flex-shrink-0" />;
      case 'Needs Correction':
        return <AlertCircle className="text-orange-500 w-5 h-5 flex-shrink-0" />;
      case 'Rejected':
      default:
        return <XCircle className="text-rose-500 w-5 h-5 flex-shrink-0" />;
    }
  };

  const getStatusBadgeClass = (statusVal) => {
    switch (statusVal) {
      case 'Completed':
      case 'Confirmed':
      case 'Approved':
      case 'Submitted':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'Pending':
      case 'Under Review':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'Needs Correction':
        return 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
      case 'Rejected':
      default:
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
    }
  };

  // Determine current active workflow step for progress bar
  return (
    <div className="bg-[#0b0f19] bg-grid min-h-screen pb-20 px-4">
      <div className="max-w-4xl mx-auto pt-10">

        {/* --- REGISTRATION SUCCESSFUL VIEW --- */}
        {isSuccessView && successState.success && (
          <div className="glass rounded-3xl p-8 border border-emerald-500/30 glow-blue text-center max-w-2xl mx-auto animate-fadeIn">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 mb-6 border border-emerald-500/30">
              <CheckCircle className="w-8 h-8" />
            </div>

            <h1 className="text-3xl font-extrabold text-white mb-2">Registration Successful!</h1>
            <p className="text-gray-400 text-sm mb-6">Your team registration has been recorded securely in the database.</p>

            <div className="bg-slate-950/80 rounded-2xl p-6 text-left border border-slate-900 mb-8 space-y-3.5">
              <div className="flex justify-between border-b border-slate-900 pb-3">
                <span className="text-gray-500 text-sm">✔ Team ID</span>
                <span className="text-blue-400 font-extrabold text-lg">{successState.teamId}</span>
              </div>
              <div className="flex justify-between border-b border-slate-900 pb-3">
                <span className="text-gray-500 text-sm">Team Name</span>
                <span className="text-white font-bold text-sm">{successState.teamName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-900 pb-3">
                <span className="text-gray-500 text-sm">Team Leader Name</span>
                <span className="text-white font-semibold text-sm">{successState.leadName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Registration Date & Time</span>
                <span className="text-gray-300 text-xs">{new Date(successState.regTime).toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-blue-600/10 border-l-4 border-blue-500 p-4 rounded-r-xl text-left text-xs mb-8">
              <span className="font-semibold text-blue-400 block mb-1">📢 Important Next Step</span>
              <span className="text-gray-300">
                You must now complete the **ID Verification Form** to verify your IEEE memberships and college enrollment proofs. Without this, your team registration cannot be validated.
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <Link
                to={`/verify?team_id=${successState.teamId}`}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg flex items-center justify-center space-x-2"
              >
                <span>Proceed to Verification</span>
                <ArrowRight size={16} />
              </Link>
              <button
                onClick={() => setIsSuccessView(false)}
                className="w-full sm:w-auto text-sm text-gray-500 hover:text-gray-300 font-medium py-2"
              >
                Close Successful Message
              </button>
            </div>
          </div>
        )}

        {/* --- STATUS SEARCH VIEW --- */}
        {!isSuccessView && (
          <div className="space-y-8 max-w-3xl mx-auto">
            <div className="glass rounded-2xl p-6 border border-slate-800/80">
              <h2 className="text-lg font-bold text-white mb-2">Check Your Team Status</h2>
              <p className="text-xs text-gray-400 mb-6">Enter either your Unique Team ID (e.g. TH26-0001) or registered Team Lead email address to check live status.</p>
              
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Team ID / Registered Email Address"
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center space-x-2"
                >
                  <Search size={16} />
                  <span>{loading ? 'Searching...' : 'Search'}</span>
                </button>
              </form>
            </div>

            {/* Results Card */}
            {team && (
              <div className="glass rounded-2xl p-6 border border-slate-800/80 space-y-6 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-2">
                  <div>
                    <h3 className="text-xl font-extrabold text-white">{team.team_name}</h3>
                    <p className="text-xs text-gray-400 mt-1">Theme: <span className="text-blue-400 font-semibold">{team.selected_theme}</span></p>
                  </div>
                  <div className="text-right sm:text-right">
                    <span className="text-xs text-gray-500 uppercase block">Team ID</span>
                    <span className="text-blue-500 font-extrabold text-xl">{team.id}</span>
                  </div>
                </div>

                {/* Workflow Statuses */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-900 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-gray-500 uppercase block">Registration Status</span>
                      <span className="text-sm font-bold text-white mt-1 block">Registration</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(team.registration_status)}
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${getStatusBadgeClass(team.registration_status)}`}>
                        ✅ Completed
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-900 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-gray-500 uppercase block">ID Verification</span>
                      <span className="text-sm font-bold text-white mt-1 block">Verification</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(team.verification_status)}
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${getStatusBadgeClass(team.verification_status)}`}>
                        {team.verification_status === 'Approved' ? '✅ Approved' : 
                         team.verification_status === 'Under Review' ? '🟡 Under Review' :
                         team.verification_status === 'Needs Correction' ? '🟡 Needs Correction' :
                         team.verification_status === 'Rejected' ? '❌ Rejected' : '🟡 Pending'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-900 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-gray-500 uppercase block">Project Idea Submission</span>
                      <span className="text-sm font-bold text-white mt-1 block">Idea Submission</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(team.idea_submission_status)}
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${getStatusBadgeClass(team.idea_submission_status)}`}>
                        {team.idea_submission_status === 'Submitted' ? '✅ Submitted' : '❌ Not Submitted'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-900 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-gray-500 uppercase block">Booking Ticket Status</span>
                      <span className="text-sm font-bold text-white mt-1 block">Ticket</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(team.ticket_status)}
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${getStatusBadgeClass(team.ticket_status)}`}>
                        ✅ Confirmed
                      </span>
                    </div>
                  </div>
                </div>

                {/* Additional audit info */}
                <div className="bg-slate-950/30 rounded-xl p-4 border border-slate-900 text-xs space-y-2 text-gray-400">
                  <div className="flex justify-between">
                    <span>Registration Date</span>
                    <span className="text-gray-300 font-semibold">{new Date(team.created_at).toLocaleDateString()}</span>
                  </div>
                  {team.verification && (
                    <div className="flex justify-between">
                      <span>Verification Submission Date</span>
                      <span className="text-gray-300 font-semibold">{new Date(team.verification.updated_at).toLocaleDateString()}</span>
                    </div>
                  )}
                  {team.verification_status === 'Needs Correction' && team.notes.length > 0 && (
                    <div className="bg-orange-500/10 border border-orange-500/20 text-orange-400 p-3 rounded-lg mt-2 text-xs">
                      <span className="font-bold block mb-1">Remarks for correction:</span>
                      {team.notes[team.notes.length - 1].note_text}
                    </div>
                  )}
                </div>

                {/* Guide actions based on status */}
                <div className="flex justify-end pt-2 border-t border-slate-800">
                  {team.verification_status === 'Pending' || team.verification_status === 'Needs Correction' ? (
                    <Link
                      to={`/verify?team_id=${team.id}`}
                      className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-6 py-2.5 rounded-xl shadow-md flex items-center space-x-2"
                    >
                      <span>Submit Verification Files</span>
                      <ArrowRight size={14} />
                    </Link>
                  ) : team.verification_status === 'Approved' && team.idea_submission_status !== 'Submitted' ? (
                    <Link
                      to="/submit-idea"
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold px-6 py-2.5 rounded-xl shadow-md flex items-center space-x-2"
                    >
                      <span>Proceed to Idea Submission</span>
                      <ArrowRight size={14} />
                    </Link>
                  ) : (
                    <div className="text-xs text-gray-500 italic">No actions required. Keep checking email/WhatsApp for updates.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
