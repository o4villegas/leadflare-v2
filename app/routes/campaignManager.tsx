import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import type { Route } from "./+types/campaignManager";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Campaign Manager - LeadFlare" },
    { name: "description", content: "Manage and monitor your AI-powered lead generation campaigns" },
  ];
}

// TypeScript interfaces following Meta API structure
interface Campaign {
  id: string;
  name: string;
  businessType: string;
  status: 'Active' | 'Paused' | 'Completed';
  budget: number;
  budgetType: 'daily' | 'lifetime';
  spend: number;
  leadsGenerated: number;
  costPerLead: number;
  startDate: string;
  endDate?: string;
  lastUpdated: string;
  createdBy: string;
  // Performance metrics for Meta API integration
  ctr: number; // Click-through rate
  cpc: number; // Cost per click
  cpm: number; // Cost per mille (1000 impressions)
  roas: number; // Return on ad spend
  frequency: number; // Average frequency
  impressions: number;
  clicks: number;
  // Placement allocation (totals 100%)
  placements: string[];
  placementAllocation: {
    facebook_feeds: number;
    instagram_feeds: number;
    facebook_marketplace: number;
    instagram_stories: number;
  };
}

// Mock data with realistic Meta campaign structure
const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'SaaS Lead Generation Campaign',
    businessType: 'Technology',
    status: 'Active',
    budget: 75,
    budgetType: 'daily',
    spend: 523.45,
    leadsGenerated: 42,
    costPerLead: 12.46,
    startDate: '2024-06-10',
    lastUpdated: '2024-06-17T10:30:00Z',
    createdBy: 'Current User',
    ctr: 2.8,
    cpc: 1.85,
    cpm: 8.42,
    roas: 4.2,
    frequency: 1.6,
    impressions: 28450,
    clicks: 796,
    placements: ['facebook_feeds', 'instagram_feeds', 'facebook_marketplace'],
    placementAllocation: {
      facebook_feeds: 50,
      instagram_feeds: 35,
      facebook_marketplace: 15,
      instagram_stories: 0
    }
  },
  {
    id: '2',
    name: 'Real Estate Lead Generation',
    businessType: 'Real Estate',
    status: 'Active',
    budget: 50,
    budgetType: 'daily',
    spend: 287.90,
    leadsGenerated: 18,
    costPerLead: 15.99,
    startDate: '2024-06-12',
    lastUpdated: '2024-06-17T09:15:00Z',
    createdBy: 'Current User',
    ctr: 1.9,
    cpc: 2.15,
    cpm: 12.30,
    roas: 3.1,
    frequency: 2.1,
    impressions: 18200,
    clicks: 346,
    placements: ['facebook_feeds', 'instagram_feeds'],
    placementAllocation: {
      facebook_feeds: 60,
      instagram_feeds: 40,
      facebook_marketplace: 0,
      instagram_stories: 0
    }
  },
  {
    id: '3',
    name: 'Healthcare Services Campaign',
    businessType: 'Healthcare',
    status: 'Paused',
    budget: 60,
    budgetType: 'daily',
    spend: 156.20,
    leadsGenerated: 8,
    costPerLead: 19.53,
    startDate: '2024-06-08',
    lastUpdated: '2024-06-15T14:22:00Z',
    createdBy: 'Current User',
    ctr: 1.4,
    cpc: 2.80,
    cpm: 15.60,
    roas: 2.3,
    frequency: 2.8,
    impressions: 12400,
    clicks: 174,
    placements: ['facebook_feeds', 'instagram_feeds', 'instagram_stories'],
    placementAllocation: {
      facebook_feeds: 45,
      instagram_feeds: 35,
      facebook_marketplace: 0,
      instagram_stories: 20
    }
  },
  {
    id: '4',
    name: 'Finance Lead Campaign Q2',
    businessType: 'Finance',
    status: 'Completed',
    budget: 1500,
    budgetType: 'lifetime',
    spend: 1485.60,
    leadsGenerated: 89,
    costPerLead: 16.69,
    startDate: '2024-05-01',
    endDate: '2024-05-31',
    lastUpdated: '2024-05-31T23:59:00Z',
    createdBy: 'Current User',
    ctr: 3.2,
    cpc: 1.95,
    cpm: 9.80,
    roas: 5.1,
    frequency: 1.8,
    impressions: 76200,
    clicks: 2438,
    placements: ['facebook_feeds', 'instagram_feeds', 'facebook_marketplace', 'instagram_stories'],
    placementAllocation: {
      facebook_feeds: 40,
      instagram_feeds: 30,
      facebook_marketplace: 20,
      instagram_stories: 10
    }
  }
];

export default function CampaignManager() {
  const navigate = useNavigate();
  // State management
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>(mockCampaigns);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'type' | 'status' | 'spend' | 'leads'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [showEditBudgetModal, setShowEditBudgetModal] = useState(false);
  const [showLeadsModal, setShowLeadsModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [performanceBreakdown, setPerformanceBreakdown] = useState<'age' | 'gender' | 'location' | 'device' | 'placement'>('age');
  
  // Budget allocation state (auto-balances to 100%)
  const [budgetAllocation, setBudgetAllocation] = useState({
    facebook_feeds: 0,
    instagram_feeds: 0,
    facebook_marketplace: 0,
    instagram_stories: 0
  });
  const [isDuplicating, setIsDuplicating] = useState(false);

  // Filter and sort campaigns
  useEffect(() => {
    let filtered = campaigns.filter(campaign => {
      const matchesStatus = selectedStatus === 'all' || campaign.status.toLowerCase() === selectedStatus;
      const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           campaign.businessType.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });

    // Sort campaigns
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'type':
          aValue = a.businessType.toLowerCase();
          bValue = b.businessType.toLowerCase();
          break;
        case 'status':
          aValue = a.status.toLowerCase();
          bValue = b.status.toLowerCase();
          break;
        case 'spend':
          aValue = a.spend;
          bValue = b.spend;
          break;
        case 'leads':
          aValue = a.leadsGenerated;
          bValue = b.leadsGenerated;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredCampaigns(filtered);
  }, [campaigns, selectedStatus, sortBy, sortOrder, searchTerm]);

  // Status styling for visual consistency
  const getStatusStyling = (status: Campaign['status']) => {
    switch (status) {
      case 'Active':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Paused':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Completed':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  // Modal management functions
  const openPerformanceModal = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setShowPerformanceModal(true);
  };

  const openEditBudgetModal = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setBudgetAllocation(campaign.placementAllocation);
    setShowEditBudgetModal(true);
  };

  const openLeadsModal = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setShowLeadsModal(true);
  };

  const closeModals = () => {
    setShowPerformanceModal(false);
    setShowEditBudgetModal(false);
    setShowLeadsModal(false);
    setSelectedCampaign(null);
    setIsDuplicating(false);
  };

  // Budget allocation helper functions (auto-balance to 100%)
  const getTotalAllocation = () => {
    return Object.values(budgetAllocation).reduce((sum, val) => sum + val, 0);
  };

  const updateAllocation = (placement: string, newValue: number) => {
    setBudgetAllocation(prev => {
      const otherPlacements = Object.keys(prev).filter(p => p !== placement);
      const newTotal = newValue + otherPlacements.reduce((sum, p) => sum + prev[p as keyof typeof prev], 0);
      
      // Auto-balance: if total exceeds 100%, proportionally reduce other placements
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

  const getPlacementBudget = (placement: string, totalBudget: number) => {
    return (totalBudget * budgetAllocation[placement as keyof typeof budgetAllocation] / 100).toFixed(2);
  };

  // Campaign management functions (ready for Meta API integration)
  const updateCampaignBudget = (newBudget: number, launchCampaign: boolean = false) => {
    if (selectedCampaign) {
      const updatedCampaign = {
        ...selectedCampaign,
        budget: newBudget,
        placementAllocation: { ...budgetAllocation },
        lastUpdated: new Date().toISOString(),
        status: launchCampaign ? 'Active' as const : selectedCampaign.status
      };

      if (isDuplicating) {
        // Meta API: POST /{campaign_id}/copies with modifications
        const newCampaign: Campaign = {
          ...updatedCampaign,
          id: (campaigns.length + 1).toString(),
          name: `${selectedCampaign.name} (Copy)`,
          status: launchCampaign ? 'Active' : 'Paused',
          spend: 0,
          leadsGenerated: 0,
          costPerLead: 0,
          startDate: new Date().toISOString().split('T')[0],
          impressions: 0,
          clicks: 0
        };
        
        setCampaigns(prev => [newCampaign, ...prev]);
      } else {
        // Meta API: POST /{campaign_id} with budget updates
        setCampaigns(prev => prev.map(campaign =>
          campaign.id === selectedCampaign.id ? updatedCampaign : campaign
        ));
      }
      
      closeModals();
    }
  };

  // Campaign status management (Meta API: POST /{campaign_id} with status)
  const toggleCampaignStatus = (campaignId: string) => {
    setCampaigns(prev => prev.map(campaign => {
      if (campaign.id === campaignId) {
        const newStatus = campaign.status === 'Active' ? 'Paused' : 'Active';
        return {
          ...campaign,
          status: newStatus,
          lastUpdated: new Date().toISOString()
        };
      }
      return campaign;
    }));
  };

  // Option B: Guided duplication (opens edit modal first)
  const duplicateCampaign = (campaignId: string) => {
    const campaignToDuplicate = campaigns.find(c => c.id === campaignId);
    if (campaignToDuplicate) {
      setSelectedCampaign(campaignToDuplicate);
      setBudgetAllocation(campaignToDuplicate.placementAllocation);
      setIsDuplicating(true);
      setShowEditBudgetModal(true);
    }
  };

  // Navigation functions
  const navigateToHome = () => {
    navigate('/');
  };

  const navigateToCreateCampaign = () => {
    navigate('/createCampaign');
  };

  const navigateToGenerateCreative = () => {
    navigate('/generateCreative');
  };

  const navigateToLeads = (campaignId: string) => {
    navigate('/leadManagement', { 
      state: { campaignId } 
    });
  };

  // Mock performance breakdown data (replace with actual Meta API calls)
  const getPerformanceBreakdown = (campaign: Campaign, breakdown: string) => {
    switch (breakdown) {
      case 'age':
        return [
          { label: '18-24', impressions: Math.floor(campaign.impressions * 0.15), clicks: Math.floor(campaign.clicks * 0.12), ctr: 1.8 },
          { label: '25-34', impressions: Math.floor(campaign.impressions * 0.35), clicks: Math.floor(campaign.clicks * 0.38), ctr: campaign.ctr + 0.3 },
          { label: '35-44', impressions: Math.floor(campaign.impressions * 0.30), clicks: Math.floor(campaign.clicks * 0.32), ctr: campaign.ctr + 0.1 },
          { label: '45-54', impressions: Math.floor(campaign.impressions * 0.15), clicks: Math.floor(campaign.clicks * 0.14), ctr: campaign.ctr - 0.2 },
          { label: '55+', impressions: Math.floor(campaign.impressions * 0.05), clicks: Math.floor(campaign.clicks * 0.04), ctr: campaign.ctr - 0.5 }
        ];
      case 'gender':
        return [
          { label: 'Male', impressions: Math.floor(campaign.impressions * 0.52), clicks: Math.floor(campaign.clicks * 0.48), ctr: campaign.ctr - 0.1 },
          { label: 'Female', impressions: Math.floor(campaign.impressions * 0.48), clicks: Math.floor(campaign.clicks * 0.52), ctr: campaign.ctr + 0.2 }
        ];
      case 'location':
        return [
          { label: 'United States', impressions: Math.floor(campaign.impressions * 0.70), clicks: Math.floor(campaign.clicks * 0.72), ctr: campaign.ctr + 0.1 },
          { label: 'Canada', impressions: Math.floor(campaign.impressions * 0.20), clicks: Math.floor(campaign.clicks * 0.18), ctr: campaign.ctr - 0.2 },
          { label: 'Other', impressions: Math.floor(campaign.impressions * 0.10), clicks: Math.floor(campaign.clicks * 0.10), ctr: campaign.ctr }
        ];
      case 'device':
        return [
          { label: 'Mobile', impressions: Math.floor(campaign.impressions * 0.75), clicks: Math.floor(campaign.clicks * 0.78), ctr: campaign.ctr + 0.2 },
          { label: 'Desktop', impressions: Math.floor(campaign.impressions * 0.20), clicks: Math.floor(campaign.clicks * 0.18), ctr: campaign.ctr - 0.3 },
          { label: 'Tablet', impressions: Math.floor(campaign.impressions * 0.05), clicks: Math.floor(campaign.clicks * 0.04), ctr: campaign.ctr - 0.5 }
        ];
      case 'placement':
        return [
          { label: 'Facebook Feed', impressions: Math.floor(campaign.impressions * 0.45), clicks: Math.floor(campaign.clicks * 0.42), ctr: campaign.ctr - 0.1 },
          { label: 'Instagram Feed', impressions: Math.floor(campaign.impressions * 0.35), clicks: Math.floor(campaign.clicks * 0.38), ctr: campaign.ctr + 0.3 },
          { label: 'Instagram Stories', impressions: Math.floor(campaign.impressions * 0.15), clicks: Math.floor(campaign.clicks * 0.16), ctr: campaign.ctr + 0.2 },
          { label: 'Marketplace', impressions: Math.floor(campaign.impressions * 0.05), clicks: Math.floor(campaign.clicks * 0.04), ctr: campaign.ctr - 0.4 }
        ];
      default:
        return [];
    }
  };

  // Generate time series data for performance trends
  const getTimeSeriesData = (campaign: Campaign) => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const variation = (Math.random() - 0.5) * 0.4;
      days.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        impressions: Math.floor((campaign.impressions / 7) * (1 + variation)),
        clicks: Math.floor((campaign.clicks / 7) * (1 + variation)),
        spend: parseFloat(((campaign.spend / 7) * (1 + variation)).toFixed(2)),
        ctr: parseFloat((campaign.ctr * (1 + variation * 0.5)).toFixed(2))
      });
    }
    return days;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
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
            <button className="text-white font-semibold bg-green-500/20 px-4 py-2 rounded-lg">
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
          </nav>

          <button
            onClick={navigateToCreateCampaign}
            className="bg-green-500 hover:bg-green-600 text-slate-900 font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            + New Campaign
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Campaign Manager</h1>
          <p className="text-slate-400">Monitor and manage your lead generation campaigns</p>
        </div>

        {/* Filters and Search */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-64 px-4 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:border-green-500 focus:outline-none transition-colors"
                />
              </div>
              
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:border-green-500 focus:outline-none transition-colors"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="flex gap-4 items-center">
              <span className="text-sm text-slate-400">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white text-sm focus:border-green-500 focus:outline-none transition-colors"
              >
                <option value="name">Name</option>
                <option value="type">Type</option>
                <option value="status">Status</option>
                <option value="spend">Spend</option>
                <option value="leads">Leads</option>
              </select>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white text-sm hover:bg-slate-600 transition-colors"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>

        {/* Campaign Grid */}
        <div className="space-y-6">
          {filteredCampaigns.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2 text-white">No campaigns found</h3>
              <p className="text-slate-400 mb-6">Try adjusting your search criteria or create a new campaign.</p>
              <button
                onClick={navigateToCreateCampaign}
                className="bg-green-500 hover:bg-green-600 text-slate-900 font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                Create Your First Campaign
              </button>
            </div>
          ) : (
            filteredCampaigns.map((campaign) => (
              <div key={campaign.id} className="bg-slate-800 rounded-xl border border-slate-700 p-6 hover:border-slate-600 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  {/* Campaign Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-semibold text-white">{campaign.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyling(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </div>
                    
                    <div className="text-sm text-slate-400 mb-2">
                      <span>{campaign.businessType}</span>
                      <span className="mx-2">•</span>
                      <span>${campaign.budget}/{campaign.budgetType}</span>
                    </div>
                    
                    {/* Placement Allocation Display */}
                    <div className="flex flex-wrap gap-1 mb-2">
                      {Object.entries(campaign.placementAllocation)
                        .filter(([_, allocation]) => allocation > 0)
                        .map(([placement, allocation]) => (
                          <span key={placement} className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-xs">
                            {placement.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}: {Math.round(allocation)}%
                          </span>
                        ))
                      }
                    </div>

                    <div className="text-xs text-slate-500">
                      Last updated: {new Date(campaign.lastUpdated).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Metrics Layout */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-sm text-slate-400 mb-1">Total Spend</div>
                        <div className="text-lg font-bold text-red-400">${campaign.spend.toFixed(2)}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-slate-400 mb-1">Leads Generated</div>
                        <div className="text-lg font-bold text-green-400">{campaign.leadsGenerated}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-slate-400 mb-1">Cost per Lead</div>
                        <div className="text-lg font-bold text-blue-400">
                          {campaign.leadsGenerated > 0 ? `$${campaign.costPerLead.toFixed(2)}` : '-'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => openPerformanceModal(campaign)}
                      className="px-3 py-2 bg-green-500/20 text-green-400 rounded-md text-xs font-medium hover:bg-green-500/30 transition-colors"
                    >
                      📊 Performance
                    </button>
                    
                    {(campaign.status === 'Active' || campaign.status === 'Paused') && (
                      <button
                        onClick={() => toggleCampaignStatus(campaign.id)}
                        className={`px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                          campaign.status === 'Active'
                            ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                            : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                        }`}
                      >
                        {campaign.status === 'Active' ? '⏸️ Pause' : '▶️ Resume'}
                      </button>
                    )}
                    
                    <button
                      onClick={() => openEditBudgetModal(campaign)}
                      className="px-3 py-2 bg-blue-500/20 text-blue-400 rounded-md text-xs font-medium hover:bg-blue-500/30 transition-colors"
                    >
                      💰 Edit Budget
                    </button>
                    
                    <button
                      onClick={() => navigateToLeads(campaign.id)}
                      className="px-3 py-2 bg-purple-500/20 text-purple-400 rounded-md text-xs font-medium hover:bg-purple-500/30 transition-colors"
                    >
                      👥 View Leads
                    </button>
                    
                    <button
                      onClick={() => duplicateCampaign(campaign.id)}
                      className="px-3 py-2 bg-slate-600 text-slate-300 rounded-md text-xs font-medium hover:bg-slate-500 transition-colors"
                    >
                      📋 Duplicate
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Performance Modal - Meta Ads Manager Style */}
        {showPerformanceModal && selectedCampaign && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-4xl max-h-[85vh] flex flex-col">
              <div className="p-6 border-b border-slate-700 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Performance Insights</h2>
                  <button
                    onClick={closeModals}
                    className="text-slate-400 hover:text-white text-2xl transition-colors"
                  >
                    ×
                  </button>
                </div>
                <p className="text-slate-300 mt-1 text-sm">{selectedCampaign.name}</p>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Key Metrics: CTR, CPC, CPM, ROAS, Frequency */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-white">Key Metrics</h3>
                  <div className="grid grid-cols-5 gap-4">
                    <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                      <div className="text-xl font-bold text-blue-400">{selectedCampaign.ctr}%</div>
                      <div className="text-xs text-slate-400">CTR</div>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                      <div className="text-xl font-bold text-green-400">${selectedCampaign.cpc}</div>
                      <div className="text-xs text-slate-400">CPC</div>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                      <div className="text-xl font-bold text-purple-400">${selectedCampaign.cpm}</div>
                      <div className="text-xs text-slate-400">CPM</div>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                      <div className="text-xl font-bold text-orange-400">{selectedCampaign.roas}x</div>
                      <div className="text-xs text-slate-400">ROAS</div>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                      <div className="text-xl font-bold text-yellow-400">{selectedCampaign.frequency}</div>
                      <div className="text-xs text-slate-400">Frequency</div>
                    </div>
                  </div>
                </div>

                {/* Time Series Chart */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-white">7-Day Performance Trends</h3>
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <div className="space-y-2">
                      {getTimeSeriesData(selectedCampaign).map((day, index) => (
                        <div key={index} className="flex items-center justify-between text-xs">
                          <div className="w-12 text-slate-400">{day.date}</div>
                          <div className="flex-1 mx-3">
                            <div className="grid grid-cols-4 gap-3 text-center">
                              <span className="text-blue-400">{day.impressions.toLocaleString()}</span>
                              <span className="text-green-400">{day.clicks}</span>
                              <span className="text-red-400">${day.spend}</span>
                              <span className="text-purple-400">{day.ctr}%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 grid grid-cols-4 gap-3 text-xs text-slate-400 text-center">
                      <span>Impressions</span>
                      <span>Clicks</span>
                      <span>Spend</span>
                      <span>CTR %</span>
                    </div>
                  </div>
                </div>

                {/* Breakdown Views: Age, Gender, Location, Device, Placement */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-white">Performance Breakdown</h3>
                  
                  <div className="flex gap-2 mb-4 flex-wrap">
                    {(['age', 'gender', 'location', 'device', 'placement'] as const).map((breakdown) => (
                      <button
                        key={breakdown}
                        onClick={() => setPerformanceBreakdown(breakdown)}
                        className={`px-3 py-1 rounded text-xs font-medium transition-colors capitalize ${
                          performanceBreakdown === breakdown
                            ? 'bg-green-500 text-slate-900'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        {breakdown}
                      </button>
                    ))}
                  </div>

                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <div className="space-y-2">
                      {getPerformanceBreakdown(selectedCampaign, performanceBreakdown).map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-slate-800/50 rounded text-sm">
                          <div className="font-medium text-white w-20">{item.label}</div>
                          <div className="flex items-center gap-4 text-xs">
                            <span className="text-blue-400">{item.impressions.toLocaleString()}</span>
                            <span className="text-green-400">{item.clicks}</span>
                            <span className="text-purple-400">{item.ctr.toFixed(1)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Budget & Allocation Modal */}
        {showEditBudgetModal && selectedCampaign && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-2xl max-h-[85vh] flex flex-col">
              <div className="p-6 border-b border-slate-700 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white">
                    {isDuplicating ? 'Duplicate & Launch Campaign' : 'Edit Budget & Allocation'}
                  </h2>
                  <button
                    onClick={closeModals}
                    className="text-slate-400 hover:text-white text-xl transition-colors"
                  >
                    ×
                  </button>
                </div>
                <p className="text-slate-300 mt-1 text-sm">
                  {isDuplicating ? `${selectedCampaign.name} (Copy)` : selectedCampaign.name}
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  {/* Budget Section */}
                  <div>
                    <h3 className="text-md font-semibold mb-4 text-white">Campaign Budget</h3>
                    <div className="space-y-4">
                      {!isDuplicating && (
                        <div>
                          <label className="block text-sm font-medium mb-2 text-white">
                            Current {selectedCampaign.budgetType === 'daily' ? 'Daily' : 'Lifetime'} Budget
                          </label>
                          <div className="text-xl font-bold text-green-400 mb-3">
                            ${selectedCampaign.budget}
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium mb-2 text-white">
                          {isDuplicating ? 'Set ' : 'New '}
                          {selectedCampaign.budgetType === 'daily' ? 'Daily' : 'Lifetime'} Budget
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">$</span>
                          <input
                            type="number"
                            min="5"
                            step="0.01"
                            defaultValue={selectedCampaign.budget}
                            className="w-full pl-8 pr-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white font-semibold focus:border-green-500 focus:outline-none transition-colors"
                            id="newBudget"
                          />
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          Minimum: $5.00/{selectedCampaign.budgetType}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Placement Allocation Section with Auto-Balance Slider */}
                  <div>
                    <h3 className="text-md font-semibold mb-4 text-white">Budget Allocation by Placement</h3>
                    
                    {/* Total Allocation Progress */}
                    <div className="mb-4 p-3 bg-slate-700/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Total Allocation</span>
                        <span className={`text-lg font-bold ${
                          Math.abs(getTotalAllocation() - 100) < 0.1 ? 'text-green-400' : 
                          getTotalAllocation() > 100 ? 'text-red-400' : 'text-yellow-400'
                        }`}>
                          {Math.round(getTotalAllocation())}%
                        </span>
                      </div>
                      
                      <div className="w-full bg-slate-600 rounded-full h-2 mb-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            Math.abs(getTotalAllocation() - 100) < 0.1 ? 'bg-green-500' : 
                            getTotalAllocation() > 100 ? 'bg-red-500' : 'bg-yellow-500'
                          }`}
                          style={{ width: `${Math.min(100, getTotalAllocation())}%` }}
                        ></div>
                      </div>
                      
                      <div className="text-xs text-slate-400">
                        {Math.abs(getTotalAllocation() - 100) < 0.1 ? '✓ Perfect allocation' :
                         getTotalAllocation() > 100 ? `Over by ${Math.round(getTotalAllocation() - 100)}%` :
                         `Remaining: ${Math.round(100 - getTotalAllocation())}%`}
                      </div>
                    </div>

                    {/* Allocation Sliders */}
                    <div className="space-y-4">
                      {selectedCampaign.placements.map((placement) => {
                        const labels = {
                          facebook_feeds: 'Facebook Feeds',
                          instagram_feeds: 'Instagram Feeds', 
                          facebook_marketplace: 'Facebook Marketplace',
                          instagram_stories: 'Instagram Stories'
                        };
                        
                        return (
                          <div key={placement} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-sm font-medium text-white">
                                {labels[placement as keyof typeof labels]}
                              </label>
                              <div className="text-right">
                                <div className="text-sm font-semibold text-green-400">
                                  {Math.round(budgetAllocation[placement as keyof typeof budgetAllocation])}%
                                </div>
                                <div className="text-xs text-slate-400">
                                  ${getPlacementBudget(placement, parseFloat((document.getElementById('newBudget') as HTMLInputElement)?.value || selectedCampaign.budget.toString()))}/day
                                </div>
                              </div>
                            </div>
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
                        );
                      })}
                    </div>
                  </div>

                  {/* Impact Information */}
                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <h4 className="font-medium text-white mb-2 text-sm">
                      {isDuplicating ? 'Campaign Setup' : 'Budget Impact'}
                    </h4>
                    <div className="text-xs text-slate-400 space-y-1">
                      {isDuplicating ? (
                        <>
                          <div>• Campaign will be created and launched immediately</div>
                          <div>• All settings copied from original campaign</div>
                          <div>• Budget allocation applied across placements</div>
                        </>
                      ) : (
                        <>
                          <div>• Changes take effect immediately</div>
                          <div>• May affect delivery and optimization</div>
                          <div>• Higher budget may improve performance</div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-700 flex-shrink-0">
                <div className="flex gap-3">
                  <button
                    onClick={closeModals}
                    className="flex-1 px-4 py-2 bg-slate-600 text-slate-300 rounded-lg font-medium hover:bg-slate-500 transition-colors"
                  >
                    Cancel
                  </button>
                  {isDuplicating && (
                    <button
                      onClick={() => {
                        const newBudget = parseFloat((document.getElementById('newBudget') as HTMLInputElement)?.value || '0');
                        if (newBudget >= 5 && Math.abs(getTotalAllocation() - 100) < 0.1) {
                          updateCampaignBudget(newBudget, false);
                        }
                      }}
                      disabled={getTotalAllocation() !== 100}
                      className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Create as Paused
                    </button>
                  )}
                  <button
                    onClick={() => {
                      const newBudget = parseFloat((document.getElementById('newBudget') as HTMLInputElement)?.value || '0');
                      if (newBudget >= 5 && Math.abs(getTotalAllocation() - 100) < 0.1) {
                        updateCampaignBudget(newBudget, isDuplicating);
                      }
                    }}
                    disabled={getTotalAllocation() !== 100}
                    className="flex-1 px-4 py-2 bg-green-500 text-slate-900 rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDuplicating ? 'Create & Launch' : 'Update Campaign'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Leads Modal */}
        {showLeadsModal && selectedCampaign && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-3xl max-h-[75vh] flex flex-col">
              <div className="p-6 border-b border-slate-700 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white">Campaign Leads</h2>
                  <button
                    onClick={closeModals}
                    className="text-slate-400 hover:text-white text-xl transition-colors"
                  >
                    ×
                  </button>
                </div>
                <p className="text-slate-300 mt-1 text-sm">{selectedCampaign.name} • {selectedCampaign.leadsGenerated} total leads</p>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {selectedCampaign.leadsGenerated > 0 ? (
                  <div className="space-y-3">
                    {Array.from({ length: Math.min(selectedCampaign.leadsGenerated, 10) }, (_, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-slate-900 font-bold text-sm">
                            {String.fromCharCode(65 + (index % 26))}
                          </div>
                          <div>
                            <div className="font-medium text-white text-sm">Lead {index + 1}</div>
                            <div className="text-xs text-slate-400">lead{index + 1}@example.com</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-xs">
                            <div className={`font-medium ${
                              index % 4 === 0 ? 'text-green-400' :
                              index % 4 === 1 ? 'text-yellow-400' :
                              index % 4 === 2 ? 'text-blue-400' : 'text-slate-400'
                            }`}>
                              {index % 4 === 0 ? 'Qualified' :
                               index % 4 === 1 ? 'Contacted' :
                               index % 4 === 2 ? 'Interested' : 'New'}
                            </div>
                            <div className="text-slate-500">
                              {new Date(Date.now() - (index * 86400000)).toLocaleDateString()}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              closeModals();
                              navigateToLeads(selectedCampaign.id);
                            }}
                            className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium hover:bg-green-500/30 transition-colors"
                          >
                            View
                          </button>
                        </div>
                      </div>
                    ))}

                    {selectedCampaign.leadsGenerated > 10 && (
                      <div className="text-center py-3 text-slate-400 text-sm">
                        Showing 10 of {selectedCampaign.leadsGenerated} leads
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-3xl mb-3">👥</div>
                    <h3 className="text-lg font-semibold mb-2 text-white">No Leads Yet</h3>
                    <p className="text-slate-400 mb-4 text-sm">This campaign hasn't generated any leads yet.</p>
                    <div className="text-xs text-slate-500">
                      Started: {new Date(selectedCampaign.startDate).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>

              {selectedCampaign.leadsGenerated > 0 && (
                <div className="p-6 border-t border-slate-700 flex-shrink-0">
                  <button
                    onClick={() => {
                      closeModals();
                      navigateToLeads(selectedCampaign.id);
                    }}
                    className="w-full px-4 py-2 bg-green-500 text-slate-900 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                  >
                    View All in Lead Manager
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
