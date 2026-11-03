import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { 
  BarChart3, Activity, CheckSquare, Award, Flame, Star, 
  Calendar, TrendingDown, TrendingUp, Minus, Info, ArrowUpRight, 
  ArrowDownRight, CheckCircle2, Clock, Zap, Leaf, Droplets, Trash2, 
  ShieldCheck, Download, ChevronDown, Check, AlertCircle
} from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { generateSustainabilityReport } from '../utils/pdfGenerator';

const BREAKDOWN_COLORS = {
  Transportation: '#3b82f6',
  Transport: '#3b82f6',
  Electricity: '#eab308',
  Food: '#10b981',
  Water: '#06b6d4',
  Waste: '#6b7280'
};

const CATEGORY_ICONS = {
  transport: Zap,
  energy: Zap,
  water: Droplets,
  waste: Trash2,
  food: Leaf
};

export default function Analytics() {
  const { user, userData } = useUser();
  const [timeframe, setTimeframe] = useState('weekly'); // 'weekly' | 'monthly' | 'all-time'
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfError, setPdfError] = useState(null);
  const [pdfSuccess, setPdfSuccess] = useState(false);
  const [showPdfMenu, setShowPdfMenu] = useState(false);
  const pdfMenuRef = useRef(null);

  // Close PDF menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (pdfMenuRef.current && !pdfMenuRef.current.contains(e.target)) {
        setShowPdfMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Extract raw user data safely
  const totalFootprint = userData?.totalFootprint ?? 0;
  const ecoStreak = userData?.ecoStreak ?? 0;
  const rewardPoints = userData?.rewardPoints ?? 0;
  const calculationHistory = userData?.calculationHistory || [];
  const habits = userData?.habits || [];
  const weeklyProgress = userData?.weeklyProgress || {};
  const challenges = userData?.challenges || [];
  const chartData = userData?.chartData || [];
  const impactBreakdown = userData?.impactBreakdown || [];

  // Current timestamp references
  const now = Date.now();
  const oneDayMs = 86400000;
  
  let daysInPeriod = 7;
  let currentPeriodStart = now - 7 * oneDayMs;
  let prevPeriodStart = currentPeriodStart - 7 * oneDayMs;

  if (timeframe === 'monthly') {
    daysInPeriod = 30;
    currentPeriodStart = now - 30 * oneDayMs;
    prevPeriodStart = currentPeriodStart - 30 * oneDayMs;
  } else if (timeframe === 'all-time') {
    const joinTime = user?.joinDate ? new Date(user.joinDate).getTime() : now - 30 * oneDayMs;
    daysInPeriod = Math.max(1, Math.ceil((now - joinTime) / oneDayMs));
    currentPeriodStart = 0;
    prevPeriodStart = 0;
  }

  // -------------------------------------------------------------
  // PDF Generation Handler
  // -------------------------------------------------------------
  const handleDownloadPdf = async (period = timeframe) => {
    try {
      setIsGeneratingPdf(true);
      setPdfError(null);
      setPdfSuccess(false);
      setShowPdfMenu(false);
      await generateSustainabilityReport(user, userData, period);
      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 4500);
    } catch (err) {
      console.error('PDF Report error:', err);
      setPdfError(err.message || 'Failed to generate PDF report.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // -------------------------------------------------------------
  // 1. Carbon Footprint Timeframe Filtering & Aggregation
  // -------------------------------------------------------------
  const carbonStats = useMemo(() => {
    // Partition calculation history into current and previous periods
    const currentPeriodCalcs = calculationHistory.filter(item => {
      const itemTime = item.id && typeof item.id === 'number' ? item.id : new Date(item.date).getTime();
      return itemTime >= currentPeriodStart && itemTime <= now;
    });

    const prevPeriodCalcs = timeframe === 'all-time' ? [] : calculationHistory.filter(item => {
      const itemTime = item.id && typeof item.id === 'number' ? item.id : new Date(item.date).getTime();
      return itemTime >= prevPeriodStart && itemTime < currentPeriodStart;
    });

    // Sum totals
    let currentEmissionsSum = currentPeriodCalcs.reduce((acc, curr) => acc + (parseFloat(curr.total) || 0), 0);
    const prevEmissionsSum = prevPeriodCalcs.reduce((acc, curr) => acc + (parseFloat(curr.total) || 0), 0);

    // Fallbacks if history is empty
    if (currentEmissionsSum === 0 && calculationHistory.length === 0) {
      if (timeframe === 'all-time') {
        currentEmissionsSum = totalFootprint;
      } else {
        currentEmissionsSum = chartData.reduce((acc, curr) => acc + (parseFloat(curr.emissions) || 0), 0);
      }
    }

    // Daily Average
    const dailyAverage = (currentEmissionsSum / daysInPeriod).toFixed(2);

    // Percentage comparison with previous period
    let pctChange = 0;
    let changeDirection = 'neutral';
    if (timeframe === 'all-time') {
      changeDirection = 'alltime';
    } else if (prevEmissionsSum > 0) {
      pctChange = parseFloat((((currentEmissionsSum - prevEmissionsSum) / prevEmissionsSum) * 100).toFixed(1));
      changeDirection = pctChange < 0 ? 'reduced' : pctChange > 0 ? 'increased' : 'neutral';
    } else if (currentEmissionsSum > 0 && prevEmissionsSum === 0) {
      pctChange = 100;
      changeDirection = 'first';
    }

    return {
      currentTotal: parseFloat(currentEmissionsSum.toFixed(2)),
      prevTotal: parseFloat(prevEmissionsSum.toFixed(2)),
      dailyAverage,
      pctChange,
      changeDirection,
      currentCalcsCount: currentPeriodCalcs.length,
      prevCalcsCount: prevPeriodCalcs.length,
    };
  }, [calculationHistory, chartData, currentPeriodStart, prevPeriodStart, now, daysInPeriod, timeframe, totalFootprint]);

  // -------------------------------------------------------------
  // 2. Carbon Comparison Chart Data
  // -------------------------------------------------------------
  const carbonChartSeries = useMemo(() => {
    if (timeframe === 'weekly') {
      const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const dataMap = dayLabels.map(day => ({ label: day, current: 0, previous: 0 }));

      if (calculationHistory.length > 0) {
        calculationHistory.forEach(item => {
          const itemTime = item.id && typeof item.id === 'number' ? item.id : new Date(item.date).getTime();
          const itemDate = new Date(itemTime);
          const dayIdx = (itemDate.getDay() + 6) % 7;
          const val = parseFloat(item.total) || 0;

          if (itemTime >= currentPeriodStart && itemTime <= now) {
            dataMap[dayIdx].current = parseFloat((dataMap[dayIdx].current + val).toFixed(2));
          } else if (itemTime >= prevPeriodStart && itemTime < currentPeriodStart) {
            dataMap[dayIdx].previous = parseFloat((dataMap[dayIdx].previous + val).toFixed(2));
          }
        });
      } else {
        chartData.forEach(d => {
          const idx = dayLabels.indexOf(d.name);
          if (idx !== -1) {
            dataMap[idx].current = parseFloat(d.emissions || 0);
          }
        });
      }

      return dataMap;
    } else {
      // Monthly or All-Time view: 4 weeks breakdown
      const weeks = [
        { label: 'Week 1', current: 0, previous: 0 },
        { label: 'Week 2', current: 0, previous: 0 },
        { label: 'Week 3', current: 0, previous: 0 },
        { label: 'Week 4', current: 0, previous: 0 },
      ];

      calculationHistory.forEach(item => {
        const itemTime = item.id && typeof item.id === 'number' ? item.id : new Date(item.date).getTime();
        const val = parseFloat(item.total) || 0;

        if (itemTime >= currentPeriodStart && itemTime <= now) {
          const daysAgo = Math.floor((now - itemTime) / oneDayMs);
          const weekIdx = Math.min(3, Math.floor((29 - daysAgo) / 7.5));
          if (weekIdx >= 0) {
            weeks[weekIdx].current = parseFloat((weeks[weekIdx].current + val).toFixed(2));
          }
        } else if (timeframe !== 'all-time' && itemTime >= prevPeriodStart && itemTime < currentPeriodStart) {
          const daysAgo = Math.floor((currentPeriodStart - itemTime) / oneDayMs);
          const weekIdx = Math.min(3, Math.floor((29 - daysAgo) / 7.5));
          if (weekIdx >= 0) {
            weeks[weekIdx].previous = parseFloat((weeks[weekIdx].previous + val).toFixed(2));
          }
        }
      });

      return weeks;
    }
  }, [timeframe, calculationHistory, chartData, currentPeriodStart, prevPeriodStart, now, oneDayMs]);

  // -------------------------------------------------------------
  // 3. Category Breakdown (Transportation, Electricity, etc.)
  // -------------------------------------------------------------
  const categoryBreakdownData = useMemo(() => {
    const totals = {
      Transportation: 0,
      Electricity: 0,
      Food: 0,
      Water: 0,
      Waste: 0,
    };

    let count = 0;
    calculationHistory.forEach(item => {
      const itemTime = item.id && typeof item.id === 'number' ? item.id : new Date(item.date).getTime();
      if (itemTime >= currentPeriodStart && itemTime <= now && Array.isArray(item.breakdown)) {
        item.breakdown.forEach(b => {
          const name = b.name === 'Transport' ? 'Transportation' : b.name;
          if (totals[name] !== undefined) {
            totals[name] += parseFloat(b.value) || 0;
            count++;
          }
        });
      }
    });

    if (count === 0 && impactBreakdown.length > 0) {
      return impactBreakdown.map(item => ({
        name: item.name,
        value: parseFloat(item.value) || 0,
        color: BREAKDOWN_COLORS[item.name] || '#10b981',
      }));
    }

    return Object.keys(totals)
      .filter(k => totals[k] > 0)
      .map(k => ({
        name: k,
        value: parseFloat(totals[k].toFixed(2)),
        color: BREAKDOWN_COLORS[k] || '#10b981',
      }));
  }, [calculationHistory, currentPeriodStart, now, impactBreakdown]);

  // -------------------------------------------------------------
  // 4. Habit Performance Analytics
  // -------------------------------------------------------------
  const completedHabitsCount = habits.filter(h => h.completed).length;
  const pendingHabitsCount = habits.filter(h => !h.completed).length;
  const totalHabitsCount = habits.length;
  const todayProgressPercent = totalHabitsCount > 0 
    ? Math.round((completedHabitsCount / totalHabitsCount) * 100) 
    : 0;

  // Consistency records from actual weeklyProgress
  const habitConsistencyData = useMemo(() => {
    const daysToShow = timeframe === 'weekly' ? 7 : 30;
    const result = [];
    let loggedDaysCount = 0;
    let sumPercentage = 0;

    for (let i = daysToShow - 1; i >= 0; i--) {
      const d = new Date(now - i * oneDayMs);
      const dateKey = d.toISOString().slice(0, 10);
      const label = timeframe === 'weekly' 
        ? d.toLocaleDateString('en-US', { weekday: 'short' })
        : d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });

      const hasRecord = Object.prototype.hasOwnProperty.call(weeklyProgress, dateKey);
      const percent = hasRecord ? weeklyProgress[dateKey] : 0;

      if (hasRecord) {
        loggedDaysCount++;
        sumPercentage += percent;
      }

      result.push({
        date: dateKey,
        label,
        completion: percent,
        isLogged: hasRecord,
      });
    }

    const averageConsistency = loggedDaysCount > 0 ? Math.round(sumPercentage / loggedDaysCount) : 0;

    return {
      records: result,
      loggedDaysCount,
      totalDays: daysToShow,
      averageConsistency,
    };
  }, [timeframe, weeklyProgress, now, oneDayMs]);

  // -------------------------------------------------------------
  // 5. Challenge Analytics
  // -------------------------------------------------------------
  const challengeStats = useMemo(() => {
    const total = challenges.length;
    const completed = challenges.filter(c => c.status === 'completed').length;
    const active = challenges.filter(c => c.status === 'active').length;
    const available = challenges.filter(c => c.status === 'available').length;
    const joined = completed + active;
    const completionPct = joined > 0 ? Math.round((completed / joined) * 100) : 0;

    return {
      total,
      completed,
      active,
      available,
      joined,
      completionPct,
    };
  }, [challenges]);

  // Format date range text for subtitle
  const dateRangeText = useMemo(() => {
    if (timeframe === 'all-time') {
      return 'All Available Historical Records';
    }
    const startDate = new Date(currentPeriodStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endDate = new Date(now).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${startDate} – ${endDate}`;
  }, [currentPeriodStart, now, timeframe]);

  return (
    <div className="space-y-8 animate-fade-in pb-12 max-w-7xl mx-auto">
      {/* Success Notification Banner */}
      {pdfSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
            <div>
              <p className="font-semibold text-sm">PDF Report Downloaded Successfully!</p>
              <p className="text-xs text-green-700">Check your downloads folder for your formatted sustainability document.</p>
            </div>
          </div>
          <button onClick={() => setPdfSuccess(false)} className="text-green-600 hover:text-green-800 text-xs font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Error Notification Banner */}
      {pdfError && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <div>
              <p className="font-semibold text-sm">Report Generation Failed</p>
              <p className="text-xs text-red-700">{pdfError}</p>
            </div>
          </div>
          <button onClick={() => setPdfError(null)} className="text-red-600 hover:text-red-800 text-xs font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Page Header with Timeframe Filter & PDF Download */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-eco-mint/20 text-eco-forest rounded-xl">
              <BarChart3 className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-eco-charcoal">Analytics & Insights</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Performance breakdown for <span className="font-semibold text-gray-700">{dateRangeText}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Toolbar: Timeframe Selector & PDF Download Button */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Weekly / Monthly / All-Time Filter Buttons */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200">
            <button
              id="filter-weekly-btn"
              onClick={() => setTimeframe('weekly')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                timeframe === 'weekly'
                  ? 'bg-eco-forest text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Weekly
            </button>
            <button
              id="filter-monthly-btn"
              onClick={() => setTimeframe('monthly')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                timeframe === 'monthly'
                  ? 'bg-eco-forest text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              id="filter-alltime-btn"
              onClick={() => setTimeframe('all-time')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                timeframe === 'all-time'
                  ? 'bg-eco-forest text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All-Time
            </button>
          </div>

          {/* Download PDF Report Button with Dropdown Options */}
          <div className="relative" ref={pdfMenuRef}>
            <div className="inline-flex rounded-xl shadow-sm">
              <button
                id="download-pdf-main-btn"
                disabled={isGeneratingPdf}
                onClick={() => handleDownloadPdf(timeframe)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-eco-forest text-white text-xs font-bold rounded-l-xl hover:bg-eco-leaf disabled:opacity-60 transition-all border-r border-eco-leaf/30"
              >
                {isGeneratingPdf ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-eco-mint" />
                    Download PDF Report
                  </>
                )}
              </button>
              <button
                id="download-pdf-menu-btn"
                disabled={isGeneratingPdf}
                onClick={() => setShowPdfMenu(!showPdfMenu)}
                className="px-2.5 py-2 bg-eco-forest text-white text-xs font-bold rounded-r-xl hover:bg-eco-leaf disabled:opacity-60 transition-all"
                title="Select Report Period"
              >
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showPdfMenu ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Dropdown Menu */}
            {showPdfMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-30 animate-fade-in text-xs">
                <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100">
                  Select Reporting Window
                </div>
                <button
                  onClick={() => handleDownloadPdf('weekly')}
                  className="w-full text-left px-3 py-2 text-gray-700 hover:bg-eco-mint/10 hover:text-eco-forest flex items-center justify-between transition-colors"
                >
                  <span>Weekly Report (Last 7 Days)</span>
                  {timeframe === 'weekly' && <Check className="w-3.5 h-3.5 text-eco-forest" />}
                </button>
                <button
                  onClick={() => handleDownloadPdf('monthly')}
                  className="w-full text-left px-3 py-2 text-gray-700 hover:bg-eco-mint/10 hover:text-eco-forest flex items-center justify-between transition-colors"
                >
                  <span>Monthly Report (Last 30 Days)</span>
                  {timeframe === 'monthly' && <Check className="w-3.5 h-3.5 text-eco-forest" />}
                </button>
                <button
                  onClick={() => handleDownloadPdf('all-time')}
                  className="w-full text-left px-3 py-2 text-gray-700 hover:bg-eco-mint/10 hover:text-eco-forest flex items-center justify-between transition-colors"
                >
                  <span>All-Time Comprehensive Report</span>
                  {timeframe === 'all-time' && <Check className="w-3.5 h-3.5 text-eco-forest" />}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Overview Cards (6 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Carbon Footprint */}
        <div className="glass-card p-5 border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Total Footprint</span>
            <div className="p-1.5 bg-red-50 text-red-600 rounded-lg">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-eco-charcoal">
              {totalFootprint} <span className="text-xs font-normal text-gray-500">kg CO₂e</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Cumulative tracked impact</p>
          </div>
        </div>

        {/* Average Daily CO2 */}
        <div className="glass-card p-5 border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Daily Avg CO₂</span>
            <div className="p-1.5 bg-yellow-50 text-yellow-600 rounded-lg">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-eco-charcoal">
              {carbonStats.dailyAverage} <span className="text-xs font-normal text-gray-500">kg/day</span>
            </div>
            <div className="flex items-center text-[11px] mt-1">
              {carbonStats.changeDirection === 'reduced' && (
                <span className="text-green-600 font-medium flex items-center">
                  <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" /> {Math.abs(carbonStats.pctChange)}% vs prev
                </span>
              )}
              {carbonStats.changeDirection === 'increased' && (
                <span className="text-red-500 font-medium flex items-center">
                  <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +{carbonStats.pctChange}% vs prev
                </span>
              )}
              {carbonStats.changeDirection === 'first' && (
                <span className="text-blue-500 font-medium">First period logged</span>
              )}
              {carbonStats.changeDirection === 'alltime' && (
                <span className="text-gray-400">All-time record</span>
              )}
              {carbonStats.changeDirection === 'neutral' && (
                <span className="text-gray-400">Baseline period</span>
              )}
            </div>
          </div>
        </div>

        {/* Habits Completed */}
        <div className="glass-card p-5 border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Habits Done</span>
            <div className="p-1.5 bg-green-50 text-eco-forest rounded-lg">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-eco-charcoal">
              {completedHabitsCount} <span className="text-xs font-normal text-gray-500">/ {totalHabitsCount}</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">{todayProgressPercent}% daily completion</p>
          </div>
        </div>

        {/* Current Eco-Streak */}
        <div className="glass-card p-5 border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Eco-Streak</span>
            <div className="p-1.5 bg-orange-50 text-orange-500 rounded-lg">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-eco-charcoal">
              {ecoStreak} <span className="text-xs font-normal text-gray-500">days</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Active daily streak</p>
          </div>
        </div>

        {/* Total Eco-Points */}
        <div className="glass-card p-5 border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Eco-Points</span>
            <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
              <Star className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-eco-charcoal">
              {rewardPoints.toLocaleString()} <span className="text-xs font-normal text-gray-500">pts</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Redeemable rewards</p>
          </div>
        </div>

        {/* Challenges Completed */}
        <div className="glass-card p-5 border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Challenges</span>
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-eco-charcoal">
              {challengeStats.completed} <span className="text-xs font-normal text-gray-500">/ {challengeStats.joined}</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">{challengeStats.completionPct}% joined completed</p>
          </div>
        </div>
      </div>

      {/* 3. Carbon Footprint Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Carbon Comparison Chart */}
        <div className="glass-card p-6 lg:col-span-2 border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-6">
            <div>
              <h2 className="text-lg font-bold text-eco-charcoal flex items-center gap-2">
                <Activity className="w-5 h-5 text-eco-forest" />
                Carbon Footprint: {timeframe === 'weekly' ? 'Weekly Comparison' : timeframe === 'monthly' ? 'Monthly Comparison' : 'Cumulative Period Overview'}
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Comparing emissions in kg CO₂e for equivalent historical intervals.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-eco-forest inline-block"></span>
                <span className="text-gray-600 font-medium">Current Period</span>
              </div>
              {timeframe !== 'all-time' && (
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-gray-300 inline-block"></span>
                  <span className="text-gray-600 font-medium">Previous Period</span>
                </div>
              )}
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={carbonChartSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="label" stroke="#6b7280" fontSize={12} tickLine={false} />
                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-100 text-xs">
                          <p className="font-bold text-gray-800 mb-1">{label}</p>
                          <p className="text-eco-forest font-semibold">
                            Current: {payload[0]?.value ?? 0} kg CO₂e
                          </p>
                          {payload[1] && (
                            <p className="text-gray-500 font-medium">
                              Previous: {payload[1]?.value ?? 0} kg CO₂e
                            </p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="current" name="Current" fill="#1b4332" radius={[4, 4, 0, 0]} />
                {timeframe !== 'all-time' && (
                  <Bar dataKey="previous" name="Previous" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap justify-between items-center text-xs text-gray-500 gap-2">
            <div>
              Period Total: <span className="font-bold text-eco-charcoal">{carbonStats.currentTotal} kg CO₂e</span>
              {timeframe !== 'all-time' && (
                <span> vs <span className="font-medium text-gray-500">{carbonStats.prevTotal} kg CO₂e</span></span>
              )}
            </div>
            {carbonStats.changeDirection === 'reduced' && (
              <span className="inline-flex items-center text-green-700 bg-green-50 px-2.5 py-1 rounded-full font-medium">
                <TrendingDown className="w-3.5 h-3.5 mr-1 text-green-600" />
                Emissions reduced by {Math.abs(carbonStats.pctChange)}%
              </span>
            )}
            {carbonStats.changeDirection === 'increased' && (
              <span className="inline-flex items-center text-red-700 bg-red-50 px-2.5 py-1 rounded-full font-medium">
                <TrendingUp className="w-3.5 h-3.5 mr-1 text-red-600" />
                Emissions increased by {carbonStats.pctChange}%
              </span>
            )}
          </div>
        </div>

        {/* Emission Breakdown by Category */}
        <div className="glass-card p-6 border border-gray-100 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-eco-charcoal flex items-center gap-2 mb-1">
              <Zap className="w-5 h-5 text-yellow-500" />
              Source Breakdown
            </h2>
            <p className="text-xs text-gray-500 mb-4">Carbon distribution by activity.</p>

            {categoryBreakdownData.length > 0 ? (
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryBreakdownData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                    >
                      {categoryBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [`${value} kg CO₂e`, name]}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-52 flex flex-col items-center justify-center text-center p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <Activity className="w-8 h-8 text-gray-300 mb-2" />
                <p className="text-xs text-gray-500 font-medium">No emissions recorded for this period</p>
                <Link to="/dashboard/calculator" className="text-xs text-eco-forest font-bold mt-2 hover:underline">
                  Calculate footprint →
                </Link>
              </div>
            )}
          </div>

          <div className="space-y-2 mt-4 pt-3 border-t border-gray-100">
            {categoryBreakdownData.map(item => (
              <div key={item.name} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="text-gray-600 font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-gray-800">{item.value} kg</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Habit Performance Analytics */}
      <div className="glass-card p-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-6">
          <div>
            <h2 className="text-lg font-bold text-eco-charcoal flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-eco-forest" />
              Habit Performance & Consistency
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Historical daily completion records tracked from user activity.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="text-green-700 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
              Completed: {completedHabitsCount}
            </span>
            <span className="text-yellow-700 bg-yellow-50 px-3 py-1.5 rounded-lg border border-yellow-200">
              Pending: {pendingHabitsCount}
            </span>
            <span className="text-eco-forest bg-eco-mint/20 px-3 py-1.5 rounded-lg">
              Consistency: {habitConsistencyData.averageConsistency}%
            </span>
          </div>
        </div>

        {/* Daily Completion Percentage Timeline */}
        <div className="mb-6">
          <div className="flex justify-between items-center text-xs font-semibold text-gray-700 mb-2">
            <span>Recorded Daily Completion Trend ({timeframe === 'weekly' ? 'Last 7 Days' : 'Last 30 Days'})</span>
            <span className="text-gray-400 font-normal">
              {habitConsistencyData.loggedDaysCount} of {habitConsistencyData.totalDays} days recorded
            </span>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={habitConsistencyData.records} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="habitGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2d6a4f" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#2d6a4f" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="label" stroke="#6b7280" fontSize={11} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#6b7280" fontSize={11} tickLine={false} tickFormatter={v => `${v}%`} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-2.5 rounded-xl shadow-md border border-gray-100 text-xs">
                          <p className="font-bold text-gray-800">{data.date}</p>
                          {data.isLogged ? (
                            <p className="text-eco-forest font-semibold mt-1">
                              Completion: {data.completion}%
                            </p>
                          ) : (
                            <p className="text-gray-400 italic mt-1">No recorded habits for this day</p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="completion" stroke="#2d6a4f" strokeWidth={2} fillOpacity={1} fill="url(#habitGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Historical Data Limitation Notice */}
          <div className="mt-3 p-3 bg-amber-50/70 rounded-xl border border-amber-200/60 flex items-start gap-2.5 text-xs text-amber-900">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Data Limitation Notice:</span> Historical completion percentages reflect only dates where habits were actively logged in your daily records. Days without recorded activity display as 0% rather than synthesized estimates.
            </div>
          </div>
        </div>

        {/* Habit-wise breakdown table */}
        <div className="pt-4 border-t border-gray-100">
          <h3 className="text-sm font-bold text-gray-800 mb-3">Habit-Wise Status & Streaks</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {habits.map(habit => {
              const IconComponent = CATEGORY_ICONS[habit.category] || Leaf;
              return (
                <div 
                  key={habit.id}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                    habit.completed 
                      ? 'bg-eco-mint/10 border-eco-forest/20' 
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-lg ${habit.completed ? 'bg-eco-forest text-white' : 'bg-gray-100 text-gray-500'}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <p className={`text-sm font-medium truncate ${habit.completed ? 'text-eco-forest font-semibold' : 'text-gray-800'}`}>
                        {habit.text}
                      </p>
                      <span className="text-[11px] text-gray-400 capitalize">{habit.category} • +{habit.points} pts</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-2">
                    <div className="flex items-center text-xs font-bold text-orange-500">
                      <Flame className="w-3.5 h-3.5 mr-0.5" />
                      {habit.streak || 0}d
                    </div>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      habit.completed 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {habit.completed ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. Challenge Analytics Section */}
      <div className="glass-card p-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-6">
          <div>
            <h2 className="text-lg font-bold text-eco-charcoal flex items-center gap-2">
              <Award className="w-5 h-5 text-eco-forest" />
              Eco-Challenge Analytics
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Active commitments and completion ratios across community initiatives.
            </p>
          </div>
          <Link to="/dashboard/challenges" className="text-xs font-bold text-eco-forest hover:underline">
            View All Challenges →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-gray-50 rounded-xl text-center border border-gray-100">
            <span className="text-xs font-medium text-gray-500">Total Joined</span>
            <div className="text-2xl font-bold text-eco-charcoal mt-1">{challengeStats.joined}</div>
          </div>
          <div className="p-4 bg-green-50 rounded-xl text-center border border-green-100">
            <span className="text-xs font-medium text-green-700">Completed</span>
            <div className="text-2xl font-bold text-green-800 mt-1">{challengeStats.completed}</div>
          </div>
          <div className="p-4 bg-blue-50 rounded-xl text-center border border-blue-100">
            <span className="text-xs font-medium text-blue-700">In Progress</span>
            <div className="text-2xl font-bold text-blue-800 mt-1">{challengeStats.active}</div>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl text-center border border-purple-100">
            <span className="text-xs font-medium text-purple-700">Completion Rate</span>
            <div className="text-2xl font-bold text-purple-800 mt-1">{challengeStats.completionPct}%</div>
          </div>
        </div>

        {/* Detailed Challenge List */}
        <div className="space-y-3">
          {challenges.map(challenge => (
            <div key={challenge.id} className="p-4 bg-white rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  challenge.status === 'completed'
                    ? 'bg-green-100 text-green-700'
                    : challenge.status === 'active'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {challenge.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-800">{challenge.title}</h4>
                  <p className="text-xs text-gray-500">{challenge.desc} • {challenge.duration}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0 sm:w-64">
                <div className="flex-1">
                  <div className="flex justify-between text-[11px] mb-1 font-medium text-gray-600">
                    <span>Progress</span>
                    <span>{challenge.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        challenge.status === 'completed' ? 'bg-eco-forest' : 'bg-blue-500'
                      }`}
                      style={{ width: `${challenge.progress || 0}%` }}
                    />
                  </div>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize whitespace-nowrap ${
                  challenge.status === 'completed'
                    ? 'bg-green-100 text-green-700'
                    : challenge.status === 'active'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {challenge.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
