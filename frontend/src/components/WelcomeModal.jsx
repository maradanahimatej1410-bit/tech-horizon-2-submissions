import { useState, useEffect } from 'react';
import { Ticket, CheckCircle2, ArrowRight } from 'lucide-react';

const FALLBACK_TICKET_URL = "https://share.goavo.ai/og/event?meetup_id=6a0c454ba281d0d9de4d77d4&redirect_to=%2Fevents%2Fticket%2Ffillup%3Fid%3D6a0c454ba281d0d9de4d77d4&title=TECH+HORIZON+2.0+%E2%80%93+National+Level+Hackathon";

export default function WelcomeModal({ isOpen, onClose }) {
  const [ticketLink, setTicketLink] = useState(FALLBACK_TICKET_URL);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          const ticketSetting = data.find(s => s.key === 'ticket_link');
          if (ticketSetting && ticketSetting.value) {
            setTicketLink(ticketSetting.value);
          }
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      }
    };

    if (isOpen) {
      fetchSettings();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      {/* Decorative background glow behind the card */}
      <div className="absolute w-72 h-72 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute w-72 h-72 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative w-full max-w-xl glass rounded-3xl p-6 md:p-8 border border-slate-800/80 shadow-2xl overflow-hidden scale-100 transition-all duration-300">
        
        {/* Top Header decoration */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500"></div>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-500/10 text-blue-400 mb-4 border border-blue-500/20">
            <Ticket className="w-7 h-7 animate-pulse" />
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            🎉 Welcome to <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">TECH HORIZON 2.0</span>
          </h2>
          <p className="text-gray-400 text-xs mt-1 uppercase tracking-wider font-semibold">National Level 48-Hour Hackathon</p>
        </div>

        <div className="space-y-5 text-gray-300 text-sm md:text-base mb-8">
          <p className="leading-relaxed text-center">
            Before proceeding, please ensure that you have purchased your hackathon ticket. If you have not yet purchased your ticket, please purchase it first.
          </p>

          <div className="bg-slate-900/50 rounded-2xl p-4 md:p-5 border border-slate-800/50 space-y-3">
            <p className="font-semibold text-white text-xs uppercase tracking-wider text-blue-400">
              After purchasing your ticket, return to this portal to:
            </p>
            <ul className="space-y-2.5 text-sm">
              {[
                "Complete Team Registration",
                "Submit ID Verification",
                "Submit Project Idea",
                "Check Project Idea Status"
              ].map((step, idx) => (
                <li key={idx} className="flex items-center space-x-2.5 text-gray-300">
                  <CheckCircle2 size={16} className="text-blue-500 flex-shrink-0" />
                  <span className="font-medium">{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Buttons Grid */}
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href={ticketLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/20"
          >
            <span>🎟 Buy Ticket</span>
            <ArrowRight size={16} />
          </a>
          <button
            onClick={onClose}
            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 border border-slate-800 hover:border-slate-700"
          >
            <span>✅ I Have Already Purchased My Ticket</span>
          </button>
        </div>

      </div>
    </div>
  );
}
