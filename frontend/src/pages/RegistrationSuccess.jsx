import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, Copy } from 'lucide-react';
import { useToast } from '../components/Toast';

export default function RegistrationSuccess() {
  const location = useLocation();
  const { addToast } = useToast();
  const state = location.state || {};

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    addToast('Team ID copied to clipboard.', 'success');
  };

  // Fallback defaults if accessed directly (though typically redirected from Register.jsx)
  const teamId = state.teamId || 'TH26-XXXX';
  const teamName = state.teamName || 'N/A';
  const regTime = state.regTime ? new Date(state.regTime) : new Date();

  return (
    <div className="bg-[#0b0f19] bg-grid min-h-screen pb-20 px-4 flex items-center justify-center">
      <div className="max-w-2xl w-full pt-10">
        <div className="glass rounded-3xl p-8 border border-emerald-500/30 glow-blue text-center relative overflow-hidden animate-fadeIn">
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 mb-6 border border-emerald-500/30">
            <CheckCircle className="w-8 h-8" />
          </div>

          <h1 className="text-3xl font-extrabold text-white mb-2">✅ Team Registration Submitted Successfully</h1>
          <p className="text-gray-400 text-sm mb-6">Your national level hackathon team registration has been recorded successfully.</p>

          <div className="bg-slate-950/85 rounded-2xl p-6 text-left border border-slate-900 mb-8 space-y-4">
            <div className="flex justify-between border-b border-slate-900 pb-3 items-center">
              <span className="text-gray-500 text-sm">✔ Team ID</span>
              <div className="flex items-center space-x-2">
                <span className="text-blue-400 font-extrabold text-xl tracking-wider">{teamId}</span>
                {teamId !== 'TH26-XXXX' && (
                  <button 
                    onClick={() => handleCopy(teamId)} 
                    className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-gray-400 hover:text-white border border-slate-800"
                    title="Copy Team ID"
                  >
                    <Copy size={12} />
                  </button>
                )}
              </div>
            </div>
            <div className="flex justify-between border-b border-slate-900 pb-3">
              <span className="text-gray-500 text-sm">Team Name</span>
              <span className="text-white font-bold text-sm">{teamName}</span>
            </div>
            <div className="flex justify-between border-b border-slate-900 pb-3">
              <span className="text-gray-500 text-sm">Registration Date</span>
              <span className="text-white font-semibold text-sm">{regTime.toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Registration Time</span>
              <span className="text-white font-semibold text-sm">{regTime.toLocaleTimeString()}</span>
            </div>
          </div>

          <div className="bg-blue-600/10 border-l-4 border-blue-500 p-4 rounded-r-xl text-left text-xs mb-8">
            <span className="font-semibold text-blue-400 block mb-1">📢 Save Your Team ID Carefully</span>
            <span className="text-gray-300 leading-relaxed">
              Please save your **Team ID** carefully. It will be required later for **ID Verification**, **Project Idea Submission**, and checking **Project Idea Status**.
            </span>
          </div>

          <p className="text-sm text-gray-400 mb-8 italic">Thank you for registering. You can now leave this page. Organizers will contact you when it's time for the next steps.</p>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Link
              to="/"
              className="w-full sm:w-auto bg-slate-900 hover:bg-slate-850 border border-slate-800 text-white font-semibold px-8 py-3.5 rounded-xl shadow-md flex items-center justify-center"
            >
              Back to Home
            </Link>
            <Link
              to={`/verify?team_id=${teamId}`}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg flex items-center justify-center space-x-2"
            >
              <span>Proceed to ID Verification</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
