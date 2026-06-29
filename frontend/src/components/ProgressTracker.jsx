import { CheckCircle2 } from 'lucide-react';

export default function ProgressTracker({ 
  ticketBookingCompleted = true,
  teamRegistrationCompleted = false,
  idVerificationCompleted = false,
  currentStepName = '' 
}) {
  const steps = [
    { num: 1, label: 'Ticket Booking', completed: ticketBookingCompleted, active: currentStepName === 'booking' },
    { num: 2, label: 'Team Registration', completed: teamRegistrationCompleted, active: currentStepName === 'registration' },
    { num: 3, label: 'ID Verification', completed: idVerificationCompleted, active: currentStepName === 'verification' }
  ];

  let progressWidth = 0;
  if (ticketBookingCompleted) progressWidth = 50;
  if (teamRegistrationCompleted) progressWidth = 100;

  return (
    <div className="w-full py-6 px-4 mb-8 glass rounded-2xl glow-blue">
      <div className="max-w-4xl mx-auto flex items-center justify-between relative">
        {/* Connecting line */}
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-slate-800 z-0"></div>
        <div 
          className="absolute left-6 top-1/2 -translate-y-1/2 h-0.5 bg-blue-600 transition-all duration-500 z-0"
          style={{ width: `${progressWidth}%` }}
        ></div>

        {/* Steps */}
        {steps.map((step) => {
          const isCompleted = step.completed;
          const isCurrent = step.active && !isCompleted;
          
          return (
            <div key={step.num} className="flex flex-col items-center relative z-10">
              <div 
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-blue-600 border-2 border-blue-500 text-white shadow-lg shadow-blue-500/20' 
                    : isCurrent 
                      ? 'bg-slate-900 border-2 border-blue-400 text-blue-400 font-bold scale-110 shadow-lg shadow-blue-400/10'
                      : 'bg-slate-900 border-2 border-slate-800 text-gray-500'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 size={22} className="stroke-[2.5]" />
                ) : (
                  <span className="text-sm font-semibold">{step.num}</span>
                )}
              </div>
              <span className={`text-xs font-semibold mt-2.5 text-center max-w-[80px] md:max-w-none ${
                isCompleted ? 'text-gray-300' : isCurrent ? 'text-blue-400' : 'text-gray-500'
              }`}>
                {step.label}
              </span>
              <span className="text-[10px] text-gray-500 mt-0.5">
                {isCompleted ? '✔ Done' : isCurrent ? '⏳ Active' : 'Pending'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
