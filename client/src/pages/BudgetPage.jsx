import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, AlertTriangle } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { motion, useReducedMotion } from 'motion/react';
import { get } from '../api/client';
import { MOCK_BUDGET, MOCK_TRIP_DETAIL, withMockFallback } from '../api/mocks';
import ErrorBanner from '../components/ErrorBanner';
import EmptyState from '../components/EmptyState';
import {
  springSettle, staggerContainer, fadeUpItem, getMotionProps,
} from '../lib/motion';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const categoryColors = {
  transport: '#5B5BF6',
  stay: '#0EA5E9',
  activities: '#E5484D',
  meals: '#1FAE7A',
};

const BudgetPage = () => {
  const { id } = useParams();
  const reduceMotion = useReducedMotion();
  const mountProps = getMotionProps(reduceMotion, 'mount');
  const tapProps = reduceMotion ? {} : { whileTap: { scale: 0.97 }, transition: springSettle };
  const [budget, setBudget] = useState(null);
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBudgetData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [bData, tData] = await Promise.all([
        withMockFallback(() => get(`/trips/${id}/budget`), MOCK_BUDGET),
        withMockFallback(() => get(`/trips/${id}`), MOCK_TRIP_DETAIL),
      ]);

      setBudget(bData);
      setTrip(tData);
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

  if (loading) {
    return (
      <div className="page-enter max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24 space-y-6">
        <div className="skeleton h-24 w-full rounded-card" />
        <div className="skeleton h-64 w-full rounded-card" />
      </div>
    );
  }

  if (!budget) return <ErrorBanner message="Budget data unavailable." onRetry={fetchBudgetData} />;

  // Chart configs
  const pieData = {
    labels: ['Transport', 'Stay', 'Activities', 'Meals'],
    datasets: [
      {
        data: [
          budget.byCategory?.transport || 0,
          budget.byCategory?.stay || 0,
          budget.byCategory?.activities || 0,
          budget.byCategory?.meals || 0,
        ],
        backgroundColor: ['#5B5BF6', '#0EA5E9', '#E5484D', '#1FAE7A'],
        borderWidth: 2,
        borderColor: '#FFFFFF',
      },
    ],
  };

  const barData = {
    labels: (budget.byDay || []).map((d) => d.date),
    datasets: [
      {
        label: 'Daily Spend (₹)',
        data: (budget.byDay || []).map((d) => d.total),
        backgroundColor: (budget.byDay || []).map((d) =>
          budget.overBudgetDays?.includes(d.date) ? '#E0A930' : '#5B5BF6'
        ),
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { family: 'Inter', size: 12 },
          color: '#6B6B7B',
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: '#15161F',
        titleFont: { family: 'Plus Jakarta Sans', size: 13, weight: 'bold' },
        bodyFont: { family: 'Inter', size: 12 },
        padding: 12,
        cornerRadius: 10,
      },
    },
  };

  const hasCosts =
    (Number(budget.total) || 0) > 0 ||
    (budget.byDay || []).some((d) => Number(d.total) > 0) ||
    Object.values(budget.byCategory || {}).some((n) => Number(n) > 0);

  return (
    <div className="page-enter max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24 pb-16 space-y-6">
      <div>
        <Link
          to={`/trips/${id}`}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-text-muted hover:text-text-main transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Itinerary Builder ({trip?.name || 'Trip'})</span>
        </Link>
      </div>

      <ErrorBanner message={error?.message} code={error?.code} onRetry={fetchBudgetData} onClose={() => setError(null)} />

      {!hasCosts ? (
        <EmptyState
          title="No scheduled costs yet"
          description="Schedule activities and add stay or transport estimates in your itinerary builder to generate a live budget breakdown."
          action={
            <motion.div className="inline-block" {...tapProps}>
              <Link
                to={`/trips/${id}`}
                className="inline-flex bg-accent hover:bg-accent-hover text-white font-bold px-6 py-3 rounded-btn shadow-btn-accent transition-colors text-xs sm:text-sm"
              >
                Add Activities
              </Link>
            </motion.div>
          }
        />
      ) : (
        <motion.div variants={staggerContainer} {...mountProps} className="space-y-6">
          {/* Total Header Card */}
          <motion.div variants={fadeUpItem} className="gt-card p-8 text-center space-y-2">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-accent-light text-accent text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Live Expense Tracking</span>
            </div>
            <p className="text-text-muted text-xs sm:text-sm font-semibold uppercase tracking-wider">
              Total Trip Cost
            </p>
            <p className="text-display-lg font-extrabold text-text-main" style={{ fontSize: 'clamp(2.5rem, 6vw, 3.8rem)' }}>
              <span className="text-accent">₹</span>
              {budget.total?.toLocaleString('en-IN')}
            </p>
          </motion.div>

          {/* Over Budget Alert */}
          {budget.overBudgetDays?.length > 0 && (
            <motion.div variants={fadeUpItem} className="flex items-start gap-3 p-4 rounded-card border border-warning/30 bg-warning/10 text-text-main">
              <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-text-main text-sm">Over budget on some days</p>
                <p className="text-text-muted text-xs sm:text-sm mt-0.5">{budget.overBudgetDays.join(', ')}</p>
              </div>
            </motion.div>
          )}

          {/* Charts Grid */}
          <motion.div variants={fadeUpItem} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div className="gt-card p-6">
              <h3 className="text-display-md font-bold text-text-main text-base mb-4">Cost by Category</h3>
              <div style={{ height: '260px', position: 'relative' }}>
                <Pie data={pieData} options={chartOptions} />
              </div>
            </div>

            {/* Bar Chart */}
            <div className="gt-card p-6">
              <h3 className="text-display-md font-bold text-text-main text-base mb-4">Daily Spend Overview</h3>
              <div style={{ height: '260px', position: 'relative' }}>
                <Bar
                  data={barData}
                  options={{
                    ...chartOptions,
                    plugins: { ...chartOptions.plugins, legend: { display: false } },
                  }}
                />
              </div>
            </div>
          </motion.div>

          {/* Category Breakdown List */}
          <motion.div variants={fadeUpItem} className="gt-card p-6 sm:p-7">
            <h3 className="text-display-md font-bold text-text-main text-base mb-4">Detailed Breakdown</h3>
            <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-4" variants={staggerContainer}>
              {Object.entries(budget.byCategory || {}).map(([cat, amount]) => (
                <motion.div key={cat} variants={fadeUpItem} className="flex items-center gap-3 p-3.5 rounded-xl bg-surface-raised border border-border-light">
                  <div
                    className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                    style={{ background: categoryColors[cat] || '#5B5BF6' }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-text-main capitalize">{cat}</p>
                    <p className="text-xs text-text-muted">₹{amount?.toLocaleString('en-IN')}</p>
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-text-main bg-white px-2.5 py-1 rounded-full border border-border-light shadow-sm">
                    {budget.total ? Math.round((amount / budget.total) * 100) : 0}%
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default BudgetPage;
