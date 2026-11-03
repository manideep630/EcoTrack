# EcoTrack – Core Implementation Code Snippets

This document contains key code snippets extracted directly from the **EcoTrack** sustainability platform codebase for project report and college viva documentation.

---

### 1. User Authentication (Registration & Login Logic)

**File:** `src/contexts/UserContext.jsx`

```javascript
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
```

**Explanation:**  
Manages user authentication by normalizing the input email, checking for an existing profile in persistent storage, and initializing fresh user state and default metrics when a new account is registered. It preserves per-user isolation by linking data strictly to the authenticated email key.

---

### 2. React Context API (Global State Management)

**File:** `src/contexts/UserContext.jsx`

```javascript
const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(buildDefault());
  const [loaded, setLoaded] = useState(false);

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
```

**Explanation:**  
Creates the central `UserContext` and provides global user state, tracking metrics, and manipulation methods to all child components. The custom `useUser` hook exposes state and action dispatches without prop-drilling across the dashboard layout.

---

### 3. LocalStorage Data Persistence

**File:** `src/contexts/UserContext.jsx`

```javascript
const persist = useCallback((u, d, canonicalEmail) => {
  const key = canonicalEmail || u?.email;
  if (key) {
    localStorage.setItem('ecoTrack_currentUser', key);
    localStorage.setItem(userKey(key), JSON.stringify({ user: u, data: d }));
  }
}, []);

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
```

**Explanation:**  
Implements client-side offline persistence using browser `localStorage`. It writes user profile and tracking state whenever changes occur and automatically rehydrates and deep-merges saved data on initial application mount.

---

### 4. Carbon Footprint Calculation

**File:** `src/pages/Calculator.jsx`

```javascript
const transportVal = formData.transportType === 'car' 
  ? distNum * 0.2 
  : formData.transportType === 'ev'
  ? distNum * 0.05
  : formData.transportType === 'public'
  ? distNum * 0.04
  : 0; // bike/walk = 0

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
```

**Explanation:**  
Calculates daily carbon emissions ($kg\text{ CO}_2\text{e}$) across transport mode, electricity usage, water consumption, and waste generation. A recycling habit factor scales the gross footprint before partitioning values for interactive chart rendering.

---

### 5. Daily Habit Tracking

**File:** `src/pages/Habits.jsx`

```javascript
const updatedHabits = habits.map(h => {
  if (h.id !== id) return h;
  const today = todayStr;
  let newStreak = h.streak;
  if (!wasCompleted) {
    if (h.lastStreakDate !== today) {
      newStreak = h.streak + 1;
    }
  } else {
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
```

**Explanation:**  
Toggles individual sustainability habits between completed and uncompleted states. It validates completion against the current calendar date to ensure habit streak counters increment accurately once per day rather than on multiple toggle clicks.

---

### 6. Eco-Streak Management

**File:** `src/pages/Habits.jsx`

```javascript
const completedCount = updatedHabits.filter(h => h.completed).length;
const progressPercent = updatedHabits.length > 0
  ? Math.round((completedCount / updatedHabits.length) * 100)
  : 0;

// Eco-streak: increment only once per day when all habits are done
let ecoStreak = userData?.ecoStreak || 0;
const habitsLastStreakDate = userData?.habitsLastStreakDate;
if (completedCount === updatedHabits.length && !wasCompleted && habitsLastStreakDate !== todayStr) {
  ecoStreak += 1;
}

updateUserData({
  habits: updatedHabits,
  ecoStreak,
  habitsLastStreakDate: completedCount === updatedHabits.length && !wasCompleted ? todayStr : habitsLastStreakDate,
});
```

**Explanation:**  
Computes user-wide eco-streak continuity by checking whether all daily sustainability habits are satisfied. It guards against false multi-increments by recording the last streak award date and rewarding consecutive daily engagement.

---

### 7. Eco-Challenge Progress & Completion

**File:** `src/pages/Challenges.jsx`

```javascript
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

  updateUserData({
    challenges: challenges.map(c =>
      c.id === id ? { ...c, status: 'completed', progress: 100 } : c
    ),
    rewardPoints: (userData?.rewardPoints || 0) + challenge.points,
    sustainabilityScore: Math.min(100, (userData?.sustainabilityScore || 0) + 5),
  });
};
```

**Explanation:**  
Updates user participation in sustainability challenges by tracking incremental percentage progress. When a challenge reaches completion, points are credited to the user's reward balance and their sustainability score is boosted.

---

### 8. Rewards and Points Calculation

**File:** `src/pages/Rewards.jsx`

```javascript
const redeemReward = (reward) => {
  if (userPoints < reward.cost) return;
  if (redeemedRewards.some(r => r.id === reward.id && Date.now() - r.redeemedAt < 86400000 * 30)) {
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
```

**Explanation:**  
Handles point redemption for real-world environmental actions (e.g., planting trees or partner discounts). It verifies sufficient point balances, deducts the point cost, logs the transaction in activity history, and prevents duplicate redemptions.

---

### 9. Learning Resource Search and Bookmark

**File:** `src/pages/EducationalResources.jsx`

```javascript
const filteredResources = useMemo(() => {
  let result = ALL_RESOURCES;
  if (activeCategory !== 'All') {
    result = result.filter(r => r.category === activeCategory);
  }
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    result = result.filter(r =>
      r.title.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q) ||
      r.type.toLowerCase().includes(q)
    );
  }
  return result;
}, [activeCategory, searchQuery]);

const toggleSave = (id) => {
  const isSaved = savedResources.includes(id);
  updateUserData({
    savedResources: isSaved
      ? savedResources.filter(sid => sid !== id)
      : [...savedResources, id],
  });
};
```

**Explanation:**  
Performs real-time resource filtering based on category selectors and multi-attribute search queries. The `toggleSave` function persists bookmarked articles and guides to the user's personal learning list.

---

### 10. Community Likes and Comments

**File:** `src/pages/Community.jsx`

```javascript
const handleLike = (postId) => {
  const updated = posts.map(post => {
    if (post.id === postId) {
      const likedBy = post.likedBy || [];
      const isLiked = likedBy.includes(currentUserEmail);
      const newLikedBy = isLiked
        ? likedBy.filter(e => e !== currentUserEmail)
        : [...likedBy, currentUserEmail];
      const newLikes = isLiked ? Math.max(0, post.likes - 1) : post.likes + 1;
      return { ...post, likes: newLikes, likedBy: newLikedBy };
    }
    return post;
  });

  updateUserData({ communityPosts: updated });
};
```

**Explanation:**  
Implements interactive community post reactions. It tracks unique user emails in a `likedBy` array to guarantee each user can toggle like/unlike accurately without inflating counts, and updates the shared feed state.
