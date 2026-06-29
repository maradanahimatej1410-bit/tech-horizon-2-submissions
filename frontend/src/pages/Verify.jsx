import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useToast } from '../components/Toast';
import ProgressTracker from '../components/ProgressTracker';
import { Check, RefreshCw, CheckCircle } from 'lucide-react';

export default function Verify() {
  const [searchParams] = useSearchParams();
  const { addToast } = useToast();
  
  const [teamId, setTeamId] = useState(() => searchParams.get('team_id') || '');
  const [fetching, setFetching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [teamFound, setTeamFound] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [verificationFound, setVerificationFound] = useState(false);

  // Verification Form Fields
  const [teamLeadName, setTeamLeadName] = useState('');
  const [companyCollege, setCompanyCollege] = useState('');
  const [teamName, setTeamName] = useState('');
  const [teamSize, setTeamSize] = useState(3);
  
  const [ieeeCounts, setIeeeCounts] = useState('');

  const [memberLinks, setMemberLinks] = useState({
    member1: '',
    member2: '',
    member3: '',
    member4: 'N/A',
    member5: 'N/A',
    member6: 'N/A'
  });

  const fetchTeamDetails = useCallback(async (idToFetch) => {
    const id = idToFetch || teamId;
    if (!id.trim()) {
      addToast('Please enter a Team ID first.', 'warning');
      return;
    }
    
    setFetching(true);
    try {
      const response = await fetch(`/api/status/${id.trim()}`);
      if (!response.ok) {
        throw new Error('Team ID not found in our database.');
      }
      const data = await response.json();
      
      // Auto populate
      setTeamName(data.team_name);
      setTeamSize(data.participants.length);
      
      const lead = data.participants.find(p => p.member_index === 1);
      if (lead) {
        setTeamLeadName(lead.name);
        setCompanyCollege(lead.college);
      }
      
      // Pre-fill links if team already has them
      if (data.verification) {
        setVerificationFound(true);
        setIeeeCounts(data.verification.ieee_members_count + ' Members / ' + data.verification.non_ieee_members_count + ' Non-Members');
        setMemberLinks({
          member1: data.verification.member1_link,
          member2: data.verification.member2_link,
          member3: data.verification.member3_link,
          member4: data.verification.member4_link || 'N/A',
          member5: data.verification.member5_link || 'N/A',
          member6: data.verification.member6_link || 'N/A'
        });
      } else {
        setVerificationFound(false);
        // Initial pre-fill from registration links if available
        setMemberLinks({
          member1: lead ? (lead.ieee_id_proof_link !== 'N/A' ? lead.ieee_id_proof_link : lead.college_id_proof_link) : '',
          member2: data.participants[1] ? (data.participants[1].ieee_id_proof_link !== 'N/A' ? data.participants[1].ieee_id_proof_link : data.participants[1].college_id_proof_link) : '',
          member3: data.participants[2] ? (data.participants[2].ieee_id_proof_link !== 'N/A' ? data.participants[2].ieee_id_proof_link : data.participants[2].college_id_proof_link) : '',
          member4: data.participants[3] ? (data.participants[3].ieee_id_proof_link !== 'N/A' ? data.participants[3].ieee_id_proof_link : data.participants[3].college_id_proof_link) : 'N/A',
          member5: data.participants[4] ? (data.participants[4].ieee_id_proof_link !== 'N/A' ? data.participants[4].ieee_id_proof_link : data.participants[4].college_id_proof_link) : 'N/A',
          member6: data.participants[5] ? (data.participants[5].ieee_id_proof_link !== 'N/A' ? data.participants[5].ieee_id_proof_link : data.participants[5].college_id_proof_link) : 'N/A'
        });
      }
      
      setTeamFound(true);
      addToast('Team details loaded successfully!', 'success');
    } catch (err) {
      addToast(err.message, 'error');
      setTeamFound(false);
    } finally {
      setFetching(false);
    }
  }, [teamId, addToast]);

  // Pull Team ID from URL query param if present
  useEffect(() => {
    const qId = searchParams.get('team_id');
    if (qId) {
      const timer = setTimeout(() => {
        fetchTeamDetails(qId);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [searchParams, fetchTeamDetails]);

  const handleLinkChange = (memberKey, value) => {
    setMemberLinks(prev => ({
      ...prev,
      [memberKey]: value
    }));
  };

  const isValidUrl = (str) => {
    if (str === 'N/A' || str === 'n/a') return true;
    try {
      new URL(str);
      return true;
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

    // URL validations
    if (!isValidUrl(memberLinks.member1)) {
      addToast('Member 1 Drive link is invalid. Enter a valid URL or N/A.', 'error');
      return;
    }
    if (!isValidUrl(memberLinks.member2)) {
      addToast('Member 2 Drive link is invalid. Enter a valid URL or N/A.', 'error');
      return;
    }
    if (!isValidUrl(memberLinks.member3)) {
      addToast('Member 3 Drive link is invalid. Enter a valid URL or N/A.', 'error');
      return;
    }
    
    // Check conditional links based on team size
    for (let i = 4; i <= teamSize; i++) {
      const link = memberLinks[`member${i}`];
      if (!link || !link.trim()) {
        addToast(`Member ${i} Drive link is required for team size ${teamSize}.`, 'error');
        return;
      }
      if (!isValidUrl(link)) {
        addToast(`Member ${i} Drive link is invalid. Enter a valid URL or N/A.`, 'error');
        return;
      }
    }

    setSubmitting(true);
    try {
      // Split IEEE counts
      const payload = {
        team_id: teamId,
        team_lead_name: teamLeadName,
        company_college: companyCollege,
        team_name: teamName,
        team_size: teamSize,
        ieee_members_count: ieeeCounts.split('/')[0]?.trim() || ieeeCounts,
        non_ieee_members_count: ieeeCounts.split('/')[1]?.trim() || 'N/A',
        member1_link: memberLinks.member1,
        member2_link: memberLinks.member2,
        member3_link: memberLinks.member3,
        member4_link: teamSize >= 4 ? memberLinks.member4 : 'N/A',
        member5_link: teamSize >= 5 ? memberLinks.member5 : 'N/A',
        member6_link: teamSize >= 6 ? memberLinks.member6 : 'N/A',
        remarks: ''
      };

      const response = await fetch('/api/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Verification submission failed.');
      }

      addToast('Verification Submitted Successfully!', 'success');
      setIsSubmitted(true);
      setVerificationFound(true);
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

            <h1 className="text-3xl font-extrabold text-white mb-2">ID Verification Submitted Successfully</h1>
            <p className="text-gray-400 text-sm mb-6">Your ID verification details have been recorded securely.</p>

            <div className="bg-slate-950/85 rounded-2xl p-6 text-left border border-slate-900 mb-8 space-y-3.5">
              <div className="flex justify-between border-b border-slate-900 pb-3">
                <span className="text-gray-500 text-sm">Team ID</span>
                <span className="text-blue-400 font-extrabold text-base">{teamId}</span>
              </div>
              <div className="flex justify-between border-b border-slate-900 pb-3">
                <span className="text-gray-500 text-sm">Team Name</span>
                <span className="text-white font-bold text-sm">{teamName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Team Lead Name</span>
                <span className="text-white font-semibold text-sm">{teamLeadName}</span>
              </div>
            </div>

            <div className="bg-blue-600/10 border-l-4 border-blue-500 p-4 rounded-r-xl text-left text-xs mb-8">
              <span className="font-semibold text-blue-400 block mb-1">💡 What Next?</span>
              <span className="text-gray-300 leading-relaxed">
                The organizers will verify your submitted proofs. You can manually check your review progress under **Status Check** or proceed to **Project Idea Submission** whenever you are ready.
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
                to="/submit-idea"
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg flex items-center justify-center"
              >
                Go to Idea Submission
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
        <ProgressTracker 
          ticketBookingCompleted={true}
          teamRegistrationCompleted={teamFound}
          idVerificationCompleted={teamFound && verificationFound}
          currentStepName="verification"
        />

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
          <h1 className="text-3xl font-extrabold text-white">ID Verification Form</h1>
          <p className="text-gray-400 mt-2">TECH HORIZON 2.0 – National Level 48-Hour Hackathon</p>
        </div>

        {/* Form Description EXACTLY as written */}
        <section className="glass rounded-2xl p-6 border border-slate-800/80 mb-8">
          <h3 className="text-lg font-bold text-white mb-3">📋 TECH HORIZON 2.0 – ID Verification Form</h3>
          <div className="text-sm text-gray-300 leading-relaxed space-y-4">
            <p>
              To ensure accurate participant records, certificate generation, and IEEE membership verification, all registered teams are requested to submit the required details and proof links through this form.
            </p>
            <p>Please provide:</p>
            <ul className="list-disc list-inside pl-2 space-y-1">
              <li>IEEE Membership ID proof links (for IEEE members)</li>
              <li>College ID proof links (for students)</li>
              <li>Team and participant details as requested</li>
            </ul>
            <p className="font-semibold text-amber-500 mt-2">⚠️ Important Notes:</p>
            <ul className="list-disc list-inside pl-2 space-y-1 text-gray-400">
              <li>Ensure all Google Drive links have "Anyone with the link" access enabled.</li>
              <li>Non-IEEE participants may enter N/A for IEEE Membership details.</li>
              <li>Working professionals may enter N/A for College ID details.</li>
              <li>All submitted information will be verified by the organizing team.</li>
              <li>Incorrect, invalid, or inaccessible proof links may affect participant verification, certification, and event benefits.</li>
            </ul>
            <p>Thank you for helping us maintain accurate participant records for TECH HORIZON 2.0. 🚀</p>
          </div>
        </section>

        {/* Verification Loader Input */}
        <div className="glass rounded-2xl p-6 border border-slate-800/80 mb-6">
          <h3 className="text-base font-bold text-white mb-4">Search & Load Your Registration</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={teamId}
              onChange={(e) => setTeamId(e.target.value.toUpperCase())}
              placeholder="Enter Team ID (e.g., TH26-0001)"
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={() => fetchTeamDetails()}
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

        {teamFound && verificationFound && (
          <div className="glass rounded-2xl p-5 border border-red-500/40 bg-red-500/5 mb-6">
            <div className="flex items-start space-x-3">
              <span className="text-red-400 text-xl mt-0.5">🚫</span>
              <div>
                <p className="text-red-300 font-bold text-sm mb-1">Already Submitted</p>
                <p className="text-red-200/80 text-sm leading-relaxed">
                  ID Verification has already been submitted for this Team ID. Multiple submissions are not allowed.
                </p>
              </div>
            </div>
          </div>
        )}

        {teamFound && !verificationFound && (
          <form onSubmit={handleSubmit} className="space-y-6 animate-fadeIn">
            {/* Auto loaded values (Disabled but visible) */}
            <div className="glass rounded-2xl p-6 border border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Team Name</label>
                <input
                  type="text"
                  disabled
                  value={teamName}
                  className="w-full bg-slate-900 border border-slate-800/50 rounded-xl px-4 py-2 text-gray-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Team Lead Name</label>
                <input
                  type="text"
                  disabled
                  value={teamLeadName}
                  className="w-full bg-slate-900 border border-slate-800/50 rounded-xl px-4 py-2 text-gray-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Company / College</label>
                <input
                  type="text"
                  disabled
                  value={companyCollege}
                  className="w-full bg-slate-900 border border-slate-800/50 rounded-xl px-4 py-2 text-gray-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Team Size</label>
                <input
                  type="text"
                  disabled
                  value={`${teamSize} Members`}
                  className="w-full bg-slate-900 border border-slate-800/50 rounded-xl px-4 py-2 text-gray-400"
                />
              </div>
            </div>

            {/* Inputs */}
            <div className="glass rounded-2xl p-6 border border-slate-800/80 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1">
                  Please specify the number of IEEE Members and Non-IEEE Members in your team. *
                  <span className="text-xs text-gray-500 block">(if no member enter N/A)</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={ieeeCounts}
                  onChange={(e) => setIeeeCounts(e.target.value)}
                  placeholder="e.g. 2 IEEE Members / 1 Non-IEEE Member"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>

              {/* Members proof links */}
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-1">
                    Member 1 Team Lead: Drive link of IEEE Membership ID and College ID *
                    <span className="text-xs text-gray-500 block">(if a working professional leave N/A)</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={memberLinks.member1}
                    onChange={(e) => handleLinkChange('member1', e.target.value)}
                    placeholder="Paste link or N/A"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-1">
                    Member 2: Drive link of IEEE Membership ID and College ID *
                    <span className="text-xs text-gray-500 block">(if a working professional leave N/A)</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={memberLinks.member2}
                    onChange={(e) => handleLinkChange('member2', e.target.value)}
                    placeholder="Paste link or N/A"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-1">
                    Member 3: Drive link of IEEE Membership ID and College ID *
                    <span className="text-xs text-gray-500 block">(if a working professional leave N/A)</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={memberLinks.member3}
                    onChange={(e) => handleLinkChange('member3', e.target.value)}
                    placeholder="Paste link or N/A"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm"
                  />
                </div>

                {teamSize >= 4 && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-1">
                      Member 4: Drive link of IEEE Membership ID and College ID *
                    </label>
                    <input
                      type="text"
                      required={teamSize >= 4}
                      value={memberLinks.member4}
                      onChange={(e) => handleLinkChange('member4', e.target.value)}
                      placeholder="Paste link or N/A"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm"
                    />
                  </div>
                )}

                {teamSize >= 5 && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-1">
                      Member 5: Drive link of IEEE Membership ID and College ID *
                    </label>
                    <input
                      type="text"
                      required={teamSize >= 5}
                      value={memberLinks.member5}
                      onChange={(e) => handleLinkChange('member5', e.target.value)}
                      placeholder="Paste link or N/A"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm"
                    />
                  </div>
                )}

                {teamSize >= 6 && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-1">
                      Member 6: Drive link of IEEE Membership ID and College ID *
                    </label>
                    <input
                      type="text"
                      required={teamSize >= 6}
                      value={memberLinks.member6}
                      onChange={(e) => handleLinkChange('member6', e.target.value)}
                      placeholder="Paste link or N/A"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-lg flex items-center space-x-2"
              >
                {submitting ? (
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                ) : (
                  <Check size={18} />
                )}
                <span>Submit Verification Proofs</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
