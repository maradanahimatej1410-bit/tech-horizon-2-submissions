import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { CheckCircle, RefreshCw, FileText } from 'lucide-react';

export default function SubmitIdea() {
  const { addToast } = useToast();
  
  const [teamId, setTeamId] = useState('');
  const [fetching, setFetching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [teamFound, setTeamFound] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [ideaAlreadySubmitted, setIdeaAlreadySubmitted] = useState(false);

  // Read-only values from Team ID search
  const [teamName, setTeamName] = useState('');
  const [teamLeadName, setTeamLeadName] = useState('');
  const [college, setCollege] = useState('');
  const [teamSize, setTeamSize] = useState(3);
  const [selectedTheme, setSelectedTheme] = useState('');

  // Input value
  const [driveLink, setDriveLink] = useState('');

  const fetchTeamDetails = async () => {
    if (!teamId.trim()) {
      addToast('Please enter a Team ID.', 'warning');
      return;
    }
    
    setFetching(true);
    setTeamFound(false);
    try {
      const response = await fetch(`/api/status/${teamId.trim()}`);
      if (!response.ok) {
        throw new Error('Team ID not found in our database.');
      }
      const data = await response.json();
      
      // Auto populate
      setTeamName(data.team_name);
      setSelectedTheme(data.selected_theme);
      setTeamSize(data.participants.length);
      
      const lead = data.participants.find(p => p.member_index === 1);
      if (lead) {
        setTeamLeadName(lead.name);
        setCollege(lead.college);
      }
      
      // Check if idea already submitted
      if (data.idea_submission_status === 'Submitted') {
        setIdeaAlreadySubmitted(true);
      } else {
        setIdeaAlreadySubmitted(false);
      }
      
      // Pre-fill drive link if already submitted
      if (data.project_idea_link) {
        setDriveLink(data.project_idea_link);
      }
      
      setTeamFound(true);
      addToast('Team details loaded successfully!', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setFetching(false);
    }
  };

  const validateUrl = (url) => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!teamFound) {
      addToast('Please fetch and verify your Team ID details before submitting.', 'error');
      return;
    }

    if (!driveLink.trim()) {
      addToast('Project Idea Google Drive Link is required.', 'error');
      return;
    }

    if (!validateUrl(driveLink)) {
      addToast('Please enter a valid Google Drive URL.', 'error');
      return;
    }

    // Warn if not a Google Drive link (Google Drive preferred)
    if (!driveLink.includes('drive.google.com') && !driveLink.includes('docs.google.com')) {
      addToast('Warning: A Google Drive link is strongly preferred for your presentation.', 'warning');
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/project-idea/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team_id: teamId,
          project_idea_link: driveLink.trim()
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Failed to submit project idea.');
      }

      addToast('Project Idea Submitted Successfully!', 'success');
      setIsSubmitted(true);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-[#0b0f19] bg-grid min-h-screen pb-20 px-4 flex items-center justify-center">
        <div className="max-w-2xl w-full pt-10">
          <div className="glass rounded-3xl p-8 border border-emerald-500/30 glow-blue text-center relative overflow-hidden animate-fadeIn">
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 mb-6 border border-emerald-500/30">
              <CheckCircle className="w-8 h-8" />
            </div>

            <h1 className="text-3xl font-extrabold text-white mb-2">Project Idea Submitted Successfully</h1>
            <p className="text-gray-400 text-sm mb-6">Your Project Idea Presentation has been saved in our database.</p>

            <div className="bg-slate-950/85 rounded-2xl p-6 text-left border border-slate-900 mb-8 space-y-3.5">
              <div className="flex justify-between border-b border-slate-900 pb-3">
                <span className="text-gray-500 text-sm">Team ID</span>
                <span className="text-blue-400 font-extrabold text-base">{teamId}</span>
              </div>
              <div className="flex justify-between border-b border-slate-900 pb-3">
                <span className="text-gray-500 text-sm">Team Name</span>
                <span className="text-white font-bold text-sm">{teamName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-900 pb-3">
                <span className="text-gray-500 text-sm">Submission Status</span>
                <span className="text-emerald-400 font-bold text-sm">Submitted</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Presentation Link</span>
                <a 
                  href={driveLink} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-blue-500 font-semibold text-xs truncate max-w-[200px] hover:underline"
                >
                  {driveLink}
                </a>
              </div>
            </div>

            <div className="bg-blue-600/10 border-l-4 border-blue-500 p-4 rounded-r-xl text-left text-xs mb-8">
              <span className="font-semibold text-blue-400 block mb-1">💡 What Next?</span>
              <span className="text-gray-300 leading-relaxed">
                The organizers will review your submitted Project Idea. You can check the evaluation and review comments anytime on the **Project Idea Status** page.
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <Link
                to="/"
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-850 border border-slate-800 text-white font-semibold px-8 py-3.5 rounded-xl shadow-md"
              >
                Back to Home
              </Link>
              <Link
                to="/project-idea-status"
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg"
              >
                Check Idea Status
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0b0f19] bg-grid min-h-screen pb-20 px-4">
      <div className="max-w-4xl mx-auto pt-10">

        {/* Important Notice Card */}
        <div className="glass rounded-2xl p-5 border border-amber-500/40 bg-amber-500/5 mb-6">
          <div className="flex items-start space-x-3">
            <span className="text-amber-400 text-xl mt-0.5">⚠️</span>
            <div>
              <p className="text-amber-300 font-bold text-sm mb-1">Important Notice</p>
              <p className="text-amber-200/80 text-sm leading-relaxed">
                This form can be submitted <strong className="text-amber-300">only once</strong> for each team. Please verify all details carefully before submitting. Once submitted successfully, this form <strong className="text-amber-300">cannot be edited or submitted again</strong>.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-white">Project Idea Submission</h1>
          <p className="text-gray-400 mt-2">Submit your Google Drive presentation link for review</p>
        </div>

        {/* Step Info */}
        <section className="glass rounded-2xl p-6 border border-slate-800/80 mb-8">
          <h3 className="text-lg font-bold text-white mb-3 flex items-center space-x-2">
            <FileText className="text-blue-500" />
            <span>Project Idea Submission Requirements</span>
          </h3>
          <div className="text-sm text-gray-300 leading-relaxed space-y-4">
            <p>
              This page is used only for submitting your final Project Idea Presentation. Please ensure your presentation is completed and uploaded to Google Drive.
            </p>
            <p className="font-semibold text-amber-500">⚠️ Important Access Rule:</p>
            <p className="text-gray-400">
              The presentation must be uploaded to Google Drive and the link accessibility settings must have **"Anyone with the link"** access enabled so that the organizing committee can view and review your submission.
            </p>
          </div>
        </section>

        {/* Step 1: Team ID Search */}
        <div className="glass rounded-2xl p-6 border border-slate-800/80 mb-6">
          <h3 className="text-base font-bold text-white mb-4">Step 1: Enter Your Team ID</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={teamId}
              onChange={(e) => setTeamId(e.target.value.toUpperCase())}
              placeholder="e.g. TH26-0001"
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={fetchTeamDetails}
              disabled={fetching || !teamId.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center space-x-2"
            >
              {fetching ? (
                <RefreshCw className="animate-spin w-4 h-4" />
              ) : (
                <span>Fetch Registration</span>
              )}
            </button>
          </div>
        </div>

        {teamFound && ideaAlreadySubmitted && (
          <div className="glass rounded-2xl p-5 border border-red-500/40 bg-red-500/5 mb-6">
            <div className="flex items-start space-x-3">
              <span className="text-red-400 text-xl mt-0.5">🚫</span>
              <div>
                <p className="text-red-300 font-bold text-sm mb-1">Already Submitted</p>
                <p className="text-red-200/80 text-sm leading-relaxed">
                  Project Idea has already been submitted for this Team ID. Multiple submissions are not allowed.
                </p>
              </div>
            </div>
          </div>
        )}

        {teamFound && !ideaAlreadySubmitted && (
          <form onSubmit={handleSubmit} className="space-y-6 animate-fadeIn">
            {/* Step 2: Read-Only Info */}
            <div className="glass rounded-2xl p-6 border border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Team Name</label>
                <input
                  type="text"
                  disabled
                  value={teamName}
                  className="w-full bg-slate-900 border border-slate-850 rounded-xl px-4 py-2 text-gray-400 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Team Lead Name</label>
                <input
                  type="text"
                  disabled
                  value={teamLeadName}
                  className="w-full bg-slate-900 border border-slate-850 rounded-xl px-4 py-2 text-gray-400 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">College</label>
                <input
                  type="text"
                  disabled
                  value={college}
                  className="w-full bg-slate-900 border border-slate-850 rounded-xl px-4 py-2 text-gray-400 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Team Size</label>
                  <input
                    type="text"
                    disabled
                    value={`${teamSize} Members`}
                    className="w-full bg-slate-900 border border-slate-850 rounded-xl px-4 py-2 text-gray-400 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Selected Theme</label>
                  <input
                    type="text"
                    disabled
                    value={selectedTheme}
                    className="w-full bg-slate-900 border border-slate-850 rounded-xl px-4 py-2 text-gray-400 font-semibold truncate"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Link Input */}
            <div className="glass rounded-2xl p-6 border border-slate-800/80 space-y-4">
              <h3 className="text-base font-bold text-white">Step 2: Enter Project Idea Presentation Link</h3>
              
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1">
                  Google Drive Presentation Link (PDF preferred) *
                </label>
                <input
                  type="url"
                  required
                  value={driveLink}
                  onChange={(e) => setDriveLink(e.target.value)}
                  placeholder="https://drive.google.com/file/d/..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm"
                />
                <span className="text-xs text-gray-500 block mt-1.5 leading-relaxed">
                  Please ensure your Google Drive link has "Anyone with the link" access enabled.
                </span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-lg flex items-center space-x-2"
              >
                {submitting ? (
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                ) : null}
                <span>Submit Project Idea</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
