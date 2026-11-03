import React, { useState, useEffect, useMemo } from 'react';
import { Check, CheckCircle2, Flame, Calendar, Plus, Trophy, ChevronRight, Pencil, Trash2, X } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { Link } from 'react-router-dom';

export default function Habits() {
  const { userData, updateUserData } = useUser();
  const [viewMode, setViewMode] = useState('today'); // today | week | month
  const [showAddForm, setShowAddForm] = useState(false);
  const [newHabitText, setNewHabitText] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState('waste');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  const todayStr = new Date().toISOString().slice(0, 10);
  const habits = userData?.habits || [];

  // Reset habit completions for a new day (keeps streaks)
  useEffect(() => {
    if (!userData) return;
    const lastDate = userData.habitsLastDate;
    if (lastDate && lastDate !== todayStr) {
      // New day: reset completions, preserve streaks
      const resetHabits = habits.map(h => ({ ...h, completed: false }));
      updateUserData({
        habits: resetHabits,
        habitsLastDate: todayStr,
      });
    } else if (!lastDate) {
      updateUserData({ habitsLastDate: todayStr });
    }
  }, [todayStr]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleHabit = (id) => {
    const habit = habits.find(h => h.id === id);
    if (!habit) return;
    const wasCompleted = habit.completed;

    const updatedHabits = habits.map(h => {
      if (h.id !== id) return h;
      // Streak: only increment on first completion of the day (not on re-toggle)
      // We track last streak date per habit
      const today = todayStr;
      let newStreak = h.streak;
      if (!wasCompleted) {
        // Completing: check if we already got a streak point today
        if (h.lastStreakDate !== today) {
          newStreak = h.streak + 1;
        }
      } else {
        // Un-completing: roll back streak only if it was incremented today
        if (h.lastStreakDate === today) {
          newStreak = Math.max(0, h.streak - 1);
        }
      }
      return {
        ...h,
        completed: !wasCompleted,
        streak: newStreak,
        lastStreakDate: !wasCompleted ? today : h.lastStreakDate,
      };
    });

    const pointsDelta = wasCompleted ? -(habit.points || 10) : (habit.points || 10);
    const completedCount = updatedHabits.filter(h => h.completed).length;
    const progressPercent = updatedHabits.length > 0
      ? Math.round((completedCount / updatedHabits.length) * 100)
      : 0;

    // Update weekly progress for today
    const weeklyProgress = { ...(userData?.weeklyProgress || {}), [todayStr]: progressPercent };

    // Eco-streak: increment only once per day when all habits are done
    let ecoStreak = userData?.ecoStreak || 0;
    const habitsLastStreakDate = userData?.habitsLastStreakDate;
    if (completedCount === updatedHabits.length && !wasCompleted && habitsLastStreakDate !== todayStr) {
      ecoStreak += 1;
    }

    // Sustainability score bump (capped to ±1 per toggle)
    const scoreDelta = wasCompleted ? -1 : 1;
    const newScore = Math.min(100, Math.max(0, (userData?.sustainabilityScore || 0) + scoreDelta));

    // Badge: "Habit Hero" — complete all habits for 3 different days
    let badges = userData?.badges || [];
    if (completedCount === updatedHabits.length && !wasCompleted) {
      const daysWithFullProgress = Object.values(weeklyProgress).filter(p => p === 100).length;
      if (daysWithFullProgress >= 3) {
        badges = badges.map(b =>
          b.name === 'Habit Hero' && !b.unlocked
            ? { ...b, unlocked: true, unlockedAt: new Date().toISOString() }
            : b
        );
      }
    }

    const updates = {
      habits: updatedHabits,
      rewardPoints: Math.max(0, (userData?.rewardPoints || 0) + pointsDelta),
      ecoStreak,
      sustainabilityScore: newScore,
      weeklyProgress,
      habitsLastDate: todayStr,
      badges,
    };

    // Track eco-streak date
    if (completedCount === updatedHabits.length && !wasCompleted && habitsLastStreakDate !== todayStr) {
      updates.habitsLastStreakDate = todayStr;
    }

    // Add activity to recent feed
    if (!wasCompleted) {
      updates.recentActivities = [
        { title: 'Habit Completed', desc: habit.text, time: 'Just now', points: `+${habit.points || 10}` },
        ...(userData?.recentActivities || []).slice(0, 19),
      ];
    }

    updateUserData(updates);
  };

  const addCustomHabit = () => {
    const text = newHabitText.trim();
    if (!text) return;
    if (habits.some(h => h.text.toLowerCase() === text.toLowerCase())) return;
    const newHabit = {
      id: Date.now(),
      text,
      completed: false,
      category: newHabitCategory,
      streak: 0,
      points: 10,
      lastStreakDate: null,
    };
    updateUserData({ habits: [...habits, newHabit] });
    setNewHabitText('');
    setShowAddForm(false);
  };

  const deleteHabit = (id) => {
    updateUserData({ habits: habits.filter(h => h.id !== id) });
  };

  const saveEdit = (id) => {
    const text = editText.trim();
    if (!text) return;
    updateUserData({
      habits: habits.map(h => h.id === id ? { ...h, text } : h),
    });
    setEditingId(null);
    setEditText('');
  };

  const completedCount = habits.filter(h => h.completed).length;
  const progressPercent = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;

  // Weekly calendar data (Mon–Sun)
  const weekDays = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=Sun
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + mondayOffset + i);
      const dateStr = d.toISOString().slice(0, 10);
      const label = ['M', 'T', 'W', 'T', 'F', 'S', 'S'][i];
      const isToday = dateStr === todayStr;
      const progress = userData?.weeklyProgress?.[dateStr] ?? null;
      days.push({ label, dateStr, isToday, progress });
    }
    return days;
  }, [todayStr, userData?.weeklyProgress]);

  // Best streak among habits
  const bestStreak = habits.length > 0 ? Math.max(0, ...habits.map(h => h.streak)) : 0;
  const bestStreakHabit = habits.find(h => h.streak === bestStreak && bestStreak > 0);

  return (
    <div className="animate-fade-in max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-eco-charcoal flex items-center">
            <CheckCircle2 className="w-8 h-8 mr-3 text-eco-forest" />
            Daily Habits
          </h1>
          <p className="text-gray-500 mt-2">Track your sustainable actions and build a greener lifestyle.</p>
        </div>
        <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200 w-fit">
          {['today', 'week', 'month'].map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === mode ? 'bg-eco-mint/20 text-eco-forest' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <div className="flex justify-between items-end mb-4">
              <div>
                <h2 className="text-lg font-bold text-eco-charcoal">Today's Progress</h2>
                <p className="text-sm text-gray-500">{completedCount} of {habits.length} habits completed</p>
              </div>
              <span className="text-3xl font-extrabold text-eco-forest">{progressPercent}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 mb-6 overflow-hidden border border-gray-200">
              <div
                className="bg-eco-leaf h-3 rounded-full transition-all duration-500 ease-out relative"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>

            {viewMode === 'today' && (
              <div className="space-y-3">
                {habits.map(habit => (
                  <div
                    key={habit.id}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                      habit.completed
                        ? 'bg-eco-mint/10 border-eco-mint/50 shadow-sm'
                        : 'bg-white border-gray-200 hover:border-eco-mint hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      <div
                        className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                          habit.completed ? 'bg-eco-forest text-white' : 'border-2 border-gray-300 text-transparent hover:border-eco-forest'
                        }`}
                        onClick={() => toggleHabit(habit.id)}
                      >
                        <Check className="w-4 h-4" />
                      </div>

                      {editingId === habit.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={editText}
                            onChange={e => setEditText(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && saveEdit(habit.id)}
                            className="input-field py-1 px-2 text-sm flex-1"
                            autoFocus
                          />
                          <button onClick={() => saveEdit(habit.id)} className="text-eco-forest hover:text-eco-leaf">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-600">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span
                          className={`font-medium transition-colors cursor-pointer truncate ${habit.completed ? 'text-eco-charcoal line-through opacity-70' : 'text-gray-700'}`}
                          onClick={() => toggleHabit(habit.id)}
                        >
                          {habit.text}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                      <span className="text-xs text-gray-400 font-medium">+{habit.points || 10}pts</span>
                      {habit.streak > 0 && (
                        <div className="flex items-center text-orange-500 bg-orange-50 px-2 py-1 rounded-lg text-xs font-bold border border-orange-100">
                          <Flame className="w-3.5 h-3.5 mr-1" />
                          {habit.streak}
                        </div>
                      )}
                      {editingId !== habit.id && (
                        <>
                          <button
                            onClick={() => { setEditingId(habit.id); setEditText(habit.text); }}
                            className="p-1 text-gray-400 hover:text-eco-forest transition-colors"
                            title="Edit habit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteHabit(habit.id)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                            title="Delete habit"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}

                {habits.length === 0 && (
                  <p className="text-center text-gray-400 py-6 text-sm">No habits yet. Add your first custom habit below!</p>
                )}
              </div>
            )}

            {viewMode === 'week' && (
              <div className="space-y-3">
                <h3 className="font-medium text-gray-700 text-sm">This Week's Completion</h3>
                {weekDays.map(day => (
                  <div key={day.dateStr} className={`flex items-center justify-between p-3 rounded-xl border ${day.isToday ? 'border-eco-forest bg-eco-mint/10' : 'border-gray-100 bg-white'}`}>
                    <span className={`font-medium text-sm ${day.isToday ? 'text-eco-forest' : 'text-gray-600'}`}>
                      {day.label} — {day.dateStr} {day.isToday ? '(Today)' : ''}
                    </span>
                    <span className={`text-sm font-bold ${day.progress !== null ? (day.progress >= 50 ? 'text-eco-forest' : 'text-orange-500') : 'text-gray-400'}`}>
                      {day.progress !== null ? `${day.progress}%` : '—'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {viewMode === 'month' && (
              <div className="space-y-3">
                <h3 className="font-medium text-gray-700 text-sm">Monthly Habit Completion History</h3>
                <div className="grid grid-cols-7 gap-1">
                  {Object.entries(userData?.weeklyProgress || {})
                    .sort(([a], [b]) => a.localeCompare(b))
                    .slice(-30)
                    .map(([date, pct]) => (
                      <div
                        key={date}
                        title={`${date}: ${pct}%`}
                        className={`h-8 rounded flex items-center justify-center text-[10px] font-bold ${
                          pct >= 80 ? 'bg-eco-forest text-white' : pct >= 50 ? 'bg-eco-mint text-eco-forest' : pct > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {pct}
                      </div>
                    ))}
                </div>
                {Object.keys(userData?.weeklyProgress || {}).length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">No data yet. Complete habits daily to build your history.</p>
                )}
              </div>
            )}

            {/* Add custom habit */}
            {showAddForm ? (
              <div className="mt-6 p-4 border-2 border-eco-forest/20 rounded-xl bg-eco-mint/5 space-y-3">
                <input
                  type="text"
                  value={newHabitText}
                  onChange={e => setNewHabitText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addCustomHabit()}
                  placeholder="e.g. Composted food waste"
                  className="input-field py-2 text-sm"
                  autoFocus
                />
                <div className="flex gap-2">
                  <select
                    value={newHabitCategory}
                    onChange={e => setNewHabitCategory(e.target.value)}
                    className="input-field py-2 text-sm flex-1"
                  >
                    <option value="transport">Transport</option>
                    <option value="energy">Energy</option>
                    <option value="water">Water</option>
                    <option value="waste">Waste</option>
                    <option value="food">Food</option>
                  </select>
                  <button onClick={addCustomHabit} className="btn-primary py-2 px-4 text-sm cursor-pointer">Add</button>
                  <button onClick={() => { setShowAddForm(false); setNewHabitText(''); }} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 cursor-pointer">Cancel</button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-6 w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-medium flex items-center justify-center hover:border-eco-forest hover:text-eco-forest transition-colors cursor-pointer"
              >
                <Plus className="w-5 h-5 mr-2" /> Add Custom Habit
              </button>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6 bg-eco-forest text-white">
            <h3 className="font-bold text-lg mb-2 flex items-center">
              <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
              {bestStreak > 0 ? 'Keep it up!' : 'Start your streak!'}
            </h3>
            <p className="text-sm text-eco-mint mb-4">
              {bestStreak > 0
                ? `You are on a ${bestStreak}-day streak for "${bestStreakHabit?.text}". Keep going to earn badges!`
                : 'Complete habits consistently to build streaks and unlock badges.'}
            </p>
            <div className="text-center mb-4">
              <span className="text-4xl font-extrabold text-white">{userData?.ecoStreak || 0}</span>
              <p className="text-xs text-eco-mint mt-1">Global Eco-Streak (days)</p>
            </div>
            <Link to="/dashboard/rewards" className="block bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded-lg text-sm font-medium w-full text-center cursor-pointer">
              View Badges
            </Link>
          </div>

          <div className="glass-card p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-gray-400" />
                This Week
              </h3>
            </div>
            <div className="flex justify-between">
              {weekDays.map((day, i) => (
                <div key={i} className="flex flex-col items-center">
                  <span className="text-xs text-gray-500 mb-2">{day.label}</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    day.progress !== null && day.progress >= 80 ? 'bg-eco-forest text-white' :
                    day.progress !== null && day.progress > 0 ? 'bg-eco-leaf text-white' :
                    day.isToday ? 'bg-eco-leaf text-white border-2 border-eco-mint shadow-[0_0_0_4px_rgba(149,213,178,0.2)]' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {day.progress !== null && day.progress >= 80 ? <Check className="w-4 h-4" /> :
                     day.isToday ? progressPercent :
                     day.progress !== null ? day.progress : '-'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
