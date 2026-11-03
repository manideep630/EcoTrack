import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Calculator from './pages/Calculator';
import Habits from './pages/Habits';
import Challenges from './pages/Challenges';
import Rewards from './pages/Rewards';
import Recommendations from './pages/Recommendations';
import EducationalResources from './pages/EducationalResources';
import Community from './pages/Community';
import About from './pages/About';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Landing />} />
          <Route path="about" element={<About />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="calculator" element={<Calculator />} />
          <Route path="habits" element={<Habits />} />
          <Route path="challenges" element={<Challenges />} />
          <Route path="rewards" element={<Rewards />} />
          <Route path="recommendations" element={<Recommendations />} />
          <Route path="resources" element={<EducationalResources />} />
          <Route path="community" element={<Community />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
