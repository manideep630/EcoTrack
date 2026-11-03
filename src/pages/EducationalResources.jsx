import React, { useState, useMemo } from 'react';
import { BookOpen, Search, Play, FileText, Bookmark, BookmarkCheck, ExternalLink, Filter, X, ArrowLeft } from 'lucide-react';
import { useUser } from '../contexts/UserContext';

const FALLBACK_IMAGE = '/images/resources/default-resource.jpg';

const handleImageError = (e) => {
  if (e.currentTarget.src !== FALLBACK_IMAGE && !e.currentTarget.src.endsWith(FALLBACK_IMAGE)) {
    e.currentTarget.onerror = null;
    e.currentTarget.src = FALLBACK_IMAGE;
  }
};

const ALL_RESOURCES = [
  { id: 1, title: 'The Ultimate Guide to Home Composting', type: 'Article', category: 'Recycling', readTime: '5 min', image: '/images/resources/composting.jpg',
    fullContent: 'Composting is one of the easiest ways to reduce your household waste and create nutrient-rich soil. Start by selecting a compost bin or designating a corner of your garden. Add green materials (fruit scraps, vegetable peels, coffee grounds) and brown materials (dry leaves, cardboard, newspaper) in roughly equal proportions. Turn the pile every few weeks and keep it moist. Within 2-6 months, you\'ll have rich compost to use in your garden. Avoid adding meat, dairy, or oily foods as they attract pests.' },
  { id: 2, title: 'Understanding Your Carbon Footprint', type: 'Video', category: 'Climate Change', readTime: '12 min', image: '/images/resources/carbon-footprint.jpg',
    fullContent: 'Your carbon footprint is the total amount of greenhouse gases produced directly and indirectly by your activities. The average person produces about 4 tons of CO2 annually. Transportation typically accounts for 29% of emissions, followed by electricity (25%), industry (23%), and agriculture (10%). Simple changes like driving less, eating less meat, reducing air travel, and improving home energy efficiency can dramatically reduce your footprint. Use EcoTrack\'s calculator to measure your personal impact.' },
  { id: 3, title: 'Top 10 Energy Efficient Appliances', type: 'Infographic', category: 'Energy', readTime: '2 min', image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    fullContent: 'Switching to energy-efficient appliances can save you hundreds of dollars per year. Top picks: 1) LED light bulbs (use 75% less energy), 2) Energy Star refrigerators, 3) Heat pump water heaters, 4) Induction cooktops, 5) Front-loading washing machines, 6) Heat pump dryers, 7) Smart thermostats, 8) Energy-efficient dishwashers, 9) Solar-powered outdoor lighting, 10) Smart power strips. Look for the Energy Star label when shopping for new appliances.' },
  { id: 4, title: 'Plant-Based Diets for Beginners', type: 'Beginner Guide', category: 'Sustainable Food', readTime: '15 min', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    fullContent: 'Transitioning to a plant-based diet doesn\'t have to be all-or-nothing. Start with "Meatless Mondays" and gradually increase plant-based meals. Focus on whole grains, legumes, nuts, fruits, and vegetables. Great protein sources include lentils, chickpeas, tofu, tempeh, and quinoa. A plant-based diet can reduce your food-related carbon footprint by up to 73%. Plan your meals ahead, explore cuisines that are naturally plant-forward (Indian, Mediterranean, Thai), and don\'t forget B12 supplements.' },
  { id: 5, title: 'How Solar Panels Work', type: 'Video', category: 'Renewable Energy', readTime: '8 min', image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    fullContent: 'Solar panels convert sunlight into electricity using photovoltaic cells. When photons hit the silicon cells, they knock electrons free, creating an electric current. A typical home system (5kW) can generate 6,000-8,000 kWh per year. With net metering, excess energy goes back to the grid for credits. Solar panels last 25-30 years and pay for themselves in 7-10 years. Government incentives and tax credits can reduce installation costs by 30% or more. Consider your roof orientation, shading, and local sunshine hours.' },
  { id: 6, title: 'Water Conservation at Home', type: 'Article', category: 'Water Conservation', readTime: '6 min', image: '/images/resources/water-conservation.jpg',
    fullContent: 'The average household uses 300 gallons of water daily. Simple changes can cut this significantly: Fix leaky faucets (saves 3,000 gallons/year), install low-flow showerheads, take shorter showers, only run full loads in dishwashers and washing machines, water gardens in early morning or evening, collect rainwater, and use drought-resistant native plants. A dual-flush toilet saves up to 4,000 gallons per year. Smart irrigation systems can reduce outdoor water use by 30-50%.' },
];

export default function EducationalResources() {
  const { userData, updateUserData } = useUser();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResource, setSelectedResource] = useState(null);

  const savedResources = userData?.savedResources || [];

  const categories = ['All', 'Climate Change', 'Recycling', 'Energy', 'Water Conservation', 'Green Transport', 'Sustainable Food', 'Renewable Energy'];

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

  // Detail view
  if (selectedResource) {
    const res = ALL_RESOURCES.find(r => r.id === selectedResource);
    if (!res) { setSelectedResource(null); return null; }
    const isSaved = savedResources.includes(res.id);
    return (
      <div className="animate-fade-in max-w-4xl mx-auto space-y-8">
        <button onClick={() => setSelectedResource(null)} className="flex items-center text-eco-forest font-medium hover:underline">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Learning Center
        </button>
        <div className="glass-card overflow-hidden">
          <img src={res.image} alt={res.title} onError={handleImageError} className="w-full h-72 object-cover" />
          <div className="p-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-bold text-eco-leaf uppercase tracking-wider">{res.category}</span>
                <h1 className="text-3xl font-extrabold text-eco-charcoal mt-2">{res.title}</h1>
              </div>
              <button onClick={() => toggleSave(res.id)} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                {isSaved ? <BookmarkCheck className="w-6 h-6 text-eco-forest" /> : <Bookmark className="w-6 h-6 text-gray-400" />}
              </button>
            </div>
            <div className="flex items-center text-sm text-gray-500 mb-6 gap-4">
              <span className="flex items-center">
                {res.type === 'Video' ? <Play className="w-4 h-4 mr-1" /> : <FileText className="w-4 h-4 mr-1" />}
                {res.type}
              </span>
              <span>{res.readTime} {res.type === 'Video' ? 'watch' : 'read'}</span>
            </div>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base">{res.fullContent}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-6">
        <div>
          <h1 className="text-2xl font-bold text-eco-charcoal flex items-center">
            <BookOpen className="w-8 h-8 mr-3 text-eco-forest" />
            Learning Center
          </h1>
          <p className="text-gray-500 mt-2">Expand your knowledge on sustainability and environmental conservation.</p>
        </div>
        <div className="relative max-w-xs w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="input-field pl-10 pr-8 py-2.5 shadow-sm"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Featured Article */}
      <div
        className="glass-card overflow-hidden relative group cursor-pointer"
        onClick={() => setSelectedResource(2)}
      >
        <div className="absolute inset-0 bg-black/40 z-10 transition-opacity group-hover:bg-black/50"></div>
        <img
          src="https://images.unsplash.com/photo-1473448912268-2022ce9509d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"
          alt="Forest"
          onError={handleImageError}
          className="w-full h-80 object-cover object-center transform transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute bottom-0 left-0 p-8 z-20 text-white w-full md:w-2/3">
          <span className="bg-eco-forest text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block">Featured Guide</span>
          <h2 className="text-3xl font-extrabold mb-2 leading-tight">The Future of Green Cities: How Urban Planning is Changing</h2>
          <p className="text-gray-200 mb-4 line-clamp-2">Discover how major cities around the world are adapting to climate change by incorporating nature into urban environments.</p>
          <span className="flex items-center text-sm font-bold hover:text-eco-mint transition-colors">
            Read Full Guide <ExternalLink className="w-4 h-4 ml-1" />
          </span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Categories Sidebar */}
        <div className="w-full md:w-64 shrink-0 space-y-2 sticky top-24">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center px-2">
            <Filter className="w-5 h-5 mr-2" /> Categories
          </h3>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeCategory === category
                  ? 'bg-eco-forest text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Resources Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredResources.map(resource => {
              const isSaved = savedResources.includes(resource.id);
              return (
                <div
                  key={resource.id}
                  className="glass-card overflow-hidden flex flex-col group cursor-pointer hover:-translate-y-1 transition-all duration-300"
                  onClick={() => setSelectedResource(resource.id)}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img src={resource.image} alt={resource.title} onError={handleImageError} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-eco-charcoal text-xs font-bold px-2.5 py-1 rounded-md flex items-center">
                      {resource.type === 'Video' ? <Play className="w-3 h-3 mr-1" /> : <FileText className="w-3 h-3 mr-1" />}
                      {resource.type}
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleSave(resource.id); }}
                      className="absolute top-3 right-3 p-1.5 bg-white/90 backdrop-blur rounded-full text-gray-500 hover:text-eco-forest transition-colors shadow-sm z-10"
                    >
                      {isSaved ? <BookmarkCheck className="w-4 h-4 text-eco-forest" /> : <Bookmark className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <span className="text-xs font-medium text-eco-leaf mb-2">{resource.category}</span>
                    <h3 className="text-lg font-bold text-eco-charcoal mb-2 leading-snug group-hover:text-eco-forest transition-colors">{resource.title}</h3>
                    <div className="mt-auto pt-4 flex items-center justify-between text-xs text-gray-500 border-t border-gray-100">
                      <span>{resource.readTime} {resource.type === 'Video' ? 'watch' : 'read'}</span>
                      <span className="font-bold text-eco-forest group-hover:underline">Read more</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {filteredResources.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900">No resources found</h3>
              <p className="text-gray-500">Try selecting a different category or adjusting your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
