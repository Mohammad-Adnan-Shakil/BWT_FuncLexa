import React, { useState } from 'react';

const FinancialInput = ({ onSubmit, darkMode = false }) => {
  const [formData, setFormData] = useState({
    monthlyIncome: '',
    monthlyExpenses: '',
    currentSavings: '',
    plannedExpense: '',
    timeHorizon: '12',
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const nextErrors = {};
    if (!formData.monthlyIncome || Number(formData.monthlyIncome) <= 0) nextErrors.monthlyIncome = 'Enter valid monthly income';
    if (formData.monthlyExpenses === '' || Number(formData.monthlyExpenses) < 0) nextErrors.monthlyExpenses = 'Enter valid monthly expenses';
    if (formData.currentSavings === '' || Number(formData.currentSavings) < 0) nextErrors.currentSavings = 'Enter current savings';
    if (!formData.plannedExpense || Number(formData.plannedExpense) <= 0) nextErrors.plannedExpense = 'Enter planned expense';
    return nextErrors;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = validateForm();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onSubmit({
      monthlyIncome: Number(formData.monthlyIncome),
      monthlyExpenses: Number(formData.monthlyExpenses),
      currentSavings: Number(formData.currentSavings),
      plannedExpense: Number(formData.plannedExpense),
      timeHorizon: Number(formData.timeHorizon),
    });
  };

  const wrapperClass = darkMode
    ? 'relative bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700 overflow-hidden'
    : 'relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden';

  const cardClass = darkMode ? 'bg-slate-900 text-slate-100' : 'bg-white';

  const labelClass = darkMode ? 'block text-sm font-medium text-slate-300 mb-2' : 'block text-sm font-medium text-slate-700 mb-2';

  const inputBaseClass = darkMode
    ? 'w-full px-4 py-3 bg-slate-800 border rounded-xl transition-all outline-none text-slate-100 placeholder:text-slate-500 border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-900'
    : 'w-full px-4 py-3 bg-white border rounded-xl transition-all outline-none text-slate-900 placeholder:text-slate-400 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100';

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-teal-500 rounded-3xl transform rotate-1 scale-105 opacity-20 blur-2xl"></div>

      <div className={wrapperClass}>
        <div className="bg-gradient-to-r from-blue-600 to-teal-500 px-8 py-10">
          <h2 className="text-3xl font-bold text-white mb-2">Financial Input</h2>
          <p className="text-blue-100 text-lg">Provide your values to generate projection and risk analysis.</p>
        </div>

        <form onSubmit={handleSubmit} className={`p-8 space-y-6 ${cardClass}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: 'Monthly Income', name: 'monthlyIncome', placeholder: '3000' },
              { label: 'Monthly Expenses', name: 'monthlyExpenses', placeholder: '2500' },
              { label: 'Current Savings', name: 'currentSavings', placeholder: '5000' },
              { label: 'Planned Major Expense', name: 'plannedExpense', placeholder: '1000' },
            ].map((field) => (
              <div key={field.name}>
                <label className={labelClass}>{field.label}</label>
                <input
                  type="number"
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  min="0"
                  step="0.01"
                  className={`${inputBaseClass} ${errors[field.name] ? 'border-rose-500 ring-2 ring-rose-100' : ''}`}
                />
                {errors[field.name] && <p className="mt-2 text-sm text-rose-500">{errors[field.name]}</p>}
              </div>
            ))}
          </div>

          <div>
            <label className={labelClass}>Time Horizon</label>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '6', label: '6 Months' },
                { value: '12', label: '12 Months' },
              ].map((option) => {
                const active = formData.timeHorizon === option.value;
                return (
                  <label
                    key={option.value}
                    className={`cursor-pointer rounded-xl border p-4 text-center font-semibold transition ${
                      active
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : darkMode
                          ? 'border-slate-700 bg-slate-800 text-slate-300'
                          : 'border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="timeHorizon"
                      value={option.value}
                      checked={active}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    {option.label}
                  </label>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-teal-500 text-white text-lg font-semibold rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/30 active:scale-[0.99]"
          >
            Analyze Financial Projection
          </button>
        </form>
      </div>
    </div>
  );
};

export default FinancialInput;
