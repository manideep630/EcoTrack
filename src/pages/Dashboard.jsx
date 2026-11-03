import React from 'react';
import { Link } from 'react-router-dom';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { ArrowDown, ArrowUp, Activity, Leaf, Zap, Trash2, Flame, Award } from 'lucide-react';
import { useUser } from '../contexts/UserContext';

export default function Dashboard() {
  const { user, userData } = useUser();

  const displayName = user?.name ? user.name.split(' ')[0] : 'there';

  // Get hour for greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const chartData = userData?.chartData || [];
  const totalFootprint = userData?.totalFootprint ?? 0;
  const sustainabilityScore = userData?.sustainabilityScore ?? 0;
  const ecoStreak = userData?.ecoStreak ?? 0;
  const rewardPoints = userData?.rewardPoints ?? 0;
  const impactBreakdown = userData?.impactBreakdown || [];
  const recentActivities = userData?.recentActivities || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-eco-charcoal">{greeting}, {displayName}!</h1>
          <p className="text-gray-500">Let's make today greener.</p>
        </div>
        <Link to="/dashboard/calculator" className="btn-primary py-2 px-4 text-sm">
          Log Activity
        </Link>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Carbon Footprint</p>
              <h3 className="text-3xl font-bold text-eco-charcoal">
                {totalFootprint} <span className="text-lg font-normal text-gray-500">kg CO2e</span>
              </h3>
            </div>
            <div className="p-2 bg-red-100 rounded-lg text-red-600">
              <Activity className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-gray-400">
              {totalFootprint === 0 ? 'Start tracking to see your footprint!' : 'Total tracked this period'}
            </span>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Sustainability Score</p>
              <h3 className="text-3xl font-bold text-eco-charcoal">
                {sustainabilityScore}<span className="text-lg font-normal text-gray-500">/100</span>
              </h3>
            </div>
            <div className="p-2 bg-green-100 rounded-lg text-eco-forest">
              <Leaf className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center text-sm">
            {sustainabilityScore === 0
              ? <span className="text-gray-400">Complete activities to earn score</span>
              : (
                <>
                  <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-500 font-medium">Growing</span>
                  <span className="text-gray-400 ml-2">as you track habits</span>
                </>
              )
            }
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Current Eco-Streak</p>
              <h3 className="text-3xl font-bold text-eco-charcoal">
                {ecoStreak} <span className="text-lg font-normal text-gray-500">days</span>
              </h3>
            </div>
            <div className="p-2 bg-orange-100 rounded-lg text-orange-500">
              <Flame className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            {ecoStreak === 0 ? 'Log a habit today to start your streak!' : 'Keep it up to earn a new badge!'}
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Reward Points</p>
              <h3 className="text-3xl font-bold text-eco-charcoal">{rewardPoints.toLocaleString()}</h3>
            </div>
            <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600">
              <Award className="w-6 h-6" />
            </div>
          </div>
          <Link to="/dashboard/rewards" className="flex items-center text-sm text-eco-forest font-medium hover:underline cursor-pointer">
            {rewardPoints === 0 ? 'Earn your first points →' : 'Redeem rewards →'}
          </Link>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-eco-charcoal">Weekly Environmental Impact</h3>
            <select className="text-sm border border-gray-300 rounded-md bg-gray-50 focus:ring-eco-mint focus:border-eco-mint px-2 py-1">
              <option>This Week</option>
              <option>Last Week</option>
              <option>This Month</option>
            </select>
          </div>
          <div className="h-72">
            {chartData.every(d => d.emissions === 0) ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
                <Activity className="w-12 h-12 mb-3 opacity-30" />
                <p className="font-medium">No data yet</p>
                <p className="text-sm mt-1">
                  <Link to="/dashboard/calculator" className="text-eco-forest hover:underline">Log your first activity</Link> to see your impact chart.
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    cursor={{ stroke: '#95d5b2', strokeWidth: 2, strokeDasharray: '3 3' }}
                  />
                  <Line type="monotone" dataKey="emissions" stroke="#2d6a4f" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6, fill: '#40916c', stroke: '#fff', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-eco-charcoal mb-6">Impact Breakdown</h3>
          {impactBreakdown.every(d => d.value === 0) ? (
            <div className="flex flex-col items-center justify-center text-center text-gray-400 py-8">
              <Leaf className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">No impact data yet.<br />
                <Link to="/dashboard/calculator" className="text-eco-forest hover:underline">Calculate your footprint</Link>.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {[
                { name: 'Transportation', icon: Activity, color: 'bg-blue-500', value: impactBreakdown[0]?.value ?? 0 },
                { name: 'Electricity', icon: Zap, color: 'bg-yellow-500', value: impactBreakdown[1]?.value ?? 0 },
                { name: 'Food', icon: Leaf, color: 'bg-green-500', value: impactBreakdown[2]?.value ?? 0 },
                { name: 'Waste', icon: Trash2, color: 'bg-gray-500', value: impactBreakdown[3]?.value ?? 0 },
              ].map((item) => (
                <div key={item.name}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center text-sm font-medium text-gray-700">
                      <item.icon className="w-4 h-4 mr-2 text-gray-500" />
                      {item.name}
                    </div>
                    <span className="text-sm text-gray-500">{item.value}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className={`${item.color} h-2 rounded-full transition-all duration-700`} style={{ width: `${item.value}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activities & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-eco-charcoal">Recent Activities</h3>
            <Link to="/dashboard/habits" className="text-sm text-eco-forest hover:underline">View All</Link>
          </div>
          {recentActivities.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Activity className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium text-sm">No activities logged yet.</p>
              <p className="text-xs mt-1">
                <Link to="/dashboard/habits" className="text-eco-forest hover:underline">Start tracking your habits!</Link>
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivities.slice(0, 3).map((activity, i) => (
                <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-full bg-green-100 text-green-500`}>
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-800">{activity.title}</h4>
                      <p className="text-xs text-gray-500">{activity.desc} • {activity.time}</p>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-eco-leaf">{activity.points} pts</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card p-6 bg-gradient-to-br from-eco-forest to-eco-leaf text-white border-none">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-lg font-bold">Recommended Action</h3>
            <span className="px-2 py-1 bg-white/20 rounded text-xs font-medium backdrop-blur-sm">High Impact</span>
          </div>
          
          <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm mb-6 border border-white/20">
            <h4 className="text-xl font-bold mb-2">Switch to LED Bulbs</h4>
            <p className="text-eco-mint text-sm mb-4">Replace 5 incandescent bulbs with LEDs to save up to 200kg of CO2 per year.</p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center">
                <Zap className="w-4 h-4 mr-1 text-yellow-300" /> Save Energy
              </div>
              <div className="flex items-center">
                <Award className="w-4 h-4 mr-1 text-yellow-300" /> +150 pts
              </div>
            </div>
          </div>
          
          <Link
            to="/dashboard/challenges"
            className="block w-full bg-white text-eco-forest font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-center"
          >
            Accept Challenge
          </Link>
        </div>
      </div>
    </div>
  );
}
