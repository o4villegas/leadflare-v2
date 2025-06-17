# LeadFlare v2.0

> AI-Powered Lead Generation Platform for Call Centers

<a href="https://deploy.workers.cloudflare.com/?url=https://github.com/o4villegas/leadflare-v2"><img src="https://deploy.workers.cloudflare.com/button" alt="Deploy to Cloudflare"/></a>

LeadFlare v2 enables call centers to offer sophisticated lead generation services to their clients through a **single-operator platform**. Unlike traditional lead generation that requires entire teams, LeadFlare's AI-powered automation allows one person to manage multiple campaigns, create content, and coordinate outreach across channels - dramatically reducing operational costs while expanding service offerings.

## 🚀 Features

### Single-Operator Efficiency
- **One-Person Operation**: Manage multiple client campaigns with a single operator
- **AI-Powered Automation**: Reduce manual work through intelligent content generation and targeting
- **Streamlined Workflow**: From campaign creation to lead delivery in one unified platform
- **Cost-Effective Scaling**: Expand lead generation services without proportional staff increases

### For Call Centers
- **Expand Service Offerings**: Add lead generation to your portfolio beyond traditional calling services
- **Operational Efficiency**: Deploy lead generation services with minimal additional staffing
- **Client Dashboard**: White-label interface for call center clients to monitor campaigns
- **Revenue Growth**: New revenue streams through AI-assisted lead generation services
- **Performance Tracking**: ROI reporting and lead quality metrics for clients

### AI-Powered Automation
- **Smart Campaign Creation**: Automated Meta campaign setup with intelligent targeting
- **Creative Generation**: OpenAI-powered ad copy and visual creation
- **Lead Qualification**: AI-powered lead scoring and routing
- **Multi-Channel Outreach**: Coordinated email, SMS, and call sequences

### Technical Features
- **Real-Time Analytics**: Campaign performance tracking and optimization
- **Template System**: Quick-start templates for different industries
- **Scalable Infrastructure**: Built on Cloudflare's global edge network
- **Type-Safe Development**: Full TypeScript integration for reliable code

## 💼 Use Cases for Call Centers

### 1. **Real Estate Call Center**
   - **Target Market**: Home buyers, sellers, and investors
   - **Campaign Types**: 
     - New listing alerts for buyers in specific neighborhoods
     - Market analysis reports for sellers
     - Investment property opportunities
   - **Lead Qualification**: Property budget, timeline, location preferences
   - **Single-Operator Impact**: Manage 5-10 real estate client campaigns simultaneously

### 2. **SaaS Sales Call Center**
   - **Target Market**: Business decision makers and IT professionals
   - **Campaign Types**:
     - Free trial signups with demo scheduling
     - Industry-specific software solutions
     - Competitive comparison campaigns
   - **Lead Qualification**: Company size, current tools, budget authority
   - **Single-Operator Impact**: Handle multiple SaaS client verticals efficiently

### 3. **Healthcare Services Call Center**
   - **Target Market**: Patients seeking medical and wellness services
   - **Campaign Types**:
     - New patient acquisition for clinics
     - Specialized treatment awareness campaigns
     - Insurance-based service promotion
   - **Lead Qualification**: Insurance type, service area, urgency level
   - **Single-Operator Impact**: Manage healthcare campaigns across multiple specialties

### 4. **Financial Services Call Center**
   - **Target Market**: Individuals and businesses seeking financial products
   - **Campaign Types**:
     - Mortgage refinancing opportunities
     - Business loan pre-qualification
     - Investment consultation appointments
   - **Lead Qualification**: Credit score range, loan amount, investment goals
   - **Single-Operator Impact**: Coordinate campaigns for multiple financial product lines

### 5. **Home Services Call Center**
   - **Target Market**: Homeowners needing repairs, renovations, or maintenance
   - **Campaign Types**:
     - Seasonal service reminders (HVAC, roofing)
     - Emergency repair lead capture
     - Home improvement project estimates
   - **Lead Qualification**: Service type, property age, budget range
   - **Single-Operator Impact**: Manage local service provider campaigns across multiple trades

Each use case demonstrates how **one operator** can efficiently manage multiple client campaigns by leveraging AI automation for content creation, audience targeting, and lead qualification - transforming traditional call center economics.

## 🛠 Tech Stack

### Core Infrastructure
- **[Cloudflare Workers](https://developers.cloudflare.com/workers/)** - Edge computing platform for global performance
- **[Hono](https://hono.dev/docs/)** - Ultra-fast web framework for edge runtimes
- **[React Router v7](https://reactrouter.com/home)** - Modern routing with file-based routing
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development

### Frontend
- **[React 18](https://react.dev/)** - UI component library
- **[Tailwind CSS](https://tailwindcss.com/docs/installation/using-vite)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/docs)** - Modern component library
- **[Vite](https://vitejs.dev/)** - Fast build tool and dev server

### AI & APIs
- **[OpenAI API](https://openai.com/api/)** - Creative generation and content optimization
- **[Anthropic Claude](https://www.anthropic.com/)** - Contact scheduling and outreach planning
- **[Meta Marketing API](https://developers.facebook.com/docs/marketing-apis/)** - Campaign creation and management

### Data & Storage
- **[Cloudflare KV](https://developers.cloudflare.com/kv/)** - Key-value storage for campaigns
- **[Cloudflare D1](https://developers.cloudflare.com/d1/)** - SQL database for lead management
- **[Cloudflare Queues](https://developers.cloudflare.com/queues/)** - Background job processing

## 📁 Project Structure

```
LeadFlare-v2/
├── app/                          # Frontend application
│   ├── routes/                   # File-based routing
│   │   ├── index.tsx            # Home page (combined welcome)
│   │   ├── createCampaign.tsx   # Campaign creation flow
│   │   ├── generateCreative.tsx # AI creative generation
│   │   ├── approveLaunch.tsx    # Campaign approval
│   │   ├── campaignManager.tsx  # Campaign management
│   │   ├── leadDetail.tsx       # Individual lead details
│   │   ├── outreachPlanner.tsx  # AI outreach planning
│   │   ├── scheduleOutreach.tsx # Contact scheduling
│   │   └── settings.tsx         # App settings
│   ├── routes.ts                # Route configuration
│   ├── root.tsx                 # App root layout
│   ├── entry.client.tsx         # Client entry point
│   ├── entry.server.tsx         # Server entry point
│   └── app.css                  # Global styles
├── workers/                      # Cloudflare Workers backend
│   ├── common.ts                # Shared worker utilities
│   ├── api.ts                   # API route handlers
│   ├── ai.ts                    # AI service integrations
│   ├── db.ts                    # Database operations
│   └── jobs.ts                  # Background job handlers
├── public/                       # Static assets
├── docs/                         # Documentation
├── wrangler.jsonc               # Cloudflare Workers configuration
├── vite.config.ts               # Vite build configuration
├── tsconfig.json                # TypeScript configuration
├── tsconfig.cloudflare.json     # Cloudflare-specific TS config
├── react-router.config.ts       # React Router configuration
└── package.json                 # Dependencies and scripts
```

## 🚦 Quick Start

### Prerequisites

- **Node.js 18+** 
- **Cloudflare account** with Workers plan
- **OpenAI API access**
- **Anthropic API access**
- **Meta Developer account** (for campaign creation)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/o4villegas/leadflare-v2.git
   cd leadflare-v2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   # Create environment file
   cp .env.example .dev.vars
   
   # Add your API keys to .dev.vars (see .env.example for required variables)
   ```

4. **Start development**
   ```bash
   npm start
   ```

5. **Deploy to production**
   ```bash
   npm run deploy
   ```

   Visit your deployed app to start creating campaigns!

## 🔧 Development

### Available Scripts

```bash
# Development
npm start           # Start dev server with HMR  
npm run build       # Build for production
npm run preview     # Preview production build

# Deployment  
npm run deploy      # Deploy to Cloudflare Workers
npm run deploy:prod # Deploy to production environment

# Database
npm run db:migrate  # Run database migrations
npm run db:studio   # Open database studio

# Code Quality
npm run lint        # Run ESLint
npm run type-check  # Run TypeScript checks
```

### Development Workflow

1. **Route Development**: Add new pages in `app/routes/` - they're automatically discovered
2. **API Development**: Add endpoints in `workers/api.ts` using Hono
3. **Database Changes**: Update schema in `workers/db.ts` and run migrations
4. **Component Development**: Build reusable components with Tailwind + shadcn/ui
5. **Type Safety**: Leverage TypeScript throughout the stack

### Environment Variables

```bash
# Required for development
# See .env.example for complete list of required environment variables
# Add your API keys to .dev.vars (not tracked in git)

# Cloudflare Workers (set via wrangler)
KV_CAMPAIGNS=...                         # KV namespace for campaigns
D1_DATABASE=...                          # D1 database binding
QUEUE_OUTREACH=...                       # Queue for outreach jobs

# Optional
SENTRY_DSN=...                           # Error tracking
ANALYTICS_ID=...                         # Analytics tracking
```

## 🏗 Architecture

### Single-Operator Design Philosophy

LeadFlare v2 is architected specifically for **one-person operation** of multiple client campaigns. Every component is designed to minimize manual intervention while maximizing campaign effectiveness through AI automation.

### Frontend Architecture

- **File-based Routing**: Routes automatically discovered from `app/routes/`
- **Server-Side Rendering**: React Router v7 with SSR on Cloudflare Workers
- **Type-Safe APIs**: Full TypeScript integration with generated route types
- **Component Library**: shadcn/ui components with Tailwind styling
- **State Management**: React hooks for local state, server state via loaders

### Backend Architecture

- **Edge-First**: Runs on Cloudflare's global edge network
- **Modular Workers**: Separate concerns (API, AI, DB, Jobs)
- **Type-Safe Database**: Drizzle ORM with TypeScript schemas
- **Queue Processing**: Background jobs for AI generation and outreach
- **Caching Strategy**: KV storage for campaigns, D1 for transactional data

### AI Integration

- **OpenAI Integration**: Creative generation, ad copy optimization
- **Anthropic Integration**: Contact scheduling, outreach personalization
- **Prompt Engineering**: Optimized prompts for campaign context
- **Response Streaming**: Real-time AI responses for better UX

## 🚀 Deployment

### Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to Cloudflare**
   ```bash
   npm run deploy:prod
   ```

3. **Set production environment variables**
   ```bash
   # Set your API keys using wrangler secrets
   # See .env.example for required environment variables
   npx wrangler secret put [VARIABLE_NAME]
   ```

### Staging Environment

```bash
# Deploy to staging
npm run deploy:staging

# Environment-specific configurations in wrangler.jsonc
```

### Custom Domain

Update `wrangler.jsonc` to configure custom domains:

```json
{
  "env": {
    "production": {
      "routes": [
        "leadflare.com/*",
        "www.leadflare.com/*"
      ]
    }
  }
}
```

## 📖 API Documentation

### Campaign Management

```typescript
// Create campaign
POST /api/campaigns
{
  "name": "Campaign Name",
  "businessType": "Technology",
  "budget": 75,
  "targeting": { ... }
}

// Get campaigns
GET /api/campaigns

// Update campaign
PUT /api/campaigns/:id

// Delete campaign
DELETE /api/campaigns/:id
```

### AI Services

```typescript
// Generate creative content
POST /api/ai/creative
{
  "campaignId": "uuid",
  "businessType": "Technology",
  "targetAudience": "SaaS professionals"
}

// Plan outreach sequence
POST /api/ai/outreach
{
  "leadId": "uuid",
  "campaignContext": "..."
}
```

### Lead Management

```typescript
// Get leads
GET /api/leads?campaignId=uuid

// Update lead status
PUT /api/leads/:id/status
{
  "status": "contacted",
  "notes": "Follow-up scheduled"
}

// Schedule outreach
POST /api/leads/:id/schedule
{
  "type": "email",
  "scheduledFor": "2024-01-15T10:00:00Z"
}
```

## 🎯 Current Status

### ✅ Completed Features

- [x] **Project Setup**: Cloudflare Workers + React Router v7 scaffold
- [x] **Home Page**: Landing page with campaign overview dashboard
- [x] **Campaign Creation Flow**: Complete campaign setup with templates and targeting
- [x] **Responsive Design**: Mobile-first Tailwind CSS implementation
- [x] **Route Configuration**: File-based routing with TypeScript type safety
- [x] **Build System**: Production-ready Vite + React Router v7 build

### 🔄 In Development (Q3 2025)

- [ ] **Meta API Integration**: Live campaign creation and management
- [ ] **AI Creative Generation**: OpenAI integration for automated ad content
- [ ] **Campaign Approval Workflow**: Review and launch management
- [ ] **Database Integration**: Cloudflare D1 setup with lead management
- [ ] **Lead Capture System**: Form handling and lead storage

### 📋 Planned Features (Q4 2025 Launch)

All advanced lead management, multi-channel outreach, and call center features are currently in planning phase for Q4 2025 launch.

### 📋 Roadmap (Q4 2025 Launch Target)

#### Development Phase (Current - Q2 2025): Foundation
- ✅ Campaign creation and configuration UI
- 🔄 AI-powered creative generation (OpenAI)
- 🔄 Campaign approval and launch workflow
- 🔄 Basic lead capture and storage

#### Integration Phase (Q3 2025): Core Features
- [ ] Meta API integration for live campaign creation
- [ ] Comprehensive lead management CRM
- [ ] AI-powered lead scoring and qualification
- [ ] Automated follow-up sequences

#### Launch Phase (Q4 2025): Call Center Features
- [ ] Single-operator dashboard for managing multiple client campaigns
- [ ] Multi-channel outreach (email, SMS, call scheduling)
- [ ] Client management and white-labeling tools
- [ ] Performance reporting and ROI tracking for call center clients
- [ ] Cross-channel performance analytics

#### Post-Launch (2026): Advanced Features
- [ ] Revenue sharing and billing integration
- [ ] Advanced analytics optimized for one-person operation
- [ ] API access for integrations
- [ ] Enhanced automation and AI optimization

## 🤝 Contributing

This is currently a solo development project targeting a 2025 launch. 

### Development Guidelines

1. **Code Style**: Follow TypeScript best practices and ESLint rules
2. **Component Structure**: Use functional components with hooks
3. **Styling**: Utility-first approach with Tailwind CSS
4. **Type Safety**: Leverage TypeScript throughout the stack

### Future Collaboration

While this is currently a solo project, the codebase is structured for future team collaboration:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes with proper TypeScript types
4. Test your changes locally
5. Commit with conventional commits: `feat: add amazing feature`
6. Push to your fork and submit a pull request

### Code Standards

```typescript
// Use descriptive interfaces
interface CampaignData {
  name: string;
  businessType: BusinessType;
  targeting: AudienceTargeting;
}

// Prefer composition over inheritance
const useCampaignData = () => {
  const [data, setData] = useState<CampaignData>();
  // ... logic
  return { data, setData };
};

// Use proper error handling
try {
  const result = await createCampaign(data);
  return result;
} catch (error) {
  console.error('Campaign creation failed:', error);
  throw new Error('Failed to create campaign');
}
```

## ⚙️ Customization Guide

### Adding Industry Templates

Create new campaign templates in `app/routes/createCampaign.tsx`:

```typescript
const templates = {
  // Add your industry template
  automotive: {
    name: 'Auto Dealership Lead Generation',
    businessType: 'Automotive',
    description: 'Generate leads for car sales and service appointments',
    budget: 65,
    interests: ['Car shopping', 'Auto financing', 'Vehicle maintenance'],
    behaviors: ['Car buyers', 'Auto enthusiasts'],
    // ... other template properties
  }
};
```

### Customizing Lead Forms

Modify form fields for specific industries in the lead form configuration:

```typescript
// Industry-specific form fields
const industryFormFields = {
  realestate: ['email', 'full_name', 'phone_number', 'budget_range', 'preferred_area'],
  healthcare: ['email', 'full_name', 'phone_number', 'insurance_type', 'preferred_appointment'],
  automotive: ['email', 'full_name', 'phone_number', 'vehicle_interest', 'financing_needed'],
};
```

### Integrating with Your CRM

Add CRM webhook integration in `workers/api.ts`:

```typescript
// Send leads to external CRM
app.post('/api/leads/webhook', async (c) => {
  const leadData = await c.req.json();
  
  // Transform data for your CRM format
  const crmPayload = transformLeadForCRM(leadData);
  
  // Send to your CRM system
  await fetch('https://your-crm.com/api/leads', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer YOUR_CRM_TOKEN' },
    body: JSON.stringify(crmPayload)
  });
  
  return c.json({ success: true });
});
```

### Custom AI Prompts

Customize AI-generated content for your industry in `workers/ai.ts`:

```typescript
// Industry-specific prompts
const industryPrompts = {
  realestate: "Create compelling real estate ad copy focusing on location benefits and investment potential...",
  healthcare: "Generate healthcare service ads emphasizing trust, expertise, and patient care...",
  automotive: "Develop automotive ads highlighting vehicle features, financing options, and dealership reputation..."
};

export async function generateCreative(businessType: string, campaignContext: string) {
  const prompt = industryPrompts[businessType] || defaultPrompt;
  // ... AI generation logic
}
```

### White-Label Configuration

Customize branding for your call center clients in `app/root.tsx`:

```typescript
// Client-specific branding
const clientBranding = {
  logo: process.env.CLIENT_LOGO_URL,
  primaryColor: process.env.CLIENT_PRIMARY_COLOR,
  companyName: process.env.CLIENT_COMPANY_NAME,
};
```

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

- **Documentation**: Check the `/docs` folder for detailed guides
- **Issues**: Report bugs via [GitHub Issues](https://github.com/o4villegas/leadflare-v2/issues)
- **Questions**: Contact [@o4villegas](https://github.com/o4villegas) for development questions

---

**Built for call centers seeking efficient, single-operator lead generation solutions**

*Target Launch: Q4 2025 | Last updated: 2024-06-17*
