import React, { useState } from 'react';
import { Leaf, Globe, Users, Heart, ArrowRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function About() {
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) return;
    setSubmitted(true);
    setContactForm({ name: '', email: '', message: '' });
  };
  const team = [
    { name: 'Sarah Chen', role: 'Founder & CEO', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { name: 'Marcus Johnson', role: 'Head of Sustainability', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { name: 'Elena Rodriguez', role: 'Lead Developer', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { name: 'David Kim', role: 'Community Director', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  ];

  return (
    <div className="bg-eco-beige min-h-screen pb-24">
      {/* Hero Section */}
      <section className="bg-eco-forest text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10 animate-fade-in">
          <Leaf className="w-16 h-16 mx-auto mb-6 text-eco-mint" />
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6">Our Mission for a Greener Tomorrow</h1>
          <p className="text-xl text-eco-mint max-w-2xl mx-auto leading-relaxed">
            Environmental issues such as climate change, pollution, deforestation, excessive waste, and resource consumption have become major global concerns. 
            EcoTrack uses digital technology to help individuals understand their environmental impact and adopt practical, sustainable habits.
          </p>
        </div>
      </section>

      {/* The Problem & Solution */}
      <section className="py-20 max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold text-eco-charcoal mb-6">Why Sustainable Living Matters</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Every day, individual choices contribute to a massive global footprint. While existing sustainability applications exist, they often lack integration, relying solely on abstract numbers without actionable advice or community support.
            </p>
            <p className="text-gray-600 mb-8 leading-relaxed">
              We built EcoTrack to bridge this gap. We provide an integrated sustainability platform that combines carbon footprint visualization, personalized recommendations, real-time progress tracking, and gamification to make green living engaging and achievable for everyone.
            </p>
            <div className="space-y-4">
              {['Track water, electricity, transport, and waste', 'Earn rewards through gamification', 'Join eco-challenges with the community', 'Learn through curated resources'].map((item, i) => (
                <div key={i} className="flex items-center text-eco-forest font-medium">
                  <div className="w-6 h-6 rounded-full bg-eco-mint/30 flex items-center justify-center mr-3">
                    <Check className="w-3.5 h-3.5 text-eco-forest" />
                  </div>
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-eco-mint rounded-3xl transform translate-x-4 translate-y-4 -z-10"></div>
            <img src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Sustainability" className="rounded-3xl shadow-xl w-full object-cover h-[500px]" />
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-eco-charcoal mb-4">Meet the Team</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">We are a group of passionate environmentalists and technologists dedicated to making a difference.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, i) => (
              <div key={i} className="text-center group">
                <div className="relative overflow-hidden rounded-2xl mb-4 aspect-square">
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">{member.name}</h3>
                <p className="text-eco-forest font-medium text-sm">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 max-w-4xl mx-auto px-4">
        <div className="glass-card p-10 md:p-14 text-center">
          <Heart className="w-12 h-12 text-red-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-eco-charcoal mb-4">Get in Touch</h2>
          <p className="text-gray-600 mb-8 max-w-xl mx-auto">Have questions, suggestions, or want to partner with us? We'd love to hear from you.</p>
          
          {submitted ? (
            <div className="p-6 bg-eco-mint/20 border border-eco-forest rounded-2xl text-center max-w-md mx-auto animate-slide-up">
              <Check className="w-10 h-10 text-eco-forest mx-auto mb-2" />
              <h3 className="text-lg font-bold text-eco-charcoal">Message Sent!</h3>
              <p className="text-sm text-gray-600 mt-1">Thank you for reaching out. The EcoTrack team will get back to you shortly.</p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-4 text-xs font-semibold text-eco-forest hover:underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="max-w-md mx-auto space-y-4 text-left">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  className="input-field"
                  placeholder="Jane Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  className="input-field"
                  placeholder="jane@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  required
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  className="input-field min-h-[120px] resize-y"
                  placeholder="How can we help?"
                ></textarea>
              </div>
              <button type="submit" className="w-full btn-primary py-3 cursor-pointer">Send Message</button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}


