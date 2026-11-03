import React, { useState } from 'react';
import { Lightbulb, Zap, Droplets, Trash2, Leaf, Car, Check, ChevronRight, Play, Award } from 'lucide-react';
import { useUser } from '../contexts/UserContext';

const ICON_MAP = { Car, Droplets, Zap, Trash2, Leaf };

export default function Recommendations() {
  const { userData, updateUserData } = useUser();
  const [activeRec, setActiveRec] = useState(null); // id of rec in "started" state

  const recommendations = userData?.recommendations || [];

  const totalSaved = recommendations
    .filter(r => r.completed)
    .reduce((sum, r) => {
      // savings format: "15kg CO2e", "2kg CO2e", etc.
      const num = parseFloat((r.savings || '0').replace(/[^0-9.]/g, ''));
      return sum + (isNaN(num) ? 0 : num);
    }, 0);

  const markComplete = (id) => {
    const rec = recommendations.find(r => r.id === id);
    if (!rec || rec.completed) return;

    const pts = rec.difficulty === 'Easy' ? 20 : 30;

    updateUserData({
      recommendations: recommendations.map(r =>
        r.id === id ? { ...r, completed: true, pointsAwarded: true } : r
      ),
      rewardPoints: (userData?.rewardPoints || 0) + pts,
      sustainabilityScore: Math.min(100, (userData?.sustainabilityScore || 0) + 2),
      recentActivities: [
        { title: 'Recommendation Completed', desc: `${rec.title} (+${pts} pts)`, time: 'Just now', points: `+${pts}` },
        ...(userData?.recentActivities || []).slice(0, 19),
      ],
    });
    setActiveRec(null);
  };

  const startAction = (id) => {
    setActiveRec(id);
  };

  return (
    <div className="animate-fade-in max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-eco-charcoal flex items-center">
            <Lightbulb className="w-8 h-8 mr-3 text-eco-forest" />
            Personalized Recommendations
          </h1>
          <p className="text-gray-500 mt-2">Smart suggestions tailored to your lifestyle to maximize your environmental impact.</p>
        </div>
        {totalSaved > 0 && (
          <div className="bg-eco-mint/20 text-eco-forest px-4 py-2 rounded-xl text-sm font-bold flex items-center">
            <Leaf className="w-4 h-4 mr-2" />
            Total saved: ~{totalSaved}kg CO2e
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map(rec => {
          const IconComp = ICON_MAP[rec.icon] || Lightbulb;
          const isStarted = activeRec === rec.id;
          return (
            <div key={rec.id} className={`glass-card flex flex-col overflow-hidden transition-all duration-300 ${rec.completed ? 'opacity-60 grayscale' : 'hover:-translate-y-1 hover:shadow-xl'}`}>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl ${rec.bg} ${rec.color}`}>
                    <IconComp className="w-6 h-6" />
                  </div>
                  <div className={`text-xs font-bold px-2 py-1 rounded ${rec.difficulty === 'Easy' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                    {rec.difficulty}
                  </div>
                </div>
                <h3 className={`text-lg font-bold mb-2 ${rec.completed ? 'line-through text-gray-500' : 'text-eco-charcoal'}`}>{rec.title}</h3>
                <p className="text-sm text-gray-600 mb-4 flex-1">{rec.benefit}</p>

                <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-100 flex justify-between items-center">
                  <span className="text-xs font-medium text-gray-500">Est. Savings:</span>
                  <span className="text-sm font-bold text-eco-forest">{rec.savings} / week</span>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 mb-6 border border-gray-100 flex justify-between items-center">
                  <span className="text-xs font-medium text-gray-500">Points:</span>
                  <span className="text-sm font-bold text-eco-forest">+{rec.difficulty === 'Easy' ? 20 : 30} pts</span>
                </div>

                {rec.completed ? (
                  <button disabled className="w-full py-2.5 bg-gray-100 text-gray-400 font-medium rounded-xl flex items-center justify-center">
                    <Check className="w-5 h-5 mr-2" /> Completed
                  </button>
                ) : isStarted ? (
                  <div className="space-y-2">
                    <div className="bg-eco-mint/10 border border-eco-mint/30 rounded-xl p-3 text-sm text-eco-forest">
                      <p className="font-medium mb-1">🌿 Action started!</p>
                      <p className="text-xs text-gray-600">{rec.benefit}</p>
                    </div>
                    <button onClick={() => markComplete(rec.id)} className="w-full py-2.5 btn-primary text-sm flex justify-center items-center">
                      <Check className="w-4 h-4 mr-1" /> Mark as Done
                    </button>
                    <button onClick={() => setActiveRec(null)} className="w-full py-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => markComplete(rec.id)} className="flex-1 py-2.5 bg-white border-2 border-eco-forest text-eco-forest font-medium rounded-xl hover:bg-eco-forest hover:text-white transition-colors flex items-center justify-center">
                      <Check className="w-4 h-4 mr-1" /> Mark Done
                    </button>
                    <button onClick={() => startAction(rec.id)} className="flex-1 py-2.5 btn-primary text-sm flex justify-center items-center">
                      <Play className="w-4 h-4 mr-1" /> Start Action
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
