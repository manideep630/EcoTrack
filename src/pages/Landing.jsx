import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Award, BookOpen, Users, Leaf, ArrowRight } from 'lucide-react';

export default function Landing() {
  return (
    <div className="bg-eco-beige min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto animate-slide-up">
            <h1 className="text-5xl md:text-6xl font-extrabold text-eco-charcoal tracking-tight mb-6">
              Track Your Impact.<br/>
              <span className="text-eco-forest">Build a Greener Future.</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
              EcoTrack helps you monitor your carbon footprint, develop sustainable habits, and join a community dedicated to protecting our planet.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/signup" className="btn-primary flex items-center justify-center gap-2">
                Start Your Eco Journey <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/about" className="btn-secondary">
                Explore Features
              </Link>
            </div>
          </div>
        </div>
        
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-eco-mint rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 left-0 -ml-20 w-72 h-72 bg-eco-leaf rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </section>

      {/* Stats Section */}
      <section className="bg-eco-forest text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">12.5k</div>
              <div className="text-eco-mint text-sm uppercase tracking-wider">Tons CO2 Reduced</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">150k+</div>
              <div className="text-eco-mint text-sm uppercase tracking-wider">Sustainable Actions</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">45k</div>
              <div className="text-eco-mint text-sm uppercase tracking-wider">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">89k</div>
              <div className="text-eco-mint text-sm uppercase tracking-wider">Trees Planted</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-eco-charcoal mb-4">Everything You Need to Live Sustainably</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Our platform provides comprehensive tools to help you understand and reduce your environmental impact.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: 'Carbon Tracking', icon: Activity, desc: 'Calculate and visualize your daily carbon emissions.' },
            { title: 'Eco-Challenges', icon: Award, desc: 'Join community challenges and earn rewards for green habits.' },
            { title: 'Learning Hub', icon: BookOpen, desc: 'Access guides and articles on sustainable living.' },
            { title: 'Community', icon: Users, desc: 'Connect with like-minded individuals and share tips.' },
            { title: 'Habit Monitoring', icon: Leaf, desc: 'Build and track daily sustainable habits.' },
            { title: 'Personalized Tips', icon: ArrowRight, desc: 'Get smart recommendations based on your lifestyle.' },
          ].map((feature, i) => (
            <div key={i} className="glass-card p-6 hover:-translate-y-1 transition-transform duration-300">
              <div className="bg-eco-mint/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-eco-forest" />
              </div>
              <h3 className="text-xl font-bold text-eco-charcoal mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-eco-charcoal mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Start your journey to a greener lifestyle in four simple steps.</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-eco-mint/30 -z-10"></div>
            
            {[
              { step: '01', title: 'Create Account', desc: 'Join our growing community of eco-conscious individuals.' },
              { step: '02', title: 'Track Activities', desc: 'Log your daily transport, energy, and consumption habits.' },
              { step: '03', title: 'View Impact', desc: 'See your carbon footprint visualized on your dashboard.' },
              { step: '04', title: 'Improve & Earn', desc: 'Complete challenges, reduce emissions, and earn rewards.' },
            ].map((item, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative text-center">
                <div className="w-10 h-10 bg-eco-forest text-white rounded-full flex items-center justify-center font-bold mx-auto mb-4 -mt-10 border-4 border-white shadow-sm">
                  {i + 1}
                </div>
                <h3 className="text-lg font-bold text-eco-charcoal mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
