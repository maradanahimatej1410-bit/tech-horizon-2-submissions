import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../components/Toast';
import { 
  Users, Award, ClipboardCheck, Clock, Download, 
  Search, ChevronLeft, ChevronRight, Check, X, 
  Mail, Copy, Save, Database, Settings, LogOut, Lock, Calendar, BookOpen
} from 'lucide-react';

export default function AdminDashboard() {
  const { addToast } = useToast();
  const [token, setToken] = useState(localStorage.getItem('admin_token') || '');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Dashboard Stats & Data
  const [stats, setStats] = useState(null);
  const [teams, setTeams] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [accomFilter, setAccomFilter] = useState('');
  const [ieeeFilter, setIeeeFilter] = useState('');
  
  // Table Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Sorting
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  // Drawer / Selected Team Modal state
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [noteHistory, setNoteHistory] = useState([]);
  const [adminSaving, setAdminSaving] = useState(false);

  // Tab State
  const [adminTab, setAdminTab] = useState('dashboard');
  
  // Project Idea Evaluation States
  const [evalRemarksTeamId, setEvalRemarksTeamId] = useState(null);
  const [evalRemarks, setEvalRemarks] = useState('');
  const [evalLoading, setEvalLoading] = useState(false);
  
  // Event Settings State
  const [eventSettings, setEventSettings] = useState({
    event_name: 'TECH HORIZON 2.0',
    ticket_link: '',
    registration_deadline: '2026-11-11T23:59:59',
    idea_deadline: '2026-11-11T23:59:59'
  });

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Login failed.');
      }
      localStorage.setItem('admin_token', data.access_token);
      setToken(data.access_token);
      addToast('Login Successful!', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoginLoading(false);
    }
  };

  // Logout handler
  const handleLogout = useCallback(() => {
    localStorage.removeItem('admin_token');
    setToken('');
    addToast('Logged out successfully.', 'info');
  }, [addToast]);

  // Fetch Dashboard Stats & Teams list
  const fetchDashboardData = useCallback(async () => {
    if (!token) return;
    setDashboardLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      
      // Fetch Stats
      const statsRes = await fetch('/api/admin/dashboard', { headers });
      const statsData = await statsRes.json();
      if (statsRes.ok) {
        setStats(statsData);
      }

      // Fetch Teams
      const teamsRes = await fetch('/api/admin/teams', { headers });
      const teamsData = await teamsRes.json();
      if (teamsRes.ok) {
        setTeams(teamsData);
        setFilteredTeams(teamsData);
      }

      // Fetch Settings
      const settingsRes = await fetch('/api/settings');
      const settingsData = await settingsRes.json();
      if (settingsRes.ok) {
        const loadedSettings = {};
        settingsData.forEach(s => {
          loadedSettings[s.key] = s.value;
        });
        setEventSettings(prev => ({ ...prev, ...loadedSettings }));
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      addToast('Failed to fetch dashboard data. Your session may have expired.', 'error');
      handleLogout();
    } finally {
      setDashboardLoading(false);
    }
  }, [token, addToast, handleLogout]);

  useEffect(() => {
    if (token) {
      const timer = setTimeout(() => {
        fetchDashboardData();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [token, fetchDashboardData]);

  // Search & Filtering logic
  useEffect(() => {
    let result = [...teams];

    // Global Search
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase().trim();
      result = result.filter(t => 
        t.id.toLowerCase().includes(query) ||
        t.team_name.toLowerCase().includes(query) ||
        t.selected_theme.toLowerCase().includes(query) ||
        t.verification_status.toLowerCase().includes(query) ||
        t.participants.some(p => 
          p.name.toLowerCase().includes(query) ||
          p.email.toLowerCase().includes(query) ||
          p.whatsapp.toLowerCase().includes(query) ||
          p.college.toLowerCase().includes(query) ||
          p.state.toLowerCase().includes(query)
        )
      );
    }

    // Status Filter
    if (statusFilter) {
      result = result.filter(t => t.verification_status === statusFilter);
    }

    // Accommodation Filter
    if (accomFilter) {
      const needAccom = accomFilter === 'Yes';
      result = result.filter(t => t.accommodation_required === needAccom);
    }

    // IEEE Filter
    if (ieeeFilter) {
      const isIeee = ieeeFilter === 'Yes';
      result = result.filter(t => 
        isIeee 
          ? t.participants.some(p => p.is_ieee_member) 
          : t.participants.every(p => !p.is_ieee_member)
      );
    }

    // Sorting
    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      // Fallback for nested sort fields if any
      if (sortField === 'created_at') {
        aVal = new Date(a.created_at).getTime();
        bVal = new Date(b.created_at).getTime();
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    const timer = setTimeout(() => {
      setFilteredTeams(result);
      setCurrentPage(1); // Reset page on filter
    }, 0);
    return () => clearTimeout(timer);
  }, [teams, searchTerm, statusFilter, accomFilter, ieeeFilter, sortField, sortOrder]);

  // Pagination bounds
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTeams = filteredTeams.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTeams.length / itemsPerPage);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Open team side drawer
  const openTeamDrawer = async (team) => {
    setSelectedTeam(team);
    setDrawerOpen(true);
    setNewNote('');
    // Fetch note history
    try {
      const res = await fetch(`/api/admin/teams/${team.id}/notes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setNoteHistory(data);
      }
    } catch (error) {
      console.error("Failed to load notes:", error);
    }
  };

  // Add Note Handler
  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    try {
      const res = await fetch(`/api/admin/teams/${selectedTeam.id}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ note_text: newNote })
      });
      const data = await res.json();
      if (res.ok) {
        setNoteHistory(prev => [data, ...prev]);
        setNewNote('');
        addToast('Admin Note Added.', 'success');
        // Refresh team list to sync notes count
        fetchDashboardData();
      }
    } catch (error) {
      console.error("Failed to add note:", error);
    }
  };

  // Update Team details (Drawer saving)
  const handleSaveTeamEdits = async (updatedTeamPayload) => {
    setAdminSaving(true);
    try {
      const res = await fetch(`/api/admin/teams/${selectedTeam.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedTeamPayload)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Failed to save changes.');
      }
      addToast('Team details updated successfully!', 'success');
      // Sync list
      setTeams(prev => prev.map(t => t.id === data.id ? data : t));
      setSelectedTeam(data);
      fetchDashboardData(); // sync stats widgets
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setAdminSaving(false);
    }
  };

  // Trigger manual emails
  const triggerEmail = async (type, remarks = '') => {
    try {
      const res = await fetch(`/api/admin/teams/${selectedTeam.id}/email?email_type=${type}&remarks=${encodeURIComponent(remarks)}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Email transmission failed.');
      }
      addToast(data.message, 'success');
      // Refresh notes/logs
      openTeamDrawer(selectedTeam);
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Export Download Handlers
  const downloadExport = async (format) => {
    try {
      const url = `/api/admin/export/${format}`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error('Export download failed.');
      }
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      
      const dateStr = new Date().toISOString().slice(0, 10);
      let filename = `TECH_HORIZON_Export_${dateStr}`;
      if (format.includes('excel')) {
        filename = `${format.replace('/', '_')}_${dateStr}.xlsx`;
      } else if (format.includes('csv')) {
        filename = `${format.replace('/', '_')}_${dateStr}.csv`;
      } else {
        filename = `database_backup_${dateStr}.json`;
      }

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      addToast(`Downloaded ${format.toUpperCase()} export successfully!`, 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };


  const handleUpdateIdeaVerification = async (teamId, status, remarks = '') => {
    setEvalLoading(true);
    try {
      const res = await fetch(`/api/admin/project-idea/verify/${teamId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, remarks })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Failed to update evaluation status.');
      }
      addToast(`Project idea status marked as ${status} successfully!`, 'success');
      
      // Sync list
      setTeams(prev => prev.map(t => t.id === data.id ? { ...t, ...data } : t));
      setEvalRemarksTeamId(null);
      setEvalRemarks('');
      fetchDashboardData(); // sync stats widgets
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setEvalLoading(false);
    }
  };

  // Settings Save Handler
  const handleSaveSettings = async (key, val) => {
    try {
      const res = await fetch(`/api/admin/settings/${key}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ value: val })
      });
      if (res.ok) {
        addToast(`Setting ${key} updated dynamically.`, 'success');
        setEventSettings(prev => ({ ...prev, [key]: val }));
      }
    } catch (error) {
      console.error("Failed to update setting:", error);
    }
  };

  // Copy helpers
  const copyToClipboard = (text, type = 'Text') => {
    navigator.clipboard.writeText(text);
    addToast(`${type} copied to clipboard.`, 'success');
  };

  // Batch actions
  const copySelectedContacts = (type) => {
    const list = filteredTeams.map(t => {
      const lead = t.participants.find(p => p.member_index === 1);
      if (!lead) return null;
      return type === 'email' ? lead.email : type === 'whatsapp' ? lead.whatsapp : t.id;
    }).filter(Boolean);

    copyToClipboard(list.join(', '), `Batch ${type} list`);
  };

  // Days Countdowns
  const getCountdownDays = (deadlineStr) => {
    const now = new Date();
    const diff = new Date(deadlineStr) - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days} Days` : 'Expired';
  };

  if (!token) {
    return (
      <div className="bg-[#0b0f19] bg-grid min-h-screen flex items-center justify-center px-4 py-20">
        <div className="glass max-w-md w-full p-8 rounded-3xl border border-slate-800 shadow-2xl relative">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-600/10 text-blue-500 mb-4 border border-blue-500/20">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-white">Organizer Login</h2>
            <p className="text-gray-400 text-xs mt-1">Credentials configured via environmental variable settings</p>
          </div>

          <div className="bg-rose-500/10 border-l-4 border-rose-500 p-4 rounded-r-xl text-left text-xs mb-6">
            <span className="font-bold text-rose-400 block mb-0.5">⚠️ Restricted Area</span>
            <span className="text-gray-300">
              This area is restricted to TECH HORIZON 2.0 organizers only. Unauthorized users are not permitted to access organizer resources.
            </span>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Admin username"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold p-3 rounded-xl transition-all shadow-md mt-2 flex items-center justify-center space-x-2"
            >
              {loginLoading ? <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span> : null}
              <span>Access Organizer Room</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0b0f19] min-h-screen text-slate-100 flex flex-col md:flex-row relative">
      
      {/* --- SIDEBAR NAV --- */}
      <aside className="w-full md:w-64 bg-slate-950 border-r border-slate-900/60 p-5 flex flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center space-x-2 mb-8">
            <div className="bg-blue-600 p-1 rounded font-bold text-white text-xs">IEEE</div>
            <span className="font-extrabold text-white text-base">Organizer Room</span>
          </div>

          <nav className="space-y-1.5">
            <button
              onClick={() => setAdminTab('dashboard')}
              className={`w-full flex items-center space-x-2.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                adminTab === 'dashboard' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Users size={16} />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setAdminTab('registrations')}
              className={`w-full flex items-center space-x-2.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                adminTab === 'registrations' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <ClipboardCheck size={16} />
              <span>Team Registration Details</span>
            </button>
            <button
              onClick={() => setAdminTab('idea-submissions')}
              className={`w-full flex items-center space-x-2.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                adminTab === 'idea-submissions' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <BookOpen size={16} />
              <span>Project Idea Submissions</span>
            </button>
            <button
              onClick={() => setAdminTab('idea-verification')}
              className={`w-full flex items-center space-x-2.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                adminTab === 'idea-verification' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Award size={16} />
              <span>Project Idea Verification</span>
            </button>
            <button
              onClick={() => setAdminTab('statistics')}
              className={`w-full flex items-center space-x-2.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                adminTab === 'statistics' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Database size={16} />
              <span>Dashboard Statistics</span>
            </button>
            <button
              onClick={() => setAdminTab('downloads')}
              className={`w-full flex items-center space-x-2.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                adminTab === 'downloads' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Download size={16} />
              <span>Downloads</span>
            </button>
            <button
              onClick={() => setAdminTab('settings')}
              className={`w-full flex items-center space-x-2.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                adminTab === 'settings' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Settings size={16} />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-900 mt-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 p-2.5 bg-rose-600/10 hover:bg-rose-600 text-rose-400 hover:text-white rounded-xl text-xs font-semibold border border-rose-500/20 transition-all"
          >
            <LogOut size={14} />
            <span>End Session</span>
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-full">
        {dashboardLoading ? (
          <div className="flex flex-col items-center justify-center h-96 space-y-3">
            <span className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></span>
            <p className="text-gray-400 text-sm">Syncing Live Database Fields...</p>
          </div>
        ) : (
          <div className="space-y-8 animate-fadeIn">

            {/* --- TAB 1: METRICS & ANALYTICS --- */}
            {adminTab === 'dashboard' && stats && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-extrabold text-white">Event Dashboard</h1>
                    <p className="text-xs text-gray-400">Live indicators compiled from database timestamps</p>
                  </div>
                  {/* Countdowns */}
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-900 flex items-center space-x-2">
                      <Calendar size={16} className="text-blue-500" />
                      <div className="text-[10px]">
                        <span className="text-gray-500 block uppercase font-bold">Reg Deadline</span>
                        <span className="text-white font-extrabold">{getCountdownDays(eventSettings.registration_deadline)}</span>
                      </div>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-900 flex items-center space-x-2">
                      <Calendar size={16} className="text-purple-500" />
                      <div className="text-[10px]">
                        <span className="text-gray-500 block uppercase font-bold">Idea Deadline</span>
                        <span className="text-white font-extrabold">{getCountdownDays(eventSettings.idea_deadline)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Widgets */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-900/80">
                    <span className="text-xs text-gray-500 uppercase block font-bold">Total Registrations</span>
                    <span className="text-2xl font-black text-white mt-1.5 block">{stats.widgets.totalRegistrations}</span>
                  </div>
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-900/80">
                    <span className="text-xs text-gray-500 uppercase block font-bold">Total Teams</span>
                    <span className="text-2xl font-black text-blue-400 mt-1.5 block">{stats.widgets.totalTeams}</span>
                  </div>
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-900/80">
                    <span className="text-xs text-gray-500 uppercase block font-bold">Pending Verification</span>
                    <span className="text-2xl font-black text-amber-500 mt-1.5 block">{stats.widgets.pendingVerification}</span>
                  </div>
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-900/80">
                    <span className="text-xs text-gray-500 uppercase block font-bold">Verified Teams</span>
                    <span className="text-2xl font-black text-emerald-500 mt-1.5 block">{stats.widgets.verifiedTeams}</span>
                  </div>

                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-900/80">
                    <span className="text-xs text-gray-500 uppercase block font-bold">Total Colleges</span>
                    <span className="text-lg font-black text-white mt-1.5 block">{stats.widgets.totalColleges}</span>
                  </div>
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-900/80">
                    <span className="text-xs text-gray-500 uppercase block font-bold">Total States</span>
                    <span className="text-lg font-black text-white mt-1.5 block">{stats.widgets.totalStates}</span>
                  </div>
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-900/80">
                    <span className="text-xs text-gray-500 uppercase block font-bold">Avg Team Size</span>
                    <span className="text-lg font-black text-blue-400 mt-1.5 block">{stats.widgets.avgTeamSize} Members</span>
                  </div>
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-900/80">
                    <span className="text-xs text-gray-500 uppercase block font-bold">Most Popular Theme</span>
                    <span className="text-sm font-black text-white mt-2 block truncate">{stats.widgets.popularTheme}</span>
                  </div>
                </div>

                {/* Second tier stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-900/60 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-bold block">IEEE Members</span>
                      <span className="text-base font-extrabold text-blue-400 mt-1">{stats.widgets.ieeeMembers} Participants</span>
                    </div>
                    <span className="text-xs text-gray-600 bg-slate-900 px-2 py-1 rounded">IEEE</span>
                  </div>
                  <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-900/60 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-bold block">Non-IEEE Members</span>
                      <span className="text-base font-extrabold text-gray-400 mt-1">{stats.widgets.nonIeeeMembers} Participants</span>
                    </div>
                    <span className="text-xs text-gray-600 bg-slate-900 px-2 py-1 rounded">Non-IEEE</span>
                  </div>
                  <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-900/60 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-bold block">Accommodation Requests</span>
                      <span className="text-base font-extrabold text-purple-400 mt-1">{stats.widgets.accommodationRequests} Teams</span>
                    </div>
                    <span className="text-xs text-gray-600 bg-slate-900 px-2 py-1 rounded">Accommodation</span>
                  </div>
                </div>

                {/* Custom Inline SVG Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  {/* Daily registration graph */}
                  <div className="glass p-5 rounded-2xl border border-slate-800">
                    <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">Registration Timeline (Trend)</h3>
                    {stats.charts.registrationTrend.length > 0 ? (
                      <div className="relative h-48 w-full flex items-end justify-between pt-6 px-4">
                        {/* Render simple bars */}
                        {stats.charts.registrationTrend.map((t, idx) => (
                          <div key={idx} className="flex flex-col items-center flex-1 group">
                            <div className="text-[10px] text-blue-400 font-bold mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {t.count}
                            </div>
                            <div 
                              className="bg-blue-600 w-6 rounded-t-md hover:bg-blue-400 transition-all duration-300 shadow-md shadow-blue-500/10"
                              style={{ height: `${(t.count / Math.max(...stats.charts.registrationTrend.map(r => r.count), 1)) * 120}px` }}
                            ></div>
                            <div className="text-[9px] text-gray-500 mt-2 truncate w-full text-center">{t.date}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500 text-center py-20">No trend data available.</div>
                    )}
                  </div>

                  {/* Themes Distribution */}
                  <div className="glass p-5 rounded-2xl border border-slate-800">
                    <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">Popular Themes</h3>
                    <div className="space-y-3.5">
                      {stats.charts.themeDistribution.map((t, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="font-semibold text-gray-300">{t.name}</span>
                            <span className="text-blue-400 font-bold">{t.value} Teams</span>
                          </div>
                          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                            <div 
                              className="bg-gradient-to-r from-blue-600 to-indigo-500 h-full rounded-full"
                              style={{ width: `${(t.value / stats.widgets.totalTeams) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Activity log columns */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                  <div className="glass p-5 rounded-2xl border border-slate-800/80">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800/80 pb-2 mb-4">Recent Registrations</h4>
                    <div className="space-y-3">
                      {stats.recent.registrations.map(r => (
                        <div key={r.id} className="flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold text-gray-300 block">{r.team_name}</span>
                            <span className="text-[10px] text-gray-500">Lead: {r.lead_name}</span>
                          </div>
                          <span className="text-blue-500 font-bold">{r.id}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass p-5 rounded-2xl border border-slate-800/80">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800/80 pb-2 mb-4">Recent Verifications</h4>
                    <div className="space-y-3">
                      {stats.recent.verifications.map((v, i) => (
                        <div key={i} className="flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold text-gray-300 block">{v.team_name}</span>
                            <span className="text-[10px] text-gray-500">Lead: {v.lead_name}</span>
                          </div>
                          <span className="text-amber-500 font-bold">{v.team_id}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass p-5 rounded-2xl border border-slate-800/80">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800/80 pb-2 mb-4">Latest Approved Teams</h4>
                    <div className="space-y-3">
                      {stats.recent.approved.map(r => (
                        <div key={r.id} className="flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold text-gray-300 block">{r.team_name}</span>
                            <span className="text-[10px] text-gray-500">Lead: {r.lead_name}</span>
                          </div>
                          <span className="text-emerald-500 font-bold">{r.id}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* --- TAB 2: TEAMS MANAGEMENT TABLE --- */}
            {adminTab === 'registrations' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-extrabold text-white">Teams Database</h1>
                    <p className="text-xs text-gray-400">Review registrations, verifications, and notes</p>
                  </div>
                  
                  {/* Batch copier actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => copySelectedContacts('email')}
                      className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs px-3 py-2 rounded-xl text-gray-300 flex items-center space-x-1.5"
                    >
                      <Copy size={12} />
                      <span>Copy Emails</span>
                    </button>
                    <button
                      onClick={() => copySelectedContacts('whatsapp')}
                      className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs px-3 py-2 rounded-xl text-gray-300 flex items-center space-x-1.5"
                    >
                      <Copy size={12} />
                      <span>Copy WhatsApps</span>
                    </button>
                  </div>
                </div>

                {/* Filter and search bar */}
                <div className="glass p-4 rounded-2xl border border-slate-850 flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search */}
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search ID, Team, Name, College, State, Email..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    
                    {/* Status Filter */}
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Verification Status</option>
                      <option value="Pending">Pending</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Needs Correction">Needs Correction</option>
                    </select>

                    {/* Accommodation */}
                    <select
                      value={accomFilter}
                      onChange={(e) => setAccomFilter(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Accommodation</option>
                      <option value="Yes">Required</option>
                      <option value="No">Not Required</option>
                    </select>

                    {/* IEEE */}
                    <select
                      value={ieeeFilter}
                      onChange={(e) => setIeeeFilter(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="">IEEE Members Only</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                    {/* Cards List for Team & Complete Participant Details */}
                <div className="space-y-6">
                  {currentTeams.map((team) => {
                    const lead = team.participants.find(p => p.member_index === 1);
                    return (
                      <div key={team.id} className="glass rounded-2xl p-6 border border-slate-850 bg-slate-950/30 space-y-4">
                        {/* Team Card Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-slate-900 gap-4">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="bg-blue-500/10 text-blue-400 text-[10px] px-2.5 py-1 rounded font-extrabold uppercase border border-blue-500/20">
                                {team.id}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                team.verification_status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                team.verification_status === 'Under Review' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                team.verification_status === 'Needs Correction' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                                team.verification_status === 'Rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                                'bg-slate-900 text-gray-500 border-slate-800'
                              }`}>
                                {team.verification_status}
                              </span>
                            </div>
                            <h3 className="text-lg font-bold text-white mt-1">{team.team_name}</h3>
                          </div>
                          
                          <div className="flex flex-wrap gap-4 text-[11px] text-gray-400">
                            <div>
                              <span className="text-gray-500 block uppercase font-bold text-[9px]">Theme</span>
                              <span className="text-white font-semibold">{team.selected_theme}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 block uppercase font-bold text-[9px]">Team Size</span>
                              <span className="text-white font-semibold">{team.participants.length} Members</span>
                            </div>
                            <div>
                              <span className="text-gray-500 block uppercase font-bold text-[9px]">Accommodation</span>
                              <span className="text-white font-semibold">{team.accommodation_required ? 'Yes' : 'No'}</span>
                            </div>
                          </div>

                          <div className="self-end sm:self-auto">
                            <button
                              onClick={() => openTeamDrawer(team)}
                              className="text-blue-400 hover:text-white bg-blue-500/10 hover:bg-blue-600 border border-blue-500/20 px-3 py-1.5 rounded-lg transition-all text-xs font-semibold"
                            >
                              Edit / Manage
                            </button>
                          </div>
                        </div>

                        {/* Participants Table Direct Display */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-[10px] text-gray-300">
                            <thead>
                              <tr className="bg-slate-950 text-gray-500 border-b border-slate-900">
                                <th className="p-2">Name</th>
                                <th className="p-2">Gender</th>
                                <th className="p-2">Email</th>
                                <th className="p-2">WhatsApp</th>
                                <th className="p-2">LinkedIn</th>
                                <th className="p-2">College/Company</th>
                                <th className="p-2">Designation</th>
                                <th className="p-2">Graduation / Sem</th>
                                <th className="p-2">State / City</th>
                                <th className="p-2 text-center">IEEE Member</th>
                              </tr>
                            </thead>
                            <tbody>
                              {team.participants.map((p) => (
                                <tr key={p.id} className="border-b border-slate-900/40 hover:bg-slate-900/10">
                                  <td className="p-2 font-bold text-white whitespace-nowrap">
                                    {p.name} {p.member_index === 1 ? '👑' : ''}
                                  </td>
                                  <td className="p-2">{p.gender || 'N/A'}</td>
                                  <td className="p-2 select-all">{p.email}</td>
                                  <td className="p-2 select-all">{p.whatsapp}</td>
                                  <td className="p-2">
                                    {p.linkedin ? (
                                      <a href={p.linkedin} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">
                                        Link
                                      </a>
                                    ) : 'N/A'}
                                  </td>
                                  <td className="p-2 max-w-[130px] truncate">{p.college}</td>
                                  <td className="p-2">{p.designation}</td>
                                  <td className="p-2">{p.grad_year_sem}</td>
                                  <td className="p-2 whitespace-nowrap">{p.state} / {p.city}</td>
                                  <td className="p-2 text-center">
                                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                                      p.is_ieee_member ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-slate-900 text-gray-500 border border-slate-800'
                                    }`}>
                                      {p.is_ieee_member ? 'Yes' : 'No'}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}

                  {currentTeams.length === 0 && (
                    <div className="glass p-8 text-center text-gray-500 rounded-2xl border border-slate-850">
                      No teams found matching search criteria.
                    </div>
                  )}

                  {/* Pagination control */}
                  {totalPages > 1 && (
                    <div className="p-4 bg-slate-950 flex items-center justify-between border border-slate-900 rounded-2xl text-gray-400 text-xs">
                      <span>Showing {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredTeams.length)} of {filteredTeams.length} entries</span>
                      <div className="flex gap-2">
                        <button
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(currentPage - 1)}
                          className="p-1.5 rounded bg-slate-900 border border-slate-800 hover:text-white disabled:opacity-40"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <button
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage(currentPage + 1)}
                          className="p-1.5 rounded bg-slate-900 border border-slate-800 hover:text-white disabled:opacity-40"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>              </div>

              </div>
            )}

            {/* --- TAB: PROJECT IDEA SUBMISSIONS --- */}
            {adminTab === 'idea-submissions' && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h1 className="text-2xl font-extrabold text-white">Project Idea Submissions</h1>
                  <p className="text-xs text-gray-400">Review all uploaded project ideas and presentations</p>
                </div>

                <div className="glass p-4 rounded-2xl border border-slate-850 flex flex-col gap-4">
                  {/* Search filter for Idea Submissions */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search Idea Submissions by Team ID, Name, Theme..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="glass rounded-2xl border border-slate-850 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-950 text-gray-400 border-b border-slate-900">
                          <th className="p-4">Team ID</th>
                          <th className="p-4">Team Name</th>
                          <th className="p-4">Team Lead</th>
                          <th className="p-4">Email</th>
                          <th className="p-4">Phone</th>
                          <th className="p-4">Theme</th>
                          <th className="p-4">Google Drive Link</th>
                          <th className="p-4">Submission Date</th>
                          <th className="p-4 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTeams.filter(t => t.idea_submission_status === 'Submitted').map((team) => {
                          const lead = team.participants.find(p => p.member_index === 1);
                          return (
                            <tr key={team.id} className="border-b border-slate-900/60 hover:bg-slate-900/20 text-gray-300">
                              <td className="p-4 font-bold text-blue-500">{team.id}</td>
                              <td className="p-4 font-semibold text-white">{team.team_name}</td>
                              <td className="p-4">{lead ? lead.name : 'N/A'}</td>
                              <td className="p-4">{lead ? lead.email : 'N/A'}</td>
                              <td className="p-4">{lead ? lead.whatsapp : 'N/A'}</td>
                              <td className="p-4">{team.selected_theme}</td>
                              <td className="p-4">
                                <a 
                                  href={team.project_idea_link} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="text-blue-400 hover:text-blue-300 underline font-medium truncate max-w-[150px] block"
                                >
                                  {team.project_idea_link}
                                </a>
                              </td>
                              <td className="p-4 text-gray-500">
                                {team.project_idea_date}
                              </td>
                              <td className="p-4 text-center">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                  team.project_idea_verification_status === 'Verified' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                  team.project_idea_verification_status === 'Rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                                  'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                }`}>
                                  {team.project_idea_verification_status || 'Pending Review'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                        {filteredTeams.filter(t => t.idea_submission_status === 'Submitted').length === 0 && (
                          <tr>
                            <td colSpan={9} className="p-8 text-center text-gray-500">No project idea submissions found.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* --- TAB: PROJECT IDEA VERIFICATION --- */}
            {adminTab === 'idea-verification' && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h1 className="text-2xl font-extrabold text-white">Project Idea Verification</h1>
                  <p className="text-xs text-gray-400">Evaluate submitted presentations. Approve or reject with feedback remarks.</p>
                </div>

                <div className="glass rounded-2xl border border-slate-850 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-950 text-gray-400 border-b border-slate-900">
                          <th className="p-4">Team ID</th>
                          <th className="p-4">Team Name</th>
                          <th className="p-4">Team Lead</th>
                          <th className="p-4">Submitted Google Drive Link</th>
                          <th className="p-4 text-center">Verify</th>
                          <th className="p-4 text-center">Reject</th>
                          <th className="p-4">Organizer Remarks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTeams.filter(t => t.idea_submission_status === 'Submitted').map((team) => {
                          const lead = team.participants.find(p => p.member_index === 1);
                          return (
                            <tr key={team.id} className="border-b border-slate-900/60 hover:bg-slate-900/20 text-gray-300">
                              <td className="p-4 font-bold text-blue-500">{team.id}</td>
                              <td className="p-4 font-semibold text-white">{team.team_name}</td>
                              <td className="p-4">{lead ? lead.name : 'N/A'}</td>
                              <td className="p-4">
                                <a
                                  href={team.project_idea_link}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-blue-500 hover:text-blue-400 underline font-medium truncate max-w-[200px] block"
                                >
                                  {team.project_idea_link}
                                </a>
                              </td>
                              <td className="p-4 text-center">
                                <button
                                  onClick={() => handleUpdateIdeaVerification(team.id, 'Verified')}
                                  className="bg-emerald-600 hover:bg-emerald-500 text-xs px-3 py-1.5 rounded-lg text-white font-bold transition-all"
                                >
                                  Verify
                                </button>
                              </td>
                              <td className="p-4 text-center">
                                <button
                                  onClick={() => {
                                    setEvalRemarksTeamId(team.id);
                                    setEvalRemarks(team.project_idea_remarks || '');
                                  }}
                                  className="bg-rose-600 hover:bg-rose-500 text-xs px-3 py-1.5 rounded-lg text-white font-bold transition-all"
                                >
                                  Reject
                                </button>
                              </td>
                              <td className="p-4 text-gray-400 max-w-[200px] truncate" title={team.project_idea_remarks || ''}>
                                {team.project_idea_remarks || 'None'}
                              </td>
                            </tr>
                          );
                        })}
                        {filteredTeams.filter(t => t.idea_submission_status === 'Submitted').length === 0 && (
                          <tr>
                            <td colSpan={7} className="p-8 text-center text-gray-500">No submissions to evaluate.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Remarks Prompt Modal */}
                {evalRemarksTeamId && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm animate-fadeIn">
                    <div className="glass max-w-md w-full p-6 rounded-2xl border border-slate-800 shadow-2xl space-y-4">
                      <h3 className="text-lg font-bold text-white">Project Idea Rejection Feedback</h3>
                      <p className="text-xs text-gray-400">Please provide organizer remarks detailing why this project idea submission was rejected. The team lead will view this on the public Idea Status page.</p>
                      
                      <textarea
                        value={evalRemarks}
                        onChange={(e) => setEvalRemarks(e.target.value)}
                        placeholder="e.g., Google Drive permissions invalid, missing system architecture diagram, wrong format, etc."
                        rows={4}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500"
                      />

                      <div className="flex justify-end space-x-2 text-xs">
                        <button
                          onClick={() => {
                            setEvalRemarksTeamId(null);
                            setEvalRemarks('');
                          }}
                          className="bg-slate-900 border border-slate-800 text-gray-300 px-4 py-2 rounded-xl"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleUpdateIdeaVerification(evalRemarksTeamId, 'Rejected', evalRemarks)}
                          disabled={evalLoading}
                          className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-4 py-2 rounded-xl flex items-center space-x-1"
                        >
                          {evalLoading ? <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></span> : null}
                          <span>Confirm Rejection</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* --- TAB: DASHBOARD STATISTICS --- */}
            {adminTab === 'statistics' && stats && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h1 className="text-2xl font-extrabold text-white">Dashboard Statistics</h1>
                  <p className="text-xs text-gray-400">Overview of all event metrics and aggregates from the database</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {/* General Stats */}
                  <div className="bg-slate-955/85 p-6 rounded-2xl border border-slate-900">
                    <span className="text-[10px] text-gray-500 block uppercase font-bold tracking-wider">Registrations & Sizes</span>
                    <div className="mt-4 space-y-3.5 text-xs text-gray-400">
                      <div className="flex justify-between">
                        <span>Total Registrations</span>
                        <span className="text-white font-extrabold text-sm">{stats.widgets.totalTeams} Teams</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Participants</span>
                        <span className="text-white font-extrabold text-sm">{stats.widgets.totalRegistrations} Members</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average Team Size</span>
                        <span className="text-white font-extrabold text-sm">{stats.widgets.avgTeamSize} Members</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Popular Theme</span>
                        <span className="text-blue-400 font-extrabold text-xs max-w-[120px] truncate text-right">{stats.widgets.popularTheme}</span>
                      </div>
                    </div>
                  </div>

                  {/* Verification Statuses */}
                  <div className="bg-slate-955/85 p-6 rounded-2xl border border-slate-900">
                    <span className="text-[10px] text-gray-500 block uppercase font-bold tracking-wider">Participant Verification</span>
                    <div className="mt-4 space-y-3.5 text-xs text-gray-400">
                      <div className="flex justify-between">
                        <span>Verified Participants / Teams</span>
                        <span className="text-emerald-400 font-extrabold text-sm">{stats.widgets.verifiedTeams} Teams</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pending Verification</span>
                        <span className="text-amber-500 font-extrabold text-sm">{stats.widgets.pendingVerification} Teams</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rejected Verification</span>
                        <span className="text-rose-500 font-extrabold text-sm">{stats.widgets.rejectedTeams} Teams</span>
                      </div>
                    </div>
                  </div>

                  {/* Project Ideas Statuses */}
                  <div className="bg-slate-955/85 p-6 rounded-2xl border border-slate-900">
                    <span className="text-[10px] text-gray-500 block uppercase font-bold tracking-wider">Project Idea Evaluations</span>
                    <div className="mt-4 space-y-3.5 text-xs text-gray-400">
                      <div className="flex justify-between">
                        <span>Project Ideas Submitted</span>
                        <span className="text-blue-400 font-extrabold text-sm">{stats.widgets.ideaSubmitted} Teams</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Project Ideas Pending</span>
                        <span className="text-gray-500 font-extrabold text-sm">{stats.widgets.ideaPending} Teams</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Project Ideas Verified</span>
                        <span className="text-emerald-400 font-extrabold text-sm">{stats.widgets.ideaVerified || 0} Teams</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Project Ideas Rejected</span>
                        <span className="text-rose-400 font-extrabold text-sm">{stats.widgets.ideaRejected || 0} Teams</span>
                      </div>
                    </div>
                  </div>

                  {/* Geographic & Academic */}
                  <div className="bg-slate-955/85 p-6 rounded-2xl border border-slate-900 md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <span className="text-[10px] text-gray-500 block uppercase font-bold tracking-wider">Demographics Summary</span>
                      <div className="mt-3.5 space-y-3.5 text-xs text-gray-400">
                        <div className="flex justify-between">
                          <span>Total Colleges Represented</span>
                          <span className="text-white font-bold">{stats.widgets.totalColleges} Colleges</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total States Represented</span>
                          <span className="text-white font-bold">{stats.widgets.totalStates} States</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 block uppercase font-bold tracking-wider">IEEE Members Breakdown</span>
                      <div className="mt-3.5 space-y-3.5 text-xs text-gray-400">
                        <div className="flex justify-between">
                          <span>IEEE Members</span>
                          <span className="text-blue-400 font-bold">{stats.widgets.ieeeMembers} Participants</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Non-IEEE Members</span>
                          <span className="text-gray-400 font-bold">{stats.widgets.nonIeeeMembers} Participants</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* --- TAB: EXCEL / CSV / JSON DOWNLOADS --- */}
            {adminTab === 'downloads' && (
              <div className="space-y-6 animate-fadeIn max-w-3xl">
                <div>
                  <h1 className="text-2xl font-extrabold text-white">Database Exports & Backups</h1>
                  <p className="text-xs text-gray-400">Download formatted Excel reports, CSV tables, or full JSON database backups.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Excel Card */}
                  <div className="bg-slate-955/85 p-6 rounded-2xl border border-slate-900 flex flex-col justify-between space-y-4">
                    <div>
                      <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2 py-0.5 rounded font-extrabold border border-emerald-500/20">EXCEL REPORTS</span>
                      <h3 className="text-sm font-bold text-white mt-2">Microsoft Excel Workbooks</h3>
                      <p className="text-xs text-gray-500 mt-1">Formatted tables with auto-adjusted widths and freeze panes.</p>
                    </div>
                    <div className="space-y-2">
                      <button
                        onClick={() => downloadExport('excel/registration')}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold p-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 transition-all"
                      >
                        <Download size={14} />
                        <span>Download Team Registrations (Excel 1)</span>
                      </button>
                      <button
                        onClick={() => downloadExport('excel/project-idea')}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold p-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 transition-all"
                      >
                        <Download size={14} />
                        <span>Download Project Ideas (Excel 2)</span>
                      </button>
                    </div>
                  </div>

                  {/* CSV Card */}
                  <div className="bg-slate-955/85 p-6 rounded-2xl border border-slate-900 flex flex-col justify-between space-y-4">
                    <div>
                      <span className="bg-blue-500/10 text-blue-400 text-[10px] px-2 py-0.5 rounded font-extrabold border border-blue-500/20">CSV EXPORTS</span>
                      <h3 className="text-sm font-bold text-white mt-2">Flat CSV Tables</h3>
                      <p className="text-xs text-gray-500 mt-1">Standard comma-separated files suitable for database import or data analysis tools.</p>
                    </div>
                    <div className="space-y-2">
                      <button
                        onClick={() => downloadExport('csv/registration')}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold p-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 transition-all"
                      >
                        <Download size={14} />
                        <span>Export Team Registry CSV</span>
                      </button>
                      <button
                        onClick={() => downloadExport('csv/project-idea')}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold p-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 transition-all"
                      >
                        <Download size={14} />
                        <span>Export Project Ideas CSV</span>
                      </button>
                    </div>
                  </div>

                  {/* JSON Backup Card */}
                  <div className="bg-slate-955/85 p-6 rounded-2xl border border-slate-900 md:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="bg-purple-500/10 text-purple-400 text-[10px] px-2 py-0.5 rounded font-extrabold border border-purple-500/20">DATABASE BACKUP</span>
                      <h3 className="text-sm font-bold text-white mt-1">JSON Full DB Dump</h3>
                      <p className="text-xs text-gray-500 max-w-md">Serialize and download the complete database records (teams, participants, notes, verifications, and project ideas) in JSON format.</p>
                    </div>
                    <button
                      onClick={() => downloadExport('backup')}
                      className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-3 rounded-xl text-xs flex items-center justify-center space-x-2 transition-all self-start sm:self-auto"
                    >
                      <Database size={14} />
                      <span>Download JSON Backup</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* --- TAB 3: DYNAMIC CONFIG --- */}
            {adminTab === 'settings' && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h1 className="text-2xl font-extrabold text-white">Dynamic Configuration</h1>
                  <p className="text-xs text-gray-400">Configure parameters for future hackathons without changing code</p>
                </div>

                <div className="glass p-6 rounded-2xl border border-slate-850 space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase">Event Name</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={eventSettings.event_name}
                        onChange={(e) => setEventSettings(prev => ({ ...prev, event_name: e.target.value }))}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                      <button 
                        onClick={() => handleSaveSettings('event_name', eventSettings.event_name)}
                        className="bg-blue-600 hover:bg-blue-500 px-4 rounded-xl text-xs font-bold"
                      >
                        Save
                      </button>
                    </div>
                  </div>


                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase">External Ticket Link</label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={eventSettings.ticket_link}
                        onChange={(e) => setEventSettings(prev => ({ ...prev, ticket_link: e.target.value }))}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                      <button 
                        onClick={() => handleSaveSettings('ticket_link', eventSettings.ticket_link)}
                        className="bg-blue-600 hover:bg-blue-500 px-4 rounded-xl text-xs font-bold"
                      >
                        Save
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase">Registration Deadline Date</label>
                      <input
                        type="datetime-local"
                        value={eventSettings.registration_deadline.slice(0, 19)}
                        onChange={(e) => handleSaveSettings('registration_deadline', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase">Idea Submission Deadline Date</label>
                      <input
                        type="datetime-local"
                        value={eventSettings.idea_deadline.slice(0, 19)}
                        onChange={(e) => handleSaveSettings('idea_deadline', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
      </main>

      {/* --- SELECTED TEAM DETAIL DRAWER (SLIDE OUT OVERLAY) --- */}
      {drawerOpen && selectedTeam && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fadeIn">
          {/* Drawer Container */}
          <div className="w-full max-w-4xl bg-slate-950 border-l border-slate-900 h-full flex flex-col animate-slideLeft shadow-2xl">
            
            {/* Drawer Header */}
            <div className="p-4 bg-slate-900 border-b border-slate-900/60 flex items-center justify-between shrink-0">
              <div>
                <span className="bg-blue-500/10 text-blue-400 text-[10px] px-2 py-0.5 rounded font-extrabold uppercase border border-blue-500/20">{selectedTeam.id}</span>
                <h2 className="text-base font-extrabold text-white mt-1">Edit Team: {selectedTeam.team_name}</h2>
              </div>
              <button 
                onClick={() => setDrawerOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Body (Scrollable form) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-gray-300">
              
              {/* STATUS & ACTIONS */}
              <div className="glass p-4 rounded-xl border border-slate-900 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={() => triggerEmail('approval')}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1"
                  >
                    <Check size={14} />
                    <span>Approve Team</span>
                  </button>
                  <button
                    onClick={() => triggerEmail('rejection')}
                    className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1"
                  >
                    <X size={14} />
                    <span>Reject Team</span>
                  </button>
                  <button
                    onClick={() => triggerEmail('correction')}
                    className="bg-orange-600 hover:bg-orange-500 text-white font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1"
                  >
                    <Clock size={14} />
                    <span>Needs Correction</span>
                  </button>
                  <button
                    onClick={() => triggerEmail('reminder')}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1"
                  >
                    <Mail size={14} />
                    <span>Send Reminder</span>
                  </button>
                </div>

                <div className="flex gap-2">
                  <select
                    value={selectedTeam.verification_status}
                    onChange={(e) => setSelectedTeam(prev => ({ ...prev, verification_status: e.target.value }))}
                    className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Needs Correction">Needs Correction</option>
                  </select>
                </div>
              </div>

              {/* TEAM METADATA FORM */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-white uppercase border-b border-slate-900 pb-1.5">Team Metadata</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-500 mb-1">Team Name</label>
                    <input
                      type="text"
                      value={selectedTeam.team_name}
                      onChange={(e) => setSelectedTeam(prev => ({ ...prev, team_name: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-500 mb-1">Selected Theme</label>
                    <input
                      type="text"
                      value={selectedTeam.selected_theme}
                      onChange={(e) => setSelectedTeam(prev => ({ ...prev, selected_theme: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-500 mb-1">Accommodation</label>
                    <select
                      value={selectedTeam.accommodation_required ? 'Yes' : 'No'}
                      onChange={(e) => setSelectedTeam(prev => ({ ...prev, accommodation_required: e.target.value === 'Yes' }))}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white"
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-500 mb-1">Ticket Status</label>
                    <input
                      type="text"
                      value={selectedTeam.ticket_status}
                      onChange={(e) => setSelectedTeam(prev => ({ ...prev, ticket_status: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-500 mb-1">Idea Submission Status</label>
                    <select
                      value={selectedTeam.idea_submission_status}
                      onChange={(e) => setSelectedTeam(prev => ({ ...prev, idea_submission_status: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white"
                    >
                      <option value="Not Submitted">Not Submitted</option>
                      <option value="Submitted">Submitted</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* MEMBERS FORM GROUPS */}
              <div className="space-y-6">
                <h3 className="text-xs font-bold text-white uppercase border-b border-slate-900 pb-1.5">Members Info (1-6)</h3>
                
                {selectedTeam.participants.map((m, mIdx) => (
                  <div key={m.id} className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-4">
                    <span className="font-bold text-blue-400">Member {m.member_index} {m.member_index === 1 ? '(Team Lead)' : ''}</span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-gray-500 mb-1">Name</label>
                        <input
                          type="text"
                          value={m.name}
                          onChange={(e) => {
                            const updated = [...selectedTeam.participants];
                            updated[mIdx].name = e.target.value;
                            setSelectedTeam(prev => ({ ...prev, participants: updated }));
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-500 mb-1">Gender</label>
                        <select
                          value={m.gender || ''}
                          onChange={(e) => {
                            const updated = [...selectedTeam.participants];
                            updated[mIdx].gender = e.target.value;
                            setSelectedTeam(prev => ({ ...prev, participants: updated }));
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-white"
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-gray-500 mb-1">Email</label>
                        <input
                          type="email"
                          value={m.email}
                          onChange={(e) => {
                            const updated = [...selectedTeam.participants];
                            updated[mIdx].email = e.target.value;
                            setSelectedTeam(prev => ({ ...prev, participants: updated }));
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-500 mb-1">WhatsApp</label>
                        <input
                          type="text"
                          value={m.whatsapp}
                          onChange={(e) => {
                            const updated = [...selectedTeam.participants];
                            updated[mIdx].whatsapp = e.target.value;
                            setSelectedTeam(prev => ({ ...prev, participants: updated }));
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-500 mb-1">LinkedIn</label>
                        <input
                          type="text"
                          value={m.linkedin || ''}
                          onChange={(e) => {
                            const updated = [...selectedTeam.participants];
                            updated[mIdx].linkedin = e.target.value;
                            setSelectedTeam(prev => ({ ...prev, participants: updated }));
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-500 mb-1">College</label>
                        <input
                          type="text"
                          value={m.college}
                          onChange={(e) => {
                            const updated = [...selectedTeam.participants];
                            updated[mIdx].college = e.target.value;
                            setSelectedTeam(prev => ({ ...prev, participants: updated }));
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-500 mb-1">Designation</label>
                        <input
                          type="text"
                          value={m.designation}
                          onChange={(e) => {
                            const updated = [...selectedTeam.participants];
                            updated[mIdx].designation = e.target.value;
                            setSelectedTeam(prev => ({ ...prev, participants: updated }));
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-500 mb-1">Graduation Year / Study</label>
                        <input
                          type="text"
                          value={m.grad_year_sem}
                          onChange={(e) => {
                            const updated = [...selectedTeam.participants];
                            updated[mIdx].grad_year_sem = e.target.value;
                            setSelectedTeam(prev => ({ ...prev, participants: updated }));
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-white"
                        />
                      </div>

                      <div className="flex items-center space-x-2 mt-5">
                        <input
                          type="checkbox"
                          checked={m.is_ieee_member}
                          onChange={(e) => {
                            const updated = [...selectedTeam.participants];
                            updated[mIdx].is_ieee_member = e.target.checked;
                            setSelectedTeam(prev => ({ ...prev, participants: updated }));
                          }}
                          className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-800"
                        />
                        <label className="text-xs text-gray-400">IEEE Member</label>
                      </div>
                    </div>

                    {/* Verification drive links */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-0.5">College ID Proof Link</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={m.college_id_proof_link || ''}
                            onChange={(e) => {
                              const updated = [...selectedTeam.participants];
                              updated[mIdx].college_id_proof_link = e.target.value;
                              setSelectedTeam(prev => ({ ...prev, participants: updated }));
                            }}
                            className="flex-1 bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-white text-[11px]"
                          />
                          {m.college_id_proof_link && m.college_id_proof_link !== 'N/A' && (
                            <>
                              <a href={m.college_id_proof_link} target="_blank" rel="noreferrer" className="bg-slate-900 hover:bg-slate-800 border border-slate-800 p-1.5 rounded text-blue-500">
                                Open
                              </a>
                              <button type="button" onClick={() => copyToClipboard(m.college_id_proof_link, 'Proof link')} className="bg-slate-900 hover:bg-slate-800 border border-slate-800 p-1.5 rounded text-gray-400">
                                Copy
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] text-gray-500 mb-0.5">IEEE Membership Proof Link</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={m.ieee_id_proof_link || ''}
                            onChange={(e) => {
                              const updated = [...selectedTeam.participants];
                              updated[mIdx].ieee_id_proof_link = e.target.value;
                              setSelectedTeam(prev => ({ ...prev, participants: updated }));
                            }}
                            className="flex-1 bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-white text-[11px]"
                          />
                          {m.ieee_id_proof_link && m.ieee_id_proof_link !== 'N/A' && (
                            <>
                              <a href={m.ieee_id_proof_link} target="_blank" rel="noreferrer" className="bg-slate-900 hover:bg-slate-800 border border-slate-800 p-1.5 rounded text-blue-500">
                                Open
                              </a>
                              <button type="button" onClick={() => copyToClipboard(m.ieee_id_proof_link, 'Proof link')} className="bg-slate-900 hover:bg-slate-800 border border-slate-800 p-1.5 rounded text-gray-400">
                                Copy
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* TIMELINE ADMIN NOTES HISTORY */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-white uppercase border-b border-slate-900 pb-1.5">Organizer Note History</h3>
                
                {/* Note adder */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Append new private verification remark..."
                    className="flex-1 bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white"
                  />
                  <button
                    onClick={handleAddNote}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 rounded-lg"
                  >
                    Add Note
                  </button>
                </div>

                {/* Timeline display */}
                <div className="relative border-l border-slate-800 pl-4 space-y-4 mt-2">
                  {noteHistory.map((note) => (
                    <div key={note.id} className="relative">
                      <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 bg-blue-500 rounded-full"></span>
                      <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-900">
                        <span className="text-[10px] text-gray-500 font-semibold">{new Date(note.created_at).toLocaleString()}</span>
                        <p className="mt-1 text-gray-300 font-medium text-xs">{note.note_text}</p>
                      </div>
                    </div>
                  ))}
                  {noteHistory.length === 0 && (
                    <p className="text-xs text-gray-600 italic">No notes logged yet.</p>
                  )}
                </div>
              </div>

            </div>

            {/* Drawer Footer */}
            <div className="p-4 bg-slate-900 border-t border-slate-900/60 flex justify-between shrink-0">
              <button
                onClick={() => setDrawerOpen(false)}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white px-4 py-2 rounded-lg"
              >
                Close Drawer
              </button>
              
              <button
                onClick={() => handleSaveTeamEdits({
                  team_name: selectedTeam.team_name,
                  selected_theme: selectedTeam.selected_theme,
                  accommodation_required: selectedTeam.accommodation_required,
                  referral_source: selectedTeam.referral_source,
                  additional_comments: selectedTeam.additional_comments,
                  registration_status: selectedTeam.registration_status,
                  verification_status: selectedTeam.verification_status,
                  ticket_status: selectedTeam.ticket_status,
                  idea_submission_status: selectedTeam.idea_submission_status,
                  participants: selectedTeam.participants.map(p => ({
                    id: p.id,
                    name: p.name,
                    email: p.email,
                    whatsapp: p.whatsapp,
                    linkedin: p.linkedin,
                    college: p.college,
                    designation: p.designation,
                    grad_year_sem: p.grad_year_sem,
                    state: p.state,
                    city: p.city,
                    is_ieee_member: p.is_ieee_member,
                    ieee_id_proof_link: p.ieee_id_proof_link,
                    college_id_proof_link: p.college_id_proof_link
                  })),
                  verification: selectedTeam.verification ? {
                    team_id: selectedTeam.id,
                    team_lead_name: selectedTeam.verification.team_lead_name,
                    company_college: selectedTeam.verification.company_college,
                    team_name: selectedTeam.verification.team_name,
                    team_size: selectedTeam.verification.team_size,
                    ieee_members_count: selectedTeam.verification.ieee_members_count,
                    non_ieee_members_count: selectedTeam.verification.non_ieee_members_count,
                    member1_link: selectedTeam.verification.member1_link,
                    member2_link: selectedTeam.verification.member2_link,
                    member3_link: selectedTeam.verification.member3_link,
                    member4_link: selectedTeam.verification.member4_link,
                    member5_link: selectedTeam.verification.member5_link,
                    member6_link: selectedTeam.verification.member6_link,
                    remarks: selectedTeam.verification.remarks
                  } : null
                })}
                disabled={adminSaving}
                className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 text-white font-bold px-6 py-2 rounded-lg shadow-md flex items-center space-x-1.5"
              >
                <Save size={14} />
                <span>{adminSaving ? 'Saving...' : 'Save Database Changes'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
