import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { GoogleGenAI, Modality } from '@google/genai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const genAIv2 = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

// Helper: generate images via Gemini 2.0 Flash preview image generation
async function generateImagesViaGemini(
  topic: string
): Promise<Array<{ url: string; alt: string; source?: string }>> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY not set; skipping image generation");
    return [];
  }

  try {
    // Use the new GoogleGenAI SDK for image generation
    const response = await genAIv2.models.generateContent({
      model: "gemini-2.0-flash-preview-image-generation",
      contents: [
        {
          text: `Create a professional, elegant header image for a blog post about "${topic}". 
          The image should reflect the luxury hair extension brand Emilio Beaufort, 
          with sophisticated styling, professional composition, and high-end aesthetic. 
          Make it suitable for B2B audience with clean, modern design.`
        }
      ],
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
      },
    });

    const images: Array<{ url: string; alt: string; source?: string }> = [];
    
    // Extract images from the response with proper null checks
    if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.mimeType?.startsWith('image/')) {
          const imageData = part.inlineData.data;
          const mimeType = part.inlineData.mimeType;
          
          images.push({
            url: `data:${mimeType};base64,${imageData}`,
            alt: `Header image for blog topic: ${topic}`,
            source: "gemini-2.0-flash-preview-image-generation",
          });
          
          // Limit to 3 images
          if (images.length >= 3) break;
        }
      }
    }

    if (images.length > 0) {
      console.log(`Gemini image generation successful: ${images.length} images created`);
      return images;
    }

    console.warn("No images generated from Gemini response");
    return [];
    
  } catch (err) {
    console.warn("Gemini image generation failed:", err);
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, tone, length, keywords, targetAudience, includeImages } = body;

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    // Use JSON mode to ensure strict JSON output
    const generationConfig: any = {
      responseMimeType: 'application/json',
      responseSchema: {
        type: SchemaType.OBJECT as typeof SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING as typeof SchemaType.STRING },
          content: { type: SchemaType.STRING as typeof SchemaType.STRING },
          keywords: { type: SchemaType.ARRAY as typeof SchemaType.ARRAY, items: { type: SchemaType.STRING as typeof SchemaType.STRING } },
          tags: { type: SchemaType.ARRAY as typeof SchemaType.ARRAY, items: { type: SchemaType.STRING as typeof SchemaType.STRING } },
          summary: { type: SchemaType.STRING as typeof SchemaType.STRING }
        },
        required: ['title', 'content']
      }
    };

    const prompt = `
You are a professional hair extension content writer for Emilio Beaufort, a luxury hair extensions company. 
Generate a high-quality blog post based on the following requirements:

Topic: ${topic}
Tone: ${tone}
Length: ${length === 'short' ? '300-500 words' : length === 'medium' ? '800-1200 words' : '1500-2000 words'}
${keywords && keywords.length > 0 ? `Keywords to include: ${keywords.join(', ')}` : ''}
${targetAudience ? `Target Audience: ${targetAudience}` : ''}

Please provide the response in the following JSON format:
{
  "title": "Engaging blog post title",
  "content": "Full blog post content in HTML format with proper formatting (headings, paragraphs, lists, etc.)",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "tags": ["tag1", "tag2", "tag3"],
  "summary": "Brief 2-3 sentence summary of the blog post"
}
`;

    const getResponseText = (resp: any): string => {
      try {
        const t = (resp.text?.() || '').trim();
        if (t) return t;
      } catch {}
      try {
        const cands = resp.candidates || [];
        for (const c of cands) {
          const parts = (c.content?.parts || []);
          for (const p of parts) {
            const pt = (p.text || '').trim();
            if (pt) return pt;
          }
        }
      } catch {}
      return '';
    };

    const modelOrder = ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
    let parsedContent: any = null;
    let lastErr: any = null;

    for (const modelName of modelOrder) {
      try {
        const mdl = genAI.getGenerativeModel({ model: modelName, generationConfig });
        let result = await mdl.generateContent(prompt);
        let resp = await result.response;
        let trimmed = getResponseText(resp).trim();

        if (!trimmed) {
          // Retry once without strict schema
          const retryMdl = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: { responseMimeType: 'application/json' }
          });
          const retryRes = await retryMdl.generateContent(prompt + '\nReturn only valid JSON for the object described above.');
          const retryResp = await retryRes.response;
          trimmed = getResponseText(retryResp).trim();
        }

        if (!trimmed) {
          // Final plain-text attempt
          const finalMdl = genAI.getGenerativeModel({ model: modelName });
          const finalRes = await finalMdl.generateContent(prompt + '\nReturn only the JSON object defined above.');
          const finalResp = await finalRes.response;
          trimmed = getResponseText(finalResp).trim();
        }

        if (!trimmed) throw new Error('Empty response');

        try {
          parsedContent = JSON.parse(trimmed);
        } catch {
          const s = trimmed.indexOf('{');
          const e = trimmed.lastIndexOf('}');
          if (s !== -1 && e !== -1 && e > s) {
            const candidate = trimmed.slice(s, e + 1);
            parsedContent = JSON.parse(candidate);
          } else {
            throw new Error('Failed to parse blog JSON');
          }
        }

        if (parsedContent) {
          console.log(`Using model: ${modelName}`);
          break;
        }
      } catch (err) {
        lastErr = err;
        console.warn(`Model failed: ${modelName}`, err);
        continue;
      }
    }

    if (!parsedContent) {
      console.error('All models failed or quota exceeded:', lastErr);
      return NextResponse.json({ error: 'request failed , all models quota exceeded' }, { status: 429 });
    }

    // Fetch related images with brand prompt
    let images: Array<{ url: string; alt: string; source?: string }> = [];
    if (includeImages) {
      images = await generateImagesViaGemini(topic);
    }

    // Append images into HTML content
    if (images.length > 0 && typeof parsedContent.content === 'string') {
      const galleryHtml = `<div class="ai-generated-images" style="margin-top:16px;display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:8px;">${images
        .map((img) => `<img src="${img.url}" alt="${img.alt}" style="width:100%;height:auto;border-radius:8px;object-fit:cover;" />`)
        .join('')}</div>`;
      parsedContent.content += galleryHtml;
    }

    return NextResponse.json({
      title: parsedContent.title,
      content: parsedContent.content,
      keywords: parsedContent.keywords || [],
      tags: parsedContent.tags || [],
      summary: parsedContent.summary,
      images
    });

  } catch (error) {
    console.error('Error generating blog post:', error);
    return NextResponse.json(
      { error: 'Failed to generate blog post' },
      { status: 500 }
    );
  }
}
