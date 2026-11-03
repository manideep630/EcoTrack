import React, { useState } from 'react';
import { Award, Clock, Users, ChevronRight, Zap, Droplets, Trash2, TreePine, CheckCircle2, Play, Plus, Minus } from 'lucide-react';
import { useUser } from '../contexts/UserContext';

const ICON_MAP = { Trash2, Zap, Droplets, TreePine };

export default function Challenges() {
  const { userData, updateUserData, addActivity } = useUser();
  const [filter, setFilter] = useState('all'); // all | active | completed

  const challenges = userData?.challenges || [];

  const joinChallenge = (id) => {
    updateUserData({
      challenges: challenges.map(c =>
        c.id === id ? { ...c, status: 'active', progress: 10 } : c
      ),
    });
    addActivity('Challenge Joined', challenges.find(c => c.id === id)?.title, 0);
  };

  const updateProgress = (id, delta) => {
    updateUserData({
      challenges: challenges.map(c => {
        if (c.id !== id) return c;
        const newProgress = Math.min(100, Math.max(0, c.progress + delta));
        return { ...c, progress: newProgress };
      }),
    });
  };

  const completeChallenge = (id) => {
    const challenge = challenges.find(c => c.id === id);
    if (!challenge || challenge.status === 'completed') return;

    // Unlock "First Step" badge immutably (no mutation of shared array)
    const existingBadges = userData?.badges || [];
    const updatedBadges = existingBadges.map(b =>
      b.name === 'First Step' && !b.unlocked
        ? { ...b, unlocked: true, unlockedAt: new Date().toISOString() }
        : b
    );

    // Single atomic update
    updateUserData({
      challenges: challenges.map(c =>
        c.id === id ? { ...c, status: 'completed', progress: 100 } : c
      ),
      rewardPoints: (userData?.rewardPoints || 0) + challenge.points,
      sustainabilityScore: Math.min(100, (userData?.sustainabilityScore || 0) + 5),
      badges: updatedBadges,
      recentActivities: [
        { title: 'Challenge Completed', desc: `${challenge.title} (+${challenge.points} pts)`, time: 'Just now', points: `+${challenge.points}` },
        ...(userData?.recentActivities || []).slice(0, 19),
      ],
    });
  };

  const filtered = filter === 'all' ? challenges
    : filter === 'active' ? challenges.filter(c => c.status === 'active')
    : challenges.filter(c => c.status === 'completed');

  const activeCount = challenges.filter(c => c.status === 'active').length;
  const completedCount = challenges.filter(c => c.status === 'completed').length;

  return (
    <div className="animate-fade-in max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-eco-charcoal flex items-center">
          <Award className="w-8 h-8 mr-3 text-eco-forest" />
          Eco-Challenges
        </h1>
        <p className="text-gray-500 mt-2">Join community challenges to push your limits and earn massive rewards.</p>
      </div>

      <div className="flex gap-4 border-b border-gray-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${filter === 'active' ? 'border-eco-forest text-eco-forest' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Active ({activeCount})
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${filter === 'all' ? 'border-eco-forest text-eco-forest' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Explore All
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${filter === 'completed' ? 'border-eco-forest text-eco-forest' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Completed ({completedCount})
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(challenge => {
          const IconComp = ICON_MAP[challenge.icon] || Award;
          return (
            <div key={challenge.id} className="glass-card flex flex-col overflow-hidden hover:-translate-y-1 transition-all duration-300">
              <div className={`h-2 ${challenge.status === 'completed' ? 'bg-eco-forest' : (challenge.status === 'active' ? 'bg-yellow-400' : 'bg-gray-200')}`}>
                {challenge.status === 'active' && challenge.progress > 0 && challenge.progress < 100 && (
                  <div className="h-full bg-yellow-400" style={{ width: `${challenge.progress}%` }}></div>
                )}
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl ${challenge.bg} ${challenge.color}`}>
                    <IconComp className="w-6 h-6" />
                  </div>
                  <div className="flex items-center text-eco-forest font-bold bg-eco-mint/20 px-3 py-1 rounded-full text-sm">
                    +{challenge.points} pts
                  </div>
                </div>
                <h3 className="text-xl font-bold text-eco-charcoal mb-2">{challenge.title}</h3>
                <p className="text-gray-600 text-sm mb-6 flex-1">{challenge.desc}</p>

                <div className="flex items-center justify-between text-xs text-gray-500 font-medium mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="flex items-center"><Clock className="w-4 h-4 mr-1"/> {challenge.duration}</div>
                  <div className="flex items-center"><Award className="w-4 h-4 mr-1"/> {challenge.difficulty}</div>
                  <div className="flex items-center"><Users className="w-4 h-4 mr-1"/> {challenge.participants}</div>
                </div>

                {challenge.status === 'active' && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs font-medium text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{challenge.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div className="bg-eco-forest h-2 rounded-full transition-all duration-300" style={{ width: `${challenge.progress}%` }}></div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateProgress(challenge.id, 10)}
                        className="flex-1 py-2 bg-eco-mint/20 text-eco-forest font-medium rounded-lg hover:bg-eco-mint/40 transition-colors text-sm flex items-center justify-center"
                      >
                        <Plus className="w-4 h-4 mr-1" /> Progress
                      </button>
                      {challenge.progress >= 100 ? (
                        <button
                          onClick={() => completeChallenge(challenge.id)}
                          className="flex-1 py-2 btn-primary text-sm flex justify-center items-center rounded-lg"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" /> Complete
                        </button>
                      ) : (
                        <button
                          onClick={() => updateProgress(challenge.id, -10)}
                          className="py-2 px-3 bg-gray-100 text-gray-500 font-medium rounded-lg hover:bg-gray-200 transition-colors text-sm"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {challenge.status === 'completed' && (
                  <button className="w-full py-2.5 bg-gray-100 text-gray-500 font-medium rounded-xl flex items-center justify-center cursor-default">
                    <Award className="w-5 h-5 mr-2" /> Completed ✓
                  </button>
                )}

                {challenge.status === 'available' && (
                  <button
                    onClick={() => joinChallenge(challenge.id)}
                    className="w-full py-2.5 btn-primary flex justify-center items-center"
                  >
                    <Play className="w-4 h-4 mr-1" /> Join Challenge
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
          <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No challenges here</h3>
          <p className="text-gray-500">{filter === 'active' ? 'Join a challenge to get started!' : 'Try exploring all challenges.'}</p>
        </div>
      )}

      {/* Leaderboard Stub */}
      <div className="mt-12">
        <h2 className="text-xl font-bold text-eco-charcoal mb-6">Top Challengers This Week</h2>
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4">Rank</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Points Earned</th>
                <th className="px-6 py-4 text-right">Challenges Completed</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-bold text-yellow-500">#1</td>
                <td className="px-6 py-4 font-medium text-gray-900 flex items-center">
                  <img src="https://ui-avatars.com/api/?name=Sarah+M&background=random" className="w-8 h-8 rounded-full mr-3" alt="avatar" />
                  Sarah M.
                </td>
                <td className="px-6 py-4 text-eco-forest font-bold">4,250</td>
                <td className="px-6 py-4 text-right">5</td>
              </tr>
              <tr className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-bold text-gray-400">#2</td>
                <td className="px-6 py-4 font-medium text-gray-900 flex items-center">
                  <img src="https://ui-avatars.com/api/?name=David+K&background=random" className="w-8 h-8 rounded-full mr-3" alt="avatar" />
                  David K.
                </td>
                <td className="px-6 py-4 text-eco-forest font-bold">3,800</td>
                <td className="px-6 py-4 text-right">4</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
