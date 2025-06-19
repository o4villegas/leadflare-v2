import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import type { Route } from "./+types/generateCreative";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Generate Creative - LeadFlare" },
    { name: "description", content: "AI-powered creative generation for your lead generation campaign" },
  ];
}

// TypeScript interfaces matching your existing patterns
interface Creative {
  id: string;
  type: 'headline' | 'description' | 'cta' | 'image';
  content: string;
  imageUrl?: string;
  score: number;
  isSelected: boolean;
}

interface CreativeOptions {
  headlines: Creative[];
  descriptions: Creative[];
  ctas: Creative[];
  images: Creative[];
}

export default function GenerateCreative() {
  const navigate = useNavigate();
  const location = useLocation();
  // Get campaign data from previous step (same pattern as your other components)
  const campaignData = location?.state?.campaignData || {
    name: 'Sample Campaign',
    businessType: 'Technology',
    description: 'Lead generation campaign',
    budget: 75,
    interests: ['Technology', 'Software'],
    locations: ['United States'],
    ageMin: 25,
    ageMax: 55
  };

  // State management
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingSection, setGeneratingSection] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [creativeOptions, setCreativeOptions] = useState<CreativeOptions>({
    headlines: [],
    descriptions: [],
    ctas: [],
    images: []
  });
  const [selectedCreatives, setSelectedCreatives] = useState({
    headline: null as Creative | null,
    description: null as Creative | null,
    cta: null as Creative | null,
    image: null as Creative | null
  });
  const [editingItem, setEditingItem] = useState<{ item: Creative; type: string } | null>(null);
  const [editText, setEditText] = useState('');

  // Auto-select highest scoring option when new creatives are generated
  const autoSelectHighestScoring = (sectionType: string, newCreatives: Creative[]) => {
    if (newCreatives.length > 0) {
      const highestScoring = newCreatives.reduce((prev, current) => 
        prev.score > current.score ? prev : current
      );
      
      // Update selected creatives
      setSelectedCreatives(prev => ({ 
        ...prev, 
        [sectionType]: highestScoring 
      }));
      
      // Update isSelected state
      const sectionKey = `${sectionType}s` as keyof CreativeOptions;
      setCreativeOptions(prev => ({
        ...prev,
        [sectionKey]: newCreatives.map(item => ({
          ...item,
          isSelected: item.id === highestScoring.id
        }))
      }));
    }
  };

  // Generate all creatives (matches your backend API pattern)
  const generateCreatives = async (retry = false) => {
    setIsGenerating(true);
    setGenerationError(null);
    
    try {
      // Single API call to your workers/ai.ts endpoint
      const response = await fetch('/api/ai/generate-creatives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignContext: {
            name: campaignData.name,
            businessType: campaignData.businessType,
            description: campaignData.description,
            interests: campaignData.interests || [],
            ageRange: `${campaignData.ageMin}-${campaignData.ageMax}`,
            locations: campaignData.locations || [],
            budget: campaignData.budget
          },
          retry: retry
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const newOptions = {
            headlines: data.creatives.headlines || [],
            descriptions: data.creatives.descriptions || [],
            ctas: data.creatives.ctas || [],
            images: data.creatives.images || []
          };
          
          setCreativeOptions(newOptions);
          
          // Auto-select highest scoring options for each category
          if (newOptions.headlines.length > 0) autoSelectHighestScoring('headline', newOptions.headlines);
          if (newOptions.descriptions.length > 0) autoSelectHighestScoring('description', newOptions.descriptions);
          if (newOptions.ctas.length > 0) autoSelectHighestScoring('cta', newOptions.ctas);
          if (newOptions.images.length > 0) autoSelectHighestScoring('image', newOptions.images);
        } else {
          throw new Error(data.error || 'Failed to generate creatives');
        }
      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      console.warn('AI generation failed, using fallback data:', error);
      setGenerationError(error instanceof Error ? error.message : 'Generation failed');
      
      // Fallback to mock data (for development)
      const fallbackOptions = {
        headlines: [
          { id: '1', type: 'headline' as const, content: 'Transform Your Business with AI Solutions', score: 94, isSelected: false },
          { id: '2', type: 'headline' as const, content: 'Boost Productivity by 40% Starting Today', score: 91, isSelected: false },
          { id: '3', type: 'headline' as const, content: 'Join 10,000+ Companies Using Our Platform', score: 88, isSelected: false }
        ],
        descriptions: [
          { id: '1', type: 'description' as const, content: 'Streamline workflows with intelligent automation. Built for modern teams that need results fast.', score: 89, isSelected: false },
          { id: '2', type: 'description' as const, content: 'Cut costs while boosting efficiency. Integrates seamlessly with your existing tools.', score: 93, isSelected: false }
        ],
        ctas: [
          { id: '1', type: 'cta' as const, content: 'Start Free Trial', score: 96, isSelected: false },
          { id: '2', type: 'cta' as const, content: 'Get Demo', score: 89, isSelected: false },
          { id: '3', type: 'cta' as const, content: 'Learn More', score: 83, isSelected: false }
        ],
        images: [
          { id: '1', type: 'image' as const, content: 'Team collaboration', imageUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=250&fit=crop', score: 90, isSelected: false },
          { id: '2', type: 'image' as const, content: 'Modern workspace', imageUrl: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=250&fit=crop', score: 87, isSelected: false }
        ]
      };
      
      setCreativeOptions(fallbackOptions);
      
      // Auto-select highest scoring options for fallback data too
      autoSelectHighestScoring('headline', fallbackOptions.headlines);
      autoSelectHighestScoring('description', fallbackOptions.descriptions);
      autoSelectHighestScoring('cta', fallbackOptions.ctas);
      autoSelectHighestScoring('image', fallbackOptions.images);
    } finally {
      setIsGenerating(false);
    }
  };

  // Regenerate specific section
  const regenerateSection = async (sectionType: string) => {
    setGeneratingSection(sectionType);
    setGenerationError(null);
    
    try {
      const response = await fetch('/api/ai/generate-creatives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignContext: {
            name: campaignData.name,
            businessType: campaignData.businessType,
            description: campaignData.description,
            interests: campaignData.interests || [],
            ageRange: `${campaignData.ageMin}-${campaignData.ageMax}`,
            locations: campaignData.locations || [],
            budget: campaignData.budget
          },
          contentType: sectionType,
          regenerate: true
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.creatives) {
          setCreativeOptions(prev => ({
            ...prev,
            [sectionType]: data.creatives
          }));
          
          // Auto-select highest scoring option in regenerated section
          autoSelectHighestScoring(sectionType.slice(0, -1), data.creatives); // Remove 's' from end
        } else {
          throw new Error(data.error || 'Failed to regenerate content');
        }
      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      console.warn(`Failed to regenerate ${sectionType}:`, error);
      setGenerationError(`Failed to regenerate ${sectionType}. Please try again.`);
    } finally {
      setGeneratingSection(null);
    }
  };

  // Auto-generate on mount
  useEffect(() => {
    generateCreatives();
  }, []);

  // Select creative
  const selectCreative = (type: keyof typeof selectedCreatives, creative: Creative) => {
    setSelectedCreatives(prev => ({ ...prev, [type]: creative }));
    
    // Update isSelected state
    const sectionKey = `${type}s` as keyof CreativeOptions;
    setCreativeOptions(prev => ({
      ...prev,
      [sectionKey]: prev[sectionKey].map(item => ({
        ...item,
        isSelected: item.id === creative.id
      }))
    }));
  };

  // Inline editing
  const startEdit = (item: Creative, type: string) => {
    setEditingItem({ item, type });
    setEditText(item.content);
  };

  const saveEdit = () => {
    if (!editingItem || !editText.trim()) return;
    
    const updatedItem = { ...editingItem.item, content: editText, score: Math.max(85, editingItem.item.score - 5) };
    const sectionKey = `${editingItem.type}s` as keyof CreativeOptions;
    
    setCreativeOptions(prev => ({
      ...prev,
      [sectionKey]: prev[sectionKey].map(item => item.id === updatedItem.id ? updatedItem : item)
    }));

    if (selectedCreatives[editingItem.type as keyof typeof selectedCreatives]?.id === updatedItem.id) {
      setSelectedCreatives(prev => ({ ...prev, [editingItem.type]: updatedItem }));
    }

    setEditingItem(null);
    setEditText('');
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditText('');
  };

  // Navigation functions
  const proceedToApproval = () => {
    navigate('/approveLaunch', { 
      state: { 
        campaignData,
        selectedCreatives 
      }
    });
  };

  const goBack = () => {
    navigate('/createCampaign', { 
      state: { campaignData }
    });
  };

  const navigateToHome = () => {
    navigate('/');
  };

  const navigateToCampaigns = () => {
    navigate('/campaignManager');
  };

  const navigateToCreateCampaign = () => {
    navigate('/createCampaign');
  };

  // Check completion
  const isComplete = Object.values(selectedCreatives).every(item => item !== null);

  return (
    <div className="bg-slate-900 text-white min-h-screen">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur border-b border-slate-700">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-24 px-6">
          <div className="flex items-center">
            <div className="w-20 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center font-bold text-slate-900 text-lg">
              LOGO
            </div>
          </div>
          
          <nav className="flex items-center gap-8">
            <button 
              onClick={navigateToHome}
              className="text-slate-300 hover:text-white font-medium transition-colors"
            >
              Dashboard
            </button>
            <button 
              onClick={navigateToCampaigns}
              className="text-slate-300 hover:text-white font-medium transition-colors"
            >
              Campaigns
            </button>
            <button 
              onClick={navigateToCreateCampaign}
              className="text-slate-300 hover:text-white font-medium transition-colors"
            >
              Create Campaign
            </button>
            <button className="text-white font-semibold bg-green-500/20 px-4 py-2 rounded-lg">
              Generate Creative
            </button>
          </nav>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => generateCreatives(true)}
              disabled={isGenerating}
              className="text-green-400 hover:text-green-300 px-3 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isGenerating ? 'Generating...' : 'Regenerate All'}
            </button>
            <button 
              onClick={goBack}
              className="bg-green-500 hover:bg-green-600 text-slate-900 px-6 py-2 rounded-md text-sm font-semibold transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">AI Creative Generation</h1>
          <p className="text-slate-300">AI-powered ad content tailored to your campaign objectives</p>
          <div className="mt-4 p-4 bg-slate-800 rounded-lg border border-slate-700">
            <div className="text-sm text-slate-400">Campaign: <span className="text-white">{campaignData.name}</span></div>
            <div className="text-sm text-slate-400">Target: <span className="text-white">{campaignData.businessType} • Ages {campaignData.ageMin}-{campaignData.ageMax}</span></div>
          </div>
        </div>

        {/* Error Alert */}
        {generationError && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-red-400">⚠️</span>
                <span className="text-red-400">{generationError}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => generateCreatives(true)}
                  disabled={isGenerating}
                  className="px-3 py-1 bg-red-500/20 text-red-400 rounded text-sm font-medium hover:bg-red-500/30 transition-colors disabled:opacity-50"
                >
                  Retry AI Generation
                </button>
                <button
                  onClick={() => setGenerationError(null)}
                  className="px-3 py-1 bg-slate-600 text-slate-300 rounded text-sm font-medium hover:bg-slate-500 transition-colors"
                >
                  Continue with Manual Entry
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Creative Options */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Headlines */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Headlines</h2>
                <button 
                  onClick={() => regenerateSection('headlines')}
                  disabled={generatingSection === 'headlines'}
                  className="text-sm text-green-400 hover:text-green-300 flex items-center gap-2 disabled:opacity-50 transition-colors"
                >
                  {generatingSection === 'headlines' ? (
                    <>
                      <div className="w-3 h-3 border border-green-400 border-t-transparent rounded-full animate-spin"></div>
                      Generating...
                    </>
                  ) : (
                    <>🔄 Regenerate</>
                  )}
                </button>
              </div>
              
              <div className="space-y-4">
                {creativeOptions.headlines.length === 0 && !isGenerating ? (
                  <div className="text-center py-8 text-slate-400">
                    <div className="text-2xl mb-2">✍️</div>
                    <p className="text-sm">No headlines generated yet</p>
                    <button
                      onClick={() => regenerateSection('headlines')}
                      className="mt-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium hover:bg-green-500/30 transition-colors"
                    >
                      Generate Headlines
                    </button>
                  </div>
                ) : (
                  creativeOptions.headlines.map((headline) => (
                    <div key={headline.id}>
                      {editingItem?.item.id === headline.id ? (
                        <div className="p-4 rounded-lg border-2 border-green-500 bg-green-500/10">
                          <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full px-3 py-3 bg-slate-700 border border-slate-600 rounded-md text-white focus:border-green-500 focus:outline-none resize-none transition-colors"
                            rows={2}
                            maxLength={100}
                          />
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-xs text-slate-400">{editText.length}/100</span>
                            <div className="flex gap-2">
                              <button 
                                onClick={cancelEdit} 
                                className="px-3 py-1 bg-slate-600 hover:bg-slate-500 text-white rounded text-xs transition-colors"
                              >
                                Cancel
                              </button>
                              <button 
                                onClick={saveEdit} 
                                className="px-3 py-1 bg-green-500 hover:bg-green-600 text-slate-900 rounded text-xs font-medium transition-colors"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div 
                          onClick={() => selectCreative('headline', headline)}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all group ${
                            headline.isSelected ? 'border-green-500 bg-green-500/10' : 'border-slate-600 hover:border-slate-500'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <p className="text-white font-medium flex-1 pr-4">{headline.content}</p>
                            <div className="flex items-center gap-3 flex-shrink-0">
                              <button
                                onClick={(e) => { e.stopPropagation(); startEdit(headline, 'headline'); }}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-700 rounded transition-all"
                                title="Edit headline"
                              >
                                ✏️
                              </button>
                              <div className="text-right">
                                <div className="text-xs text-slate-400">Score</div>
                                <div className="text-green-400 font-semibold">{headline.score}%</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Descriptions */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Descriptions</h2>
                <button 
                  onClick={() => regenerateSection('descriptions')}
                  disabled={generatingSection === 'descriptions'}
                  className="text-sm text-green-400 hover:text-green-300 flex items-center gap-2 disabled:opacity-50 transition-colors"
                >
                  {generatingSection === 'descriptions' ? (
                    <>
                      <div className="w-3 h-3 border border-green-400 border-t-transparent rounded-full animate-spin"></div>
                      Generating...
                    </>
                  ) : (
                    <>🔄 Regenerate</>
                  )}
                </button>
              </div>
              
              <div className="space-y-4">
                {creativeOptions.descriptions.length === 0 && !isGenerating ? (
                  <div className="text-center py-8 text-slate-400">
                    <div className="text-2xl mb-2">📝</div>
                    <p className="text-sm">No descriptions generated yet</p>
                    <button
                      onClick={() => regenerateSection('descriptions')}
                      className="mt-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium hover:bg-green-500/30 transition-colors"
                    >
                      Generate Descriptions
                    </button>
                  </div>
                ) : (
                  creativeOptions.descriptions.map((desc) => (
                    <div key={desc.id}>
                      {editingItem?.item.id === desc.id ? (
                        <div className="p-4 rounded-lg border-2 border-green-500 bg-green-500/10">
                          <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full px-3 py-3 bg-slate-700 border border-slate-600 rounded-md text-white focus:border-green-500 focus:outline-none resize-none transition-colors"
                            rows={3}
                            maxLength={250}
                          />
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-xs text-slate-400">{editText.length}/250</span>
                            <div className="flex gap-2">
                              <button 
                                onClick={cancelEdit} 
                                className="px-3 py-1 bg-slate-600 hover:bg-slate-500 text-white rounded text-xs transition-colors"
                              >
                                Cancel
                              </button>
                              <button 
                                onClick={saveEdit} 
                                className="px-3 py-1 bg-green-500 hover:bg-green-600 text-slate-900 rounded text-xs font-medium transition-colors"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div 
                          onClick={() => selectCreative('description', desc)}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all group ${
                            desc.isSelected ? 'border-green-500 bg-green-500/10' : 'border-slate-600 hover:border-slate-500'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <p className="text-white flex-1 pr-4">{desc.content}</p>
                            <div className="flex items-center gap-3 flex-shrink-0">
                              <button
                                onClick={(e) => { e.stopPropagation(); startEdit(desc, 'description'); }}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-700 rounded transition-all"
                                title="Edit description"
                              >
                                ✏️
                              </button>
                              <div className="text-right">
                                <div className="text-xs text-slate-400">Score</div>
                                <div className="text-green-400 font-semibold">{desc.score}%</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* CTAs and Images */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* CTAs */}
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Call-to-Actions</h2>
                  <button 
                    onClick={() => regenerateSection('ctas')}
                    disabled={generatingSection === 'ctas'}
                    className="text-sm text-green-400 hover:text-green-300 flex items-center gap-2 disabled:opacity-50 transition-colors"
                  >
                    {generatingSection === 'ctas' ? (
                      <>
                        <div className="w-3 h-3 border border-green-400 border-t-transparent rounded-full animate-spin"></div>
                        Generating...
                      </>
                    ) : (
                      <>🔄 Regenerate</>
                    )}
                  </button>
                </div>
                
                <div className="space-y-3">
                  {creativeOptions.ctas.length === 0 && !isGenerating ? (
                    <div className="text-center py-8 text-slate-400">
                      <div className="text-2xl mb-2">🎯</div>
                      <p className="text-sm">No CTAs generated yet</p>
                      <button
                        onClick={() => regenerateSection('ctas')}
                        className="mt-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium hover:bg-green-500/30 transition-colors"
                      >
                        Generate CTAs
                      </button>
                    </div>
                  ) : (
                    creativeOptions.ctas.map((cta) => (
                      <div key={cta.id}>
                        {editingItem?.item.id === cta.id ? (
                          <div className="p-3 rounded-lg border-2 border-green-500 bg-green-500/10">
                            <input
                              type="text"
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:border-green-500 focus:outline-none text-center font-medium transition-colors"
                              maxLength={25}
                            />
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-slate-400">{editText.length}/25</span>
                              <div className="flex gap-2">
                                <button 
                                  onClick={cancelEdit} 
                                  className="px-2 py-1 bg-slate-600 hover:bg-slate-500 text-white rounded text-xs transition-colors"
                                >
                                  Cancel
                                </button>
                                <button 
                                  onClick={saveEdit} 
                                  className="px-2 py-1 bg-green-500 hover:bg-green-600 text-slate-900 rounded text-xs font-medium transition-colors"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div 
                            onClick={() => selectCreative('cta', cta)}
                            className={`p-3 rounded-lg border-2 cursor-pointer transition-all text-center group ${
                              cta.isSelected ? 'border-green-500 bg-green-500/10' : 'border-slate-600 hover:border-slate-500'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="font-medium text-white flex-1">{cta.content}</div>
                              <button
                                onClick={(e) => { e.stopPropagation(); startEdit(cta, 'cta'); }}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-700 rounded transition-all ml-2"
                                title="Edit CTA"
                              >
                                ✏️
                              </button>
                            </div>
                            <div className="text-green-400 text-xs mt-1">{cta.score}%</div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Images */}
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Images</h2>
                  <button 
                    onClick={() => regenerateSection('images')}
                    disabled={generatingSection === 'images'}
                    className="text-sm text-green-400 hover:text-green-300 flex items-center gap-2 disabled:opacity-50 transition-colors"
                  >
                    {generatingSection === 'images' ? (
                      <>
                        <div className="w-3 h-3 border border-green-400 border-t-transparent rounded-full animate-spin"></div>
                        Generating...
                      </>
                    ) : (
                      <>🔄 Regenerate</>
                    )}
                  </button>
                </div>
                
                <div className="space-y-3">
                  {creativeOptions.images.length === 0 && !isGenerating ? (
                    <div className="text-center py-8 text-slate-400">
                      <div className="text-2xl mb-2">🖼️</div>
                      <p className="text-sm">No images generated yet</p>
                      <button
                        onClick={() => regenerateSection('images')}
                        className="mt-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium hover:bg-green-500/30 transition-colors"
                      >
                        Generate Images
                      </button>
                    </div>
                  ) : (
                    creativeOptions.images.map((image) => (
                      <div 
                        key={image.id}
                        onClick={() => selectCreative('image', image)}
                        className={`relative rounded-lg overflow-hidden border-2 cursor-pointer transition-all group ${
                          image.isSelected ? 'border-green-500' : 'border-slate-600 hover:border-slate-500'
                        }`}
                      >
                        <img 
                          src={image.imageUrl} 
                          alt={image.content} 
                          className="w-full h-24 object-cover" 
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute bottom-2 left-2 right-2">
                          <div className="text-xs text-white font-medium">{image.content}</div>
                          <div className="text-xs text-green-400">Score: {image.score}%</div>
                        </div>
                        {image.isSelected && (
                          <div className="absolute top-2 right-2 bg-green-500 text-slate-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                            ✓
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ad Preview */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h3 className="text-lg font-semibold mb-4">Live Preview</h3>
              <div className="bg-white rounded-lg p-4 text-black">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    YB
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Your Business</div>
                    <div className="text-xs text-gray-500">Sponsored</div>
                  </div>
                </div>
                
                {selectedCreatives.image ? (
                  <img 
                    src={selectedCreatives.image.imageUrl} 
                    alt="Preview" 
                    className="w-full h-32 object-cover rounded mb-3" 
                  />
                ) : (
                  <div className="w-full h-32 bg-gray-200 rounded mb-3 flex items-center justify-center text-gray-400">
                    <span>No image selected</span>
                  </div>
                )}
                
                {selectedCreatives.headline ? (
                  <h4 className="font-semibold text-sm mb-2">{selectedCreatives.headline.content}</h4>
                ) : (
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                )}
                
                {selectedCreatives.description ? (
                  <p className="text-sm text-gray-700 mb-3">{selectedCreatives.description.content}</p>
                ) : (
                  <div className="space-y-1 mb-3">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                )}
                
                {selectedCreatives.cta ? (
                  <button className="bg-blue-500 text-white px-4 py-2 rounded text-sm font-medium w-full">
                    {selectedCreatives.cta.content}
                  </button>
                ) : (
                  <div className="h-8 bg-gray-200 rounded w-full"></div>
                )}
                
                {!isComplete && (
                  <div className="text-center py-4 text-gray-400 absolute inset-0 bg-white/90 flex items-center justify-center rounded">
                    <div>
                      <div className="text-2xl mb-2">👁️</div>
                      <p className="text-sm">Select creative elements to see preview</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Selection Summary */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h3 className="text-lg font-semibold mb-4">Selection Summary</h3>
              <div className="space-y-3 text-sm">
                {Object.entries(selectedCreatives).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-slate-400 capitalize">{key}:</span>
                    <span className={`flex items-center gap-1 ${value ? 'text-green-400' : 'text-slate-500'}`}>
                      {value ? (
                        <>
                          <span>✓ Selected</span>
                          <span className="text-xs bg-green-500/20 px-2 py-0.5 rounded">{value.score}%</span>
                        </>
                      ) : (
                        'Not selected'
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* AI Insights */}
            {isComplete && (
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <h3 className="text-lg font-semibold mb-4">AI Insights</h3>
                <div className="text-sm text-slate-400 leading-relaxed space-y-2">
                  <div className="text-green-400">✓ Excellent creative combination!</div>
                  <div>• High-scoring elements selected</div>
                  <div>• Strong emotional appeal</div>
                  <div>• Clear value proposition</div>
                  <div>• Compelling call-to-action</div>
                  <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded text-green-400">
                    Average Score: {Math.round(Object.values(selectedCreatives).reduce((sum, item) => sum + (item?.score || 0), 0) / Object.values(selectedCreatives).filter(Boolean).length)}%
                  </div>
                </div>
              </div>
            )}

            {/* Generation Status */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h3 className="text-lg font-semibold mb-4">Generation Status</h3>
              <div className="space-y-3 text-sm">
                {['headlines', 'descriptions', 'ctas', 'images'].map((section) => (
                  <div key={section} className="flex justify-between items-center">
                    <span className="text-slate-400 capitalize">{section}:</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      (creativeOptions as any)[section].length > 0 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-slate-600 text-slate-400'
                    }`}>
                      {(creativeOptions as any)[section].length > 0 ? 'Generated' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Proceed Button */}
        <div className="mt-12 text-center">
          <button
            onClick={proceedToApproval}
            disabled={!isComplete || isGenerating}
            className={`px-12 py-4 rounded-lg text-lg font-semibold transition-all ${
              isComplete && !isGenerating
                ? 'bg-green-500 hover:bg-green-600 text-slate-900 hover:scale-105 shadow-lg'
                : 'bg-slate-600 text-slate-400 cursor-not-allowed opacity-50'
            }`}
          >
            {isGenerating ? 'Generating...' : 'Proceed to Campaign Approval →'}
          </button>
          <p className="mt-4 text-sm text-slate-500">
            {isComplete ? 'Ready to review and launch your campaign!' : 'Select all creative elements to continue'}
          </p>
        </div>
      </div>
    </div>
  );
}
