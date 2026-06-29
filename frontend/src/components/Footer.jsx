import { MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 py-10 px-4 md:px-8 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Info Column */}
        <div className="flex flex-col space-y-3">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-600 px-2 py-1 rounded text-white font-bold text-xs">
              IEEE SMC
            </div>
            <span className="font-extrabold text-white text-base tracking-tight">TECH HORIZON 2.0</span>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
            A prestigious National Level 48-Hour Hackathon organized by the IEEE Systems, Man, and Cybernetics Society (SMC), Guru Nanak Institutions Technical Campus (Autonomous), Hyderabad.
          </p>
        </div>

        {/* Venue Info */}
        <div className="flex flex-col space-y-3">
          <h4 className="font-bold text-white text-sm tracking-wider uppercase">Venue</h4>
          <p className="text-sm text-gray-400 flex items-start space-x-2">
            <MapPin size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
            <span>
              Guru Nanak Institutions Technical Campus (Autonomous),<br />
              Ibrahimpatnam, Hyderabad, Telangana, India - 501506
            </span>
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-slate-900 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500">
        <p>© 2026 TECH HORIZON 2.0. All Rights Reserved.</p>
        <p className="mt-2 md:mt-0">Designed for IEEE SMC GNITC Student Branch Chapter.</p>
      </div>
    </footer>
  );
}
