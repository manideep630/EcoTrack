import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const UserContext = createContext();

// --------------- helpers ---------------
function safeJSON(str, fallback) {
  try { return str ? JSON.parse(str) : fallback; }
  catch { return fallback; }
}

function userKey(email) {
  return `ecoTrack_data_${(email || '').toLowerCase().trim()}`;
}

// Deep merge arrays by replacing (not spreading), but merges object fields
function mergeData(defaults, stored) {
  if (!stored || typeof stored !== 'object') return defaults;
  const result = { ...defaults };
  for (const key of Object.keys(stored)) {
    const sv = stored[key];
    const dv = defaults[key];
    if (sv === null || sv === undefined) {
      // keep default
    } else if (Array.isArray(sv)) {
      // Always use stored arrays (habits, challenges etc.) — they are the source of truth
      result[key] = sv;
    } else if (typeof sv === 'object' && !Array.isArray(dv)) {
      // Deep merge objects (e.g. settings)
      result[key] = { ...(dv || {}), ...sv };
    } else {
      result[key] = sv;
    }
  }
  // Ensure badges array from defaults is padded if stored has fewer (new badges added to app)
  if (defaults.badges && result.badges && result.badges.length < defaults.badges.length) {
    const existing = new Set(result.badges.map(b => b.name));
    for (const b of defaults.badges) {
      if (!existing.has(b.name)) {
        result.badges = [...result.badges, { ...b }];
      }
    }
  }
  return result;
}

// --------------- defaults ---------------
const defaultHabits = [
  { id: 1, text: 'Used public transportation', completed: false, category: 'transport', streak: 0, points: 10 },
  { id: 2, text: 'Walked or cycled', completed: false, category: 'transport', streak: 0, points: 10 },
  { id: 3, text: 'Turned off unused lights', completed: false, category: 'energy', streak: 0, points: 5 },
  { id: 4, text: 'Reduced shower time to 5 mins', completed: false, category: 'water', streak: 0, points: 5 },
  { id: 5, text: 'Avoided single-use plastic', completed: false, category: 'waste', streak: 0, points: 10 },
  { id: 6, text: 'Recycled waste correctly', completed: false, category: 'waste', streak: 0, points: 5 },
  { id: 7, text: 'Brought reusable bags', completed: false, category: 'waste', streak: 0, points: 5 },
  { id: 8, text: 'Ate a plant-based meal', completed: false, category: 'food', streak: 0, points: 10 },
];

const defaultChallenges = [
  { id: 1, title: '7-Day Plastic-Free', desc: 'Avoid all single-use plastics for a week.', duration: '7 Days', difficulty: 'Hard', points: 500, participants: '12.5k', icon: 'Trash2', color: 'text-blue-500', bg: 'bg-blue-100', status: 'available', progress: 0 },
  { id: 2, title: 'Walk or Cycle for a Week', desc: 'Replace car trips under 3 miles with active transport.', duration: '7 Days', difficulty: 'Medium', points: 300, participants: '8.2k', icon: 'Zap', color: 'text-yellow-500', bg: 'bg-yellow-100', status: 'available', progress: 0 },
  { id: 3, title: 'Save Water Challenge', desc: 'Keep all showers under 5 minutes.', duration: '14 Days', difficulty: 'Easy', points: 250, participants: '24.1k', icon: 'Droplets', color: 'text-cyan-500', bg: 'bg-cyan-100', status: 'available', progress: 0 },
  { id: 4, title: 'Plant a Tree', desc: 'Plant a tree in your local community or donate to a reforestation project.', duration: '1 Day', difficulty: 'Easy', points: 1000, participants: '5.6k', icon: 'TreePine', color: 'text-eco-forest', bg: 'bg-eco-mint/20', status: 'available', progress: 0 },
];

const defaultRecommendations = [
  { id: 1, title: 'Use public transportation twice this week', benefit: 'Reduces carbon emissions significantly compared to driving.', savings: '15kg CO2e', difficulty: 'Medium', category: 'Transport', icon: 'Car', color: 'text-blue-500', bg: 'bg-blue-100', completed: false, pointsAwarded: false },
  { id: 2, title: 'Reduce shower time by five minutes', benefit: 'Saves water and the energy used to heat it.', savings: '2kg CO2e', difficulty: 'Easy', category: 'Water', icon: 'Droplets', color: 'text-cyan-500', bg: 'bg-cyan-100', completed: false, pointsAwarded: false },
  { id: 3, title: 'Switch off unused appliances', benefit: 'Prevents phantom energy drain.', savings: '1kg CO2e', difficulty: 'Easy', category: 'Energy', icon: 'Zap', color: 'text-yellow-500', bg: 'bg-yellow-100', completed: false, pointsAwarded: false },
  { id: 4, title: 'Replace plastic bottles with a reusable bottle', benefit: 'Reduces plastic waste and manufacturing footprint.', savings: '5kg CO2e', difficulty: 'Easy', category: 'Waste', icon: 'Trash2', color: 'text-gray-500', bg: 'bg-gray-100', completed: false, pointsAwarded: false },
  { id: 5, title: 'Recycle paper and plastic waste', benefit: 'Diverts waste from landfills.', savings: '3kg CO2e', difficulty: 'Medium', category: 'Waste', icon: 'Trash2', color: 'text-gray-500', bg: 'bg-gray-100', completed: false, pointsAwarded: false },
  { id: 6, title: 'Try a plant-based meal', benefit: 'Meat production is highly resource-intensive.', savings: '8kg CO2e', difficulty: 'Medium', category: 'Food', icon: 'Leaf', color: 'text-green-500', bg: 'bg-green-100', completed: false, pointsAwarded: false },
  { id: 7, title: 'Use energy-efficient lighting', benefit: 'LEDs use 75% less energy than incandescent lighting.', savings: '10kg CO2e', difficulty: 'Easy', category: 'Energy', icon: 'Zap', color: 'text-yellow-500', bg: 'bg-yellow-100', completed: false, pointsAwarded: false },
];

const defaultCommunityPosts = [
  {
    id: 'seed-1', user: 'Sarah M.',
    avatar: 'https://ui-avatars.com/api/?name=Sarah+M&background=random',
    time: '2 hours ago', timestamp: Date.now() - 7200000,
    content: 'Just completed my first Zero Waste week! 🌍 It was tough, especially grocery shopping, but totally worth it. Found an amazing local bulk store.',
    image: 'https://images.unsplash.com/photo-1610419266100-3fb2e3a1bb1c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    likes: 124, likedBy: [], comments: [],
  },
  {
    id: 'seed-2', user: 'David K.',
    avatar: 'https://ui-avatars.com/api/?name=David+K&background=random',
    time: '5 hours ago', timestamp: Date.now() - 18000000,
    content: 'Installed solar panels today! So excited to see how much energy we can generate. Anyone else made the switch recently? Tips welcome! ☀️⚡',
    image: null,
    likes: 89, likedBy: [], comments: [],
  },
  {
    id: 'seed-3', user: 'Elena R.',
    avatar: 'https://ui-avatars.com/api/?name=Elena+R&background=random',
    time: 'Yesterday', timestamp: Date.now() - 86400000,
    content: 'Check out this upcycled planter I made from old tin cans! A little paint goes a long way.',
    image: 'https://images.unsplash.com/photo-1416879598555-22b64b183656?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    likes: 210, likedBy: [], comments: [],
  },
];

const defaultSettings = {
  notifications: {
    dailyReminders: true,
    weeklyReports: true,
    challengeUpdates: true,
    communityMentions: false,
    newResources: false,
  },
  privacy: {
    visibility: 'public',
  },
  appearance: {
    compactMode: false,
    vibrantAccent: true,
  },
};

function buildDefault() {
  return {
    totalFootprint: 0,
    sustainabilityScore: 0,
    ecoStreak: 0,
    rewardPoints: 0,
    recentActivities: [],
    chartData: [
      { name: 'Mon', emissions: 0 },
      { name: 'Tue', emissions: 0 },
      { name: 'Wed', emissions: 0 },
      { name: 'Thu', emissions: 0 },
      { name: 'Fri', emissions: 0 },
      { name: 'Sat', emissions: 0 },
      { name: 'Sun', emissions: 0 },
    ],
    impactBreakdown: [
      { name: 'Transportation', value: 0, color: 'bg-blue-500' },
      { name: 'Electricity', value: 0, color: 'bg-yellow-500' },
      { name: 'Food', value: 0, color: 'bg-green-500' },
      { name: 'Waste', value: 0, color: 'bg-gray-500' },
    ],
    habits: defaultHabits.map(h => ({ ...h })),
    habitsLastDate: null,
    habitsLastStreakDate: null, // tracks streak per-day (not per-toggle)
    weeklyProgress: {},
    challenges: defaultChallenges.map(c => ({ ...c })),
    recommendations: defaultRecommendations.map(r => ({ ...r })),
    communityPosts: defaultCommunityPosts.map(p => ({ ...p, comments: [], likedBy: [] })),
    calculationHistory: [],
    savedResources: [],
    settings: { ...defaultSettings },
    badges: [
      { name: 'First Step', desc: 'Completed your first eco-challenge', unlocked: false, unlockedAt: null },
      { name: 'Zero Waste Week', desc: 'Maintained a zero-waste streak for 7 days', unlocked: false, unlockedAt: null },
      { name: 'Energy Saver', desc: 'Reduced electricity usage by 20%', unlocked: false, unlockedAt: null },
      { name: 'Tree Hugger', desc: 'Planted 5 trees through challenges', unlocked: false, unlockedAt: null },
      { name: 'Habit Hero', desc: 'Complete all daily habits for 3 days', unlocked: false, unlockedAt: null },
      { name: 'Calculator Pro', desc: 'Saved 5 carbon calculations', unlocked: false, unlockedAt: null },
    ],
    redeemedRewards: [],
    calculationLastDate: null, // ISO date of last calculation save (for streak logic)
  };
}

// --------------- provider ---------------
export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(buildDefault());
  const [loaded, setLoaded] = useState(false);
  // Track the "canonical email" key for saving (in case email is changed in profile)
  const savedEmailRef = useRef(null);

  // persist helper — always saves to the key used at login, regardless of profile email changes
  const persist = useCallback((u, d, canonicalEmail) => {
    const key = canonicalEmail || u?.email;
    if (key) {
      localStorage.setItem('ecoTrack_currentUser', key);
      localStorage.setItem(userKey(key), JSON.stringify({ user: u, data: d }));
    }
  }, []);

  // Load on mount
  useEffect(() => {
    const currentEmail = localStorage.getItem('ecoTrack_currentUser');
    if (currentEmail) {
      const stored = safeJSON(localStorage.getItem(userKey(currentEmail)), null);
      if (stored?.user) {
        savedEmailRef.current = currentEmail;
        setUser(stored.user);
        setUserData(mergeData(buildDefault(), stored.data));
      }
    }
    setLoaded(true);
  }, []);

  // Auto-persist on every change (after initial load)
  useEffect(() => {
    if (loaded && user) {
      persist(user, userData, savedEmailRef.current || user.email);
    }
  }, [user, userData, loaded, persist]);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const signup = (name, email, password) => {
    const newUser = {
      name, email,
      initials: getInitials(name),
      location: '',
      sustainabilityGoal: 'Reduce Carbon Footprint',
      joinDate: new Date().toISOString(),
    };
    const data = buildDefault();
    savedEmailRef.current = email.toLowerCase().trim();
    setUser(newUser);
    setUserData(data);
    persist(newUser, data, savedEmailRef.current);
  };

  const login = (email) => {
    const normalizedEmail = email.toLowerCase().trim();
    const stored = safeJSON(localStorage.getItem(userKey(normalizedEmail)), null);
    savedEmailRef.current = normalizedEmail;
    if (stored?.user) {
      setUser(stored.user);
      setUserData(mergeData(buildDefault(), stored.data));
    } else {
      const name = email.split('@')[0];
      const newUser = {
        name, email,
        initials: getInitials(name),
        location: '',
        sustainabilityGoal: 'Reduce Carbon Footprint',
        joinDate: new Date().toISOString(),
      };
      const data = buildDefault();
      setUser(newUser);
      setUserData(data);
      persist(newUser, data, savedEmailRef.current);
    }
    localStorage.setItem('ecoTrack_currentUser', normalizedEmail);
  };

  const logout = () => {
    // Don't delete user data — just clear session pointer
    localStorage.removeItem('ecoTrack_currentUser');
    savedEmailRef.current = null;
    setUser(null);
    setUserData(buildDefault());
  };

  const updateProfile = (updates) => {
    // Note: email change does NOT re-key localStorage — user data stays under original login email
    const updatedUser = {
      ...user,
      ...updates,
      initials: getInitials(updates.name || user.name),
    };
    setUser(updatedUser);
    return updatedUser;
  };

  const updateUserData = useCallback((updates) => {
    setUserData(prev => ({ ...prev, ...updates }));
  }, []);

  // Convenience: add a recent activity (with optional points added to rewardPoints)
  const addActivity = useCallback((title, desc, points) => {
    setUserData(prev => ({
      ...prev,
      rewardPoints: prev.rewardPoints + (points || 0),
      recentActivities: [
        { title, desc: desc || '', time: 'Just now', points: points ? `+${points}` : '0' },
        ...prev.recentActivities.slice(0, 19),
      ],
    }));
  }, []);

  return (
    <UserContext.Provider value={{
      user, userData, loaded,
      signup, login, logout,
      updateProfile, updateUserData, addActivity,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
