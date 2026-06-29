import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Register from './pages/Register';
import Verify from './pages/Verify';
import Status from './pages/Status';
import SubmitIdea from './pages/SubmitIdea';
import AdminDashboard from './pages/AdminDashboard';
import ContactSupport from './pages/ContactSupport';
import RegistrationSuccess from './pages/RegistrationSuccess';
import ProjectIdeaStatus from './pages/ProjectIdeaStatus';
import WelcomeModal from './components/WelcomeModal';

export default function App() {
  const [showWelcome, setShowWelcome] = useState(() => {
    const isAdminPath = window.location.pathname.startsWith('/admin');
    const hasShown = sessionStorage.getItem('welcome_modal_shown');
    return !hasShown && !isAdminPath;
  });

  const handleCloseWelcome = () => {
    sessionStorage.setItem('welcome_modal_shown', 'true');
    setShowWelcome(false);
  };

  return (
    <ToastProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-[#0b0f19]">
          <WelcomeModal isOpen={showWelcome} onClose={handleCloseWelcome} />
          <Navbar />
          <div className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify" element={<Verify />} />
              <Route path="/status" element={<Status />} />
              <Route path="/submit-idea" element={<SubmitIdea />} />
              <Route path="/project-idea-status" element={<ProjectIdeaStatus />} />
              <Route path="/support" element={<ContactSupport />} />
              <Route path="/registration-success" element={<RegistrationSuccess />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              {/* Fallback routing */}
              <Route path="*" element={
                <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
                  <h1 className="text-4xl font-extrabold text-white">404 - Page Not Found</h1>
                  <p className="text-gray-400 mt-2 text-sm max-w-sm">The URL you requested does not exist in the TECH HORIZON 2.0 application.</p>
                  <a href="/" className="mt-6 bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all shadow-md">
                    Return to Home
                  </a>
                </div>
              } />
            </Routes>
          </div>
          <Footer />
        </div>
      </Router>
    </ToastProvider>
  );
}
