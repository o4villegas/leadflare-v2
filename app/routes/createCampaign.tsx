import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

export function meta() {
  return [
    { title: "Create Campaign - LeadFlare" },
    { name: "description", content: "Create a new AI-powered lead generation campaign" },
  ];
}

// TypeScript interfaces
interface CampaignData {
  name: string;
  businessType: string;
  description: string;
  ageMin: number;
  ageMax: number;
  gender: 'all' | 'male' | 'female';
  locations: string[];
  interests: string[];
  behaviors: string[];
  placements: string[];
  bidStrategy: string;
  optimizationGoal: string;
  formFields: string[];
  privacyPolicyUrl: string;
  thankYouMessage: string;
}

interface Template {
  name: string;
  businessType: string;
  description: string;
  ageMin: number;
  ageMax: number;
  gender: 'all' | 'male' | 'female';
  locations: string[];
  interests: string[];
  behaviors: string[];
  placements: string[];
  bidStrategy: string;
  optimizationGoal: string;
  formFields: string[];
  thankYouMessage: string;
}

interface BusinessSuggestion {
  interests: string[];
  locations: string[];
  behaviors: string[];
  recommendedBudget: number; // Keep for reference but don't set
}

// Templates data
const templates: Record<string, Template> = {
  saas: {
    name: 'SaaS Lead Generation Campaign',
    businessType: 'Technology',
    description: 'Generate high-quality leads for our software solution targeting business professionals and decision makers.',
    ageMin: 25,
    ageMax: 55,
    gender: 'all',
    locations: ['United States', 'Canada'],
    interests: ['Technology', 'Software', 'Business tools', 'Productivity', 'Cloud computing'],
    behaviors: ['Small business owners', 'Technology early adopters'],
    placements: ['facebook_feeds', 'instagram_feeds'],
    bidStrategy: 'LOWEST_COST_WITHOUT_CAP',
    optimizationGoal: 'LEAD_GENERATION',
    formFields: ['email', 'full_name', 'company_name'],
    thankYouMessage: 'Thank you for your interest in our software solution! Our team will contact you within 24 hours.'
  },
  realestate: {
    name: 'Real Estate Lead Generation',
    businessType: 'Real Estate',
    description: 'Connect with potential home buyers and sellers in our local market area.',
    ageMin: 25,
    ageMax: 65,
    gender: 'all',
    locations: ['Local area'],
    interests: ['Real estate', 'Home buying', 'Property investment', 'Moving'],
    behaviors: ['Frequent travelers'],
    placements: ['facebook_feeds', 'instagram_feeds', 'facebook_marketplace'],
    bidStrategy: 'LOWEST_COST_WITHOUT_CAP',
    optimizationGoal: 'LEAD_GENERATION',
    formFields: ['email', 'full_name', 'phone_number'],
    thankYouMessage: 'Thank you for your interest! A local real estate expert will contact you soon.'
  },
  healthcare: {
    name: 'Healthcare Services Campaign',
    businessType: 'Healthcare',
    description: 'Attract patients seeking quality healthcare and wellness services in our area.',
    ageMin: 25,
    ageMax: 65,
    gender: 'all',
    locations: ['Local area'],
    interests: ['Health and wellness', 'Healthcare', 'Medical services', 'Fitness'],
    behaviors: [],
    placements: ['facebook_feeds', 'instagram_feeds'],
    bidStrategy: 'LOWEST_COST_WITHOUT_CAP',
    optimizationGoal: 'LEAD_GENERATION',
    formFields: ['email', 'full_name', 'phone_number'],
    thankYouMessage: 'Thank you for choosing our healthcare services! We will contact you to schedule your appointment.'
  }
};

// Business suggestions
const businessSuggestions: Record<string, BusinessSuggestion> = {
  'Technology': {
    interests: ['Technology', 'Software', 'Cloud Computing', 'Artificial Intelligence', 'Digital Marketing'],
    recommendedBudget: 75,
    locations: ['United States', 'San Francisco', 'Seattle', 'Austin', 'New York'],
    behaviors: ['Technology early adopters', 'Small business owners']
  },
  'Healthcare': {
    interests: ['Health and wellness', 'Healthcare', 'Medical services', 'Fitness', 'Nutrition'],
    recommendedBudget: 60,
    locations: ['United States'],
    behaviors: []
  },
  'Real Estate': {
    interests: ['Real estate', 'Home buying', 'Investment', 'Property management'],
    recommendedBudget: 50,
    locations: ['Local area'],
    behaviors: ['Home buyers', 'Real estate investors']
  },
  'Finance': {
    interests: ['Finance', 'Investment', 'Banking', 'Insurance', 'Financial planning'],
    recommendedBudget: 80,
    locations: ['United States'],
    behaviors: ['Small business owners', 'Frequent travelers']
  },
  'Education': {
    interests: ['Education', 'Online learning', 'Professional development', 'Skill building'],
    recommendedBudget: 45,
    locations: ['United States'],
    behaviors: []
  }
};

export default function CreateCampaign() {
  const navigate = useNavigate();
  const [showTemplates, setShowTemplates] = useState(true);
  const [campaignData, setCampaignData] = useState<CampaignData>({
    name: '',
    businessType: '',
    description: '',
    ageMin: 18,
    ageMax: 65,
    gender: 'all',
    locations: [],
    interests: [],
    behaviors: [],
    placements: ['facebook_feeds', 'instagram_feeds'],
    bidStrategy: 'LOWEST_COST_WITHOUT_CAP',
    optimizationGoal: 'LEAD_GENERATION',
    formFields: ['email', 'full_name', 'phone_number'],
    privacyPolicyUrl: '',
    thankYouMessage: "Thank you for your interest! We'll be in touch soon."
  });

  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [audienceSize, setAudienceSize] = useState('2.3M people');
  const [weeklyReach, setWeeklyReach] = useState('450K - 780K');

  // Update campaign data
  const updateField = (field: keyof CampaignData, value: any) => {
    setCampaignData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: false }));
  };

  // Apply template
  const applyTemplate = (templateKey: string) => {
    const template = templates[templateKey];
    if (!template) return;

    setCampaignData(prev => ({
      ...prev,
      ...template,
      locations: [...template.locations],
      interests: [...template.interests],
      behaviors: [...template.behaviors],
      placements: [...template.placements],
      formFields: [...template.formFields]
    }));

    setShowTemplates(false);
  };

  // Get recommended budget for display
  const getRecommendedBudget = (businessType: string) => {
    return businessSuggestions[businessType]?.recommendedBudget || 50;
  };

  // Add/remove location
  const addLocation = (location: string) => {
    if (location && !campaignData.locations.includes(location)) {
      updateField('locations', [...campaignData.locations, location]);
    }
  };

  const removeLocation = (index: number) => {
    const newLocations = campaignData.locations.filter((_, i) => i !== index);
    updateField('locations', newLocations);
  };

  // Add/remove interest
  const addInterest = (interest: string) => {
    if (interest && !campaignData.interests.includes(interest)) {
      updateField('interests', [...campaignData.interests, interest]);
    }
  };

  const removeInterest = (index: number) => {
    const newInterests = campaignData.interests.filter((_, i) => i !== index);
    updateField('interests', newInterests);
  };

  // Update behavior
  const updateBehavior = (behavior: string, checked: boolean) => {
    if (checked && !campaignData.behaviors.includes(behavior)) {
      updateField('behaviors', [...campaignData.behaviors, behavior]);
    } else if (!checked) {
      const newBehaviors = campaignData.behaviors.filter(b => b !== behavior);
      updateField('behaviors', newBehaviors);
    }
  };

  // Update placement
  const updatePlacement = (placement: string, checked: boolean) => {
    if (checked && !campaignData.placements.includes(placement)) {
      updateField('placements', [...campaignData.placements, placement]);
    } else if (!checked) {
      const newPlacements = campaignData.placements.filter(p => p !== placement);
      updateField('placements', newPlacements);
    }
  };

  // Update form field
  const updateFormField = (field: string, checked: boolean) => {
    if (checked && !campaignData.formFields.includes(field)) {
      updateField('formFields', [...campaignData.formFields, field]);
    } else if (!checked) {
      const newFields = campaignData.formFields.filter(f => f !== field);
      updateField('formFields', newFields);
    }
  };

  // Calculate audience estimate using default budget for calculation
  const calculateAudienceEstimate = () => {
    let baseAudience = 5000000;
    const ageRange = campaignData.ageMax - campaignData.ageMin;
    baseAudience *= (ageRange / 52);
    
    if (campaignData.gender !== 'all') baseAudience *= 0.5;
    if (campaignData.locations.length > 0) baseAudience *= Math.min(campaignData.locations.length * 0.3, 1);
    if (campaignData.interests.length > 0) baseAudience *= Math.max(0.1, 1 - (campaignData.interests.length * 0.15));
    if (campaignData.behaviors.length > 0) baseAudience *= Math.max(0.05, 1 - (campaignData.behaviors.length * 0.2));
    
    const audienceSize = Math.max(50000, Math.floor(baseAudience));
    const formatted = audienceSize > 1000000 ? 
      `${(audienceSize / 1000000).toFixed(1)}M people` : 
      `${Math.floor(audienceSize / 1000)}K people`;
    
    setAudienceSize(formatted);
    
    const weeklyMin = Math.floor(audienceSize * 0.1 / 1000);
    const weeklyMax = Math.floor(audienceSize * 0.3 / 1000);
    setWeeklyReach(`${weeklyMin}K - ${weeklyMax}K`);
  };

  // Update audience estimate when targeting changes
  useEffect(() => {
    calculateAudienceEstimate();
  }, [campaignData.ageMin, campaignData.ageMax, campaignData.gender, campaignData.locations, campaignData.interests, campaignData.behaviors]);

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, boolean> = {};
    
    if (!campaignData.name) newErrors.name = true;
    if (!campaignData.businessType) newErrors.businessType = true;
    if (!campaignData.description) newErrors.description = true;
    if (campaignData.locations.length === 0) newErrors.locations = true;
    if (!campaignData.privacyPolicyUrl) newErrors.privacyPolicyUrl = true;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check if form is complete
  const isFormComplete = () => {
    return campaignData.name && 
           campaignData.businessType && 
           campaignData.description && 
           campaignData.locations.length > 0 &&
           campaignData.privacyPolicyUrl;
  };

  // Proceed to creative generation
  const proceedToCreative = () => {
    if (validateForm()) {
      console.log('Campaign data:', campaignData);
      navigate('/generateCreative', { 
        state: { 
          campaignData: campaignData,
          recommendedBudget: getRecommendedBudget(campaignData.businessType)
        }
      });
    }
  };

  // Go back to home
  const goBack = () => {
    navigate('/');
  };

  return (
    <div className="bg-slate-900 text-white min-h-screen">
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-slate-900/80 backdrop-blur-sm px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-24">
          <div className="flex items-center">
            <div className="w-20 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center font-bold text-slate-900 text-lg">
              LOGO
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-slate-400 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Save Draft
            </button>
            <button 
              onClick={goBack}
              className="bg-green-500 hover:bg-green-600 text-slate-900 px-6 py-2 rounded-md text-sm font-semibold transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Create New Campaign</h1>
          <p className="text-slate-300">Configure your audience targeting and lead capture settings. Budget will be set in the next steps.</p>
        </div>

        {/* Quick Start Templates */}
        {showTemplates && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Quick Start Templates</h2>
              <button 
                onClick={() => setShowTemplates(false)}
                className="text-sm text-green-400 hover:text-green-300"
              >
                Hide Templates
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div 
                className="template-card border-2 border-slate-600 rounded-lg p-4 cursor-pointer hover:border-green-500 transition-colors"
                onClick={() => applyTemplate('saas')}
              >
                <h3 className="font-semibold mb-2">SaaS Lead Generation</h3>
                <p className="text-sm text-slate-400 mb-3">Target business professionals interested in software solutions</p>
                <div className="flex flex-wrap gap-1">
                  <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs">Technology</span>
                  <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs">Rec: $75/day</span>
                  <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs">Business Tools</span>
                </div>
              </div>
              
              <div 
                className="template-card border-2 border-slate-600 rounded-lg p-4 cursor-pointer hover:border-green-500 transition-colors"
                onClick={() => applyTemplate('realestate')}
              >
                <h3 className="font-semibold mb-2">Real Estate Leads</h3>
                <p className="text-sm text-slate-400 mb-3">Attract potential home buyers and sellers in your area</p>
                <div className="flex flex-wrap gap-1">
                  <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs">Real Estate</span>
                  <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs">Rec: $50/day</span>
                  <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs">Local Targeting</span>
                </div>
              </div>
              
              <div 
                className="template-card border-2 border-slate-600 rounded-lg p-4 cursor-pointer hover:border-green-500 transition-colors"
                onClick={() => applyTemplate('healthcare')}
              >
                <h3 className="font-semibold mb-2">Healthcare Services</h3>
                <p className="text-sm text-slate-400 mb-3">Connect with patients seeking medical and wellness services</p>
                <div className="flex flex-wrap gap-1">
                  <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs">Healthcare</span>
                  <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs">Rec: $60/day</span>
                  <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs">Health & Wellness</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Campaign Basics */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h2 className="text-xl font-semibold mb-6">Campaign Basics</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Campaign Name</label>
                  <input
                    type="text"
                    value={campaignData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:border-green-500 focus:outline-none"
                    placeholder="Enter campaign name"
                    maxLength={60}
                  />
                  {errors.name && <p className="text-red-400 text-sm mt-1">Campaign name is required</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Business Type</label>
                  <select
                    value={campaignData.businessType}
                    onChange={(e) => updateField('businessType', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:border-green-500 focus:outline-none"
                  >
                    <option value="">Select business type</option>
                    <option value="Technology">Technology</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Finance">Finance</option>
                    <option value="Education">Education</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Retail">Retail</option>
                    <option value="Professional Services">Professional Services</option>
                    <option value="Food & Beverage">Food & Beverage</option>
                    <option value="Fitness & Wellness">Fitness & Wellness</option>
                    <option value="Legal Services">Legal Services</option>
                  </select>
                  {errors.businessType && <p className="text-red-400 text-sm mt-1">Business type is required</p>}
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium mb-2">Campaign Description</label>
                <textarea
                  value={campaignData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:border-green-500 focus:outline-none resize-vertical"
                  placeholder="Describe your campaign goals and target outcome..."
                  maxLength={300}
                />
                {errors.description && <p className="text-red-400 text-sm mt-1">Campaign description is required</p>}
              </div>

              {/* Budget Recommendation */}
              {campaignData.businessType && (
                <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">💡</span>
                    <span className="text-sm text-green-400">
                      Recommended budget for {campaignData.businessType}: <strong>${getRecommendedBudget(campaignData.businessType)}/day</strong>
                    </span>
                  </div>
                  <p className="text-xs text-green-400 mt-1 ml-6">Budget will be finalized in the approval step</p>
                </div>
              )}
            </div>

            {/* Audience Targeting */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h2 className="text-xl font-semibold mb-6">Audience Targeting</h2>
              
              {/* Demographics */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-4">Demographics</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Age Range</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="number"
                        value={campaignData.ageMin}
                        onChange={(e) => updateField('ageMin', parseInt(e.target.value) || 18)}
                        min="13"
                        max="65"
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:border-green-500 focus:outline-none"
                      />
                      <span className="text-slate-400">to</span>
                      <input
                        type="number"
                        value={campaignData.ageMax}
                        onChange={(e) => updateField('ageMax', parseInt(e.target.value) || 65)}
                        min="13"
                        max="65"
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:border-green-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Gender</label>
                    <select
                      value={campaignData.gender}
                      onChange={(e) => updateField('gender', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:border-green-500 focus:outline-none"
                    >
                      <option value="all">All</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Locations</label>
                    <input
                      type="text"
                      placeholder="Add location (press Enter)"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value) {
                          addLocation(e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:border-green-500 focus:outline-none"
                    />
                    {errors.locations && <p className="text-red-400 text-sm mt-1">At least one location is required</p>}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {campaignData.locations.map((location, index) => (
                        <span key={index} className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-sm flex items-center gap-1">
                          {location}
                          <button 
                            onClick={() => removeLocation(index)}
                            className="text-green-400 hover:text-green-300"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Interests */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-4">Interests</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Add Interest</label>
                    <input
                      type="text"
                      placeholder="Type interest (press Enter)"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value) {
                          addInterest(e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:border-green-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Quick Add</label>
                    <div className="flex flex-wrap gap-2">
                      {businessSuggestions[campaignData.businessType]?.interests.slice(0, 4).map((interest) => (
                        <button
                          key={interest}
                          onClick={() => addInterest(interest)}
                          className="bg-slate-700 hover:bg-slate-600 text-white text-xs px-3 py-2 rounded transition-colors"
                        >
                          + {interest}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {campaignData.interests.map((interest, index) => (
                    <span key={index} className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-sm flex items-center gap-1">
                      {interest}
                      <button 
                        onClick={() => removeInterest(index)}
                        className="text-green-400 hover:text-green-300"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Behaviors */}
              <div>
                <h3 className="text-lg font-medium mb-4">Behaviors</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['Small business owners', 'Frequent travelers', 'Online shoppers', 'Technology early adopters'].map((behavior) => (
                    <label key={behavior} className="flex items-center">
                      <input 
                        type="checkbox" 
                        checked={campaignData.behaviors.includes(behavior)}
                        onChange={(e) => updateBehavior(behavior, e.target.checked)}
                        className="mr-3 accent-green-500" 
                      />
                      <span className="text-sm">{behavior}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Placements & Optimization */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h2 className="text-xl font-semibold mb-6">Placements & Optimization</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Ad Placements</h3>
                  <div className="space-y-3">
                    {[
                      { key: 'facebook_feeds', label: 'Facebook Feeds' },
                      { key: 'instagram_feeds', label: 'Instagram Feeds' },
                      { key: 'facebook_marketplace', label: 'Facebook Marketplace' },
                      { key: 'instagram_stories', label: 'Instagram Stories' }
                    ].map((placement) => (
                      <label key={placement.key} className="flex items-center">
                        <input 
                          type="checkbox" 
                          checked={campaignData.placements.includes(placement.key)}
                          onChange={(e) => updatePlacement(placement.key, e.target.checked)}
                          className="mr-3 accent-green-500" 
                        />
                        <span className="text-sm">{placement.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Bid Strategy</label>
                    <select
                      value={campaignData.bidStrategy}
                      onChange={(e) => updateField('bidStrategy', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:border-green-500 focus:outline-none"
                    >
                      <option value="LOWEST_COST_WITHOUT_CAP">Lowest Cost</option>
                      <option value="LOWEST_COST_WITH_BID_CAP">Bid Cap</option>
                      <option value="TARGET_COST">Target Cost</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Optimization Goal</label>
                    <select
                      value={campaignData.optimizationGoal}
                      onChange={(e) => updateField('optimizationGoal', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:border-green-500 focus:outline-none"
                    >
                      <option value="LEAD_GENERATION">Lead Generation</option>
                      <option value="CONVERSIONS">Conversions</option>
                      <option value="LINK_CLICKS">Link Clicks</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Lead Form Configuration */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h2 className="text-xl font-semibold mb-6">Lead Form Configuration</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Form Fields</h3>
                  <div className="space-y-3">
                    <label className="flex items-center text-slate-400">
                      <input type="checkbox" checked disabled className="mr-3 accent-green-500" />
                      <span className="text-sm">Email (Required)</span>
                    </label>
                    {[
                      { key: 'full_name', label: 'Full Name' },
                      { key: 'phone_number', label: 'Phone Number' },
                      { key: 'company_name', label: 'Company Name' },
                      { key: 'message', label: 'Message' }
                    ].map((field) => (
                      <label key={field.key} className="flex items-center">
                        <input 
                          type="checkbox" 
                          checked={campaignData.formFields.includes(field.key)}
                          onChange={(e) => updateFormField(field.key, e.target.checked)}
                          className="mr-3 accent-green-500" 
                        />
                        <span className="text-sm">{field.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Privacy Policy URL</label>
                    <input
                      type="url"
                      value={campaignData.privacyPolicyUrl}
                      onChange={(e) => updateField('privacyPolicyUrl', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:border-green-500 focus:outline-none"
                      placeholder="https://yoursite.com/privacy"
                    />
                    {errors.privacyPolicyUrl && <p className="text-red-400 text-sm mt-1">Privacy policy URL is required</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Thank You Message</label>
                    <textarea
                      value={campaignData.thankYouMessage}
                      onChange={(e) => updateField('thankYouMessage', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:border-green-500 focus:outline-none resize-vertical"
                      maxLength={150}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Audience Insights */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h3 className="text-lg font-semibold mb-4">Audience Insights</h3>
              
              <div className="mb-4">
                <div className="text-sm text-slate-400 mb-1">Estimated Audience Size</div>
                <div className="text-2xl font-semibold text-green-400">{audienceSize}</div>
              </div>
              
              <div className="mb-4">
                <div className="text-sm text-slate-400 mb-1">Potential Weekly Reach</div>
                <div className="text-lg font-medium text-slate-300">{weeklyReach}</div>
              </div>
              
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-sm text-green-400">
                ✓ Optimal audience size for lead generation
              </div>
            </div>
            
            {/* Campaign Summary */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h3 className="text-lg font-semibold mb-4">Campaign Summary</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Business Type:</span>
                  <span className="text-slate-300">{campaignData.businessType || 'Not selected'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Recommended Budget:</span>
                  <span className="text-slate-300">
                    {campaignData.businessType ? `$${getRecommendedBudget(campaignData.businessType)}/day` : 'Select business type'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Locations:</span>
                  <span className="text-slate-300">{campaignData.locations.length} selected</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Interests:</span>
                  <span className="text-slate-300">{campaignData.interests.length} selected</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Form Fields:</span>
                  <span className="text-slate-300">{campaignData.formFields.length} fields</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Placements:</span>
                  <span className="text-slate-300">{campaignData.placements.length} platforms</span>
                </div>
              </div>
            </div>
            
            {/* Optimization Tips */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h3 className="text-lg font-semibold mb-4">Next Steps</h3>
              <div className="text-sm text-slate-400 leading-relaxed">
                {isFormComplete() ? (
                  <div className="space-y-2">
                    <div className="text-green-400">✓ Targeting configuration complete!</div>
                    <div>• Generate AI-powered creatives</div>
                    <div>• Review performance projections</div>
                    <div>• Set final budget and launch</div>
                  </div>
                ) : (
                  'Complete your targeting details to proceed to creative generation.'
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Proceed Button */}
        <div className="mt-12 text-center">
          <button
            onClick={proceedToCreative}
            disabled={!isFormComplete()}
            className={`px-12 py-4 rounded-lg text-lg font-semibold transition-all ${
              isFormComplete()
                ? 'bg-green-500 hover:bg-green-600 text-slate-900 hover:scale-105 shadow-lg'
                : 'bg-slate-600 text-slate-400 cursor-not-allowed opacity-50'
            }`}
          >
            Proceed to Creative Generation →
          </button>
          <p className="mt-2 text-sm text-slate-500">
            {isFormComplete() ? 'Ready to create amazing ad content!' : 'Complete all required fields to continue'}
          </p>
        </div>
      </div>
    </div>
  );
}
