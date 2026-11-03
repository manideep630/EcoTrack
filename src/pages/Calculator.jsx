import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { Car, Zap, Trash2, Recycle, Calculator as CalcIcon, RefreshCw, Save, Lightbulb, CheckCircle2, Leaf, History, Clock } from 'lucide-react';
import { useUser } from '../contexts/UserContext';

export default function Calculator() {
  const { userData, updateUserData, addActivity } = useUser();
  const [formData, setFormData] = useState({
    transportType: 'car',
    transportDistance: 0,
    electricity: 0,
    water: 0,
    waste: 0,
    recycling: 'sometimes'
  });
  
  const [result, setResult] = useState(null);
  const [saved, setSaved] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const history = userData?.calculationHistory || [];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setSaved(false);
  };

  const calculateFootprint = (e) => {
    e.preventDefault();
    setSaved(false);

    const distNum = parseFloat(formData.transportDistance) || 0;
    const elecNum = parseFloat(formData.electricity) || 0;
    const waterNum = parseFloat(formData.water) || 0;
    const wasteNum = parseFloat(formData.waste) || 0;

    const transportVal = formData.transportType === 'car' 
      ? distNum * 0.2 
      : formData.transportType === 'ev'
      ? distNum * 0.05
      : formData.transportType === 'public'
      ? distNum * 0.04
      : 0;  // bike/walk = 0

    const elecVal = elecNum * 0.4;
    const waterVal = waterNum * 0.1;
    const wasteVal = wasteNum * 0.5;
    const recycleMulti = formData.recycling === 'always' ? 0.7 : (formData.recycling === 'sometimes' ? 0.9 : 1.1);
    
    const total = (transportVal + elecVal + waterVal + wasteVal) * recycleMulti;
    
    setResult({
      total: total.toFixed(2),
      data: [
        { name: 'Transport', value: parseFloat(transportVal.toFixed(2)) },
        { name: 'Electricity', value: parseFloat(elecVal.toFixed(2)) },
        { name: 'Water', value: parseFloat(waterVal.toFixed(2)) },
        { name: 'Waste', value: parseFloat(wasteVal.toFixed(2)) }
      ]
    });
  };

  const handleSave = () => {
    if (!result) return;
    const totalNum = parseFloat(result.total);
    const totalBreakdown = result.data.reduce((sum, d) => sum + d.value, 0);
    const todayStr = new Date().toISOString().slice(0, 10);

    // Build updated impact breakdown percentages
    const impactBreakdown = [
      { name: 'Transportation', value: totalBreakdown > 0 ? Math.round((result.data[0].value / totalBreakdown) * 100) : 0, color: 'bg-blue-500' },
      { name: 'Electricity', value: totalBreakdown > 0 ? Math.round((result.data[1].value / totalBreakdown) * 100) : 0, color: 'bg-yellow-500' },
      { name: 'Food', value: totalBreakdown > 0 ? Math.round((result.data[2].value / totalBreakdown) * 100) : 0, color: 'bg-green-500' },
      { name: 'Waste', value: totalBreakdown > 0 ? Math.round((result.data[3].value / totalBreakdown) * 100) : 0, color: 'bg-gray-500' },
    ];

    // Update chart data for today
    const today = new Date().getDay(); // 0=Sun, 1=Mon...
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const newChartData = (userData?.chartData || []).map(d =>
      d.name === dayNames[today] ? { ...d, emissions: totalNum } : d
    );

    const newHistoryItem = {
      id: Date.now(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      total: result.total,
      breakdown: result.data,
      transportType: formData.transportType,
    };

    const newHistory = [newHistoryItem, ...(userData?.calculationHistory || []).slice(0, 19)];

    // Eco-streak: increment only once per calendar day
    const lastCalcDate = userData?.calculationLastDate;
    const newEcoStreak = lastCalcDate === todayStr
      ? (userData?.ecoStreak || 0)
      : (userData?.ecoStreak || 0) + 1;

    // Check if "Calculator Pro" badge should unlock (5 calculations)
    const updatedBadges = (userData?.badges || []).map(b => {
      if (b.name === 'Calculator Pro' && !b.unlocked && newHistory.length >= 5) {
        return { ...b, unlocked: true, unlockedAt: new Date().toLocaleDateString() };
      }
      return b;
    });

    updateUserData({
      totalFootprint: parseFloat(((userData?.totalFootprint || 0) + totalNum).toFixed(2)),
      sustainabilityScore: Math.min(100, (userData?.sustainabilityScore || 0) + 5),
      ecoStreak: newEcoStreak,
      calculationLastDate: todayStr,
      rewardPoints: (userData?.rewardPoints || 0) + 20,
      impactBreakdown,
      chartData: newChartData,
      calculationHistory: newHistory,
      badges: updatedBadges,
      recentActivities: [
        { title: 'Footprint Calculated', desc: `${result.total} kg CO2e`, time: 'Just now', points: '+20' },
        ...(userData?.recentActivities || []).slice(0, 9),
      ]
    });

    setSaved(true);
  };

  const resetCalc = () => {
    setFormData({ transportType: 'car', transportDistance: 0, electricity: 0, water: 0, waste: 0, recycling: 'sometimes' });
    setResult(null);
    setSaved(false);
  };

  const loadFromHistory = (item) => {
    setResult({
      total: item.total,
      data: item.breakdown,
    });
    setSaved(true);
  };

  const COLORS = ['#2d6a4f', '#f59e0b', '#3b82f6', '#6b7280'];

  return (
    <div className="animate-fade-in max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-eco-charcoal flex items-center">
            <CalcIcon className="w-8 h-8 mr-3 text-eco-forest" />
            Carbon Footprint Calculator
          </h1>
          <p className="text-gray-500 mt-2">Estimate your daily environmental impact and find ways to improve.</p>
        </div>
        {history.length > 0 && (
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center text-sm font-medium px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 shadow-sm transition-colors"
          >
            <History className="w-4 h-4 mr-2 text-eco-forest" />
            {showHistory ? 'Hide History' : `Past Calculations (${history.length})`}
          </button>
        )}
      </div>

      {showHistory && history.length > 0 && (
        <div className="glass-card p-6 animate-slide-up border-l-4 border-l-eco-forest">
          <h3 className="text-base font-bold text-eco-charcoal mb-4 flex items-center">
            <Clock className="w-4 h-4 mr-2 text-eco-forest" /> Recent Saved Calculations
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {history.slice(0, 6).map((item) => (
              <div
                key={item.id}
                onClick={() => loadFromHistory(item)}
                className="p-4 bg-gray-50 hover:bg-eco-mint/10 rounded-xl border border-gray-200 hover:border-eco-forest cursor-pointer transition-all"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-500">{item.date}</span>
                  <span className="text-xs px-2 py-0.5 bg-eco-forest text-white rounded-full font-medium">
                    {item.transportType}
                  </span>
                </div>
                <div className="text-2xl font-bold text-eco-forest">{item.total} <span className="text-xs font-normal text-gray-500">kg CO2e</span></div>
                <p className="text-xs text-gray-500 mt-1">Click to view breakdown</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold text-eco-charcoal mb-6">Enter Your Daily Activities</h2>
          <form onSubmit={calculateFootprint} className="space-y-6">
            
            <div className="space-y-4">
              <h3 className="font-medium text-gray-700 flex items-center border-b pb-2">
                <Car className="w-5 h-5 mr-2 text-blue-500"/> Transportation
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Primary Mode</label>
                  <select name="transportType" value={formData.transportType} onChange={handleChange} className="input-field py-2 px-3 text-sm">
                    <option value="car">Car (Gasoline)</option>
                    <option value="ev">Electric Vehicle</option>
                    <option value="public">Public Transit</option>
                    <option value="bike">Bicycle / Walk</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Distance (miles)</label>
                  <input type="number" name="transportDistance" value={formData.transportDistance} onChange={handleChange} className="input-field py-2 px-3 text-sm" min="0" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-gray-700 flex items-center border-b pb-2">
                <Zap className="w-5 h-5 mr-2 text-yellow-500"/> Energy & Utilities
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Electricity (kWh)</label>
                  <input type="number" name="electricity" value={formData.electricity} onChange={handleChange} className="input-field py-2 px-3 text-sm" min="0" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Water (Gallons)</label>
                  <input type="number" name="water" value={formData.water} onChange={handleChange} className="input-field py-2 px-3 text-sm" min="0" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-gray-700 flex items-center border-b pb-2">
                <Trash2 className="w-5 h-5 mr-2 text-gray-500"/> Waste & Recycling
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Waste (lbs)</label>
                  <input type="number" name="waste" value={formData.waste} onChange={handleChange} className="input-field py-2 px-3 text-sm" min="0" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Recycling Habit</label>
                  <select name="recycling" value={formData.recycling} onChange={handleChange} className="input-field py-2 px-3 text-sm">
                    <option value="always">Always Recycle</option>
                    <option value="sometimes">Sometimes Recycle</option>
                    <option value="rarely">Rarely Recycle</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button type="submit" className="flex-1 btn-primary flex justify-center items-center">
                Calculate Impact
              </button>
              <button type="button" onClick={resetCalc} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors" title="Reset">
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>

        <div className="glass-card p-6 flex flex-col">
          <h2 className="text-xl font-bold text-eco-charcoal mb-6">Your Results</h2>
          {result ? (
            <div className="flex-1 flex flex-col animate-slide-up">
              <div className="text-center mb-8">
                <p className="text-sm text-gray-500 uppercase tracking-wide">Estimated Daily Footprint</p>
                <div className="flex items-end justify-center mt-2">
                  <span className="text-5xl font-extrabold text-eco-forest">{result.total}</span>
                  <span className="text-xl text-gray-500 ml-2 mb-1">kg CO2e</span>
                </div>
                <p className="text-sm mt-4 text-green-600 bg-green-50 inline-block px-3 py-1 rounded-full border border-green-200">
                  {parseFloat(result.total) < 5 ? '🌟 Excellent! Below average!' : parseFloat(result.total) < 15 ? '✅ Good — keep improving!' : '⚠️ High — try some changes below.'}
                </p>
              </div>

              <div className="flex-1 min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={result.data.filter(d => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {result.data.filter(d => d.value > 0).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value) => `${value} kg`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <h4 className="font-medium text-gray-800 mb-3">Top Suggestion</h4>
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start">
                  <Lightbulb className="w-5 h-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-sm text-yellow-800">
                    {formData.transportType === 'car' 
                      ? 'Your transportation emissions are high. Consider taking public transit or carpooling to reduce this by up to 40%.'
                      : formData.electricity > 10 
                      ? 'Your electricity usage is significant. Try switching to LED bulbs and unplugging idle devices.'
                      : 'Great job! Consider tracking daily to monitor your progress and earn more eco points.'
                    }
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                {saved ? (
                  <div className="flex items-center text-sm font-medium text-eco-forest">
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Saved to your dashboard!
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleSave}
                    className="flex items-center text-sm font-medium text-white bg-eco-charcoal px-4 py-2 rounded-xl hover:bg-gray-800 transition-colors"
                  >
                    <Save className="w-4 h-4 mr-2" /> Save Result
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <Leaf className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-500">No Data Yet</h3>
              <p className="text-sm text-gray-400 mt-2">Fill out the form and click Calculate to see your estimated footprint breakdown.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
