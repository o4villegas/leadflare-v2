import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import type { Route } from "./+types/leadManagement";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Lead Management - LeadFlare" },
    { name: "description", content: "AI-powered lead tracking and contact management" },
  ];
}

// TypeScript interfaces following the existing pattern
interface Lead {
  id: string;
  campaignId: string;
  campaignName: string;
  status: 'new' | 'contacted' | 'qualified' | 'opportunity' | 'converted' | 'rejected' | 'unresponsive' | 'do_not_contact';
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  source: string;
  createdAt: string;
  lastContactedAt?: string;
  aiScore: number; // 1-100 AI-generated lead quality score
  aiInsights: string[];
  contactAttempts: number;
  nextAction?: string;
  assignedAgent?: string;
  formData: Record<string, any>;
  notes: ContactNote[];
  tags: string[];
}

interface ContactNote {
  id: string;
  date: string;
  type: 'call' | 'email' | 'sms' | 'meeting' | 'note';
  content: string;
  agent: string;
  outcome?: 'connected' | 'voicemail' | 'no_answer' | 'busy' | 'callback_requested';
}

interface Campaign {
  id: string;
  name: string;
  businessType: string;
  status: string;
}

// Mock data
const mockCampaigns: Campaign[] = [
  { id: '1', name: 'SaaS Lead Generation Campaign', businessType: 'Technology', status: 'Active' },
  { id: '2', name: 'Real Estate Lead Generation', businessType: 'Real Estate', status: 'Active' },
  { id: '3', name: 'Healthcare Services Campaign', businessType: 'Healthcare', status: 'Paused' },
  { id: '4', name: 'Finance Lead Campaign Q2', businessType: 'Finance', status: 'Completed' }
];

const mockLeads: Lead[] = [
  {
    id: '1',
    campaignId: '1',
    campaignName: 'SaaS Lead Generation Campaign',
    status: 'qualified',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@techstartup.com',
    phone: '+1-555-0123',
    company: 'TechStartup Inc',
    source: 'Facebook Feed',
    createdAt: '2024-06-16T14:30:00Z',
    lastContactedAt: '2024-06-17T09:15:00Z',
    aiScore: 92,
    aiInsights: ['High intent signals', 'Decision maker', 'Budget confirmed'],
    contactAttempts: 2,
    nextAction: 'Schedule demo call',
    assignedAgent: 'Mike Chen',
    formData: { budget: '$50,000+', timeline: 'Within 3 months', team_size: '25-50' },
    notes: [
      { id: '1', date: '2024-06-17T09:15:00Z', type: 'call', content: 'Great conversation! Very interested in the enterprise features. Wants to schedule a demo next week.', agent: 'Mike Chen', outcome: 'connected' },
      { id: '2', date: '2024-06-16T16:45:00Z', type: 'email', content: 'Initial follow-up email sent with product overview and case studies.', agent: 'System' }
    ],
    tags: ['enterprise', 'hot_lead', 'decision_maker']
  },
  {
    id: '2',
    campaignId: '2',
    campaignName: 'Real Estate Lead Generation',
    status: 'new',
    firstName: 'David',
    lastName: 'Rodriguez',
    email: 'david.r.homebuyer@gmail.com',
    phone: '+1-555-0789',
    company: '',
    source: 'Instagram Feed',
    createdAt: '2024-06-17T11:20:00Z',
    aiScore: 76,
    aiInsights: ['First-time buyer signals', 'Pre-approved for loan', 'Urgent timeline'],
    contactAttempts: 0,
    nextAction: 'Initial contact call',
    formData: { budget: '$400,000-$500,000', location: 'Downtown area', bedrooms: '3+' },
    notes: [],
    tags: ['first_time_buyer', 'pre_approved']
  },
  {
    id: '3',
    campaignId: '1',
    campaignName: 'SaaS Lead Generation Campaign',
    status: 'contacted',
    firstName: 'Emma',
    lastName: 'Williams',
    email: 'emma.williams@consultrm.com',
    phone: '+1-555-0456',
    company: 'ConsultRM',
    source: 'Facebook Marketplace',
    createdAt: '2024-06-15T08:45:00Z',
    lastContactedAt: '2024-06-16T14:30:00Z',
    aiScore: 68,
    aiInsights: ['Exploring options', 'Price sensitive', 'Small team'],
    contactAttempts: 1,
    nextAction: 'Follow up in 2 days',
    assignedAgent: 'Lisa Park',
    formData: { budget: '$10,000-$25,000', timeline: 'Next quarter', team_size: '5-10' },
    notes: [
      { id: '3', date: '2024-06-16T14:30:00Z', type: 'call', content: 'Left voicemail with callback request. Seemed interested but wants to compare with competitors.', agent: 'Lisa Park', outcome: 'voicemail' }
    ],
    tags: ['price_sensitive', 'comparison_shopping']
  },
  {
    id: '4',
    campaignId: '3',
    campaignName: 'Healthcare Services Campaign',
    status: 'opportunity',
    firstName: 'Michael',
    lastName: 'Thompson',
    email: 'mthompson@healthgroup.org',
    phone: '+1-555-0321',
    company: 'HealthGroup Medical',
    source: 'Instagram Stories',
    createdAt: '2024-06-14T13:15:00Z',
    lastContactedAt: '2024-06-17T10:45:00Z',
    aiScore: 88,
    aiInsights: ['Immediate need', 'Budget approved', 'Multiple locations'],
    contactAttempts: 3,
    nextAction: 'Send proposal',
    assignedAgent: 'Dr. Sarah Kim',
    formData: { service_type: 'Preventive care', locations: '3', timeline: 'Immediate' },
    notes: [
      { id: '4', date: '2024-06-17T10:45:00Z', type: 'meeting', content: 'Excellent in-person meeting. Ready to move forward with proposal. Decision expected by end of week.', agent: 'Dr. Sarah Kim', outcome: 'connected' },
      { id: '5', date: '2024-06-15T16:20:00Z', type: 'call', content: 'Discussed requirements in detail. Scheduled face-to-face meeting.', agent: 'Dr. Sarah Kim', outcome: 'connected' }
    ],
    tags: ['immediate_need', 'budget_approved', 'proposal_stage']
  },
  {
    id: '5',
    campaignId: '2',
    campaignName: 'Real Estate Lead Generation',
    status: 'unresponsive',
    firstName: 'Jennifer',
    lastName: 'Davis',
    email: 'j.davis.realty@email.com',
    company: '',
    source: 'Facebook Feed',
    createdAt: '2024-06-12T09:30:00Z',
    lastContactedAt: '2024-06-14T15:20:00Z',
    aiScore: 45,
    aiInsights: ['Low engagement', 'Multiple contact attempts failed', 'Consider remarketing'],
    contactAttempts: 4,
    nextAction: 'Add to nurture sequence',
    assignedAgent: 'Tom Wilson',
    formData: { budget: '$300,000-$400,000', timeline: 'Flexible' },
    notes: [
      { id: '6', date: '2024-06-14T15:20:00Z', type: 'call', content: 'No answer. Fourth attempt.', agent: 'Tom Wilson', outcome: 'no_answer' },
      { id: '7', date: '2024-06-13T11:10:00Z', type: 'email', content: 'Follow-up email sent. No response.', agent: 'Tom Wilson' }
    ],
    tags: ['unresponsive', 'nurture_sequence']
  },
  {
    id: '6',
    campaignId: '4',
    campaignName: 'Finance Lead Campaign Q2',
    status: 'converted',
    firstName: 'Robert',
    lastName: 'Chen',
    email: 'robert.chen@financial.biz',
    phone: '+1-555-0987',
    company: 'Financial Solutions LLC',
    source: 'Facebook Feed',
    createdAt: '2024-05-15T12:00:00Z',
    lastContactedAt: '2024-05-25T14:30:00Z',
    aiScore: 95,
    aiInsights: ['Converted successfully', 'High value client', 'Referral potential'],
    contactAttempts: 5,
    nextAction: 'Onboarding complete',
    assignedAgent: 'Amanda Foster',
    formData: { service_type: 'Investment planning', assets: '$1M+', timeline: 'Immediate' },
    notes: [
      { id: '8', date: '2024-05-25T14:30:00Z', type: 'meeting', content: 'Contract signed! $150k deal closed. Very satisfied with our service.', agent: 'Amanda Foster', outcome: 'connected' }
    ],
    tags: ['converted', 'high_value', 'success_story']
  }
];

export default function LeadManagement() {
  const navigate = useNavigate();
  const location = useLocation();
  // Get campaign filter from URL state if navigated from campaign manager
  const initialCampaignFilter = location?.state?.campaignId || 'all';

  // State management
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>(mockLeads);
  const [selectedCampaign, setSelectedCampaign] = useState<string>(initialCampaignFilter);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedAgent, setSelectedAgent] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'created' | 'score' | 'name' | 'status' | 'lastContact'>('created');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);

  // Modal states
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkAction, setBulkAction] = useState<'status' | 'agent' | 'tags'>('status');

  // Filter and sort leads
  useEffect(() => {
    let filtered = leads.filter(lead => {
      const matchesCampaign = selectedCampaign === 'all' || lead.campaignId === selectedCampaign;
      const matchesStatus = selectedStatus === 'all' || lead.status === selectedStatus;
      const matchesAgent = selectedAgent === 'all' || lead.assignedAgent === selectedAgent;
      const matchesSearch = 
        lead.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.company && lead.company.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesCampaign && matchesStatus && matchesAgent && matchesSearch;
    });

    // Sort leads
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'created':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'score':
          aValue = a.aiScore;
          bValue = b.aiScore;
          break;
        case 'name':
          aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
          bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'lastContact':
          aValue = a.lastContactedAt ? new Date(a.lastContactedAt) : new Date(0);
          bValue = b.lastContactedAt ? new Date(b.lastContactedAt) : new Date(0);
          break;
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredLeads(filtered);
  }, [leads, selectedCampaign, selectedStatus, selectedAgent, sortBy, sortOrder, searchTerm]);

  // Status styling
  const getStatusStyling = (status: Lead['status']) => {
    const styles = {
      new: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      contacted: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      qualified: 'bg-green-500/20 text-green-400 border-green-500/30',
      opportunity: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      converted: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
      unresponsive: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      do_not_contact: 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    };
    return styles[status];
  };

  // AI score styling
  const getScoreStyling = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Modal management functions
  const openLeadDetail = (leadId: string) => {
    navigate('/leadDetail', { 
      state: { leadId } 
    });
  };

  const closeBulkModal = () => {
    setShowBulkModal(false);
  };

  // Lead selection
  const toggleLeadSelection = (leadId: string) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  const selectAllLeads = () => {
    setSelectedLeads(filteredLeads.map(lead => lead.id));
  };

  const clearSelection = () => {
    setSelectedLeads([]);
  };

  // Status update
  const updateLeadStatus = (leadId: string, newStatus: Lead['status']) => {
    setLeads(prev => prev.map(lead => 
      lead.id === leadId 
        ? { ...lead, status: newStatus, lastContactedAt: new Date().toISOString() }
        : lead
    ));
  };

  // Get unique agents for filter
  const uniqueAgents = Array.from(new Set(leads.map(lead => lead.assignedAgent).filter(Boolean)));

  // Status counts for quick filters
  const statusCounts = {
    all: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    qualified: leads.filter(l => l.status === 'qualified').length,
    opportunity: leads.filter(l => l.status === 'opportunity').length,
    converted: leads.filter(l => l.status === 'converted').length,
  };

  // Navigation functions
  const navigateToHome = () => {
    navigate('/');
  };

  const navigateToCampaigns = () => {
    navigate('/campaignManager');
  };

  const navigateToCreateCampaign = () => {
    navigate('/createCampaign');
  };

  const navigateToScheduling = () => {
    // This would navigate to a scheduling component when implemented
    alert('Navigate to: Smart Contact Scheduling');
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
            <button 
              onClick={navigateToCampaigns}
              className="text-slate-300 hover:text-white font-medium transition-colors"
            >
              Campaigns
            </button>
            <button className="text-white font-semibold bg-green-500/20 px-4 py-2 rounded-lg">
              Lead Manager
            </button>
            <button 
              onClick={navigateToScheduling}
              className="text-slate-300 hover:text-white font-medium transition-colors"
            >
              Scheduling
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
          <h1 className="text-3xl font-bold text-white mb-2">Lead Management</h1>
          <p className="text-slate-400">AI-powered lead tracking and contact management</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          {Object.entries(statusCounts).map(([status, count]) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`p-4 rounded-lg border transition-all text-center ${
                selectedStatus === status
                  ? 'bg-green-500/20 border-green-500 text-green-400'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
              }`}
            >
              <div className="text-2xl font-bold">{count}</div>
              <div className="text-xs capitalize">{status === 'all' ? 'Total' : status}</div>
            </button>
          ))}
        </div>

        {/* Filters and Actions */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-64 px-4 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:border-green-500 focus:outline-none transition-colors"
                />
              </div>
              
              <select
                value={selectedCampaign}
                onChange={(e) => setSelectedCampaign(e.target.value)}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:border-green-500 focus:outline-none transition-colors"
              >
                <option value="all">All Campaigns</option>
                {mockCampaigns.map(campaign => (
                  <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
                ))}
              </select>

              <select
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:border-green-500 focus:outline-none transition-colors"
              >
                <option value="all">All Agents</option>
                {uniqueAgents.map(agent => (
                  <option key={agent} value={agent}>{agent}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-4 items-center flex-wrap">
              {selectedLeads.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-400">{selectedLeads.length} selected</span>
                  <button
                    onClick={() => setShowBulkModal(true)}
                    className="px-3 py-2 bg-green-500/20 text-green-400 rounded-md text-sm font-medium hover:bg-green-500/30 transition-colors"
                  >
                    Bulk Actions
                  </button>
                  <button
                    onClick={clearSelection}
                    className="px-3 py-2 bg-slate-600 text-slate-300 rounded-md text-sm font-medium hover:bg-slate-500 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              )}

              <span className="text-sm text-slate-400">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white text-sm focus:border-green-500 focus:outline-none transition-colors"
              >
                <option value="created">Created Date</option>
                <option value="score">AI Score</option>
                <option value="name">Name</option>
                <option value="status">Status</option>
                <option value="lastContact">Last Contact</option>
              </select>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white text-sm hover:bg-slate-600 transition-colors"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>

          {filteredLeads.length > 0 && (
            <div className="mt-4 flex gap-2">
              <button
                onClick={selectAllLeads}
                className="text-xs text-green-400 hover:text-green-300 transition-colors"
              >
                Select All ({filteredLeads.length})
              </button>
            </div>
          )}
        </div>

        {/* Lead List */}
        <div className="space-y-4">
          {filteredLeads.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-semibold mb-2 text-white">No leads found</h3>
              <p className="text-slate-400 mb-6">Try adjusting your search criteria or create a new campaign.</p>
              <button
                onClick={navigateToCreateCampaign}
                className="bg-green-500 hover:bg-green-600 text-slate-900 font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                Create New Campaign
              </button>
            </div>
          ) : (
            filteredLeads.map((lead) => (
              <div 
                key={lead.id} 
                onClick={() => openLeadDetail(lead.id)}
                className={`bg-slate-800 rounded-xl border p-6 hover:border-slate-600 transition-all cursor-pointer ${
                  selectedLeads.includes(lead.id) ? 'border-green-500 bg-green-500/5' : 'border-slate-700'
                }`}
              >
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={selectedLeads.includes(lead.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleLeadSelection(lead.id);
                    }}
                    className="accent-green-500 flex-shrink-0"
                  />

                  {/* Lead Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-lg font-semibold text-white">
                        {lead.firstName} {lead.lastName}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${getStatusStyling(lead.status)}`}>
                        {lead.status.replace('_', ' ')}
                      </span>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className="text-xs text-slate-400">AI Score:</span>
                        <span className={`font-bold ${getScoreStyling(lead.aiScore)}`}>
                          {lead.aiScore}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-sm text-slate-400 mb-2">
                      <span className="break-all">{lead.email}</span>
                      {lead.phone && <span className="mx-2">•</span>}
                      {lead.phone && <span>{lead.phone}</span>}
                      {lead.company && <span className="mx-2">•</span>}
                      {lead.company && <span>{lead.company}</span>}
                    </div>

                    <div className="text-xs text-slate-500 mb-2">
                      {lead.campaignName} • {lead.source} • Created {new Date(lead.createdAt).toLocaleDateString()}
                    </div>

                    {/* AI Insights */}
                    <div className="flex flex-wrap gap-1 mb-2">
                      {lead.aiInsights.slice(0, 3).map((insight, index) => (
                        <span key={index} className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-xs">
                          {insight}
                        </span>
                      ))}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {lead.tags.map((tag, index) => (
                        <span key={index} className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-xs">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-medium text-white mb-1">
                      {lead.contactAttempts} attempts
                    </div>
                    <div className="text-xs text-slate-400 mb-2">
                      {lead.lastContactedAt 
                        ? `Last: ${new Date(lead.lastContactedAt).toLocaleDateString()}`
                        : 'Never contacted'
                      }
                    </div>
                    {lead.assignedAgent && (
                      <div className="text-xs text-green-400">
                        Agent: {lead.assignedAgent}
                      </div>
                    )}
                    {lead.nextAction && (
                      <div className="text-xs text-yellow-400 mt-1">
                        Next: {lead.nextAction}
                      </div>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateLeadStatus(lead.id, 'contacted');
                      }}
                      className="px-3 py-2 bg-blue-500/20 text-blue-400 rounded text-xs font-medium hover:bg-blue-500/30 transition-colors min-w-[80px]"
                    >
                      📞 Call
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        alert(`Send email to ${lead.email}`);
                      }}
                      className="px-3 py-2 bg-green-500/20 text-green-400 rounded text-xs font-medium hover:bg-green-500/30 transition-colors min-w-[80px]"
                    >
                      ✉️ Email
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateToScheduling();
                      }}
                      className="px-3 py-2 bg-purple-500/20 text-purple-400 rounded text-xs font-medium hover:bg-purple-500/30 transition-colors min-w-[80px]"
                    >
                      📅 Schedule
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bulk Actions Modal */}
        {showBulkModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-md">
              <div className="p-6 border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white">Bulk Actions</h2>
                  <button
                    onClick={closeBulkModal}
                    className="text-slate-400 hover:text-white text-xl transition-colors"
                  >
                    ×
                  </button>
                </div>
                <p className="text-slate-300 mt-1 text-sm">{selectedLeads.length} leads selected</p>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white">Action Type</label>
                    <select
                      value={bulkAction}
                      onChange={(e) => setBulkAction(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:border-green-500 focus:outline-none transition-colors"
                    >
                      <option value="status">Update Status</option>
                      <option value="agent">Assign Agent</option>
                      <option value="tags">Add Tags</option>
                    </select>
                  </div>

                  {bulkAction === 'status' && (
                    <div>
                      <label className="block text-sm font-medium mb-2 text-white">New Status</label>
                      <select className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:border-green-500 focus:outline-none transition-colors">
                        <option value="contacted">Contacted</option>
                        <option value="qualified">Qualified</option>
                        <option value="opportunity">Opportunity</option>
                        <option value="rejected">Rejected</option>
                        <option value="unresponsive">Unresponsive</option>
                      </select>
                    </div>
                  )}

                  {bulkAction === 'agent' && (
                    <div>
                      <label className="block text-sm font-medium mb-2 text-white">Assign to Agent</label>
                      <select className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:border-green-500 focus:outline-none transition-colors">
                        {uniqueAgents.map(agent => (
                          <option key={agent} value={agent}>{agent}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {bulkAction === 'tags' && (
                    <div>
                      <label className="block text-sm font-medium mb-2 text-white">Add Tags</label>
                      <input
                        type="text"
                        placeholder="Enter tags separated by commas"
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:border-green-500 focus:outline-none transition-colors"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-slate-700 flex gap-3">
                <button
                  onClick={closeBulkModal}
                  className="flex-1 px-4 py-2 bg-slate-600 text-slate-300 rounded-lg font-medium hover:bg-slate-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Implement bulk action
                    alert(`Bulk action: ${bulkAction} applied to ${selectedLeads.length} leads`);
                    clearSelection();
                    closeBulkModal();
                  }}
                  className="flex-1 px-4 py-2 bg-green-500 text-slate-900 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                >
                  Apply Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
