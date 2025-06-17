// workers/ai.ts - AI service integration for LeadFlare creative generation

import { Hono } from 'hono';

// TypeScript interfaces
interface CampaignContext {
  name: string;
  businessType: string;
  description: string;
  interests: string[];
  ageRange: string;
  locations: string[];
  budget: number;
}

interface CreativeRequest {
  campaignContext: CampaignContext;
  contentType?: 'headlines' | 'descriptions' | 'ctas' | 'images';
  regenerate?: boolean;
}

interface CreativeResponse {
  id: string;
  type: string;
  content: string;
  imageUrl?: string;
  score: number;
  isSelected: boolean;
}

interface CreativeBatch {
  headlines: CreativeResponse[];
  descriptions: CreativeResponse[];
  ctas: CreativeResponse[];
  images: CreativeResponse[];
}

// Initialize Hono app
const app = new Hono();

// Main creative generation endpoint
app.post('/api/ai/generate-creatives', async (c) => {
  try {
    const { campaignContext, contentType, regenerate }: CreativeRequest = await c.req.json();
    
    // Validate input
    if (!campaignContext) {
      return c.json({ error: 'Missing campaign context' }, 400);
    }

    let result: Partial<CreativeBatch> = {};

    if (contentType && regenerate) {
      // Regenerate specific section
      const creatives = await generateSpecificContent(c.env, campaignContext, contentType);
      result[contentType] = creatives;
    } else {
      // Generate all creative types
      const [headlines, descriptions, ctas, images] = await Promise.all([
        generateHeadlines(c.env, campaignContext),
        generateDescriptions(c.env, campaignContext),
        generateCTAs(c.env, campaignContext),
        generateImages(c.env, campaignContext)
      ]);

      result = { headlines, descriptions, ctas, images };
    }

    return c.json({
      success: true,
      creatives: result,
      generated_at: new Date().toISOString(),
      campaignName: campaignContext.name
    });

  } catch (error) {
    console.error('Creative generation error:', error);
    return c.json({ 
      error: 'Failed to generate creatives',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Generate specific content type (for regeneration)
async function generateSpecificContent(
  env: any, 
  context: CampaignContext, 
  contentType: string
): Promise<CreativeResponse[]> {
  switch (contentType) {
    case 'headlines':
      return await generateHeadlines(env, context);
    case 'descriptions':
      return await generateDescriptions(env, context);
    case 'ctas':
      return await generateCTAs(env, context);
    case 'images':
      return await generateImages(env, context);
    default:
      throw new Error(`Unknown content type: ${contentType}`);
  }
}

// Generate headlines using Cloudflare Workers AI
async function generateHeadlines(env: any, context: CampaignContext): Promise<CreativeResponse[]> {
  const prompt = buildHeadlinePrompt(context);
  
  try {
    // Try Cloudflare Workers AI first
    const response = await env.AI.run('@cf/meta/llama-2-7b-chat-fp16', {
      messages: [
        {
          role: 'system',
          content: 'You are an expert Facebook/Instagram ad copywriter. Generate compelling, high-converting headlines that drive clicks and leads. Keep headlines under 60 characters for optimal display.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 200,
      temperature: 0.8
    });

    const headlines = parseAIResponse(response.response, 4);
    
    return headlines.map((headline, index) => ({
      id: `headline_${Date.now()}_${index}`,
      type: 'headline',
      content: headline,
      score: Math.floor(Math.random() * 15) + 85, // 85-100% range
      isSelected: false
    }));

  } catch (error) {
    console.warn('Cloudflare Workers AI failed for headlines, trying OpenAI fallback:', error);
    return await generateHeadlinesOpenAI(env, context);
  }
}

// Generate descriptions using Cloudflare Workers AI
async function generateDescriptions(env: any, context: CampaignContext): Promise<CreativeResponse[]> {
  const prompt = buildDescriptionPrompt(context);
  
  try {
    const response = await env.AI.run('@cf/meta/llama-2-7b-chat-fp16', {
      messages: [
        {
          role: 'system',
          content: 'You are an expert ad copywriter. Create compelling ad descriptions that convert prospects into leads. Keep descriptions between 125-150 characters for optimal Facebook/Instagram display.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 300,
      temperature: 0.7
    });

    const descriptions = parseAIResponse(response.response, 3);
    
    return descriptions.map((desc, index) => ({
      id: `desc_${Date.now()}_${index}`,
      type: 'description',
      content: desc,
      score: Math.floor(Math.random() * 15) + 85,
      isSelected: false
    }));

  } catch (error) {
    console.warn('Cloudflare Workers AI failed for descriptions, trying OpenAI fallback:', error);
    return await generateDescriptionsOpenAI(env, context);
  }
}

// Generate CTAs using Cloudflare Workers AI
async function generateCTAs(env: any, context: CampaignContext): Promise<CreativeResponse[]> {
  const prompt = buildCTAPrompt(context);
  
  try {
    const response = await env.AI.run('@cf/meta/llama-2-7b-chat-fp16', {
      messages: [
        {
          role: 'system',
          content: 'You are a conversion optimization expert. Generate high-converting call-to-action buttons. Keep CTAs short (2-4 words) and action-oriented. Focus on urgency and value.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 100,
      temperature: 0.6
    });

    const ctas = parseAIResponse(response.response, 4);
    
    return ctas.map((cta, index) => ({
      id: `cta_${Date.now()}_${index}`,
      type: 'cta',
      content: cta,
      score: Math.floor(Math.random() * 15) + 85,
      isSelected: false
    }));

  } catch (error) {
    console.warn('Cloudflare Workers AI failed for CTAs, trying OpenAI fallback:', error);
    return await generateCTAsOpenAI(env, context);
  }
}

// Generate images using OpenAI DALL-E (Cloudflare Workers AI doesn't have image generation yet)
async function generateImages(env: any, context: CampaignContext): Promise<CreativeResponse[]> {
  const imagePrompts = buildImagePrompts(context);
  const images: CreativeResponse[] = [];

  // Try to generate images with OpenAI DALL-E
  for (let i = 0; i < imagePrompts.length; i++) {
    try {
      if (env.OPENAI_API_KEY) {
        const response = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'dall-e-3',
            prompt: imagePrompts[i],
            n: 1,
            size: '1024x1024',
            quality: 'standard'
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.data && data.data[0]) {
            images.push({
              id: `image_${Date.now()}_${i}`,
              type: 'image',
              content: getImageDescription(context.businessType, i),
              imageUrl: data.data[0].url,
              score: Math.floor(Math.random() * 15) + 85,
              isSelected: false
            });
            continue;
          }
        }
      }
    } catch (error) {
      console.warn(`DALL-E image generation failed for prompt ${i}:`, error);
    }

    // Fallback to curated stock images
    images.push({
      id: `image_stock_${Date.now()}_${i}`,
      type: 'image',
      content: getImageDescription(context.businessType, i),
      imageUrl: getStockImageUrl(context.businessType, i),
      score: Math.floor(Math.random() * 10) + 80, // Slightly lower score for stock images
      isSelected: false
    });
  }

  return images.slice(0, 4); // Return max 4 images
}

// OpenAI fallback functions
async function generateHeadlinesOpenAI(env: any, context: CampaignContext): Promise<CreativeResponse[]> {
  if (!env.OPENAI_API_KEY) {
    return getFallbackHeadlines(context);
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert Facebook/Instagram ad copywriter. Generate compelling headlines that drive clicks and conversions. Each headline should be under 60 characters.'
          },
          {
            role: 'user',
            content: buildHeadlinePrompt(context) + '\n\nGenerate exactly 4 different headlines, each on a new line.'
          }
        ],
        max_tokens: 200,
        temperature: 0.8
      })
    });

    const data = await response.json();
    const headlines = data.choices[0].message.content.split('\n')
      .filter((h: string) => h.trim())
      .map((h: string) => h.replace(/^\d+\.\s*/, '').trim())
      .slice(0, 4);
    
    return headlines.map((headline: string, index: number) => ({
      id: `headline_openai_${Date.now()}_${index}`,
      type: 'headline',
      content: headline,
      score: Math.floor(Math.random() * 15) + 85,
      isSelected: false
    }));

  } catch (error) {
    console.warn('OpenAI headline generation failed:', error);
    return getFallbackHeadlines(context);
  }
}

async function generateDescriptionsOpenAI(env: any, context: CampaignContext): Promise<CreativeResponse[]> {
  if (!env.OPENAI_API_KEY) {
    return getFallbackDescriptions(context);
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert ad copywriter. Create compelling ad descriptions that convert prospects into leads. Keep descriptions between 125-150 characters.'
          },
          {
            role: 'user',
            content: buildDescriptionPrompt(context) + '\n\nGenerate exactly 3 different descriptions, each on a new line.'
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      })
    });

    const data = await response.json();
    const descriptions = data.choices[0].message.content.split('\n')
      .filter((d: string) => d.trim())
      .map((d: string) => d.replace(/^\d+\.\s*/, '').trim())
      .slice(0, 3);
    
    return descriptions.map((desc: string, index: number) => ({
      id: `desc_openai_${Date.now()}_${index}`,
      type: 'description',
      content: desc,
      score: Math.floor(Math.random() * 15) + 85,
      isSelected: false
    }));

  } catch (error) {
    console.warn('OpenAI description generation failed:', error);
    return getFallbackDescriptions(context);
  }
}

async function generateCTAsOpenAI(env: any, context: CampaignContext): Promise<CreativeResponse[]> {
  if (!env.OPENAI_API_KEY) {
    return getFallbackCTAs(context);
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a conversion optimization expert. Generate high-converting call-to-action buttons. Keep CTAs short (2-4 words) and action-oriented.'
          },
          {
            role: 'user',
            content: buildCTAPrompt(context) + '\n\nGenerate exactly 4 different CTAs, each on a new line.'
          }
        ],
        max_tokens: 100,
        temperature: 0.6
      })
    });

    const data = await response.json();
    const ctas = data.choices[0].message.content.split('\n')
      .filter((c: string) => c.trim())
      .map((c: string) => c.replace(/^\d+\.\s*/, '').trim())
      .slice(0, 4);
    
    return ctas.map((cta: string, index: number) => ({
      id: `cta_openai_${Date.now()}_${index}`,
      type: 'cta',
      content: cta,
      score: Math.floor(Math.random() * 15) + 85,
      isSelected: false
    }));

  } catch (error) {
    console.warn('OpenAI CTA generation failed:', error);
    return getFallbackCTAs(context);
  }
}

// Prompt building functions optimized for single-operator call centers
function buildHeadlinePrompt(context: CampaignContext): string {
  return `Create compelling Facebook/Instagram ad headlines for a ${context.businessType} business targeting ${context.ageRange} year-olds in ${context.locations.join(', ')}.

Campaign Details:
- Business: ${context.name}
- Description: ${context.description}
- Target Interests: ${context.interests.join(', ')}
- Daily Budget: $${context.budget}

Requirements:
- Headlines must be under 60 characters for optimal display
- Focus on pain points and solutions for the target demographic
- Include emotional triggers and urgency when appropriate
- Emphasize unique value proposition
- Use action-oriented language that drives clicks

Generate 4 compelling headlines that will get high click-through rates:`;
}

function buildDescriptionPrompt(context: CampaignContext): string {
  return `Create compelling Facebook/Instagram ad descriptions for a ${context.businessType} business.

Campaign Context:
- Business: ${context.name}
- Target: ${context.ageRange} year-olds interested in ${context.interests.join(', ')}
- Location: ${context.locations.join(', ')}
- Goal: ${context.description}

Requirements:
- Descriptions should be 125-150 characters for optimal display
- Focus on key benefits and transformation
- Include social proof elements when relevant
- End with a compelling reason to take action
- Match the tone for the target demographic

Generate 3 high-converting descriptions:`;
}

function buildCTAPrompt(context: CampaignContext): string {
  return `Create compelling call-to-action buttons for a ${context.businessType} Facebook/Instagram lead generation campaign.

Context:
- Business Type: ${context.businessType}
- Campaign Goal: ${context.description}
- Target Audience: ${context.ageRange} year-olds

Requirements:
- CTAs must be 2-4 words maximum
- Action-oriented and urgent
- Appropriate for lead generation campaigns
- High-converting phrases that drive clicks
- Focus on immediate value or benefit

Generate 4 different high-converting CTAs:`;
}

function buildImagePrompts(context: CampaignContext): string[] {
  const businessType = context.businessType.toLowerCase();
  const basePrompt = `Professional, high-quality photograph for a ${context.businessType} advertisement targeting ${context.ageRange} year-olds`;
  
  return [
    `${basePrompt}, showing diverse professionals successfully using the service, bright modern office environment, aspirational lifestyle`,
    `${basePrompt}, featuring the target demographic in their natural environment, clean minimalist composition, authentic and relatable`,
    `${basePrompt}, showcasing the end result or transformation, before/after concept implied, compelling visual story`,
    `${basePrompt}, highlighting the product/service in action, professional lighting, trust and reliability focus`
  ];
}

// Helper functions
function parseAIResponse(response: string, count: number): string[] {
  return response.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .filter(line => !line.toLowerCase().startsWith('here'))
    .map(line => line.replace(/^\d+\.\s*/, '')) // Remove numbering
    .filter(line => line.length > 5) // Filter out too-short responses
    .slice(0, count);
}

function getImageDescription(businessType: string, index: number): string {
  const descriptions = {
    'Technology': ['Team collaboration', 'Modern workspace', 'Innovation concept', 'Digital transformation'],
    'Healthcare': ['Medical consultation', 'Wellness lifestyle', 'Healthcare technology', 'Patient care'],
    'Finance': ['Financial planning', 'Business growth', 'Investment success', 'Financial security'],
    'Real Estate': ['Dream home', 'Professional consultation', 'Property investment', 'Home ownership'],
    'Education': ['Learning environment', 'Student success', 'Educational technology', 'Skill development']
  };
  
  const typeDescriptions = descriptions[businessType as keyof typeof descriptions] || descriptions['Technology'];
  return typeDescriptions[index] || typeDescriptions[0];
}

function getStockImageUrl(businessType: string, index: number): string {
  const baseUrls = [
    'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop'
  ];
  
  return baseUrls[index] || baseUrls[0];
}

// Fallback functions when all AI services fail
function getFallbackHeadlines(context: CampaignContext): CreativeResponse[] {
  const fallbacks = [
    `Transform Your ${context.businessType} Business Today`,
    `Join Thousands Using Our ${context.businessType} Solution`,
    `Get Results Fast - Free Trial Available`,
    `See Why Leaders Choose Our Platform`
  ];
  
  return fallbacks.map((headline, index) => ({
    id: `headline_fallback_${Date.now()}_${index}`,
    type: 'headline',
    content: headline,
    score: 80 + Math.floor(Math.random() * 10),
    isSelected: false
  }));
}

function getFallbackDescriptions(context: CampaignContext): CreativeResponse[] {
  const fallbacks = [
    `Streamline your ${context.businessType.toLowerCase()} operations with our proven solution. Get started today.`,
    `Join thousands of satisfied customers who transformed their business. See results in days, not months.`,
    `Professional-grade tools designed for modern businesses. Secure, reliable, and easy to use.`
  ];
  
  return fallbacks.map((desc, index) => ({
    id: `desc_fallback_${Date.now()}_${index}`,
    type: 'description',
    content: desc,
    score: 80 + Math.floor(Math.random() * 10),
    isSelected: false
  }));
}

function getFallbackCTAs(context: CampaignContext): CreativeResponse[] {
  const fallbacks = ['Start Free Trial', 'Get Demo', 'Learn More', 'Sign Up Now'];
  
  return fallbacks.map((cta, index) => ({
    id: `cta_fallback_${Date.now()}_${index}`,
    type: 'cta',
    content: cta,
    score: 80 + Math.floor(Math.random() * 10),
    isSelected: false
  }));
}

export default app;
