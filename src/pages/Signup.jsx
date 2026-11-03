import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Mail, Lock, Eye, EyeOff, User, CheckCircle2, ArrowRight } from 'lucide-react';
import { useUser } from '../contexts/UserContext';

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [registered, setRegistered] = useState(false);
  const navigate = useNavigate();
  const { signup } = useUser();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!formData.name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match!");
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    // Register the user in context + localStorage
    signup(formData.name.trim(), formData.email.trim(), formData.password);
    setRegistered(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- Welcome screen after successful registration ---
  if (registered) {
    const firstName = formData.name.split(' ')[0];
    const initials = formData.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-eco-beige via-white to-eco-mint/20 px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-3xl shadow-2xl p-10 animate-slide-up border border-eco-mint/30">
            {/* Success icon */}
            <div className="w-20 h-20 bg-eco-forest rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-3xl font-bold text-white">{initials}</span>
            </div>

            <div className="flex justify-center mb-4">
              <CheckCircle2 className="w-10 h-10 text-eco-forest" />
            </div>

            <h1 className="text-3xl font-extrabold text-eco-charcoal mb-2">
              Welcome, {firstName}! 🌿
            </h1>
            <p className="text-gray-500 mb-2 text-sm">
              <span className="font-medium text-eco-forest">{formData.email}</span>
            </p>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Your EcoTrack account has been created. Start tracking your environmental impact and join a community making a real difference.
            </p>

            <div className="bg-eco-beige rounded-2xl p-5 mb-8 text-left space-y-3">
              <h3 className="font-bold text-eco-charcoal text-sm uppercase tracking-wider mb-3">
                Your fresh start includes:
              </h3>
              {[
                '🌱 Carbon footprint tracking from scratch',
                '🏆 0 reward points — ready to earn',
                '📊 Personalized dashboard just for you',
                '🤝 Access to the EcoTrack community',
              ].map((item, i) => (
                <div key={i} className="flex items-center text-sm text-gray-700">
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate('/dashboard')}
              className="w-full btn-primary flex items-center justify-center gap-2 py-3 text-base"
            >
              Go to My Dashboard <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-xs text-gray-400 mt-4">
              You're joining 45,000+ eco-conscious members.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-eco-beige">
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 bg-eco-charcoal h-full w-full flex flex-col items-center justify-center p-12">
          <div className="grid grid-cols-2 gap-4 opacity-30 mb-8">
            <Leaf className="w-16 h-16 text-eco-mint" />
            <Leaf className="w-16 h-16 text-eco-forest" />
            <Leaf className="w-16 h-16 text-eco-leaf" />
            <Leaf className="w-16 h-16 text-eco-mint" />
          </div>
          <h2 className="text-4xl font-bold text-white text-center max-w-lg leading-tight">Start Tracking. Start Improving.</h2>
          <p className="mt-4 text-xl text-gray-300 text-center">Join EcoTrack and take the first step towards a sustainable lifestyle.</p>
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <Link to="/" className="flex items-center space-x-2">
              <Leaf className="h-10 w-10 text-eco-forest" />
              <span className="text-3xl font-bold text-eco-forest tracking-tight">EcoTrack</span>
            </Link>
            <h2 className="mt-6 text-3xl font-extrabold text-eco-charcoal">Create an account</h2>
            <p className="mt-2 text-sm text-gray-600">
              Already have an account? <Link to="/login" className="font-medium text-eco-forest hover:text-eco-leaf">Sign in</Link>
            </p>
          </div>

          <div className="mt-8">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input id="name" name="name" type="text" required value={formData.name} onChange={handleChange} className="input-field pl-10" placeholder="Jane Doe" />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input id="email" name="email" type="email" required value={formData.email} onChange={handleChange} className="input-field pl-10" placeholder="you@example.com" />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input id="password" name="password" type={showPassword ? 'text' : 'password'} required value={formData.password} onChange={handleChange} className="input-field pl-10 pr-10" placeholder="••••••••" />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" /> : <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />}
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input id="confirmPassword" name="confirmPassword" type={showPassword ? 'text' : 'password'} required value={formData.confirmPassword} onChange={handleChange} className="input-field pl-10" placeholder="••••••••" />
                </div>
              </div>

              <div>
                <button type="submit" className="w-full btn-primary flex justify-center py-3">Sign up</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
