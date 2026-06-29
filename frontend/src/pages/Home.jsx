import { Link } from 'react-router-dom';
import { ArrowRight, MessageSquare } from 'lucide-react';

export default function Home() {
  return (
    <div className="bg-[#0b0f19] bg-grid min-h-screen pb-20 relative overflow-hidden">
      {/* Decorative Glow Blobs */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute top-[800px] right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto px-4 pt-10 md:pt-16">

        {/* Hero Section */}
        <header className="text-center py-16 md:py-24 max-w-4xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/5 mb-6 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span className="text-xs font-semibold text-blue-400 tracking-wide uppercase">National Level Hackathon</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            TECH HORIZON <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">2.0</span>
          </h1>
          
          <p className="text-gray-400 text-lg md:text-xl leading-relaxed mb-8 max-w-2xl">
            Innovate. Compete. Conquer. Join India's brightest minds in a prestigious 48-Hour Hackathon organized by the IEEE SMC Society at GNITC.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-xl font-bold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/20 group"
            >
              <span>Register Your Team</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/status"
              className="w-full sm:w-auto glass hover:bg-white/5 text-white px-8 py-3.5 rounded-xl font-bold transition-all duration-300 flex items-center justify-center space-x-2 border border-slate-800"
            >
              <span>Check Team Status</span>
            </Link>
          </div>
        </header>

        {/* Main Card - Containing Event Copy exactly */}
        <section className="glass rounded-3xl p-6 md:p-10 mb-12 shadow-2xl relative border border-slate-800/80">
          <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed space-y-6">
            
            {/* EVENT DESCRIPTION */}
            <h2 className="text-2xl md:text-3xl font-extrabold text-white border-b border-slate-800 pb-3 flex items-center space-x-2.5">
              <span>🚀 TECH HORIZON 2.0 – National Level Hackathon</span>
            </h2>
            
            <p className="text-gray-200 font-medium">Innovate. Compete. Conquer.</p>
            
            <p>
              Get ready for TECH HORIZON 2.0, a prestigious National Level 48-Hour Hackathon organized by the IEEE Systems, Man, and Cybernetics Society (SMC), Guru Nanak Institutions Technical Campus (Autonomous), Hyderabad.
              This event is designed to bring together passionate innovators, developers, researchers, entrepreneurs, and problem-solvers from across India to create impactful solutions for real-world challenges. Whether you're an AI enthusiast, software developer, hardware innovator, or startup-minded creator, TECH HORIZON 2.0 provides the perfect platform to transform your ideas into reality.
            </p>

            {/* WHY PARTICIPATE */}
            <h3 className="text-xl font-bold text-white mt-8 flex items-center space-x-2">
              <span>✨ Why Participate?</span>
            </h3>
            <ul className="list-disc list-inside pl-4 space-y-2">
              <li>Solve real-world problems through innovation</li>
              <li>Collaborate with talented participants from across the country</li>
              <li>Build working prototypes within 48 hours</li>
              <li>Showcase your solutions before industry experts and academicians</li>
              <li>Gain valuable networking and mentorship opportunities</li>
              <li>Earn national-level recognition and certificates</li>
            </ul>

            {/* THEMES */}
            <h3 className="text-xl font-bold text-white mt-8 flex items-center space-x-2">
              <span>🎯 Hackathon Themes</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
              {[
                "Generative AI", "Health & Biotech", "Security & Surveillance", 
                "E-Commerce", "Clean & Green Technology", "Smart Automation", 
                "Blockchain & Cryptography", "Game Development", "Circuit Design", 
                "Embedded Systems", "Defense Technologies", "Next-Generation Communication", 
                "Sustainable Development", "Open Innovation (Any Real-World Problem)"
              ].map((theme, i) => (
                <div key={i} className="flex items-center space-x-2 p-3 bg-slate-900/60 rounded-xl border border-slate-800/50">
                  <span className="text-blue-500 font-bold text-sm">🔹</span>
                  <span className="text-sm font-semibold text-gray-300">{theme}</span>
                </div>
              ))}
            </div>

            {/* WHO CAN PARTICIPATE */}
            <h3 className="text-xl font-bold text-white mt-8 flex items-center space-x-2">
              <span>👥 Who Can Participate?</span>
            </h3>
            <ul className="list-none pl-4 space-y-2">
              <li>✅ Undergraduate Students (UG)</li>
              <li>✅ Postgraduate Students (PG)</li>
              <li>✅ Ph.D. Scholars</li>
              <li>✅ Working Professionals</li>
            </ul>
            <p className="font-semibold text-blue-400 mt-2">📌 Team Size: 3–6 Members</p>

            {/* REWARDS */}
            <h3 className="text-xl font-bold text-white mt-8 flex items-center space-x-2">
              <span>🏆 Exciting Rewards</span>
            </h3>
            <ul className="list-none pl-4 space-y-2 text-gray-200">
              <li>🥇 Winner – $1,350</li>
              <li>🥈 Runner-Up – $810</li>
              <li>🏅 Domain Excellence Award – $540</li>
              <li>🎁 Consolation Prizes for Outstanding Teams</li>
              <li>📜 Participation Certificates for All Participants</li>
              <li>🎉And much more....</li>
            </ul>

            {/* ADDITIONAL BENEFITS */}
            <h3 className="text-xl font-bold text-white mt-8">🌟 Additional Benefits</h3>
            <ul className="list-disc list-inside pl-4 space-y-2">
              <li>National-level exposure</li>
              <li>Industry interaction and mentorship</li>
              <li>Networking opportunities with innovators and experts</li>
              <li>Project showcase opportunities</li>
              <li>Accommodation facility available</li>
              <li>Optional Hyderabad sightseeing experience</li>
            </ul>

            {/* ACCOMMODATION */}
            <h3 className="text-xl font-bold text-white mt-8">🏨 Accommodation:</h3>
            <p>
              Participants requiring accommodation will be contacted separately by the organizing team with further details and instructions.
            </p>

            {/* EVENT EXPERIENCE */}
            <h3 className="text-xl font-bold text-white mt-8">🎉 Event Experience:</h3>
            <p>
              Enjoy food stalls, fun activities, networking opportunities, DJ nights, musical performances, surprise engagements, and much more throughout the hackathon. 🚀🎶🍔✨
            </p>

            {/* IMPORTANT DATES */}
            <h3 className="text-xl font-bold text-white mt-8 flex items-center space-x-2">
              <span>📅 Important Dates</span>
            </h3>
            <ul className="list-none pl-4 space-y-2 font-medium">
              <li>🗓️ Early Bird Registration Deadline: 11 October 2026</li>
              <li>🗓️ Final Registration Deadline: 11 November 2026</li>
              <li>🗓️ Idea Submission Deadline: 11 November 2026</li>
              <li>🗓️ Hackathon Dates: November 2026</li>
            </ul>

            {/* REGISTRATION PROCESS */}
            <h3 className="text-xl font-bold text-white mt-8">📌 Registration & Submission Process</h3>
            <ul className="list-disc list-inside pl-4 space-y-2">
              <li>Confirm your ticket to secure participation.</li>
              <li>Complete Team Registration directly on this website.</li>
              <li>Submit your ID Verification proofs (IEEE ID / College ID) directly on this website.</li>
              <li>Submit your Project Idea presentation (PDF Format) directly on this website.</li>
              <li>Project Idea Presentation must be submitted on or before 11th November 2026.</li>
              <li>Check your Project Idea Status and updates directly on this website portal.</li>
            </ul>

            <div className="bg-blue-600/10 border-l-4 border-blue-500 p-4 my-6 rounded-r-xl">
              <p className="margin-0 text-sm font-semibold text-blue-400">
                📢 All event updates, idea submission communications, and IEEE membership verifications will be conducted through the registered email IDs and phone numbers provided during registration!
              </p>
            </div>

            {/* VENUE */}
            <h3 className="text-xl font-bold text-white mt-8 flex items-center space-x-2">
              <span>📍 Venue</span>
            </h3>
            <p>
              Guru Nanak Institutions Technical Campus (Autonomous), Hyderabad, Telangana, India
            </p>

            {/* CONTACT */}
            <p>For any queries regarding registration, participation, or event-related information, feel free to contact:</p>
            <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800/80 mt-2 space-y-1">
              <p className="font-bold text-white">M. Himatej</p>
              <p className="text-sm">Student Coordinator – TECH HORIZON 2.0</p>
              <p className="text-sm text-blue-400">IEEE SMC GNITC Student Branch Chapter</p>
              <p className="text-sm">📱 Phone: +91 77298 36382</p>
              <p className="text-sm">📧 Email: maradanahimatej27@gmail.com</p>
              <p className="text-sm">🌐 Website: <a href="https://ieeetechhorizon.gt.tc/" className="text-blue-500 underline">https://ieeetechhorizon.gt.tc/</a></p>
            </div>

            <p className="mt-8 font-semibold text-white">
              We look forward to welcoming you to TECH HORIZON 2.0 and witnessing your innovative ideas come to life! 🚀
            </p>
            
            <p className="text-sm italic text-gray-400">
              💡 Don't miss this opportunity to challenge yourself, build innovative solutions, and compete on a national stage.
            </p>
            
            <p className="text-sm text-gray-400">
              TECH HORIZON 2.0 isn't just a hackathon — it's where ideas become innovations and innovators become leaders.
            </p>

            <p className="text-lg font-bold text-blue-400 mt-6 text-center">
              🔥 Innovate. Compete. Conquer.
            </p>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-extrabold text-white mb-6 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4 max-w-4xl mx-auto">
            {[
              {
                q: "What is the team size requirement?",
                a: "A team must consist of 3 to 6 members. The team lead must fill the registration on behalf of all members."
              },
              {
                q: "What is the registration workflow?",
                a: "1. Confirm your ticket via the ticket link. 2. Complete Team Registration on this website. 3. Submit your IEEE / College ID Verification on this website. 4. Submit your Project Idea directly on this website."
              },
              {
                q: "How does the accommodation process work?",
                a: "Accommodation is available at GNITC campus. Indicate your preference during team registration, and the organizing team will reach out separately."
              }
            ].map((faq, i) => (
              <div key={i} className="glass border border-slate-800/80 p-5 rounded-2xl">
                <h4 className="font-bold text-white flex items-center space-x-2">
                  <MessageSquare size={16} className="text-blue-500" />
                  <span>{faq.q}</span>
                </h4>
                <p className="text-sm text-gray-400 mt-2 pl-6">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
