import React, { useState } from 'react';
import FinancialInput from './components/FinancialInput';
import ResultDashboard from './components/ResultDashboard';

function App() {
  const [currentView, setCurrentView] = useState('input');
  const [predictionData, setPredictionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [darkMode, setDarkMode] = useState(false);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      const response = await mockPredictionAPI(formData);
      setPredictionData(response);
      setCurrentView('dashboard');
    } catch (error) {
      console.error('Prediction failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewCheck = () => {
    setCurrentView('input');
    setPredictionData(null);
  };

  const goToSection = (sectionId) => {
    setCurrentView('input');
    setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };

  const mockPredictionAPI = (data) =>
    new Promise((resolve) => {
      setTimeout(() => {
        const monthlyDisposable = data.monthlyIncome - data.monthlyExpenses;
        const totalSavings = data.currentSavings + monthlyDisposable * data.timeHorizon;
        const impactRatio = totalSavings > 0 ? (data.plannedExpense / totalSavings) * 100 : 100;

        let stability = 'High Risk';
        let insightText = '';
        let badgeColor = 'from-rose-500 to-pink-600';

        if (impactRatio < 30) {
          stability = 'Stable';
          badgeColor = 'from-emerald-500 to-teal-600';
          insightText = `Your planned expense is ${impactRatio.toFixed(1)}% of projected savings. This appears manageable.`;
        } else if (impactRatio < 60) {
          stability = 'Moderate';
          badgeColor = 'from-amber-500 to-orange-600';
          insightText = `This expense represents ${impactRatio.toFixed(1)}% of your savings. Consider building more buffer first.`;
        } else {
          stability = 'High Risk';
          badgeColor = 'from-rose-500 to-pink-600';
          insightText = `This would use ${impactRatio.toFixed(1)}% of your savings. May significantly impact financial stability.`;
        }

        const chartData = Array.from({ length: data.timeHorizon + 1 }, (_, i) => ({
          month: i,
          savings: data.currentSavings + monthlyDisposable * i,
        }));

        resolve({
          projectedSavings: totalSavings,
          monthlyDisposable,
          stability,
          badgeColor,
          insightText,
          chartData,
          impactRatio,
          ...data,
        });
      }, 1400);
    });

  const shellClass = darkMode
    ? 'min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-100'
    : 'min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 text-slate-900';

  const navClass = darkMode
    ? 'relative z-10 bg-slate-900/80 backdrop-blur-lg border-b border-slate-700'
    : 'relative z-10 bg-white/80 backdrop-blur-lg border-b border-white/20';

  const testimonials = [
    {
      quote: '"I stopped making emotional purchases and saved more in 3 months."',
      name: 'Aman Adnan Sharyanaya',
      role: 'Early User',
    },
    {
      quote: '"The clarity score helped me plan with confidence."',
      name: 'Priya Sharma',
      role: 'Freelancer',
    },
    {
      quote: '"Simple inputs, powerful output. Perfect for monthly planning."',
      name: 'Neeraj Verma',
      role: 'Product Manager',
    },
  ];

  return (
    <div className={shellClass}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <nav className={navClass}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <button onClick={() => setCurrentView('input')} className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">₹</span>
              </div>
              <span
                className={`text-2xl font-bold bg-clip-text text-transparent ${
                  darkMode
                    ? 'bg-gradient-to-r from-cyan-300 via-blue-300 to-teal-300'
                    : 'bg-gradient-to-r from-blue-700 via-indigo-600 to-teal-600'
                }`}
              >
                CentSight
              </span>
            </button>

            <div className="hidden md:flex items-center space-x-6">
              <button onClick={() => goToSection('features')} className={`${darkMode ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'} transition-colors font-medium`}>Features</button>
              <button onClick={() => goToSection('how-it-works')} className={`${darkMode ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'} transition-colors font-medium`}>How It Works</button>
              <button onClick={() => goToSection('testimonials')} className={`${darkMode ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'} transition-colors font-medium`}>Testimonials</button>
              <button
                onClick={() => setDarkMode((prev) => !prev)}
                className={`px-3 py-2 rounded-lg text-sm font-semibold ${darkMode ? 'bg-slate-700 text-slate-100' : 'bg-slate-100 text-slate-700'}`}
              >
                {darkMode ? 'Light' : 'Dark'}
              </button>
              <button
                onClick={() => {
                  setAuthMode('signup');
                  setCurrentView('auth');
                }}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-full font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 transform hover:scale-105"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        {loading && (
          <div className={`fixed inset-0 ${darkMode ? 'bg-slate-900/90' : 'bg-white/90'} backdrop-blur-sm flex flex-col items-center justify-center z-50`}>
            <div className="relative">
              <div className="w-24 h-24 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <p className={`mt-8 text-xl font-medium ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>Analyzing your finances...</p>
          </div>
        )}

        {currentView === 'auth' && !loading && (
          <section className="mx-auto max-w-md">
            <div className={`rounded-3xl border p-8 shadow-2xl ${darkMode ? 'border-slate-700 bg-slate-900/80' : 'border-white/40 bg-white/80'}`}>
              <div className={`inline-flex rounded-xl p-1 mb-6 w-full ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                <button
                  onClick={() => setAuthMode('login')}
                  className={`w-1/2 rounded-lg py-2 text-sm font-semibold ${
                    authMode === 'login'
                      ? darkMode
                        ? 'bg-slate-200 text-slate-900 shadow'
                        : 'bg-white text-slate-900 shadow'
                      : darkMode
                        ? 'text-slate-300'
                        : 'text-slate-500'
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => setAuthMode('signup')}
                  className={`w-1/2 rounded-lg py-2 text-sm font-semibold ${
                    authMode === 'signup'
                      ? darkMode
                        ? 'bg-slate-200 text-slate-900 shadow'
                        : 'bg-white text-slate-900 shadow'
                      : darkMode
                        ? 'text-slate-300'
                        : 'text-slate-500'
                  }`}
                >
                  Sign Up
                </button>
              </div>
              <h2 className={`text-3xl font-bold ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>{authMode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
              <p className={`${darkMode ? 'text-slate-400' : 'text-slate-500'} mt-2 mb-6`}>{authMode === 'login' ? 'Access your financial insights.' : 'Start your financial clarity journey.'}</p>
              <form className="space-y-4">
                {authMode === 'signup' && <input type="text" placeholder="Full name" className={`w-full rounded-xl border px-4 py-3 focus:outline-none ${darkMode ? 'border-slate-700 bg-slate-800 text-slate-100' : 'border-slate-200 bg-white'}`} />}
                <input type="email" placeholder="Email address" className={`w-full rounded-xl border px-4 py-3 focus:outline-none ${darkMode ? 'border-slate-700 bg-slate-800 text-slate-100' : 'border-slate-200 bg-white'}`} />
                <input type="password" placeholder="Password" className={`w-full rounded-xl border px-4 py-3 focus:outline-none ${darkMode ? 'border-slate-700 bg-slate-800 text-slate-100' : 'border-slate-200 bg-white'}`} />
                <button type="button" className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 py-3 font-semibold text-white">
                  {authMode === 'login' ? 'Login' : 'Sign Up'}
                </button>
              </form>
              <button onClick={() => setCurrentView('input')} className="mt-5 text-sm font-semibold text-blue-500 hover:text-blue-400">Back to Home</button>
            </div>
          </section>
        )}

        {currentView === 'input' && !loading && (
          <>
            <section className="text-center max-w-3xl mx-auto mb-16">
              <h1 className={`text-4xl lg:text-6xl font-bold mb-6 leading-tight ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                Know Your Financial Future
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">Before You Spend</span>
              </h1>
              <p className={`${darkMode ? 'text-slate-300' : 'text-slate-600'} text-sm font-medium`}>
                All calculations are displayed in INR (₹).
              </p>
            </section>

            <FinancialInput onSubmit={handleSubmit} darkMode={darkMode} />

            <section id="features" className="mt-20 grid gap-6 md:grid-cols-3">
              {[
                { title: 'Smart Forecasting', desc: 'Simulate real-world scenarios with instant savings projections.' },
                { title: 'Risk Signal', desc: 'See the impact ratio and stability grade before you commit.' },
                { title: 'Actionable Insights', desc: 'Receive concise suggestions to strengthen your money position.' },
              ].map((item) => (
                <div key={item.title} className={`rounded-2xl border p-6 shadow-sm ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white/80 border-slate-200'}`}>
                  <h3 className={`text-lg font-bold ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>{item.title}</h3>
                  <p className={`mt-2 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{item.desc}</p>
                </div>
              ))}
            </section>

            <section id="how-it-works" className={`mt-14 rounded-3xl border p-8 ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white/80 border-slate-200'}`}>
              <h3 className={`text-2xl font-bold ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>How It Works</h3>
              <div className="mt-6 grid md:grid-cols-3 gap-6">
                {['Enter your monthly numbers', 'Run AI prediction', 'Review report and decide'].map((step, idx) => (
                  <div key={step} className={`rounded-xl p-5 ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                    <p className="text-sm font-semibold text-blue-500">Step {idx + 1}</p>
                    <p className={`mt-2 font-medium ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>{step}</p>
                  </div>
                ))}
              </div>
            </section>

            <section id="testimonials" className="mt-14 grid gap-6 md:grid-cols-3">
              {testimonials.map((item) => (
                <div key={item.name} className={`rounded-2xl border p-6 ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white/80 border-slate-200'}`}>
                  <p className={darkMode ? 'text-slate-200' : 'text-slate-700'}>{item.quote}</p>
                  <p className={`mt-4 text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{item.name}</p>
                  <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{item.role}</p>
                </div>
              ))}
            </section>
          </>
        )}

        {currentView === 'dashboard' && predictionData && !loading && (
          <ResultDashboard data={predictionData} onNewCheck={handleNewCheck} darkMode={darkMode} />
        )}
      </main>

      <footer className={`relative z-10 border-t ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Copyright 2026 CentSight. Financial clarity platform.
          </p>
          <p className={`text-sm ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            Built for fast scenario planning and decision support.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
