import React, { useMemo } from 'react';
import { Gift, Award, Star, Zap, Leaf, CheckCircle2, Lock, ShieldCheck, Flame } from 'lucide-react';
import { useUser } from '../contexts/UserContext';

const BADGE_ICONS = { Award, Star, Zap, Leaf, ShieldCheck, Flame };

export default function Rewards() {
  const { userData, updateUserData } = useUser();
  const userPoints = userData?.rewardPoints ?? 0;
  const badges = userData?.badges || [];
  const redeemedRewards = userData?.redeemedRewards || [];

  // Dynamic levels based on actual points
  const levels = useMemo(() => {
    const defs = [
      { name: 'Eco Beginner', min: 0, max: 1000 },
      { name: 'Green Explorer', min: 1000, max: 5000 },
      { name: 'Planet Protector', min: 5000, max: 15000 },
      { name: 'Sustainability Champion', min: 15000, max: null },
    ];
    return defs.map((level, i) => {
      const completed = userPoints >= (level.max ?? Infinity);
      const current = userPoints >= level.min && (level.max === null || userPoints < level.max);
      let progress = 0;
      if (current && level.max) {
        progress = Math.round(((userPoints - level.min) / (level.max - level.min)) * 100);
      } else if (completed) {
        progress = 100;
      }
      return { ...level, completed, current, progress };
    });
  }, [userPoints]);

  const currentLevel = levels.find(l => l.current) || levels[0];
  const nextLevel = levels[levels.indexOf(currentLevel) + 1];

  // Badge display with icons
  const badgeIcons = ['Award', 'Star', 'Zap', 'Leaf', 'ShieldCheck', 'Flame'];
  const badgeColors = [
    { color: 'text-yellow-500', bg: 'bg-yellow-100' },
    { color: 'text-purple-500', bg: 'bg-purple-100' },
    { color: 'text-blue-500', bg: 'bg-blue-100' },
    { color: 'text-green-500', bg: 'bg-green-100' },
    { color: 'text-orange-500', bg: 'bg-orange-100' },
    { color: 'text-red-500', bg: 'bg-red-100' },
  ];

  // Available rewards (dynamic availability based on points)
  const rewards = [
    { id: 'premium-1mo', name: 'EcoTrack Premium (1 Month)', cost: 1000, desc: 'Unlock advanced analytics and exclusive challenges.' },
    { id: 'plant-5-trees', name: 'Plant 5 Trees in the Amazon', cost: 2500, desc: 'We will donate to plant 5 trees on your behalf.' },
    { id: 'eco-discount', name: 'Sustainable Goods Discount (15%)', cost: 1500, desc: 'Get a coupon for our partner eco-stores.' },
    { id: 'plant-10-trees', name: 'Plant 10 Trees in the Rainforest', cost: 5000, desc: 'We will donate to plant 10 trees on your behalf.' },
  ];

  const redeemReward = (reward) => {
    if (userPoints < reward.cost) return;
    if (redeemedRewards.some(r => r.id === reward.id && Date.now() - r.redeemedAt < 86400000 * 30)) {
      // Already redeemed within 30 days
      return;
    }
    updateUserData({
      rewardPoints: userPoints - reward.cost,
      redeemedRewards: [
        ...redeemedRewards,
        { ...reward, redeemedAt: Date.now() },
      ],
      recentActivities: [
        { title: 'Reward Redeemed', desc: reward.name, time: 'Just now', points: `-${reward.cost}` },
        ...(userData?.recentActivities || []).slice(0, 19),
      ],
    });
  };

  const unlockedBadgeCount = badges.filter(b => b.unlocked).length;

  return (
    <div className="animate-fade-in max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-eco-charcoal flex items-center">
            <Gift className="w-8 h-8 mr-3 text-eco-forest" />
            Rewards & Achievements
          </h1>
          <p className="text-gray-500 mt-2">Track your progress, earn badges, and redeem your hard-earned points.</p>
        </div>
        <div className="bg-gradient-to-r from-eco-forest to-eco-leaf text-white px-6 py-4 rounded-2xl shadow-lg flex items-center">
          <div className="mr-4">
            <p className="text-sm text-eco-mint uppercase tracking-wider font-bold">Total Points</p>
            <h2 className="text-4xl font-extrabold">{userPoints.toLocaleString()}</h2>
          </div>
          <Star className="w-10 h-10 text-yellow-300 opacity-80" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Eco Level */}
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold text-eco-charcoal mb-6">Your Eco Level</h2>
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 before:to-transparent">
              {levels.map((level, i) => (
                <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-md z-10 ${level.completed || level.current ? 'bg-eco-forest' : 'bg-gray-300'}`}>
                    {level.completed ? <CheckCircle2 className="w-5 h-5 text-white" /> : level.current ? <Star className="w-5 h-5 text-yellow-300" /> : <Lock className="w-4 h-4 text-gray-500" />}
                  </div>
                  <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border ${level.current ? 'bg-eco-mint/10 border-eco-forest shadow-sm' : 'bg-white border-gray-200'} ${level.completed ? 'opacity-80' : ''}`}>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`font-bold ${level.current ? 'text-eco-forest' : 'text-gray-800'}`}>{level.name}</h3>
                      <span className="text-xs font-bold text-gray-500">{level.min}{level.max ? ` - ${level.max}` : '+'} pts</span>
                    </div>
                    {level.current && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1 font-medium text-eco-forest">
                          <span>Progress</span>
                          <span>{level.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-eco-forest h-2 rounded-full transition-all duration-500" style={{ width: `${level.progress}%` }}></div>
                        </div>
                        {nextLevel && (
                          <p className="text-xs text-gray-500 mt-2">Earn {nextLevel.min - userPoints} more points to reach {nextLevel.name}.</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Badges */}
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold text-eco-charcoal mb-2">Earned Badges</h2>
            <p className="text-sm text-gray-500 mb-6">{unlockedBadgeCount} of {badges.length} unlocked</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {badges.map((badge, i) => {
                const IconComp = BADGE_ICONS[badgeIcons[i % badgeIcons.length]] || Award;
                const colors = badgeColors[i % badgeColors.length];
                return (
                  <div key={i} className={`flex flex-col items-center text-center p-4 rounded-xl border transition-all duration-200 ${badge.unlocked ? 'bg-white border-gray-200 hover:shadow-md' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${badge.unlocked ? colors.bg : 'bg-gray-100'} ${badge.unlocked ? colors.color : 'text-gray-400'} relative`}>
                      <IconComp className="w-7 h-7" />
                      {!badge.unlocked && <Lock className="absolute -bottom-1 -right-1 w-5 h-5 text-gray-400 bg-white rounded-full p-0.5 border border-gray-200" />}
                    </div>
                    <h4 className="text-sm font-bold text-gray-800 leading-tight mb-1">{badge.name}</h4>
                    <p className="text-xs text-gray-500">{badge.desc}</p>
                    {badge.unlocked && badge.unlockedAt && (
                      <p className="text-[10px] text-eco-forest mt-1 font-medium">Unlocked {new Date(badge.unlockedAt).toLocaleDateString()}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Redeem Rewards */}
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold text-eco-charcoal mb-6 flex items-center">
              Redeem Rewards
            </h2>
            <div className="space-y-4">
              {rewards.map((reward) => {
                const canAfford = userPoints >= reward.cost;
                const recentlyRedeemed = redeemedRewards.some(r => r.id === reward.id && Date.now() - r.redeemedAt < 86400000 * 30);
                return (
                  <div key={reward.id} className="border border-gray-200 rounded-xl p-4 flex flex-col hover:border-eco-mint transition-colors bg-white">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-gray-800 leading-tight">{reward.name}</h4>
                      <span className="text-sm font-bold text-eco-forest bg-eco-mint/20 px-2 py-0.5 rounded flex items-center">
                        {reward.cost} <Star className="w-3 h-3 ml-1" />
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">{reward.desc}</p>
                    {recentlyRedeemed ? (
                      <button disabled className="mt-auto py-2 rounded-lg text-sm font-medium bg-green-100 text-green-700 cursor-default flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 mr-1" /> Redeemed ✓
                      </button>
                    ) : (
                      <button
                        disabled={!canAfford}
                        onClick={() => redeemReward(reward)}
                        className={`mt-auto py-2 rounded-lg text-sm font-medium transition-colors ${
                          canAfford
                            ? 'bg-eco-forest text-white hover:bg-eco-leaf'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {canAfford ? 'Redeem Now' : `Need ${reward.cost - userPoints} more pts`}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Redemptions */}
          {redeemedRewards.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="font-bold text-gray-800 mb-4">Recent Redemptions</h3>
              <div className="space-y-3">
                {redeemedRewards.slice(-5).reverse().map((r, i) => (
                  <div key={i} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded-lg">
                    <span className="text-gray-700 font-medium truncate mr-2">{r.name}</span>
                    <span className="text-xs text-gray-500 whitespace-nowrap">{new Date(r.redeemedAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
