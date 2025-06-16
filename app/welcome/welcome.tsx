import React from 'react';

export function Welcome({ message }: { message: string }) {
  const workflowSteps = [
    { title: "Lead Generation", desc: "Meta & multi-channel lead capture", icon: "🎯" },
    { title: "Campaign CRM", desc: "Intelligent lead management", icon: "📊" },
    { title: "Smart Contact Scheduling", desc: "Powered by Anthropic AI", icon: "📅" },
    { title: "Automated Creative Suite", desc: "Powered by OpenAI", icon: "🎨" }
  ];

  const stats = [
    { label: "Active Campaigns", value: "247", change: "+12%" },
    { label: "Leads Generated", value: "15.2K", change: "+23%" },
    { label: "Conversion Rate", value: "8.4%", change: "+1.2%" },
    { label: "ROI", value: "340%", change: "+45%" }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans">
      
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-slate-900/80 backdrop-blur-sm px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-24">
          <div className="flex items-center">
            <img 
              src="/logo-dark.svg" 
              alt="LeadFlare" 
              className="h-20"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="text-slate-400 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Docs
            </button>
            <button className="text-slate-400 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Support
            </button>
            <button className="bg-green-500 hover:bg-green-600 text-slate-900 px-4 py-2 rounded-md text-sm font-semibold transition-colors">
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column */}
          <div>
            <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight mb-6 bg-gradient-to-r from-white to-green-400 bg-clip-text text-transparent">
              AI-Powered Campaign Management for Call Centers
            </h1>
            
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              From Meta campaign creation to lead nurturing - automate your entire workflow with AI-generated creatives, intelligent CRM, and advanced contact scheduling.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button className="bg-green-500 hover:bg-green-600 text-slate-900 px-8 py-4 rounded-lg text-lg font-bold transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-green-500/25">
                Create Campaign Now
              </button>
              <button className="border-2 border-green-500 hover:border-green-400 text-green-400 hover:text-green-300 hover:bg-green-500/10 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200">
                Manage Campaigns
              </button>
            </div>

            <p className="text-sm text-slate-500">
              Server Status: <span className="text-green-400">{message || "Connected to Cloudflare Edge"}</span>
            </p>
          </div>

          {/* Right Column - Dashboard Preview */}
          <div className="relative">
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Campaign Dashboard</h3>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                  <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></div>
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                {stats.map((stat, i) => (
                  <div key={i} className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                    <div className="text-2xl font-bold text-green-400 mb-1">
                      {stat.value}
                    </div>
                    <div className="text-xs text-slate-300 mb-0.5">
                      {stat.label}
                    </div>
                    <div className="text-xs text-green-400">
                      {stat.change}
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-300">Active: Tech Startup Leads</span>
                  <span className="text-green-400">86% CTR</span>
                </div>
                <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div className="w-5/6 h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Workflow Section */}
      <section className="py-16 px-6 bg-slate-800/50 border-t border-b border-slate-700">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Complete AI Workflow
            </h2>
            <p className="text-xl text-slate-300">
              End-to-end campaign management powered by OpenAI and Anthropic
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {workflowSteps.map((step, i) => (
              <div key={i} className="group relative bg-slate-800 rounded-xl p-6 border border-slate-700 text-center cursor-pointer transition-all duration-200 hover:border-green-500 hover:shadow-lg hover:shadow-green-500/20 hover:-translate-y-1">
                <div className="text-3xl mb-3">{step.icon}</div>
                <h3 className="text-sm font-semibold mb-2">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-400">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          <div className="bg-slate-800 rounded-xl p-8 border border-slate-700">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center text-2xl mb-4">
              🤖
            </div>
            <h3 className="text-xl font-semibold mb-3">
              AI Creative Generation
            </h3>
            <p className="text-slate-300 leading-relaxed">
              OpenAI generates compelling ad copy and visuals tailored to your target market and campaign objectives.
            </p>
          </div>

          <div className="bg-slate-800 rounded-xl p-8 border border-slate-700">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center text-2xl mb-4">
              📊
            </div>
            <h3 className="text-xl font-semibold mb-3">
              Smart CRM
            </h3>
            <p className="text-slate-300 leading-relaxed">
              Advanced lead management with AI-powered scoring, segmentation, and automated follow-up sequences.
            </p>
          </div>

          <div className="bg-slate-800 rounded-xl p-8 border border-slate-700">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center text-2xl mb-4">
              ⚡
            </div>
            <h3 className="text-xl font-semibold mb-3">
              Multi-Channel Outreach
            </h3>
            <p className="text-slate-300 leading-relaxed">
              Coordinated email, SMS, and call scheduling powered by Anthropic's advanced language models.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900/80 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img 
                  src="/logo-dark.svg" 
                  alt="LeadFlare" 
                  className="h-6"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <span className="font-semibold">LeadFlare</span>
              </div>
              <p className="text-slate-400 text-sm">
                AI-powered campaign management for the modern call center.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-green-400 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors">API</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-green-400 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors">Guides</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-green-400 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors">Careers</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-400 text-sm">
            © 2024 LeadFlare. Built on Cloudflare Workers with AI.
          </div>
        </div>
      </footer>

    </div>
  );
}
