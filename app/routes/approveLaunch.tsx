import React, { useState } from 'react';
import type { Route } from "./+types/approveLaunch";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Campaign Budget & Launch - LeadFlare" },
    { name: "description", content: "Configure your budget settings and launch to Meta Ads Manager" },
  ];
}

export default function ApproveLaunch({ navigate, location }: Route.ComponentProps) {
  // Get data from previous route (generateCreative)
  const { campaignData: initialCampaignData, creatives, selectedCreatives } = location?.state || {};

  // Campaign data - budget entered for first time
  const [campaignData, setCampaignData] = useState({
    name: initialCampaignData?.name || "SaaS Lead Generation Campaign",
    businessType: initialCampaignData?.businessType || "Technology",
    description: initialCampaignData?.description || "Generate high-quality leads for our software solution targeting business professionals and decision makers.",
    budget: 0, // First-time entry
    budgetType: "daily", // DAILY_BUDGET or LIFETIME_BUDGET in Meta API
    currency: "USD",
    ageMin: initialCampaignData?.ageMin || 25,
    ageMax: initialCampaignData?.ageMax || 55,
    locations: initialCampaignData?.locations || ["United States", "Canada"],
    interests: initialCampaignData?.interests || ["Technology", "Software", "Business tools", "Productivity"],
    placements: initialCampaignData?.placements || ["facebook_feeds", "instagram_feeds", "facebook_marketplace"],
    bidStrategy: "LOWEST_COST_WITHOUT_CAP",
    optimizationGoal: "LEAD_GENERATION"
  });

  const [selectedCreativesState] = useState(selectedCreatives || {
    headline: { content: "Transform Your Business Operations with AI", score: 94 },
    description: { content: "Streamline workflows with intelligent automation. Built for modern teams that need results fast.", score: 89 },
    cta: { content: "Start Free Trial", score: 96 },
    image: { imageUrl: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=250&fit=crop", content: "Team collaboration" }
  });

  // Advanced settings state
  const [budgetAllocation, setBudgetAllocation] = useState({
    facebook_feeds: 50,
    instagram_feeds: 30,
    facebook_marketplace: 20,
    instagram_stories: 0
  });

  // Recommended allocation based on business type
  const getRecommendedAllocation = () => {
    const recommendations = {
      'Technology': {
        facebook_feeds: 45,
        instagram_feeds: 35,
        facebook_marketplace: 20,
        instagram_stories: 0
      },
      'Real Estate': {
        facebook_feeds: 40,
        instagram_feeds: 25,
        facebook_marketplace: 35,
        instagram_stories: 0
      },
      'Healthcare': {
        facebook_feeds: 55,
        instagram_feeds: 30,
        facebook_marketplace: 15,
        instagram_stories: 0
      },
      'Finance': {
        facebook_feeds: 50,
        instagram_feeds: 25,
        facebook_marketplace: 25,
        instagram_stories: 0
      }
    };
    return recommendations[campaignData.businessType as keyof typeof recommendations] || recommendations.Technology;
  };

  const [schedule, setSchedule] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    dayparting: {
      enabled: false,
      hours: { start: 9, end: 17 }
    }
  });

  const [bidSettings, setBidSettings] = useState({
    strategy: "LOWEST_COST_WITHOUT_CAP", // Meta API bid_strategy
    optimization: "LEAD_GENERATION", // Meta API optimization_goal
    bidCap: null, // Meta API bid_amount when using bid cap
    targetCost: null, // Meta API cost_per_action_type for TARGET_COST
    pacing: "STANDARD", // Meta API pacing_type: STANDARD or ACCELERATED
    attributionSpec: "7_day_click_1_day_view", // Meta API attribution_spec
    campaignSpendingLimit: null, // Meta API spend_cap
    accountSpendingLimit: null // Account-level spend cap (read-only typically)
  });

  // Launch state
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchStep, setLaunchStep] = useState(0);
  const [currentPreview, setCurrentPreview] = useState('facebook_feed');

  // Helper functions - defined early to avoid initialization errors
  // Calculate total allocation percentage
  const getTotalAllocation = () => {
    return Object.values(budgetAllocation).reduce((sum, val) => sum + val, 0);
  };

  // Calculate remaining allocation
  const getRemainingAllocation = () => {
    return Math.max(0, 100 - getTotalAllocation());
  };

  // Reset to recommended allocation
  const resetToRecommended = () => {
    const recommended = getRecommendedAllocation();
    setBudgetAllocation(recommended);
  };

  // Update budget allocation with auto-adjustment
  const updateAllocation = (placement: string, newValue: number) => {
    setBudgetAllocation(prev => {
      const otherPlacements = Object.keys(prev).filter(p => p !== placement);
      const newTotal = newValue + otherPlacements.reduce((sum, p) => sum + prev[p as keyof typeof prev], 0);
      
      // If new total exceeds 100%, proportionally reduce other placements
      if (newTotal > 100) {
        const excess = newTotal - 100;
        const otherTotal = otherPlacements.reduce((sum, p) => sum + prev[p as keyof typeof prev], 0);
        
        if (otherTotal > 0) {
          const adjustedAllocations = { ...prev, [placement]: newValue };
          
          // Proportionally reduce other placements
          otherPlacements.forEach(p => {
            const reduction = (prev[p as keyof typeof prev] / otherTotal) * excess;
            (adjustedAllocations as any)[p] = Math.max(0, prev[p as keyof typeof prev] - reduction);
          });
          
          return adjustedAllocations;
        }
      }
      
      return { ...prev, [placement]: newValue };
    });
  };

  // Calculate daily budget for placement
  const getPlacementBudget = (placement: string) => {
    return (campaignData.budget * budgetAllocation[placement as keyof typeof budgetAllocation] / 100).toFixed(2);
  };

  // Meta API minimum budget validation
  const getMinimumBudget = () => {
    // Meta API minimum daily budgets by optimization goal
    const minimums: Record<string, number> = {
      'LEAD_GENERATION': 5.00,
      'CONVERSIONS': 5.00,
      'LINK_CLICKS': 1.00,
      'LANDING_PAGE_VIEWS': 1.00,
      'PAGE_LIKES': 1.00,
      'POST_ENGAGEMENT': 1.00,
      'VIDEO_VIEWS': 1.00,
      'REACH': 1.00,
      'IMPRESSIONS': 1.00
    };
    return minimums[bidSettings.optimization] || 5.00;
  };

  // Validate budget against Meta requirements
  const validateBudget = () => {
    const minBudget = getMinimumBudget();
    const errors: string[] = [];
    
    if (campaignData.budget < minBudget) {
      errors.push(`Minimum ${campaignData.budgetType} budget for ${bidSettings.optimization} is $${minBudget}`);
    }
    
    if (campaignData.budgetType === 'lifetime' && campaignData.budget < minBudget * 7) {
      errors.push(`Lifetime budget should be at least $${(minBudget * 7).toFixed(2)} (7x daily minimum)`);
    }
    
    return errors;
  };

  // Performance projections - calculated dynamically based on budget
  const calculateProjections = () => {
    const dailyBudget = campaignData.budget;
    
    if (dailyBudget === 0) {
      return {
        estimatedReach: "Enter budget to see projections",
        costPerLead: "Enter budget to see projections", 
        dailyLeads: "Enter budget to see projections",
        weeklyBudget: 0
      };
    }
    
    const weeklyBudget = campaignData.budgetType === 'daily' ? dailyBudget * 7 : dailyBudget;
    const effectiveDailyBudget = campaignData.budgetType === 'daily' ? dailyBudget : dailyBudget / 7;
    
    // Base calculations on effective daily budget (realistic industry averages)
    const baseCPL = bidSettings.optimization === 'LEAD_GENERATION' ? 10 : 
                   bidSettings.optimization === 'CONVERSIONS' ? 15 :
                   bidSettings.optimization === 'LINK_CLICKS' ? 2 : 8;
    
    const estimatedCPL = effectiveDailyBudget < 25 ? baseCPL * 1.5 : 
                        effectiveDailyBudget < 50 ? baseCPL * 1.2 : 
                        effectiveDailyBudget < 100 ? baseCPL : baseCPL * 0.8;
    
    const dailyLeads = Math.floor(effectiveDailyBudget / estimatedCPL);
    const reachMultiplier = effectiveDailyBudget < 25 ? 200 : 
                           effectiveDailyBudget < 50 ? 300 : 
                           effectiveDailyBudget < 100 ? 350 : 400;
    
    const minReach = Math.floor(effectiveDailyBudget * reachMultiplier);
    const maxReach = Math.floor(minReach * 1.6);
    
    return {
      estimatedReach: `${(minReach / 1000).toFixed(0)}K - ${(maxReach / 1000).toFixed(0)}K`,
      costPerLead: `$${(estimatedCPL * 0.8).toFixed(2)} - $${(estimatedCPL * 1.2).toFixed(2)}`,
      dailyLeads: `${Math.max(1, dailyLeads - 1)} - ${dailyLeads + 2}`,
      weeklyBudget: weeklyBudget
    };
  };

  // Launch campaign
  const launchCampaign = async () => {
    setIsLaunching(true);
    setLaunchStep(0);

    const steps = [
      { delay: 1000, step: 1, message: "Creating Meta campaign..." },
      { delay: 2000, step: 2, message: "Configuring ad sets..." },
      { delay: 3000, step: 3, message: "Uploading creatives..." },
      { delay: 4000, step: 4, message: "Setting targeting parameters..." },
      { delay: 5000, step: 5, message: "Activating campaign..." }
    ];

    for (const { delay, step, message } of steps) {
      setTimeout(() => {
        setLaunchStep(step);
        if (step === 5) {
          setTimeout(() => {
            setIsLaunching(false);
            // Navigate to campaign manager
            navigate('/campaignManager');
          }, 1000);
        }
      }, delay);
    }
  };

  // Navigation handlers
  const handleBackToCreative = () => {
    navigate('/generateCreative', { 
      state: { 
        campaignData: initialCampaignData, 
        selectedCreatives: selectedCreativesState 
      }
    });
  };

  const handleSaveDraft = () => {
    // Save draft logic here
    console.log('Saving draft...', {
      campaignData,
      selectedCreatives: selectedCreativesState,
      budgetAllocation,
      schedule,
      bidSettings
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

  const navigateToGenerateCreative = () => {
    navigate('/generateCreative');
  };

  // Calculate projections and validation - moved after all function definitions
  const projections = calculateProjections();
  const budgetErrors = validateBudget();
  const minBudget = getMinimumBudget();
  const totalAllocation = getTotalAllocation();
  const isAllocationValid = Math.abs(totalAllocation - 100) < 0.1; // Allow tiny rounding errors
  
  // Check if campaign is ready to launch
  const canLaunch = !isLaunching && 
                   budgetErrors.length === 0 && 
                   campaignData.budget > 0 && 
                   isAllocationValid;

  // Placement preview options
  const previewOptions = [
    { key: 'facebook_feed', label: 'Facebook Feed', icon: '📘' },
    { key: 'instagram_feed', label: 'Instagram Feed', icon: '📷' },
    { key: 'facebook_marketplace', label: 'Marketplace', icon: '🛒' },
    { key: 'instagram_stories', label: 'IG Stories', icon: '📖' }
  ];

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
            <button 
              onClick={navigateToGenerateCreative}
              className="text-slate-300 hover:text-white font-medium transition-colors"
            >
              Generate Creative
            </button>
            <button className="text-white font-semibold bg-green-500/20 px-4 py-2 rounded-lg">
              Approve & Launch
            </button>
          </nav>

          <div className="flex items-center gap-4">
            <button 
              onClick={handleSaveDraft}
              className="text-slate-400 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Save Draft
            </button>
            <button 
              onClick={handleBackToCreative}
              className="bg-green-500 hover:bg-green-600 text-slate-900 px-6 py-2 rounded-md text-sm font-semibold transition-colors"
            >
              Back to Creative
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Campaign Budget & Launch</h1>
          <p className="text-slate-300">Configure your budget settings and launch to Meta Ads Manager</p>
          <div className="mt-4 p-4 bg-slate-800 rounded-lg border border-slate-700">
            <div className="text-sm text-slate-400">Campaign: <span className="text-white">{campaignData.name}</span></div>
            <div className="text-sm text-slate-400">
              Status: <span className="text-yellow-400">Budget Configuration Required</span>
              {campaignData.budget > 0 && (
                <span className="ml-4">
                  Total Budget: <span className="text-white">${campaignData.budget}/{campaignData.budgetType}</span>
                  {campaignData.budgetType === 'daily' && (
                    <span className="text-slate-300"> • Estimated Weekly: ${(campaignData.budget * 7).toFixed(0)}</span>
                  )}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Launch Progress */}
        {isLaunching && (
          <div className="mb-8 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-xl p-6 border border-green-500/20">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
              <div>
                <h3 className="text-lg font-semibold text-white">Launching Campaign to Meta</h3>
                <p className="text-green-400 text-sm">Setting up your campaign in Meta Ads Manager...</p>
              </div>
            </div>
            
            <div className="space-y-2">
              {['Validating campaign settings', 'Creating Meta campaign...', 'Configuring ad sets...', 'Uploading creatives...', 'Setting targeting parameters...', 'Activating campaign...'].map((step, index) => (
                <div key={step} className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${index < launchStep ? 'bg-green-400' : index === launchStep ? 'bg-yellow-400 animate-pulse' : 'bg-slate-600'}`}></div>
                  <span className={index <= launchStep ? 'text-white' : 'text-slate-500'}>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* Budget Configuration */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h2 className="text-xl font-semibold mb-6">Budget Configuration</h2>
              
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {campaignData.budgetType === 'daily' ? 'Daily Budget' : 'Lifetime Budget'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">$</span>
                    <input
                      type="number"
                      min={minBudget}
                      max="50000"
                      step="0.01"
                      value={campaignData.budget || ''}
                      onChange={(e) => setCampaignData(prev => ({ ...prev, budget: parseFloat(e.target.value) || 0 }))}
                      className={`w-full pl-8 pr-3 py-3 bg-slate-700 border rounded-md text-white text-lg font-semibold focus:outline-none transition-colors ${
                        budgetErrors.length > 0 ? 'border-red-500 focus:border-red-500' : 'border-slate-600 focus:border-green-500'
                      }`}
                      placeholder="0.00"
                    />
                  </div>
                  {budgetErrors.length > 0 && (
                    <div className="mt-2">
                      {budgetErrors.map((error, index) => (
                        <p key={index} className="text-xs text-red-400">{error}</p>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-slate-400 mt-1">
                    Minimum: ${minBudget}/{campaignData.budgetType} for {bidSettings.optimization}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Budget Type</label>
                  <select
                    value={campaignData.budgetType}
                    onChange={(e) => setCampaignData(prev => ({ ...prev, budgetType: e.target.value }))}
                    className="w-full px-3 py-3 bg-slate-700 border border-slate-600 rounded-md text-white focus:border-green-500 focus:outline-none transition-colors"
                  >
                    <option value="daily">Daily Budget</option>
                    <option value="lifetime">Lifetime Budget</option>
                  </select>
                  <p className="text-xs text-slate-400 mt-1">
                    {campaignData.budgetType === 'daily' ? 'Amount spent per day' : 'Total campaign budget'}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Currency</label>
                  <select
                    value={campaignData.currency}
                    onChange={(e) => setCampaignData(prev => ({ ...prev, currency: e.target.value }))}
                    className="w-full px-3 py-3 bg-slate-700 border border-slate-600 rounded-md text-white focus:border-green-500 focus:outline-none transition-colors"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="AUD">AUD - Australian Dollar</option>
                  </select>
                </div>
              </div>
              
              {/* Campaign Spending Limit */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Campaign Spending Limit (Optional)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={bidSettings.campaignSpendingLimit || ''}
                    onChange={(e) => setBidSettings(prev => ({ ...prev, campaignSpendingLimit: parseFloat(e.target.value) || null }))}
                    className="w-full pl-8 pr-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:border-green-500 focus:outline-none transition-colors"
                    placeholder="No limit"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">Maximum total amount this campaign can spend (Meta API: spend_cap)</p>
              </div>
              
              {campaignData.budget > 0 && (
                <div className="grid grid-cols-3 gap-4 p-4 bg-slate-700/50 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                      ${campaignData.budgetType === 'daily' ? campaignData.budget : (campaignData.budget / 7).toFixed(2)}
                    </div>
                    <div className="text-xs text-slate-400">Per Day</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">
                      ${campaignData.budgetType === 'daily' ? (campaignData.budget * 7).toFixed(0) : campaignData.budget}
                    </div>
                    <div className="text-xs text-slate-400">Per Week</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">
                      ${campaignData.budgetType === 'daily' ? (campaignData.budget * 30.44).toFixed(0) : (campaignData.budget * 4.33).toFixed(0)}
                    </div>
                    <div className="text-xs text-slate-400">Per Month</div>
                  </div>
                </div>
              )}
            </div>

            {/* Budget Allocation Across Placements */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Budget Allocation Across Placements</h2>
                <button
                  onClick={resetToRecommended}
                  className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-500/30 transition-colors"
                >
                  Reset to Recommended
                </button>
              </div>
              
              {/* Allocation Progress Bar */}
              <div className="mb-6 p-4 bg-slate-700/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Total Allocation</span>
                  <span className={`text-lg font-bold ${getTotalAllocation() === 100 ? 'text-green-400' : getTotalAllocation() > 100 ? 'text-red-400' : 'text-yellow-400'}`}>
                    {Math.round(getTotalAllocation())}%
                  </span>
                </div>
                
                <div className="w-full bg-slate-600 rounded-full h-3 mb-2">
                  <div 
                    className={`h-3 rounded-full transition-all duration-300 ${
                      getTotalAllocation() === 100 ? 'bg-green-500' : 
                      getTotalAllocation() > 100 ? 'bg-red-500' : 'bg-yellow-500'
                    }`}
                    style={{ width: `${Math.min(100, getTotalAllocation())}%` }}
                  ></div>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    {getTotalAllocation() === 100 ? '✓ Perfect allocation' :
                     getTotalAllocation() > 100 ? `Over by ${Math.round(getTotalAllocation() - 100)}%` :
                     `Remaining: ${Math.round(getRemainingAllocation())}%`}
                  </span>
                  <span className="text-slate-400">
                    Daily Budget: ${campaignData.budget > 0 ? campaignData.budget.toFixed(2) : '0.00'}
                  </span>
                </div>
              </div>
              
              <div className="grid gap-6">
                {campaignData.placements.map((placement) => {
                  const labels = {
                    facebook_feeds: 'Facebook Feeds',
                    instagram_feeds: 'Instagram Feeds', 
                    facebook_marketplace: 'Facebook Marketplace',
                    instagram_stories: 'Instagram Stories'
                  };
                  
                  return (
                    <div key={placement} className="flex items-center gap-4">
                      <div className="w-32 text-sm font-medium">{labels[placement as keyof typeof labels]}</div>
                      <div className="flex-1">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="1"
                          value={budgetAllocation[placement as keyof typeof budgetAllocation]}
                          onChange={(e) => updateAllocation(placement, parseInt(e.target.value))}
                          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                        />
                      </div>
                      <div className="w-24 text-right">
                        <div className="text-sm font-semibold text-green-400">{Math.round(budgetAllocation[placement as keyof typeof budgetAllocation])}%</div>
                        <div className="text-xs text-slate-400">
                          ${campaignData.budget > 0 ? getPlacementBudget(placement) : '0.00'}/day
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Allocation Summary */}
              <div className="mt-6 p-4 bg-slate-700/50 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Total Allocation:</span>
                    <span className={`ml-2 font-semibold ${
                      getTotalAllocation() === 100 ? 'text-green-400' : 
                      getTotalAllocation() > 100 ? 'text-red-400' : 'text-yellow-400'
                    }`}>
                      {Math.round(getTotalAllocation())}%
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Daily Budget:</span>
                    <span className="ml-2 text-green-400 font-semibold">
                      ${campaignData.budget > 0 ? campaignData.budget.toFixed(2) : '0.00'}
                    </span>
                  </div>
                </div>
                
                {getTotalAllocation() !== 100 && (
                  <div className="mt-3 p-2 rounded border border-yellow-500/20 bg-yellow-500/10">
                    <div className="text-xs text-yellow-400 flex items-center gap-2">
                      <span>⚠️</span>
                      <span>
                        {getTotalAllocation() > 100 
                          ? `Allocation exceeds 100% by ${Math.round(getTotalAllocation() - 100)}%. Adjust sliders to continue.`
                          : `${Math.round(getRemainingAllocation())}% budget unallocated. Allocate all budget for optimal performance.`
                        }
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Advanced Scheduling */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h2 className="text-xl font-semibold mb-6">Campaign Schedule</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Start Date</label>
                  <input
                    type="date"
                    value={schedule.startDate}
                    onChange={(e) => setSchedule(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:border-green-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">End Date (Optional)</label>
                  <input
                    type="date"
                    value={schedule.endDate}
                    onChange={(e) => setSchedule(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:border-green-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={schedule.dayparting.enabled}
                    onChange={(e) => setSchedule(prev => ({ 
                      ...prev, 
                      dayparting: { ...prev.dayparting, enabled: e.target.checked }
                    }))}
                    className="accent-green-500"
                  />
                  <span className="text-sm font-medium">Enable Dayparting (Show ads only during specific hours)</span>
                </label>
                
                {schedule.dayparting.enabled && (
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Start Hour</label>
                      <select
                        value={schedule.dayparting.hours.start}
                        onChange={(e) => setSchedule(prev => ({ 
                          ...prev, 
                          dayparting: { ...prev.dayparting, hours: { ...prev.dayparting.hours, start: parseInt(e.target.value) }}
                        }))}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:border-green-500 focus:outline-none transition-colors"
                      >
                        {[...Array(24)].map((_, i) => (
                          <option key={i} value={i}>{i}:00</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">End Hour</label>
                      <select
                        value={schedule.dayparting.hours.end}
                        onChange={(e) => setSchedule(prev => ({ 
                          ...prev, 
                          dayparting: { ...prev.dayparting, hours: { ...prev.dayparting.hours, end: parseInt(e.target.value) }}
                        }))}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:border-green-500 focus:outline-none transition-colors"
                      >
                        {[...Array(24)].map((_, i) => (
                          <option key={i} value={i}>{i}:00</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bidding Strategy */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h2 className="text-xl font-semibold mb-6">Bidding & Optimization</h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Bid Strategy</label>
                  <select
                    value={bidSettings.strategy}
                    onChange={(e) => setBidSettings(prev => ({ ...prev, strategy: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:border-green-500 focus:outline-none transition-colors"
                  >
                    <option value="LOWEST_COST_WITHOUT_CAP">Lowest Cost (Recommended)</option>
                    <option value="LOWEST_COST_WITH_BID_CAP">Lowest Cost with Bid Cap</option>
                    <option value="TARGET_COST">Target Cost per Result</option>
                  </select>
                  <p className="text-xs text-slate-400 mt-1">Meta API: bid_strategy</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Optimization Goal</label>
                  <select
                    value={bidSettings.optimization}
                    onChange={(e) => setBidSettings(prev => ({ ...prev, optimization: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:border-green-500 focus:outline-none transition-colors"
                  >
                    <option value="LEAD_GENERATION">Lead Generation</option>
                    <option value="CONVERSIONS">Conversions</option>
                    <option value="LINK_CLICKS">Link Clicks</option>
                    <option value="LANDING_PAGE_VIEWS">Landing Page Views</option>
                    <option value="PAGE_LIKES">Page Likes</option>
                    <option value="POST_ENGAGEMENT">Post Engagement</option>
                    <option value="VIDEO_VIEWS">Video Views</option>
                    <option value="REACH">Reach</option>
                    <option value="IMPRESSIONS">Impressions</option>
                  </select>
                  <p className="text-xs text-slate-400 mt-1">Meta API: optimization_goal</p>
                </div>
              </div>

              {/* Conditional Bid Controls */}
              {bidSettings.strategy === 'LOWEST_COST_WITH_BID_CAP' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Bid Cap ($)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">$</span>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={bidSettings.bidCap || ''}
                      onChange={(e) => setBidSettings(prev => ({ ...prev, bidCap: parseFloat(e.target.value) || null }))}
                      placeholder="Enter maximum bid amount"
                      className="w-full pl-8 pr-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:border-green-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Meta API: bid_amount - Maximum amount to bid per result</p>
                </div>
              )}

              {bidSettings.strategy === 'TARGET_COST' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Target Cost per Result ($)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">$</span>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={bidSettings.targetCost || ''}
                      onChange={(e) => setBidSettings(prev => ({ ...prev, targetCost: parseFloat(e.target.value) || null }))}
                      placeholder="Enter target cost"
                      className="w-full pl-8 pr-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:border-green-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Meta API: cost_per_action_type - Target cost per optimization event</p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Ad Delivery Pacing</label>
                  <select
                    value={bidSettings.pacing}
                    onChange={(e) => setBidSettings(prev => ({ ...prev, pacing: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:border-green-500 focus:outline-none transition-colors"
                  >
                    <option value="STANDARD">Standard (Recommended)</option>
                    <option value="ACCELERATED">Accelerated</option>
                  </select>
                  <p className="text-xs text-slate-400 mt-1">Meta API: pacing_type</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Attribution Window</label>
                  <select
                    value={bidSettings.attributionSpec}
                    onChange={(e) => setBidSettings(prev => ({ ...prev, attributionSpec: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:border-green-500 focus:outline-none transition-colors"
                  >
                    <option value="1_day_click">1-day click</option>
                    <option value="7_day_click">7-day click</option>
                    <option value="7_day_click_1_day_view">7-day click, 1-day view</option>
                    <option value="28_day_click">28-day click</option>
                    <option value="28_day_click_1_day_view">28-day click, 1-day view</option>
                  </select>
                  <p className="text-xs text-slate-400 mt-1">Meta API: attribution_spec</p>
                </div>
              </div>
            </div>

            {/* Placement Previews */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h2 className="text-xl font-semibold mb-6">Ad Placement Previews</h2>
              
              {/* Preview Navigation */}
              <div className="flex gap-2 mb-6 flex-wrap">
                {previewOptions.map((option) => (
                  <button
                    key={option.key}
                    onClick={() => setCurrentPreview(option.key)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentPreview === option.key
                        ? 'bg-green-500 text-slate-900'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {option.icon} {option.label}
                  </button>
                ))}
              </div>

              {/* Preview Content */}
              <div className="bg-white rounded-lg p-4 text-black">
                {currentPreview === 'facebook_feed' && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        YB
                      </div>
                      <div>
                        <div className="font-semibold text-sm">Your Business</div>
                        <div className="text-xs text-gray-500">Sponsored</div>
                      </div>
                    </div>
                    <img src={selectedCreativesState.image.imageUrl} alt="Preview" className="w-full h-40 object-cover rounded mb-3" />
                    <h4 className="font-semibold text-sm mb-2">{selectedCreativesState.headline.content}</h4>
                    <p className="text-sm text-gray-700 mb-3">{selectedCreativesState.description.content}</p>
                    <button className="bg-blue-500 text-white px-4 py-2 rounded text-sm font-medium w-full">
                      {selectedCreativesState.cta.content}
                    </button>
                  </div>
                )}

                {currentPreview === 'instagram_feed' && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        YB
                      </div>
                      <div>
                        <div className="font-semibold text-sm">yourbusiness</div>
                        <div className="text-xs text-gray-500">Sponsored</div>
                      </div>
                    </div>
                    <img src={selectedCreativesState.image.imageUrl} alt="Preview" className="w-full h-40 object-cover rounded mb-3" />
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                      <span className="font-semibold text-sm">yourbusiness</span>
                    </div>
                    <p className="text-sm mb-2">{selectedCreativesState.headline.content}</p>
                    <p className="text-sm text-gray-600">{selectedCreativesState.description.content}</p>
                  </div>
                )}

                {currentPreview === 'facebook_marketplace' && (
                  <div className="border rounded-lg overflow-hidden">
                    <img src={selectedCreativesState.image.imageUrl} alt="Preview" className="w-full h-32 object-cover" />
                    <div className="p-3">
                      <h4 className="font-semibold text-sm mb-1">{selectedCreativesState.headline.content}</h4>
                      <p className="text-xs text-gray-600 mb-2">Your Business</p>
                      <button className="bg-blue-500 text-white px-3 py-1 rounded text-xs font-medium">
                        {selectedCreativesState.cta.content}
                      </button>
                    </div>
                  </div>
                )}

                {currentPreview === 'instagram_stories' && (
                  <div className="relative bg-gradient-to-b from-purple-400 to-pink-400 rounded-lg aspect-[9/16] max-h-80 overflow-hidden">
                    <img src={selectedCreativesState.image.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h4 className="font-bold text-sm mb-1">{selectedCreativesState.headline.content}</h4>
                      <p className="text-xs mb-3">{selectedCreativesState.description.content}</p>
                      <button className="bg-white text-black px-4 py-2 rounded-full text-xs font-medium w-full">
                        {selectedCreativesState.cta.content}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Performance Projections */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h3 className="text-lg font-semibold mb-4">Performance Projections</h3>
              
              {campaignData.budget > 0 ? (
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-slate-400 mb-1">Estimated Daily Reach</div>
                    <div className="text-xl font-bold text-green-400">{projections.estimatedReach}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-slate-400 mb-1">Cost Per Lead</div>
                    <div className="text-xl font-bold text-blue-400">{projections.costPerLead}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-slate-400 mb-1">Daily Leads Expected</div>
                    <div className="text-xl font-bold text-purple-400">{projections.dailyLeads}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-slate-400 mb-1">Weekly Ad Spend</div>
                    <div className="text-xl font-bold text-orange-400">${projections.weeklyBudget}</div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-sm text-green-400">
                    ✓ Projections based on {bidSettings.optimization} optimization and {campaignData.currency} currency
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📊</div>
                  <div className="text-slate-400 mb-2">Performance Projections</div>
                  <div className="text-sm text-slate-500">Enter your campaign budget above to see estimated reach, cost per lead, and daily leads projections</div>
                  <div className="mt-4 p-3 bg-slate-700/50 rounded-lg text-xs text-slate-400">
                    Projections will be calculated based on Meta's delivery estimates and industry benchmarks
                  </div>
                </div>
              )}
            </div>
            
            {/* Campaign Summary */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h3 className="text-lg font-semibold mb-4">Campaign Summary</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Business Type:</span>
                  <span className="text-slate-300">{campaignData.businessType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Age:</span>
                  <span className="text-slate-300">{campaignData.ageMin}-{campaignData.ageMax}</span>
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
                  <span className="text-slate-400">Placements:</span>
                  <span className="text-slate-300">{campaignData.placements.length} platforms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Bid Strategy:</span>
                  <span className="text-slate-300">Lowest Cost</span>
                </div>
              </div>
            </div>
            
            {/* Launch Checklist */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h3 className="text-lg font-semibold mb-4">Pre-Launch Checklist</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Campaign settings configured</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Creative assets approved</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={campaignData.budget > 0 ? "text-green-400" : "text-slate-500"}>
                    {campaignData.budget > 0 ? "✓" : "○"}
                  </span>
                  <span>Budget configuration complete</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={isAllocationValid ? "text-green-400" : "text-slate-500"}>
                    {isAllocationValid ? "✓" : "○"}
                  </span>
                  <span>Budget allocation at 100%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Targeting parameters validated</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Meta policy compliance checked</span>
                </div>
              </div>
              
              {!canLaunch && (
                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <div className="text-xs text-yellow-400">
                    <div className="font-medium mb-1">⚠️ Action Required:</div>
                    {campaignData.budget === 0 && <div>• Enter campaign budget</div>}
                    {budgetErrors.length > 0 && <div>• Fix budget validation errors</div>}
                    {!isAllocationValid && <div>• Adjust allocation to equal 100%</div>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Launch Button */}
        <div className="mt-12 text-center">
          <button
            onClick={launchCampaign}
            disabled={!canLaunch}
            className={`px-12 py-4 rounded-lg text-lg font-semibold transition-all ${
              canLaunch
                ? 'bg-green-500 hover:bg-green-600 text-slate-900 hover:scale-105 shadow-lg'
                : 'bg-slate-600 text-slate-400 cursor-not-allowed opacity-50'
            }`}
          >
            {isLaunching ? 'Launching Campaign...' : 
             budgetErrors.length > 0 ? 'Fix Budget Issues to Launch' :
             campaignData.budget === 0 ? 'Enter Budget to Launch' :
             !isAllocationValid ? 'Fix Budget Allocation to Launch' :
             '🚀 Launch Campaign to Meta'}
          </button>
          <p className="mt-4 text-sm text-slate-500">
            {budgetErrors.length > 0 ? 'Please resolve budget validation errors above' :
             campaignData.budget === 0 ? 'Campaign budget is required to proceed' :
             !isAllocationValid ? `Budget allocation must equal 100% (currently ${Math.round(totalAllocation)}%)` :
             'Campaign will be created in Meta Ads Manager and begin running immediately'}
          </p>
        </div>
      </div>
    </div>
  );
}
