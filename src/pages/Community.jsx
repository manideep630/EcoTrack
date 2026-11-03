import React, { useState } from 'react';
import { Users, Heart, MessageSquare, Share2, MapPin, PlusCircle, Award, X, Send, Check, Trophy, Sparkles } from 'lucide-react';
import { useUser } from '../contexts/UserContext';

const INITIAL_INITIATIVES = [
  { id: 1, title: 'Downtown Beach Cleanup', date: 'Saturday, 10 AM', location: 'Sunny Cove Beach', participants: 45, joined: false },
  { id: 2, title: 'Community Garden Planting', date: 'Sunday, 9 AM', location: 'Central Park', participants: 22, joined: false },
  { id: 3, title: 'Electronic Waste Drive', date: 'Next Friday', location: 'City Hall Square', participants: 150, joined: false },
];

const LEADERBOARD_USERS = [
  { rank: 1, name: 'EcoWarrior_99', points: 3450, badge: 'Zero Waste Champion' },
  { rank: 2, name: 'GreenThumb_Sam', points: 2890, badge: 'Tree Planter' },
  { rank: 3, name: 'SolarPioneer', points: 2410, badge: 'Clean Energy Pro' },
  { rank: 4, name: 'CycleEveryday', points: 1980, badge: 'Mobility Master' },
  { rank: 5, name: 'Elena R.', points: 1720, badge: 'Upcycle Specialist' },
];

export default function Community() {
  const { user, userData, updateUserData, addActivity } = useUser();
  const [activeTab, setActiveTab] = useState('feed');
  const [selectedTag, setSelectedTag] = useState(null);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [copiedPostId, setCopiedPostId] = useState(null);
  const [initiatives, setInitiatives] = useState(INITIAL_INITIATIVES);
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [commentInput, setCommentInput] = useState('');

  // Form state for new post
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState('');

  const posts = userData?.communityPosts || [];
  const currentUserName = user?.name || 'You';
  const currentUserEmail = user?.email || 'user@example.com';

  const filteredPosts = selectedTag
    ? posts.filter(p => p.content.toLowerCase().includes(selectedTag.toLowerCase()))
    : posts;

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    const newPost = {
      id: `post-${Date.now()}`,
      user: currentUserName,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUserName)}&background=2d6a4f&color=fff`,
      time: 'Just now',
      timestamp: Date.now(),
      content: newPostContent.trim(),
      image: newPostImage.trim() || null,
      likes: 0,
      likedBy: [],
      comments: [],
    };

    const updated = [newPost, ...posts];
    updateUserData({ communityPosts: updated });
    addActivity('Shared Community Post', 'Inspiring fellow eco-warriors', 25);

    setNewPostContent('');
    setNewPostImage('');
    setShowNewPostModal(false);
  };

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

  const handleAddComment = (postId) => {
    if (!commentInput.trim()) return;

    const updated = posts.map(post => {
      if (post.id === postId) {
        const comments = post.comments || [];
        const newComment = {
          id: Date.now(),
          user: currentUserName,
          text: commentInput.trim(),
          time: 'Just now',
        };
        return { ...post, comments: [...comments, newComment] };
      }
      return post;
    });

    updateUserData({ communityPosts: updated });
    setCommentInput('');
  };

  const handleShare = (post) => {
    navigator.clipboard?.writeText?.(window.location.href);
    setCopiedPostId(post.id);
    setTimeout(() => setCopiedPostId(null), 2500);
  };

  const toggleRSVP = (id) => {
    setInitiatives(prev => prev.map(item => {
      if (item.id === id) {
        const joined = !item.joined;
        if (joined) {
          addActivity('RSVP for Initiative', item.title, 30);
        }
        return {
          ...item,
          joined,
          participants: joined ? item.participants + 1 : item.participants - 1,
        };
      }
      return item;
    }));
  };

  return (
    <div className="animate-fade-in max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-6">
        <div>
          <h1 className="text-2xl font-bold text-eco-charcoal flex items-center">
            <Users className="w-8 h-8 mr-3 text-eco-forest" />
            Community Hub
          </h1>
          <p className="text-gray-500 mt-2">Connect, share, and make an impact with local eco-warriors.</p>
        </div>
        <button
          onClick={() => setShowNewPostModal(true)}
          className="btn-primary flex items-center justify-center whitespace-nowrap shadow-md cursor-pointer"
        >
          <PlusCircle className="w-5 h-5 mr-2" /> New Post
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 pb-2">
        <button 
          onClick={() => setActiveTab('feed')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'feed' ? 'border-eco-forest text-eco-forest' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Community Feed ({posts.length})
        </button>
        <button 
          onClick={() => setActiveTab('local')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'local' ? 'border-eco-forest text-eco-forest' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Local Initiatives ({initiatives.length})
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {selectedTag && (
            <div className="flex items-center justify-between p-3 bg-eco-mint/20 rounded-xl text-sm text-eco-forest font-medium">
              <span>Filtering by <strong>{selectedTag}</strong></span>
              <button onClick={() => setSelectedTag(null)} className="flex items-center hover:underline">
                <X className="w-4 h-4 mr-1" /> Clear
              </button>
            </div>
          )}

          {activeTab === 'feed' ? (
            filteredPosts.length === 0 ? (
              <div className="glass-card p-12 text-center text-gray-500">
                <p className="font-medium text-lg">No posts matching this topic.</p>
                <button onClick={() => setSelectedTag(null)} className="mt-4 text-sm text-eco-forest hover:underline">
                  Show all posts
                </button>
              </div>
            ) : (
              filteredPosts.map(post => {
                const isLiked = (post.likedBy || []).includes(currentUserEmail);
                const comments = post.comments || [];
                const isCommentOpen = activeCommentPostId === post.id;

                return (
                  <div key={post.id} className="glass-card overflow-hidden">
                    <div className="p-5 flex items-center justify-between border-b border-gray-100 bg-gray-50/50">
                      <div className="flex items-center space-x-3">
                        <img src={post.avatar} alt={post.user} className="w-10 h-10 rounded-full border border-gray-200" />
                        <div>
                          <h4 className="font-bold text-gray-800">{post.user}</h4>
                          <p className="text-xs text-gray-500">{post.time}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-5">
                      <p className="text-gray-700 leading-relaxed mb-4 whitespace-pre-wrap">{post.content}</p>
                      {post.image && (
                        <div className="rounded-xl overflow-hidden mb-4 border border-gray-100">
                          <img src={post.image} alt="Post content" className="w-full h-auto object-cover max-h-96" />
                        </div>
                      )}
                    </div>
                    
                    <div className="px-5 py-3 border-t border-gray-100 flex items-center space-x-6 text-sm font-medium text-gray-500 bg-white">
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center transition-colors cursor-pointer ${isLiked ? 'text-red-500' : 'hover:text-red-500'}`}
                      >
                        <Heart className={`w-5 h-5 mr-1.5 ${isLiked ? 'fill-current text-red-500' : ''}`} />
                        {post.likes}
                      </button>

                      <button
                        onClick={() => setActiveCommentPostId(isCommentOpen ? null : post.id)}
                        className="flex items-center hover:text-eco-forest transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-5 h-5 mr-1.5" />
                        {comments.length}
                      </button>

                      <button
                        onClick={() => handleShare(post)}
                        className="flex items-center hover:text-blue-500 transition-colors ml-auto cursor-pointer"
                      >
                        {copiedPostId === post.id ? (
                          <span className="flex items-center text-eco-forest"><Check className="w-4 h-4 mr-1" /> Link Copied!</span>
                        ) : (
                          <span className="flex items-center"><Share2 className="w-5 h-5 mr-1.5" /> Share</span>
                        )}
                      </button>
                    </div>

                    {/* Comments drawer */}
                    {isCommentOpen && (
                      <div className="p-5 bg-gray-50 border-t border-gray-100 space-y-4 animate-slide-up">
                        {comments.length > 0 ? (
                          <div className="space-y-3">
                            {comments.map((c) => (
                              <div key={c.id} className="p-3 bg-white rounded-xl border border-gray-200 text-sm">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="font-bold text-gray-800">{c.user}</span>
                                  <span className="text-xs text-gray-400">{c.time}</span>
                                </div>
                                <p className="text-gray-600">{c.text}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400">No comments yet. Be the first to reply!</p>
                        )}

                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Write a comment..."
                            value={commentInput}
                            onChange={(e) => setCommentInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(post.id); }}
                            className="input-field py-2 text-sm"
                          />
                          <button
                            onClick={() => handleAddComment(post.id)}
                            className="btn-primary py-2 px-4 shrink-0 flex items-center"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )
          ) : (
            <div className="space-y-4">
              {initiatives.map(initiative => (
                <div key={initiative.id} className="glass-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 border-l-eco-leaf">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1">{initiative.title}</h3>
                    <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-500 gap-2 sm:gap-4">
                      <span className="flex items-center"><MapPin className="w-4 h-4 mr-1 text-gray-400" /> {initiative.location}</span>
                      <span className="flex items-center text-eco-forest font-medium">{initiative.date}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <div className="flex -space-x-2 overflow-hidden">
                      {[1,2,3].map(i => <img key={i} className="inline-block h-6 w-6 rounded-full ring-2 ring-white" src={`https://ui-avatars.com/api/?name=User+${i}&background=random`} alt=""/>)}
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full ring-2 ring-white bg-gray-100 text-[10px] font-medium text-gray-500">+{initiative.participants - 3}</span>
                    </div>
                    <button
                      onClick={() => toggleRSVP(initiative.id)}
                      className={`py-1.5 px-4 text-sm w-full sm:w-auto rounded-xl font-medium transition-all ${
                        initiative.joined
                          ? 'bg-eco-forest text-white shadow-sm'
                          : 'btn-secondary'
                      }`}
                    >
                      {initiative.joined ? 'Attending ✓' : 'RSVP'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="glass-card p-6 bg-gradient-to-br from-eco-forest to-eco-leaf text-white border-none">
            <h3 className="font-bold text-lg mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2 text-yellow-300" /> Community Impact
            </h3>
            <div className="space-y-4">
              <div>
                <div className="text-eco-mint text-xs font-bold uppercase mb-1">Total CO2 Saved</div>
                <div className="text-2xl font-extrabold">25,430 kg</div>
              </div>
              <div className="w-full h-px bg-white/20"></div>
              <div>
                <div className="text-eco-mint text-xs font-bold uppercase mb-1">Active Challenges</div>
                <div className="text-2xl font-extrabold">14</div>
              </div>
            </div>
            <button
              onClick={() => setShowLeaderboard(true)}
              className="mt-6 w-full py-2 bg-white/20 hover:bg-white/30 backdrop-blur rounded-xl text-sm font-bold transition-colors cursor-pointer"
            >
              View Leaderboard
            </button>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-bold text-gray-800 mb-4">Trending Topics</h3>
            <div className="flex flex-wrap gap-2">
              {['#ZeroWaste', '#SolarEnergy', '#VeganRecipes', '#BeachCleanup', '#Upcycling'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={`px-3 py-1 text-sm font-medium rounded-full transition-colors cursor-pointer ${
                    selectedTag === tag
                      ? 'bg-eco-forest text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* New Post Modal */}
      {showNewPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl animate-slide-up space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-eco-charcoal">Create a Community Post</h3>
              <button onClick={() => setShowNewPostModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">What did you accomplish?</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Share a milestone, eco-tip, or sustainable win! (e.g. #ZeroWaste)"
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Image URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newPostImage}
                  onChange={(e) => setNewPostImage(e.target.value)}
                  className="input-field text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewPostModal(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary py-2 px-5 text-sm"
                >
                  Post & Earn +25 pts
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-slide-up space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center space-x-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                <h3 className="text-lg font-bold text-eco-charcoal">Eco Leaderboard</h3>
              </div>
              <button onClick={() => setShowLeaderboard(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {LEADERBOARD_USERS.map((item) => (
                <div key={item.rank} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center space-x-3">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                      item.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                      item.rank === 2 ? 'bg-gray-200 text-gray-700' :
                      item.rank === 3 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      #{item.rank}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{item.name}</p>
                      <p className="text-xs text-eco-forest">{item.badge}</p>
                    </div>
                  </div>
                  <span className="text-sm font-extrabold text-eco-charcoal">{item.points.toLocaleString()} pts</span>
                </div>
              ))}

              {/* Current user ranking row */}
              <div className="p-3 bg-eco-mint/20 rounded-xl border border-eco-mint flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="w-7 h-7 rounded-full bg-eco-forest text-white flex items-center justify-center font-bold text-xs">
                    You
                  </span>
                  <div>
                    <p className="text-sm font-bold text-eco-forest">{currentUserName}</p>
                    <p className="text-xs text-gray-500">Your Current Standing</p>
                  </div>
                </div>
                <span className="text-sm font-extrabold text-eco-forest">{(userData?.rewardPoints || 0).toLocaleString()} pts</span>
              </div>
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => setShowLeaderboard(false)}
                className="w-full btn-secondary py-2 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
