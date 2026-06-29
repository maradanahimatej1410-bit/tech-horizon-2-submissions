import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import ProgressTracker from '../components/ProgressTracker';
import { User, Users, HelpCircle } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  // Form State
  const [teamName, setTeamName] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('');
  const [teamSize, setTeamSize] = useState(3); // default 3 members
  const [accommodation, setAccommodation] = useState('No');
  const [referral, setReferral] = useState([]);
  const [comments, setComments] = useState('');
  const [confirmLead, setConfirmLead] = useState(false);
  const [confirmDetails, setConfirmDetails] = useState(false);
  const [confirmAllDriveLinks, setConfirmAllDriveLinks] = useState(false);

  // Members state (size 6)
  const initialMember = {
    name: '',
    gender: '',
    email: '',
    whatsapp: '',
    linkedin: '',
    college: '',
    designation: '',
    grad_year_sem: '',
    state: '',
    city: '',
    is_ieee_member: false,
    ieee_id_proof_link: '',
    college_id_proof_link: ''
  };

  const [members, setMembers] = useState(
    Array.from({ length: 6 }, (_, i) => ({
      ...initialMember,
      designation: i === 0 ? 'Team Lead' : 'Member'
    }))
  );

  const handleMemberChange = (index, field, value) => {
    setMembers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleReferralChange = (option) => {
    setReferral((prev) => {
      if (prev.includes(option)) {
        return prev.filter((o) => o !== option);
      } else {
        return [...prev, option];
      }
    });
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const validatePhone = (phone) => {
    const re = /^\+?[0-9]{8,15}$/;
    return re.test(String(phone).replace(/\s/g, ''));
  };

  const validateUrl = (url) => {
    if (url === 'N/A' || url === 'n/a') return true;
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const validateStep1 = () => {
    if (!teamName.trim()) return 'Team Name is required.';
    if (!selectedTheme) return 'Please select a Hackathon Theme.';
    if (!confirmLead) return 'You must confirm you are the Team Lead.';
    
    // Validate Team Lead (Member index 0)
    const lead = members[0];
    if (!lead.name.trim()) return 'Team Lead Name is required.';
    if (!lead.gender) return 'Team Lead Gender is required.';
    if (!lead.state.trim() || !lead.city.trim()) return 'Team Lead State and City are required.';
    if (!lead.college.trim()) return 'Team Lead College/Company is required.';
    if (!lead.designation.trim()) return 'Team Lead Designation is required.';
    if (!lead.grad_year_sem.trim()) return 'Team Lead Graduation Year / Semester is required.';
    if (!lead.email.trim()) return 'Team Lead Email is required.';
    if (!validateEmail(lead.email)) return 'Team Lead Email format is invalid.';
    if (!lead.whatsapp.trim()) return 'Team Lead WhatsApp number is required.';
    if (!validatePhone(lead.whatsapp)) return 'Team Lead WhatsApp number is invalid. Use digits only (8-15 characters).';
    if (!lead.linkedin.trim()) return 'Team Lead LinkedIn URL is required.';
    if (!validateUrl(lead.linkedin)) return 'Team Lead LinkedIn URL is invalid.';
    if (!lead.college_id_proof_link.trim()) return 'Team Lead College ID Proof Drive Link is required.';
    if (!validateUrl(lead.college_id_proof_link)) return 'Team Lead College ID Proof Link must be a valid URL.';
    if (lead.is_ieee_member && !lead.ieee_id_proof_link.trim()) return 'Team Lead IEEE ID Proof Drive Link is required.';
    if (lead.is_ieee_member && lead.ieee_id_proof_link.trim() !== 'N/A' && !validateUrl(lead.ieee_id_proof_link)) return 'Team Lead IEEE ID Proof Link must be a valid URL.';
    
    return null;
  };

  const validateStep2 = () => {
    // Validate members 2 to N
    for (let i = 1; i < teamSize; i++) {
      const m = members[i];
      if (!m.name.trim()) return `Member ${i + 1} Name is required.`;
      if (!m.gender) return `Member ${i + 1} Gender is required.`;
      if (!m.email.trim()) return `Member ${i + 1} Email is required.`;
      if (!validateEmail(m.email)) return `Member ${i + 1} Email format is invalid.`;
      if (!m.whatsapp.trim()) return `Member ${i + 1} WhatsApp number is required.`;
      if (!validatePhone(m.whatsapp)) return `Member ${i + 1} WhatsApp number is invalid. Use digits only (8-15 characters).`;
      if (!m.linkedin.trim()) return `Member ${i + 1} LinkedIn URL is required.`;
      if (!validateUrl(m.linkedin)) return `Member ${i + 1} LinkedIn URL is invalid.`;
      if (!m.college.trim()) return `Member ${i + 1} College/Company is required.`;
      if (!m.designation.trim()) return `Member ${i + 1} Designation is required.`;
      if (!m.grad_year_sem.trim()) return `Member ${i + 1} Graduation Year / Semester is required.`;
      if (!m.college_id_proof_link.trim()) return `Member ${i + 1} College ID Proof Drive Link is required.`;
      if (!validateUrl(m.college_id_proof_link)) return `Member ${i + 1} College ID Proof Link must be a valid URL.`;
      if (m.is_ieee_member && !m.ieee_id_proof_link.trim()) return `Member ${i + 1} IEEE ID Proof Drive Link is required.`;
      if (m.is_ieee_member && m.ieee_id_proof_link.trim() !== 'N/A' && !validateUrl(m.ieee_id_proof_link)) return `Member ${i + 1} IEEE ID Proof Link must be a valid URL.`;
    }

    if (!confirmAllDriveLinks) return 'You must confirm that IEEE / College ID drive links are filled for all members.';
    if (!confirmDetails) return 'You must confirm that the details are valid for communication.';
    if (referral.length === 0) return 'Please check at least one option under "Where did you hear about this event?".';

    return null;
  };

  const handleNext = () => {
    const error = validateStep1();
    if (error) {
      addToast(error, 'error');
    } else {
      setStep(2);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validateStep2();
    if (error) {
      addToast(error, 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        team_name: teamName,
        selected_theme: selectedTheme,
        accommodation_required: accommodation === 'Yes',
        referral_source: referral.join(', '),
        additional_comments: comments,
        members: members.slice(0, teamSize).map((m, idx) => ({
          name: m.name,
          gender: m.gender,
          email: m.email,
          whatsapp: m.whatsapp,
          linkedin: m.linkedin,
          college: m.college,
          designation: m.designation,
          grad_year_sem: m.grad_year_sem,
          state: idx === 0 ? m.state : (members[0].state || 'N/A'),
          city: idx === 0 ? m.city : (members[0].city || 'N/A'),
          is_ieee_member: m.is_ieee_member,
          ieee_id_proof_link: m.is_ieee_member ? m.ieee_id_proof_link : 'N/A',
          college_id_proof_link: m.college_id_proof_link
        }))
      };

      const response = await fetch('/api/registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Registration failed.');
      }

      addToast('Registration Successful!', 'success');
      // Redirect to dedicated success view
      navigate('/registration-success', { 
        state: { 
          success: true, 
          teamId: data.id, 
          teamName: data.team_name,
          leadName: data.participants[0].name,
          regTime: data.created_at
        } 
      });
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0b0f19] bg-grid min-h-screen pb-20 px-4">
      <div className="max-w-4xl mx-auto pt-10">
        <ProgressTracker 
          ticketBookingCompleted={true}
          teamRegistrationCompleted={false}
          idVerificationCompleted={false}
          currentStepName="registration"
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
          <h1 className="text-3xl font-extrabold text-white">Team Registration Form</h1>
          <p className="text-gray-400 mt-2">TECH HORIZON 2.0 – National Level 48-Hour Hackathon</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {step === 1 && (
            <div className="space-y-6">
              {/* --- TEAM GENERAL INFO --- */}
              <div className="glass rounded-2xl p-6 border border-slate-800/80">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                  <Users className="text-blue-500 w-5 h-5" />
                  <span>1. Team Specifications</span>
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-1">📋 Team Name *</label>
                    <input
                      type="text"
                      required
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="Enter team name"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-1">📊 Team Size *</label>
                      <select
                        value={teamSize}
                        onChange={(e) => setTeamSize(parseInt(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                      >
                        {[3, 4, 5, 6].map((num) => (
                          <option key={num} value={num}>{num} Members</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-1">🎯 Selected Hackathon Theme *</label>
                      <select
                        required
                        value={selectedTheme}
                        onChange={(e) => setSelectedTheme(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="">Select a Theme</option>
                        {[
                          "Generative AI", "Health & Biotech", "Security & Surveillance", 
                          "E-Commerce", "Clean & Green Technology", "Smart Automation", 
                          "Blockchain & Cryptography", "Game Development", "Circuit Design", 
                          "Embedded Systems", "Defense Technologies", "Next-Generation Communication", 
                          "Sustainable Development", "Open Innovation (Any Real-World Problem)"
                        ].map((theme) => (
                          <option key={theme} value={theme}>{theme}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={confirmLead}
                        onChange={(e) => setConfirmLead(e.target.checked)}
                        className="w-4 h-4 mt-1 text-blue-600 bg-slate-950 border-slate-800 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-300 select-none">
                        I confirm that I am the Team Leader.<br />
                        <span className="text-xs text-gray-500">(Note:- this form must be filled by Team Lead on behalf of whole team, First enter team lead details as a priority)</span>
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* --- MEMBER 1 (TEAM LEAD) DETAILS --- */}
              <div className="glass rounded-2xl p-6 border border-slate-800/80">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                  <User className="text-blue-500 w-5 h-5" />
                  <span>2. Team Lead Details</span>
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-1">Name *</label>
                    <input
                      type="text"
                      required
                      value={members[0].name}
                      onChange={(e) => handleMemberChange(0, 'name', e.target.value)}
                      placeholder="Full Name"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-1">Gender *</label>
                    <select
                      required
                      value={members[0].gender}
                      onChange={(e) => handleMemberChange(0, 'gender', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={members[0].email}
                      onChange={(e) => handleMemberChange(0, 'email', e.target.value)}
                      placeholder="Email Address"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-1">📞 WhatsApp number *</label>
                    <input
                      type="tel"
                      required
                      value={members[0].whatsapp}
                      onChange={(e) => handleMemberChange(0, 'whatsapp', e.target.value)}
                      placeholder="WhatsApp Phone Number"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-1">LinkedIn URL *</label>
                    <input
                      type="url"
                      required
                      value={members[0].linkedin}
                      onChange={(e) => handleMemberChange(0, 'linkedin', e.target.value)}
                      placeholder="LinkedIn Profile URL"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-1">Company / College *</label>
                    <input
                      type="text"
                      required
                      value={members[0].college}
                      onChange={(e) => handleMemberChange(0, 'college', e.target.value)}
                      placeholder="College or Organization Name"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-1">Designation *</label>
                    <input
                      type="text"
                      required
                      value={members[0].designation}
                      onChange={(e) => handleMemberChange(0, 'designation', e.target.value)}
                      placeholder="Student / Profession"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-1">🏫 Graduation Year / Year of Study & Semester *</label>
                    <input
                      type="text"
                      required
                      value={members[0].grad_year_sem}
                      onChange={(e) => handleMemberChange(0, 'grad_year_sem', e.target.value)}
                      placeholder="e.g. 2027 / 3rd Year 1st Sem"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-1">State *</label>
                      <input
                        type="text"
                        required
                        value={members[0].state}
                        onChange={(e) => handleMemberChange(0, 'state', e.target.value)}
                        placeholder="State"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-1">City *</label>
                      <input
                        type="text"
                        required
                        value={members[0].city}
                        onChange={(e) => handleMemberChange(0, 'city', e.target.value)}
                        placeholder="City"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* IEEE Member radio */}
                <div className="mt-4 border-t border-slate-800/50 pt-4">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Are you an IEEE MEMBER ? *</label>
                  <div className="flex space-x-6">
                    <label className="flex items-center space-x-2 cursor-pointer text-gray-300 select-none">
                      <input
                        type="radio"
                        checked={members[0].is_ieee_member === true}
                        onChange={() => handleMemberChange(0, 'is_ieee_member', true)}
                        className="text-blue-600 bg-slate-950 border-slate-800 focus:ring-blue-500"
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer text-gray-300 select-none">
                      <input
                        type="radio"
                        checked={members[0].is_ieee_member === false}
                        onChange={() => handleMemberChange(0, 'is_ieee_member', false)}
                        className="text-blue-600 bg-slate-950 border-slate-800 focus:ring-blue-500"
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>

                {/* ID proof links */}
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-1">
                      🔗 College ID Proof Drive Link *
                    </label>
                    <input
                      type="url"
                      required
                      value={members[0].college_id_proof_link}
                      onChange={(e) => handleMemberChange(0, 'college_id_proof_link', e.target.value)}
                      placeholder="Paste College ID Google Drive Link (Anyone with the link view access)"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {members[0].is_ieee_member && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-1">
                        🔗 IEEE Membership ID Drive Link *
                      </label>
                      <input
                        type="url"
                        required={members[0].is_ieee_member}
                        value={members[0].ieee_id_proof_link}
                        onChange={(e) => handleMemberChange(0, 'ieee_id_proof_link', e.target.value)}
                        placeholder="Paste IEEE Card Google Drive Link"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Next step button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleNext}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg flex items-center space-x-2"
                >
                  <span>Continue to Member Details</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              {/* Dynamic member inputs from Member 2 to Team Size */}
              {Array.from({ length: teamSize - 1 }).map((_, idx) => {
                const memberIndex = idx + 1;
                const m = members[memberIndex];
                
                return (
                  <div key={memberIndex} className="glass rounded-2xl p-6 border border-slate-800/80">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                      <User className="text-blue-500 w-5 h-5" />
                      <span>Member {memberIndex + 1} Details</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-1">Name *</label>
                        <input
                          type="text"
                          required
                          value={m.name}
                          onChange={(e) => handleMemberChange(memberIndex, 'name', e.target.value)}
                          placeholder="Full Name"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-1">Email *</label>
                        <input
                          type="email"
                          required
                          value={m.email}
                          onChange={(e) => handleMemberChange(memberIndex, 'email', e.target.value)}
                          placeholder="Email Address"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-1">WhatsApp number *</label>
                        <input
                          type="tel"
                          required
                          value={m.whatsapp}
                          onChange={(e) => handleMemberChange(memberIndex, 'whatsapp', e.target.value)}
                          placeholder="WhatsApp Phone Number"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-1">LinkedIn URL *</label>
                        <input
                          type="url"
                          required
                          value={m.linkedin}
                          onChange={(e) => handleMemberChange(memberIndex, 'linkedin', e.target.value)}
                          placeholder="LinkedIn Profile URL"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-1">Company / College *</label>
                        <input
                          type="text"
                          required
                          value={m.college}
                          onChange={(e) => handleMemberChange(memberIndex, 'college', e.target.value)}
                          placeholder="College or Organization Name"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-1">Designation *</label>
                        <input
                          type="text"
                          required
                          value={m.designation}
                          onChange={(e) => handleMemberChange(memberIndex, 'designation', e.target.value)}
                          placeholder="Student / Profession"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-1">Graduation Year / Study & Semester *</label>
                        <input
                          type="text"
                          required
                          value={m.grad_year_sem}
                          onChange={(e) => handleMemberChange(memberIndex, 'grad_year_sem', e.target.value)}
                          placeholder="e.g. 2027 / 3rd Year 1st Sem"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-1">Gender *</label>
                        <select
                          required
                          value={m.gender}
                          onChange={(e) => handleMemberChange(memberIndex, 'gender', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-4 border-t border-slate-800/50 pt-4">
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Are they an IEEE MEMBER ? *</label>
                      <div className="flex space-x-6">
                        <label className="flex items-center space-x-2 cursor-pointer text-gray-300 select-none">
                          <input
                            type="radio"
                            checked={m.is_ieee_member === true}
                            onChange={() => handleMemberChange(memberIndex, 'is_ieee_member', true)}
                            className="text-blue-600 bg-slate-950 border-slate-800 focus:ring-blue-500"
                          />
                          <span>Yes</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer text-gray-300 select-none">
                          <input
                            type="radio"
                            checked={m.is_ieee_member === false}
                            onChange={() => handleMemberChange(memberIndex, 'is_ieee_member', false)}
                            className="text-blue-600 bg-slate-950 border-slate-800 focus:ring-blue-500"
                          />
                          <span>No</span>
                        </label>
                      </div>
                    </div>

                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-1">
                          🔗 College ID Proof Drive Link *
                        </label>
                        <input
                          type="url"
                          required
                          value={m.college_id_proof_link}
                          onChange={(e) => handleMemberChange(memberIndex, 'college_id_proof_link', e.target.value)}
                          placeholder="Paste College ID Google Drive Link"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {m.is_ieee_member && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-300 mb-1">
                            🔗 IEEE Membership ID Drive Link *
                          </label>
                          <input
                            type="url"
                            required={m.is_ieee_member}
                            value={m.ieee_id_proof_link}
                            onChange={(e) => handleMemberChange(memberIndex, 'ieee_id_proof_link', e.target.value)}
                            placeholder="Paste IEEE Card Google Drive Link"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* --- ACCOMMODATION & ADDITIONAL INFO --- */}
              <div className="glass rounded-2xl p-6 border border-slate-800/80 space-y-4">
                <h3 className="text-lg font-bold text-white mb-2 flex items-center space-x-2">
                  <HelpCircle className="text-blue-500 w-5 h-5" />
                  <span>3. Final Inquiries</span>
                </h3>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">🏨 Do you require accommodation? *</label>
                  <div className="flex space-x-6">
                    <label className="flex items-center space-x-2 cursor-pointer text-gray-300 select-none">
                      <input
                        type="radio"
                        checked={accommodation === 'Yes'}
                        onChange={() => setAccommodation('Yes')}
                        className="text-blue-600 bg-slate-950 border-slate-800 focus:ring-blue-500"
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer text-gray-300 select-none">
                      <input
                        type="radio"
                        checked={accommodation === 'No'}
                        onChange={() => setAccommodation('No')}
                        className="text-blue-600 bg-slate-950 border-slate-800 focus:ring-blue-500"
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">📢 Where did you hear about this event? *</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {['LinkedIn', 'Instagram', 'WhatsApp', 'Friends', 'College', 'Other'].map((option) => (
                      <label key={option} className="flex items-center space-x-2 cursor-pointer text-gray-300 select-none">
                        <input
                          type="checkbox"
                          checked={referral.includes(option)}
                          onChange={() => handleReferralChange(option)}
                          className="w-4 h-4 text-blue-600 bg-slate-950 border-slate-800 rounded focus:ring-blue-500"
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-1">📝 Anything else that you would like to tell us?</label>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Comments, special requests, team context, etc. (Optional)"
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Form Agreements Checkbox */}
                <div className="pt-4 border-t border-slate-800/50 space-y-3">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={confirmAllDriveLinks}
                      onChange={(e) => setConfirmAllDriveLinks(e.target.checked)}
                      className="w-4 h-4 mt-1 text-blue-600 bg-slate-950 border-slate-800 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-300 select-none">
                      Fill all details of members → IEEE, College ID drive links; Non-IEEE participants may enter N/A for IEEE details. *
                    </span>
                  </label>

                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={confirmDetails}
                      onChange={(e) => setConfirmDetails(e.target.checked)}
                      className="w-4 h-4 mt-1 text-blue-600 bg-slate-950 border-slate-800 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-300 select-none">
                      I confirm the details are valid for communication & idea submissions. *
                    </span>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="glass hover:bg-white/5 border border-slate-800 text-white font-bold px-6 py-3 rounded-xl transition-all"
                >
                  Back
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg flex items-center space-x-2"
                >
                  {loading ? (
                    <span className="flex items-center space-x-2">
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                      <span>Submitting...</span>
                    </span>
                  ) : (
                    <span>Submit Registration</span>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
const ArrowRight = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
);
