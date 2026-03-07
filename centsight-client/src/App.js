import React, { useEffect, useMemo, useState } from 'react';
import jsPDF from 'jspdf';
import FinancialInput from './components/FinancialInput';
import ResultDashboard from './components/ResultDashboard';

const DEFAULT_API_BASE =
  process.env.NODE_ENV === 'production'
    ? 'https://centsight-backend.onrender.com/api'
    : 'http://localhost:5000/api';
const API_BASE = (process.env.REACT_APP_API_BASE || DEFAULT_API_BASE).replace(/\/$/, '');
const getUserIdFromToken = (token) => {
  try {
    if (!token) return '';
    const parts = token.split('.');
    if (parts.length < 2) return '';
    const payload = JSON.parse(atob(parts[1]));
    return payload?.userId || '';
  } catch {
    return '';
  }
};

function App() {
  const initialToken = localStorage.getItem('centsight_token') || '';
  const initialUserId = getUserIdFromToken(initialToken);
  const [currentView, setCurrentView] = useState('input');
  const [predictionData, setPredictionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [darkMode, setDarkMode] = useState(false);
  const [authForm, setAuthForm] = useState({
    name: 'Aman',
    email: '',
    password: '',
  });
  const [authError, setAuthError] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [token, setToken] = useState(initialToken);
  const [userId, setUserId] = useState(initialUserId);
  const [apiOnline, setApiOnline] = useState(null);
  const [recentReportsLoading, setRecentReportsLoading] = useState(false);
  const [recentReportsError, setRecentReportsError] = useState('');
  const [recentTrack, setRecentTrack] = useState([]);

  const formatINR = (value) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number.isFinite(Number(value)) ? Number(value) : 0);

  const deriveStability = (projectedSavings, plannedExpense) => {
    const ratio = projectedSavings > 0 ? (plannedExpense / projectedSavings) * 100 : 100;
    if (ratio < 30) return 'Stable';
    if (ratio < 60) return 'Moderate';
    return 'High Risk';
  };

  const downloadRecentReportPdf = (row) => {
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    const left = 48;
    let y = 56;

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(20);
    pdf.text('CentSight Recent Report', left, y);
    y += 24;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    pdf.text(`Generated: ${new Date().toLocaleString()}`, left, y);
    y += 16;
    pdf.text(`Report Time: ${new Date(row.createdAt).toLocaleString()}`, left, y);
    y += 26;

    const rows = [
      ['Income', formatINR(row.monthlyIncome)],
      ['Expenses', formatINR(row.monthlyExpenses)],
      ['Planned Expense', formatINR(row.plannedExpense)],
      ['Projected Savings', formatINR(row.projectedSavings)],
      ['Stability', row.stability || 'N/A'],
    ];

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(13);
    pdf.text('Summary', left, y);
    y += 18;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    rows.forEach(([label, value]) => {
      pdf.text(`${label}: ${value}`, left, y);
      y += 16;
    });

    const safeTime = new Date(row.createdAt).toISOString().replace(/[:.]/g, '-');
    pdf.save(`centsight-recent-report-${safeTime}.pdf`);
  };

  const testimonials = useMemo(
    () => [
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
    ],
    []
  );

  const saveToken = (value) => {
    setToken(value);
    setUserId(getUserIdFromToken(value));
    localStorage.setItem('centsight_token', value);
  };

  const clearToken = () => {
    setToken('');
    setUserId('');
    localStorage.removeItem('centsight_token');
    setCurrentView('input');
    setPredictionData(null);
    setAuthError('');
    setAuthMessage('');
  };

  const pushRecentTrack = (record) => {
    setRecentTrack((prev) => {
      const next = [record, ...prev].slice(0, 8);
      const key = userId ? `centsight_recent_track_${userId}` : 'centsight_recent_track_guest';
      localStorage.setItem(key, JSON.stringify(next));
      return next;
    });
  };

  const replaceRecentTrack = (records) => {
    const next = records.slice(0, 8);
    setRecentTrack(next);
    const key = userId ? `centsight_recent_track_${userId}` : 'centsight_recent_track_guest';
    localStorage.setItem(key, JSON.stringify(next));
  };

  const loadRecentReports = async ({ openView = false } = {}) => {
    if (openView) setCurrentView('recentReports');
    setRecentReportsError('');

    if (!token) {
      setRecentReportsError('Login required to fetch backend recent reports.');
      return;
    }

    setRecentReportsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/simulate/history?limit=20`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        clearToken();
        setAuthMode('login');
        setAuthError('Session expired. Please login again.');
        setCurrentView('auth');
        return;
      }

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || 'Unable to load recent reports');
      }

      const rows = Array.isArray(payload?.reports) ? payload.reports : [];
      const mapped = rows.map((row) => {
        const projectedSavings = Number(row.predicted_savings ?? 0);
        const plannedExpense = Number(row.planned_expense ?? 0);
        return {
          id: row.id || row._id || `${Date.now()}-${Math.random()}`,
          createdAt: row.created_at || new Date().toISOString(),
          monthlyIncome: Number(row.income ?? 0),
          monthlyExpenses: Number(row.expenses ?? 0),
          plannedExpense,
          projectedSavings,
          stability: deriveStability(projectedSavings, plannedExpense),
        };
      });

      if (mapped.length > 0) {
        replaceRecentTrack(mapped);
      } else if (recentTrack.length === 0) {
        setRecentReportsError('No previous reports found for this account yet.');
      }
    } catch (error) {
      if (recentTrack.length > 0) {
        setRecentReportsError('Backend history unavailable, showing local recent reports.');
      } else {
        setRecentReportsError(String(error?.message || 'Unable to load recent reports'));
      }
    } finally {
      setRecentReportsLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    fetch(`${API_BASE}/health`, { signal: controller.signal })
      .then((res) => {
        if (!cancelled) setApiOnline(res.ok);
      })
      .catch(() => {
        if (!cancelled) setApiOnline(false);
      })
      .finally(() => clearTimeout(timeout));

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  useEffect(() => {
    try {
      const key = userId ? `centsight_recent_track_${userId}` : 'centsight_recent_track_guest';
      const raw = localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : [];
      setRecentTrack(Array.isArray(parsed) ? parsed : []);
    } catch {
      setRecentTrack([]);
    }
  }, [userId]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    const syncHistory = async () => {
      try {
        const response = await fetch(`${API_BASE}/simulate/history?limit=20`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 401) {
          if (!cancelled) {
            setToken('');
            localStorage.removeItem('centsight_token');
          }
          return;
        }

        const payload = await response.json();
        if (!response.ok) return;

        const rows = Array.isArray(payload?.reports) ? payload.reports : [];
        if (!cancelled && rows.length > 0) {
          const mapped = rows.slice(0, 8).map((row) => {
            const projectedSavings = Number(row.predicted_savings ?? 0);
            const plannedExpense = Number(row.planned_expense ?? 0);
            const ratio = projectedSavings > 0 ? (plannedExpense / projectedSavings) * 100 : 100;
            const stability = ratio < 30 ? 'Stable' : ratio < 60 ? 'Moderate' : 'High Risk';
            return {
              id: row.id || row._id || `${Date.now()}-${Math.random()}`,
              createdAt: row.created_at || new Date().toISOString(),
              monthlyIncome: Number(row.income ?? 0),
              monthlyExpenses: Number(row.expenses ?? 0),
              plannedExpense,
              projectedSavings,
              stability,
            };
          });

          setRecentTrack(mapped);
          localStorage.setItem('centsight_recent_track', JSON.stringify(mapped));
        }
      } catch {
        // Keep local recent reports if backend fetch fails.
      }
    };

    syncHistory();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const goToSection = (sectionId) => {
    setCurrentView('input');
    setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };

  const handleNewCheck = () => {
    setCurrentView('input');
    setPredictionData(null);
  };

  const mapToDashboardModel = (formData, apiData) => {
    const monthlyDisposable = formData.monthlyIncome - formData.monthlyExpenses;
    const projectedSavings =
      Number.isFinite(Number(apiData?.predicted_savings))
        ? Number(apiData.predicted_savings)
        : formData.currentSavings + monthlyDisposable * formData.timeHorizon;

    const impactRatio = projectedSavings > 0 ? (formData.plannedExpense / projectedSavings) * 100 : 100;

    let stability = 'High Risk';
    let badgeColor = 'from-rose-500 to-pink-600';
    if (impactRatio < 30) {
      stability = 'Stable';
      badgeColor = 'from-emerald-500 to-teal-600';
    } else if (impactRatio < 60) {
      stability = 'Moderate';
      badgeColor = 'from-amber-500 to-orange-600';
    }

    const chartData = Array.from({ length: formData.timeHorizon + 1 }, (_, i) => ({
      month: i,
      savings: Number((formData.currentSavings + ((projectedSavings - formData.currentSavings) * i) / formData.timeHorizon).toFixed(2)),
    }));

    return {
      ...formData,
      projectedSavings,
      monthlyDisposable,
      stability,
      badgeColor,
      insightText: apiData?.insight || 'Projection generated successfully.',
      chartData,
      impactRatio,
      riskScore: apiData?.risk_score,
      backendMode: true,
    };
  };

  const runLocalFallback = (formData, reason = '') => {
    const monthlyDisposable = formData.monthlyIncome - formData.monthlyExpenses;
    const projectedSavings = formData.currentSavings + monthlyDisposable * formData.timeHorizon;
    const impactRatio = projectedSavings > 0 ? (formData.plannedExpense / projectedSavings) * 100 : 100;

    let stability = 'High Risk';
    let badgeColor = 'from-rose-500 to-pink-600';
    let insightText = `This would use ${impactRatio.toFixed(1)}% of your savings. May significantly impact financial stability.`;

    if (impactRatio < 30) {
      stability = 'Stable';
      badgeColor = 'from-emerald-500 to-teal-600';
      insightText = `Your planned expense is ${impactRatio.toFixed(1)}% of projected savings. This appears manageable.`;
    } else if (impactRatio < 60) {
      stability = 'Moderate';
      badgeColor = 'from-amber-500 to-orange-600';
      insightText = `This expense represents ${impactRatio.toFixed(1)}% of your savings. Consider building more buffer first.`;
    }

    if (reason) {
      insightText += ` (Local fallback used: ${reason})`;
    }

    const chartData = Array.from({ length: formData.timeHorizon + 1 }, (_, i) => ({
      month: i,
      savings: formData.currentSavings + monthlyDisposable * i,
    }));

    return {
      ...formData,
      projectedSavings,
      monthlyDisposable,
      stability,
      badgeColor,
      insightText,
      chartData,
      impactRatio,
      backendMode: false,
    };
  };

  const handleSubmit = async (formData) => {
    if (!token) {
      setAuthMode('login');
      setAuthError('Please login first to run backend simulation.');
      setAuthMessage('');
      setCurrentView('auth');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/simulate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          income: formData.monthlyIncome,
          expenses: formData.monthlyExpenses,
          current_savings: formData.currentSavings,
          planned_expense: formData.plannedExpense,
          time_horizon: formData.timeHorizon,
        }),
      });

      if (response.status === 401) {
        clearToken();
        setAuthMode('login');
        setAuthError('Session expired. Please login again.');
        setCurrentView('auth');
        return;
      }

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || 'Simulation request failed');
      }

      const dashboardData = mapToDashboardModel(formData, payload);
      setPredictionData(dashboardData);
      pushRecentTrack({
        id: Date.now(),
        createdAt: new Date().toISOString(),
        monthlyIncome: dashboardData.monthlyIncome,
        monthlyExpenses: dashboardData.monthlyExpenses,
        plannedExpense: dashboardData.plannedExpense,
        projectedSavings: dashboardData.projectedSavings,
        stability: dashboardData.stability,
      });
      setCurrentView('dashboard');
    } catch (error) {
      const fallback = runLocalFallback(formData, error.message);
      setPredictionData(fallback);
      pushRecentTrack({
        id: Date.now(),
        createdAt: new Date().toISOString(),
        monthlyIncome: fallback.monthlyIncome,
        monthlyExpenses: fallback.monthlyExpenses,
        plannedExpense: fallback.plannedExpense,
        projectedSavings: fallback.projectedSavings,
        stability: fallback.stability,
      });
      setCurrentView('dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthInput = (event) => {
    const { name, value } = event.target;
    setAuthForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setAuthError('');
    setAuthMessage('');

    try {
      if (authMode === 'signup') {
        const signupRes = await fetch(`${API_BASE}/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: authForm.name,
            email: authForm.email,
            password: authForm.password,
          }),
        });
        const signupPayload = await signupRes.json();
        if (!signupRes.ok) {
          throw new Error(signupPayload?.error || 'Signup failed');
        }
        setAuthMessage('Signup successful. Logging you in...');
      }

      const loginRes = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: authForm.email,
          password: authForm.password,
        }),
      });
      const loginPayload = await loginRes.json();
      if (!loginRes.ok || !loginPayload?.token) {
        throw new Error(loginPayload?.error || 'Login failed');
      }

      saveToken(loginPayload.token);
      setAuthMessage('Login successful.');
      setCurrentView('input');
      setRecentReportsError('');
      void loadRecentReports();
    } catch (error) {
      const msg = String(error?.message || '');
      const networkFailure =
        error instanceof TypeError ||
        /failed to fetch|networkerror|connection refused|err_connection_refused/i.test(msg);

      if (networkFailure) {
        setAuthError(`Cannot connect to backend (${API_BASE}). Check REACT_APP_API_BASE and backend status.`);
      } else {
        setAuthError(msg || 'Authentication failed');
      }
    }
  };

  const shellClass = darkMode
    ? 'min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-100'
    : 'min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 text-slate-900';

  const navClass = darkMode
    ? 'relative z-10 bg-slate-900/80 backdrop-blur-lg border-b border-slate-700'
    : 'relative z-10 bg-white/80 backdrop-blur-lg border-b border-white/20';

  return (
    <div className={shellClass}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <nav className={`${navClass} ${loading ? 'opacity-0 pointer-events-none' : 'opacity-100'} transition-opacity duration-200`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <button onClick={() => setCurrentView('input')} className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">{'\u20B9'}</span>
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
                className={`px-3 py-2 rounded-lg text-sm font-semibold inline-flex items-center gap-2 ${darkMode ? 'bg-slate-700 text-slate-100' : 'bg-slate-100 text-slate-700'}`}
              >
                <span className="text-base" aria-hidden="true">{darkMode ? '\u2600' : '\u263D'}</span>
                <span>{darkMode ? 'Light' : 'Dark'}</span>
              </button>
              {token ? (
                <>
                  <button
                    onClick={() => loadRecentReports({ openView: true })}
                    className="px-4 py-2.5 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-500 transition-all duration-300"
                  >
                    Recent Reports
                  </button>
                  <button
                    onClick={clearToken}
                    className="px-4 py-2.5 bg-slate-700 text-white rounded-full font-semibold hover:bg-slate-600 transition-all duration-300"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setAuthMode('signup');
                    setCurrentView('auth');
                  }}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-full font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 transform hover:scale-105"
                >
                  Get Started
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        {loading && (
          <div className={`fixed inset-0 ${darkMode ? 'bg-slate-900/95' : 'bg-white/95'} backdrop-blur-sm flex flex-col items-center justify-center z-50`}>
            <div className="relative">
              <div className="absolute inset-0 w-28 h-28 -translate-x-2 -translate-y-2 rounded-full bg-gradient-to-r from-blue-500 to-teal-400 opacity-20 blur-xl animate-pulse"></div>
              <div className="w-24 h-24 border-4 border-blue-200/80 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-4 w-16 h-16 border-4 border-teal-200/60 border-b-teal-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.2s' }}></div>
            </div>
            <p className={`mt-10 text-2xl font-semibold ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>Building your financial report</p>
            <p className={`mt-2 text-sm ${darkMode ? 'text-slate-300' : 'text-slate-500'}`}>Crunching projections, risk ratio, and savings nodes...</p>
            <div className="mt-6 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-500 animate-bounce"></span>
              <span className="h-2 w-2 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '0.15s' }}></span>
              <span className="h-2 w-2 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '0.3s' }}></span>
            </div>
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

              <h2 className={`text-3xl font-bold ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                {authMode === 'login' ? 'Welcome back' : 'Create your account'}
              </h2>
              <p className={`${darkMode ? 'text-slate-400' : 'text-slate-500'} mt-2 mb-6`}>
                {authMode === 'login' ? 'Access your financial insights.' : 'Start your financial clarity journey.'}
              </p>

              <form className="space-y-4" onSubmit={handleAuthSubmit}>
                {authMode === 'signup' && (
                  <input
                    type="text"
                    name="name"
                    value={authForm.name}
                    onChange={handleAuthInput}
                    placeholder="Full name"
                    className={`w-full rounded-xl border px-4 py-3 focus:outline-none ${darkMode ? 'border-slate-700 bg-slate-800 text-slate-100' : 'border-slate-200 bg-white'}`}
                  />
                )}
                <input
                  type="email"
                  name="email"
                  value={authForm.email}
                  onChange={handleAuthInput}
                  placeholder="Email address"
                  className={`w-full rounded-xl border px-4 py-3 focus:outline-none ${darkMode ? 'border-slate-700 bg-slate-800 text-slate-100' : 'border-slate-200 bg-white'}`}
                  required
                />
                <input
                  type="password"
                  name="password"
                  value={authForm.password}
                  onChange={handleAuthInput}
                  placeholder="Password"
                  className={`w-full rounded-xl border px-4 py-3 focus:outline-none ${darkMode ? 'border-slate-700 bg-slate-800 text-slate-100' : 'border-slate-200 bg-white'}`}
                  required
                />
                {authError && <p className="text-sm text-rose-500">{authError}</p>}
                {authMessage && <p className="text-sm text-emerald-500">{authMessage}</p>}
                <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 py-3 font-semibold text-white">
                  {authMode === 'login' ? 'Login' : 'Sign Up'}
                </button>
              </form>

              <button onClick={() => setCurrentView('input')} className="mt-5 text-sm font-semibold text-blue-500 hover:text-blue-400">
                Back to Home
              </button>
            </div>
          </section>
        )}

        {currentView === 'recentReports' && !loading && (
          <section className={`mx-auto max-w-6xl rounded-3xl border p-6 shadow-xl ${darkMode ? 'border-slate-700 bg-slate-900/80' : 'border-slate-200 bg-white/90'}`}>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className={`text-3xl font-bold ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>Recent Reports</h2>
                <p className={`${darkMode ? 'text-slate-400' : 'text-slate-500'} text-sm`}>
                  Track your previous submitted values and projected results without new input.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => loadRecentReports({ openView: true })}
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 px-4 py-2 text-sm font-semibold text-white"
                >
                  Refresh
                </button>
                <button
                  onClick={() => setCurrentView('input')}
                  className={`rounded-xl border px-4 py-2 text-sm font-semibold ${darkMode ? 'border-slate-600 bg-slate-800 text-slate-100' : 'border-slate-200 bg-white text-slate-700'}`}
                >
                  New Analysis
                </button>
              </div>
            </div>

            {recentReportsLoading && (
              <p className={`${darkMode ? 'text-slate-400' : 'text-slate-500'} text-sm mb-4`}>Loading reports...</p>
            )}
            {recentReportsError && (
              <p className="mb-4 text-sm text-amber-500">{recentReportsError}</p>
            )}

            {recentTrack.length === 0 ? (
              <p className={`${darkMode ? 'text-slate-400' : 'text-slate-600'} text-sm`}>No recent report entries available.</p>
            ) : (
              <div className={`overflow-x-auto rounded-xl border ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className={darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'}>
                      <th className="px-4 py-3 text-left">Date</th>
                      <th className="px-4 py-3 text-right">Income</th>
                      <th className="px-4 py-3 text-right">Expenses</th>
                      <th className="px-4 py-3 text-right">Planned</th>
                      <th className="px-4 py-3 text-right">Projected</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-center">Download</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTrack.map((row) => (
                      <tr key={row.id} className={darkMode ? 'border-t border-slate-800' : 'border-t border-slate-100'}>
                        <td className={`px-4 py-3 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{new Date(row.createdAt).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-semibold">{formatINR(row.monthlyIncome)}</td>
                        <td className="px-4 py-3 text-right font-semibold">{formatINR(row.monthlyExpenses)}</td>
                        <td className="px-4 py-3 text-right font-semibold">{formatINR(row.plannedExpense)}</td>
                        <td className="px-4 py-3 text-right font-bold">{formatINR(row.projectedSavings)}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            row.stability === 'Stable'
                              ? 'bg-emerald-100 text-emerald-700'
                              : row.stability === 'Moderate'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-rose-100 text-rose-700'
                          }`}>
                            {row.stability}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => downloadRecentReportPdf(row)}
                            className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition ${
                              darkMode
                                ? 'border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700'
                                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                            title="Download PDF"
                            aria-label="Download report PDF"
                          >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
                Backend status: {apiOnline === null ? 'Checking...' : apiOnline ? 'Online' : 'Offline'} | Model: {apiOnline ? 'Connected' : apiOnline === false ? 'Disconnected' : 'Checking'} | Currency: {'\u20B9'}
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
                {['Create account and login', 'Submit financial input', 'Receive projection report'].map((step, idx) => (
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
          <ResultDashboard data={predictionData} recentTrack={recentTrack} onNewCheck={handleNewCheck} darkMode={darkMode} />
        )}
      </main>

      <footer className={`relative z-10 border-t ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Copyright 2026 CentSight. Financial clarity platform.
          </p>
          <p className={`text-sm ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            Connected workflow: Auth + Simulation API + Dashboard.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
