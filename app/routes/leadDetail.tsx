import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import type { Route } from "./+types/leadDetail";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Lead Detail - LeadFlare" },
    { name: "description", content: "Detailed lead information and contact management" },
  ];
}

// TypeScript interfaces (same as lead management)
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
  aiScore: number;
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

// Mock lead data (in real implementation, this would come from URL params or props)
const mockLead: Lead = {
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
};

export default function LeadDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  // Get lead ID from URL state if navigated from lead management
  const leadId = location?.state?.leadId || '1';

  // State management
  const [lead, setLead] = useState<Lead>(mockLead);
  const [isEditing, setIsEditing] = useState(false);

  // AI score styling
  const getScoreStyling = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

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

  // Update lead status
  const updateLeadStatus = (newStatus: Lead['status']) => {
    setLead(prev => ({
      ...prev,
      status: newStatus,
      lastContactedAt: new Date().toISOString()
    }));
  };

  // Add contact note
  const addContactNote = (note: Omit<ContactNote, 'id'>) => {
    const newNote: ContactNote = {
      ...note,
      id: Date.now().toString()
    };

    setLead(prev => ({
      ...prev,
      notes: [newNote, ...prev.notes],
      lastContactedAt: new Date().toISOString(),
      contactAttempts: prev.contactAttempts + 1
    }));
  };

  // Navigation functions
  const navigateToHome = () => {
    navigate('/');
  };

  const navigateToCampaigns = () => {
    navigate('/campaignManager');
  };

  const navigateToLeadManagement = () => {
    navigate('/leadManagement');
  };

  const navigateToScheduling = () => {
    alert('Navigate to: Smart Contact Scheduling');
  };

  const navigateToCreateCampaign = () => {
    navigate('/createCampaign');
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
            <button 
              onClick={navigateToLeadManagement}
              className="text-white font-semibold bg-green-500/20 px-4 py-2 rounded-lg"
            >
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
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={navigateToLeadManagement}
              className="text-slate-400 hover:text-white transition-colors"
            >
              ← Back to Lead Manager
            </button>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {lead.firstName} {lead.lastName}
          </h1>
          <p className="text-slate-400">{lead.email} • {lead.campaignName}</p>
        </div>

        {/* Lead Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 text-center">
            <div className={`text-3xl font-bold mb-2 ${getScoreStyling(lead.aiScore)}`}>
              {lead.aiScore}
            </div>
            <div className="text-slate-400 text-sm">AI Score</div>
          </div>
          
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {lead.contactAttempts}
            </div>
            <div className="text-slate-400 text-sm">Contact Attempts</div>
          </div>
          
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 text-center">
            <div className="text-lg font-bold text-white mb-2">
              {lead.lastContactedAt 
                ? new Date(lead.lastContactedAt).toLocaleDateString()
                : 'Never'
              }
            </div>
            <div className="text-slate-400 text-sm">Last Contact</div>
          </div>
          
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 text-center">
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusStyling(lead.status)}`}>
              {lead.status.replace('_', ' ')}
            </span>
            <div className="text-slate-400 text-sm mt-2">Status</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Lead Information */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Lead Information</h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-green-400 hover:text-green-300 text-sm font-medium transition-colors"
                >
                  {isEditing ? 'Save Changes' : 'Edit'}
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Status</label>
                  <select
                    value={lead.status}
                    onChange={(e) => updateLeadStatus(e.target.value as Lead['status'])}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:border-green-500 focus:outline-none transition-colors"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="opportunity">Opportunity</option>
                    <option value="converted">Converted</option>
                    <option value="rejected">Rejected</option>
                    <option value="unresponsive">Unresponsive</option>
                    <option value="do_not_contact">Do Not Contact</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Assigned Agent</label>
                  <select
                    value={lead.assignedAgent || ''}
                    onChange={(e) => setLead(prev => ({ ...prev, assignedAgent: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:border-green-500 focus:outline-none transition-colors"
                  >
                    <option value="">Unassigned</option>
                    <option value="Mike Chen">Mike Chen</option>
                    <option value="Lisa Park">Lisa Park</option>
                    <option value="Dr. Sarah Kim">Dr. Sarah Kim</option>
                    <option value="Tom Wilson">Tom Wilson</option>
                    <option value="Amanda Foster">Amanda Foster</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-3 text-white">Contact Details</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Email:</span>
                      <span className="text-white break-all">{lead.email}</span>
                    </div>
                    {lead.phone && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Phone:</span>
                        <span className="text-white">{lead.phone}</span>
                      </div>
                    )}
                    {lead.company && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Company:</span>
                        <span className="text-white">{lead.company}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-400">Source:</span>
                      <span className="text-white">{lead.source}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3 text-white">Campaign Info</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Campaign:</span>
                      <span className="text-white">{lead.campaignName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Created:</span>
                      <span className="text-white">{new Date(lead.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Lead Form Data */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h2 className="text-xl font-semibold mb-6 text-white">Lead Form Data</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(lead.formData).map(([key, value]) => (
                  <div key={key} className="flex justify-between p-3 bg-slate-700/50 rounded-lg">
                    <span className="text-slate-400 capitalize font-medium">{key.replace('_', ' ')}:</span>
                    <span className="text-white font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Insights */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h2 className="text-xl font-semibold mb-6 text-white">AI Insights</h2>
              <div className="space-y-3">
                {lead.aiInsights.map((insight, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <span className="text-blue-400 text-xl">🤖</span>
                    <span className="text-white">{insight}</span>
                  </div>
                ))}
              </div>
              {lead.nextAction && (
                <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-yellow-400">💡</span>
                    <span className="text-yellow-400 font-medium">Recommended Next Action:</span>
                  </div>
                  <div className="text-white">{lead.nextAction}</div>
                </div>
              )}
            </div>

            {/* Contact History */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h2 className="text-xl font-semibold mb-6 text-white">Contact History</h2>
              <div className="space-y-4">
                {lead.notes.map((note) => (
                  <div key={note.id} className="border-l-4 border-green-500 pl-4 py-3 bg-slate-700/30 rounded-r-lg">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="text-green-400 font-medium capitalize">{note.type}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-400 text-sm">{new Date(note.date).toLocaleDateString()}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-400 text-sm">{note.agent}</span>
                      {note.outcome && (
                        <>
                          <span className="text-slate-400">•</span>
                          <span className="text-blue-400 text-sm capitalize">{note.outcome.replace('_', ' ')}</span>
                        </>
                      )}
                    </div>
                    <p className="text-white">{note.content}</p>
                  </div>
                ))}
                
                {lead.notes.length === 0 && (
                  <div className="text-center py-8 text-slate-400">
                    No contact history yet
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h3 className="text-lg font-semibold mb-4 text-white">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => alert(`Calling ${lead.phone}`)}
                  className="w-full px-4 py-3 bg-blue-500/20 text-blue-400 rounded-lg font-medium hover:bg-blue-500/30 transition-colors flex items-center gap-3"
                >
                  <span className="text-xl">📞</span>
                  <div className="text-left">
                    <div>Call Lead</div>
                    <div className="text-xs opacity-75">{lead.phone}</div>
                  </div>
                </button>
                <button
                  onClick={() => alert(`Sending email to ${lead.email}`)}
                  className="w-full px-4 py-3 bg-green-500/20 text-green-400 rounded-lg font-medium hover:bg-green-500/30 transition-colors flex items-center gap-3"
                >
                  <span className="text-xl">✉️</span>
                  <div className="text-left">
                    <div>Send Email</div>
                    <div className="text-xs opacity-75 break-all">{lead.email}</div>
                  </div>
                </button>
                <button
                  onClick={navigateToScheduling}
                  className="w-full px-4 py-3 bg-purple-500/20 text-purple-400 rounded-lg font-medium hover:bg-purple-500/30 transition-colors flex items-center gap-3"
                >
                  <span className="text-xl">📅</span>
                  <div className="text-left">
                    <div>Schedule Meeting</div>
                    <div className="text-xs opacity-75">AI-optimized timing</div>
                  </div>
                </button>
                <button
                  onClick={() => alert('SMS feature coming soon')}
                  className="w-full px-4 py-3 bg-yellow-500/20 text-yellow-400 rounded-lg font-medium hover:bg-yellow-500/30 transition-colors flex items-center gap-3"
                >
                  <span className="text-xl">💬</span>
                  <div className="text-left">
                    <div>Send SMS</div>
                    <div className="text-xs opacity-75">Coming soon</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Add Contact Note */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h3 className="text-lg font-semibold mb-4 text-white">Add Contact Note</h3>
              <div className="space-y-4">
                <select
                  id="noteType"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:border-green-500 focus:outline-none transition-colors"
                >
                  <option value="call">Phone Call</option>
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="meeting">Meeting</option>
                  <option value="note">Note</option>
                </select>
                
                <select
                  id="noteOutcome"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:border-green-500 focus:outline-none transition-colors"
                >
                  <option value="">Select outcome (optional)</option>
                  <option value="connected">Connected</option>
                  <option value="voicemail">Voicemail</option>
                  <option value="no_answer">No Answer</option>
                  <option value="busy">Busy</option>
                  <option value="callback_requested">Callback Requested</option>
                </select>
                
                <textarea
                  id="noteContent"
                  rows={4}
                  placeholder="Add your note here..."
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:border-green-500 focus:outline-none resize-vertical transition-colors"
                />
                
                <button
                  onClick={() => {
                    const typeElement = document.getElementById('noteType') as HTMLSelectElement;
                    const outcomeElement = document.getElementById('noteOutcome') as HTMLSelectElement;
                    const contentElement = document.getElementById('noteContent') as HTMLTextAreaElement;
                    
                    if (contentElement.value.trim()) {
                      addContactNote({
                        date: new Date().toISOString(),
                        type: typeElement.value as ContactNote['type'],
                        content: contentElement.value,
                        agent: 'Current User',
                        outcome: outcomeElement.value as ContactNote['outcome'] || undefined
                      });
                      
                      // Reset form
                      typeElement.selectedIndex = 0;
                      outcomeElement.selectedIndex = 0;
                      contentElement.value = '';
                    }
                  }}
                  className="w-full px-4 py-2 bg-green-500 text-slate-900 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                >
                  Add Note
                </button>
              </div>
            </div>

            {/* Lead Tags */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h3 className="text-lg font-semibold mb-4 text-white">Lead Tags</h3>
              <div className="flex flex-wrap gap-2">
                {lead.tags.map((tag, index) => (
                  <span key={index} className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
                    #{tag}
                  </span>
                ))}
              </div>
              <button className="mt-4 text-green-400 hover:text-green-300 text-sm font-medium transition-colors">
                + Add Tag
              </button>
            </div>

            {/* Lead Activity Summary */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h3 className="text-lg font-semibold mb-4 text-white">Activity Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Contacts:</span>
                  <span className="text-white font-medium">{lead.contactAttempts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Calls Made:</span>
                  <span className="text-white font-medium">{lead.notes.filter(n => n.type === 'call').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Emails Sent:</span>
                  <span className="text-white font-medium">{lead.notes.filter(n => n.type === 'email').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Meetings:</span>
                  <span className="text-white font-medium">{lead.notes.filter(n => n.type === 'meeting').length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
