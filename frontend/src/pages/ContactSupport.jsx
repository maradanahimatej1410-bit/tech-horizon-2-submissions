import { Mail, Phone, Globe, User } from 'lucide-react';

export default function ContactSupport() {
  return (
    <div className="bg-[#0b0f19] bg-grid min-h-screen pb-20 px-4 flex items-center justify-center">
      <div className="max-w-md w-full pt-10">
        <div className="glass rounded-3xl p-8 border border-slate-800/80 shadow-2xl relative overflow-hidden animate-fadeIn">
          {/* Decorative Glow Blob */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 text-blue-400 mb-4 border border-blue-500/20">
              <Phone className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-extrabold text-white">Contact Support</h1>
            <p className="text-gray-400 text-sm mt-1">Get in touch with the Tech Horizon 2.0 team</p>
          </div>

          <div className="space-y-6">
            {/* Coordinator Section */}
            <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-900 flex items-start space-x-4">
              <div className="bg-blue-600/10 p-2 rounded-xl text-blue-400 border border-blue-500/20 mt-1">
                <User size={20} />
              </div>
              <div>
                <span className="text-xs text-gray-500 uppercase block font-semibold">Student Coordinator</span>
                <span className="text-white font-bold text-lg block mt-0.5">M. Himatej</span>
                <span className="text-blue-400 text-xs font-medium mt-1 block">IEEE SMC GNITC Student Branch Chapter</span>
              </div>
            </div>

            {/* Details Section */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center space-x-3.5 pl-2">
                <Phone size={16} className="text-blue-500 flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-gray-500 block uppercase font-bold">Phone</span>
                  <a href="tel:+917729836382" className="text-sm text-gray-200 font-semibold hover:text-blue-400 transition-colors">
                    +91 7729836382
                  </a>
                </div>
              </div>

              <div className="flex items-center space-x-3.5 pl-2">
                <Mail size={16} className="text-blue-500 flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-gray-500 block uppercase font-bold">Email</span>
                  <a href="mailto:maradanahimatej27@gmail.com" className="text-sm text-gray-200 font-semibold hover:text-blue-400 transition-colors">
                    maradanahimatej27@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-center space-x-3.5 pl-2">
                <Globe size={16} className="text-blue-500 flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-gray-500 block uppercase font-bold">Website</span>
                  <a href="https://ieeetechhorizon.gt.tc/" target="_blank" rel="noreferrer" className="text-sm text-blue-500 font-semibold hover:underline">
                    https://ieeetechhorizon.gt.tc/
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
