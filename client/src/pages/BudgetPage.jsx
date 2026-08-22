import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, PieChart as PieIcon, BarChart as BarIcon, DollarSign } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { get } from '../api/client';
import { MOCK_BUDGET, MOCK_TRIP_DETAIL } from '../api/mocks';
import Skeleton from '../components/Skeleton';
import ErrorBanner from '../components/ErrorBanner';

// Register Chart.js modules
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const BudgetPage = () => {
  const { id } = useParams();
  const [budget, setBudget] = useState(null);
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBudgetData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let bData = null;
      let tData = null;
      try {
        bData = await get(`/trips/${id}/budget`);
        tData = await get(`/trips/${id}`);
      } catch {
        bData = MOCK_BUDGET;
        tData = MOCK_TRIP_DETAIL;
      }

      setBudget(bData || MOCK_BUDGET);
      setTrip(tData || MOCK_TRIP_DETAIL);
    } catch (err) {
      setError({
        message: err.message || 'Failed to fetch budget details.',
        code: err.code || 'FETCH_ERROR',
      });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBudgetData();
  }, [fetchBudgetData]);

  if (loading) return <Skeleton type="itinerary" />;
  if (!budget) return <ErrorBanner message="Budget data unavailable." onRetry={fetchBudgetData} />;

  // Category Pie Chart Data & Colors
  const categoryLabels = ['Transport', 'Stay', 'Activities', 'Meals'];
  const categoryValues = [
    budget.byCategory?.transport || 0,
    budget.byCategory?.stay || 0,
    budget.byCategory?.activities || 0,
    budget.byCategory?.meals || 0,
  ];
  const categoryColors = ['#1E3A5F', '#3B82F6', '#FF6B6B', '#10B981'];
  const totalCalculated = categoryValues.reduce((a, b) => a + b, 0) || budget.total || 1;

  const pieChartData = {
    labels: categoryLabels,
    datasets: [
      {
        data: categoryValues,
        backgroundColor: categoryColors,
        borderWidth: 2,
        borderColor: '#FFFFFF',
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => ` ₹${context.raw.toFixed(2)}`,
        },
      },
    },
  };

  // Daily Spend Bar Chart Data
  const dailyLabels = (budget.byDay || []).map((d) => d.date);
  const dailyValues = (budget.byDay || []).map((d) => d.total);

  const barChartData = {
    labels: dailyLabels,
    datasets: [
      {
        label: 'Daily Spend (₹)',
        data: dailyValues,
        backgroundColor: (budget.byDay || []).map((d) =>
          budget.overBudgetDays?.includes(d.date) ? '#F59E0B' : '#1E3A5F'
        ),
        borderRadius: 8,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => ` Spend: ₹${context.raw.toFixed(2)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { family: 'Inter', size: 11 } },
      },
      y: {
        grid: { color: '#E5E7EB' },
        ticks: { font: { family: 'Inter', size: 11 } },
      },
    },
  };

  const hasOverBudgetDays = budget.overBudgetDays && budget.overBudgetDays.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div>
        <Link
          to={`/trips/${id}`}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-textMuted hover:text-primary transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Itinerary Builder</span>
        </Link>
        <h1 className="text-3xl font-extrabold text-textMain tracking-tight font-display">
          Trip Budget Breakdown
        </h1>
        <p className="text-sm text-textMuted mt-1">
          {trip?.name || 'Multi-city Trip'} • Financial analytics & category expense tracking
        </p>
      </div>

      <ErrorBanner message={error?.message} code={error?.code} onRetry={fetchBudgetData} onClose={() => setError(null)} />

      {/* Large Total Budget Metric Card: font-size 3rem, font-weight 800, color #1E3A5F, currency prefix ₹ in coral */}
      <div className="bg-surface-card rounded-card p-6 sm:p-8 shadow-card border border-borderLight flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-textMuted">
            Total Trip Expenditure
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-accent font-display">₹</span>
            <span className="text-[3rem] font-extrabold text-primary font-display tracking-tight leading-none">
              {(budget.total || totalCalculated).toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-slate-50 px-4 py-3 rounded-btn border border-borderLight">
          <DollarSign className="w-5 h-5 text-accent" />
          <span className="text-xs font-semibold text-slate-700">
            {categoryValues.filter((v) => v > 0).length} Categories Active
          </span>
        </div>
      </div>

      {/* Over-Budget Banner: background: #FFFBEB, border-left: 4px solid #F59E0B, padding: 16px (p-4), border-radius: 8px (rounded-lg). Render ONLY if non-empty! */}
      {hasOverBudgetDays && (
        <div className="bg-[#FFFBEB] border-l-4 border-[#F59E0B] p-4 rounded-lg shadow-sm flex items-start space-x-3 text-amber-900 animate-fade-in">
          <AlertTriangle className="w-5 h-5 text-[#F59E0B] shrink-0 mt-0.5" />
          <div>
            <h4 className="font-extrabold text-sm text-amber-950">Over Budget Alert</h4>
            <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
              Target daily budget limits were exceeded on:{' '}
              <span className="font-bold underline">
                {budget.overBudgetDays.join(', ')}
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Charts Grid — White cards with titles, p-6, shadow, border-radius: 16px */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart Card (Explicit Height: 300px) */}
        <div className="bg-surface-card rounded-card p-6 shadow-card border border-borderLight flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <PieIcon className="w-5 h-5 text-accent" />
              <h3 className="text-lg font-bold text-textMain font-display">
                Expense by Category
              </h3>
            </div>

            {/* Explicit 300px height container */}
            <div className="h-[300px] w-full relative">
              <Pie data={pieChartData} options={pieChartOptions} />
            </div>
          </div>

          {/* 2-Column Custom Category Legend */}
          <div className="mt-6 pt-4 border-t border-borderLight grid grid-cols-2 gap-3">
            {categoryLabels.map((label, idx) => {
              const val = categoryValues[idx];
              const pct = ((val / totalCalculated) * 100).toFixed(1);

              return (
                <div key={label} className="flex items-center space-x-2.5 text-xs">
                  <span
                    className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: categoryColors[idx] }}
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-textMain truncate">{label}</p>
                    <p className="text-[11px] text-textMuted">
                      ₹{val.toFixed(2)} ({pct}%)
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bar Chart Card (Explicit Height: 280px) */}
        <div className="bg-surface-card rounded-card p-6 shadow-card border border-borderLight flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <BarIcon className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold text-textMain font-display">
                Daily Spend Timeline
              </h3>
            </div>

            {/* Explicit 280px height container */}
            <div className="h-[280px] w-full relative">
              <Bar data={barChartData} options={barChartOptions} />
            </div>
          </div>

          <div className="mt-4 text-[11px] text-textMuted text-center">
            * Amber bars indicate dates exceeding target daily limits.
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetPage;
