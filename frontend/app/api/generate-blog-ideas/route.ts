import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category } = body;

         const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-pro',
            generationConfig: {
              responseMimeType: 'application/json',
              responseSchema: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
            }
          });

                                       const prompt = `
Generate 10 engaging blog post ideas for Emilio Beaufort, a luxury hair extensions company.
${category ? `Focus on the category: ${category}` : 'Cover various hair extension topics'}

Topics should include:
- Hair extension care and maintenance
- Different types of hair extensions (clip-ins, tape-ins, sew-ins, fusion, etc.)
- How to choose the right hair extensions for different hair types
- Hair extension installation and styling tips
- Starting a hair extension business
- Hair extension industry insights and trends
- Customer success stories and testimonials
- Professional hair extension advice
- Hair extension troubleshooting and solutions
- Luxury hair extension experiences
- Hair extension brands and products
- Hair extension techniques and methods
- Hair extension pricing and business models
- Hair extension marketing and client acquisition

Return only the titles as a JSON array:
["Title 1", "Title 2", "Title 3", ...]

Make sure the titles are:
- Engaging and click-worthy
- Relevant to hair extension audience
- Specific and actionable
- SEO-friendly
- Brand-appropriate for Emilio Beaufort's hair extension business
- Cover a broad range of hair extension topics and brands
`;

    // Helpers
    const sanitizeIdeas = (value: unknown): string[] => {
      if (!Array.isArray(value)) return [];
      const strings = (value as unknown[])
        .map(v => (typeof v === 'string' ? v : typeof v === 'object' && v && 'title' in (v as any) ? String((v as any).title) : ''))
        .map(v => v.trim())
        .filter(v => v.length > 0);
      return Array.from(new Set(strings));
    };

    const buildFallbackIdeas = (cat?: string): string[] => {
      const focus = cat ? `for ${cat}` : '';
      return [
        `Ultimate Care Guide ${focus} Hair Extensions`,
        `Top 10 Styling Tips to Make Extensions Look Seamless`,
        `Choosing the Right Length and Volume For Your Hair`,
        `Clip-ins vs Tape-ins vs Sew-ins: What Suits You Best?`,
        `How to Wash and Maintain Luxury Hair Extensions`,
        `Color Matching 101: Extensions That Blend Perfectly`,
        `Starter Kit: Launching a Boutique Hair Extension Business`,
        `Salon-Pro Secrets: Long-Lasting Installations`,
        `Red Flags: Common Extension Mistakes and Fixes`,
        `Trend Report: What’s New in Premium Hair Extensions`,
      ];
    };

    const tryGenerateIdeas = async (): Promise<string[] | null> => {
      const maxAttempts = 3;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const result = await model.generateContent(prompt);
          const response = await result.response;
          const raw = response.text();
          const trimmed = (raw ?? '').toString().trim();
          if (!trimmed) {
            console.warn(`Gemini returned empty text on attempt ${attempt}`);
            continue;
          }
          let parsed: unknown;
          try {
            parsed = JSON.parse(trimmed);
          } catch {
            const start = trimmed.indexOf('[');
            const end = trimmed.lastIndexOf(']');
            if (start !== -1 && end !== -1 && end > start) {
              const candidate = trimmed.slice(start, end + 1);
              parsed = JSON.parse(candidate);
            } else {
              console.warn(`Failed to parse ideas JSON on attempt ${attempt}`);
              continue;
            }
          }
          const ideas = sanitizeIdeas(parsed);
          if (ideas.length > 0) {
            return ideas;
          }
        } catch (err) {
          console.warn(`Error generating ideas on attempt ${attempt}:`, err);
        }
        await new Promise(r => setTimeout(r, 300 * attempt));
      }
      return null;
    };

    const ideas = await tryGenerateIdeas();
    if (ideas && ideas.length > 0) {
      return NextResponse.json({ ideas });
    }

    // Fallback to avoid 500s
    return NextResponse.json({ ideas: buildFallbackIdeas(category), fallback: true });

  } catch (error) {
    console.error('Error generating blog ideas (outer catch):', error);
    return NextResponse.json({ ideas: [
      'Luxury Hair Extensions: The Complete Care Handbook',
      'Perfect Blend: Color Matching Extensions Made Easy',
      'Top 7 Secrets for Seamless, Natural-Looking Extensions',
      'How to Choose the Right Extension Method for You',
      'From Day to Night: Chic Hairstyles with Extensions',
    ], fallback: true });
  }
}
