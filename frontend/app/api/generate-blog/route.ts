import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

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
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-pro',
      generationConfig
    });

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

Important guidelines:
- Write in a ${tone} tone that matches luxury hair extension brand standards
- Include practical hair extension tips and advice
- Cover a broad range of hair extension topics, types, and brands
- Use proper HTML formatting for the content
- Make it engaging and informative
- Include relevant hair extension industry insights
- Focus on quality and value for the reader
- Ensure the content is original and well-structured
- Cover topics like hair extension care, maintenance, installation, styling, business opportunities, different types, techniques, etc.
- Mention various hair extension brands and products when relevant
`;

    let result;
    try {
      result = await model.generateContent(prompt);
    } catch (err) {
      console.error('Gemini generateContent failed (attempt 1):', err);
      await new Promise((r) => setTimeout(r, 800));
      try {
        result = await model.generateContent(prompt);
      } catch (err2) {
        console.error('Gemini generateContent failed (attempt 2):', err2);
        // Fallback to a lighter model
        const fallbackModel = genAI.getGenerativeModel({
          model: 'gemini-2.0-flash',
          generationConfig
        });
        result = await fallbackModel.generateContent(prompt);
      }
    }
    const response = await result.response;
    // Log meta for diagnostics
    try {
      const meta = {
        promptFeedback: (response as any).promptFeedback || null,
        candidates: (response as any).candidates?.map((c: any) => ({
          finishReason: c.finishReason,
          safetyRatings: c.safetyRatings
        })) || []
      };
      console.log('Gemini response meta (initial):', JSON.stringify(meta));
    } catch {}
    // Prefer response.text(); if empty, try candidates' parts
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
    const raw = getResponseText(response);
    const trimmed = raw.trim();
    if (!trimmed) {
      // Retry once without strict schema
      const retryModel = genAI.getGenerativeModel({
        model: 'gemini-2.5-pro',
        generationConfig: { responseMimeType: 'application/json' }
      });
      const retryResult = await retryModel.generateContent(prompt + "\nReturn only valid JSON for the object described above. Do not include any extra text.");
      const retryResp = await retryResult.response;
      try {
        const meta = {
          promptFeedback: (retryResp as any).promptFeedback || null,
          candidates: (retryResp as any).candidates?.map((c: any) => ({
            finishReason: c.finishReason,
            safetyRatings: c.safetyRatings
          })) || []
        };
        console.log('Gemini response meta (retry):', JSON.stringify(meta));
      } catch {}
      const retryRaw = getResponseText(retryResp);
      const retryTrimmed = retryRaw.trim();
      if (!retryTrimmed) {
        // Final fallback: call without JSON mode and parse JSON from plain text
        const finalModel = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
        const finalResult = await finalModel.generateContent(prompt + "\nReturn only the JSON object defined above. Do not include markdown or any extra text.");
        const finalResp = await finalResult.response;
        try {
          const meta = {
            promptFeedback: (finalResp as any).promptFeedback || null,
            candidates: (finalResp as any).candidates?.map((c: any) => ({
              finishReason: c.finishReason,
              safetyRatings: c.safetyRatings
            })) || []
          };
          console.log('Gemini response meta (final):', JSON.stringify(meta));
        } catch {}
        const finalRaw = getResponseText(finalResp);
        const finalTrimmed = finalRaw.trim();
        if (!finalTrimmed) {
          throw new Error('Empty model response (final)');
        }
        let finalParsed: any;
        try {
          finalParsed = JSON.parse(finalTrimmed);
        } catch {
          // Strip code fences or extract JSON object substring
          let textToParse = finalTrimmed;
          if (textToParse.startsWith('```json')) {
            textToParse = textToParse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
          } else if (textToParse.startsWith('```')) {
            textToParse = textToParse.replace(/^```\s*/, '').replace(/\s*```$/, '');
          }
          try {
            finalParsed = JSON.parse(textToParse);
          } catch {
            const s2 = textToParse.indexOf('{');
            const e2 = textToParse.lastIndexOf('}');
            if (s2 !== -1 && e2 !== -1 && e2 > s2) {
              const candidate2 = textToParse.slice(s2, e2 + 1);
              finalParsed = JSON.parse(candidate2);
            } else {
              throw new Error('Failed to parse blog JSON (final)');
            }
          }
        }
        let images: Array<{ url: string; alt: string; source?: string }> = [];
        if (includeImages && process.env.HF_TOKEN) {
          try {
            const promptText = `Editorial, luxury brand style photo, sharp, high-quality, related to: ${finalParsed.title || topic}`;
            const modelId = process.env.HF_IMAGE_MODEL || 'black-forest-labs/FLUX.1-pro';
            const url = `https://api-inference.huggingface.co/models/${encodeURIComponent(modelId)}`;
            const resp = await fetch(url, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${process.env.HF_TOKEN}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ inputs: promptText, options: { wait_for_model: true } })
            });
            if (resp.ok) {
              const contentType = resp.headers.get('content-type') || '';
              if (contentType.startsWith('image/')) {
                const arrbuf = await resp.arrayBuffer();
                const base64 = Buffer.from(arrbuf).toString('base64');
                images = [{ url: `data:${contentType};base64,${base64}`, alt: finalParsed.title || topic, source: 'hf' }];
              } else {
                const data = await resp.json();
                const imgList = (data.images || data)?.slice?.(0, 3) || [];
                images = imgList.map((b64: string) => ({ url: `data:image/png;base64,${b64}`, alt: finalParsed.title || topic, source: 'hf' }));
              }
            } else {
              console.error('HF image gen failed (final)', resp.status, await resp.text());
            }
          } catch {}
        }
        if (images.length > 0 && typeof finalParsed.content === 'string') {
          const galleryHtml = `<div class="ai-generated-images" style="margin-top:16px;display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:8px;">${images
            .map((img) => `<img src="${img.url}" alt="${img.alt}" style="width:100%;height:auto;border-radius:8px;object-fit:cover;" />`)
            .join('')}</div>`;
          finalParsed.content += galleryHtml;
        }
        return NextResponse.json({
          title: finalParsed.title,
          content: finalParsed.content,
          keywords: finalParsed.keywords || [],
          tags: finalParsed.tags || [],
          summary: finalParsed.summary,
          images
        });
      }
      let retryParsed: any;
      try {
        retryParsed = JSON.parse(retryTrimmed);
      } catch {
        const s = retryTrimmed.indexOf('{');
        const e = retryTrimmed.lastIndexOf('}');
        if (s !== -1 && e !== -1 && e > s) {
          const candidate = retryTrimmed.slice(s, e + 1);
          retryParsed = JSON.parse(candidate);
        } else {
          throw new Error('Failed to parse blog JSON (retry)');
        }
      }
      // Optionally fetch images via Hugging Face in retry path
      let images: Array<{ url: string; alt: string; source?: string }> = [];
      if (includeImages && process.env.HF_TOKEN) {
        try {
          const promptText = `Editorial, luxury brand style photo, sharp, high-quality, related to: ${retryParsed.title || topic}`;
          const modelId = process.env.HF_IMAGE_MODEL || 'black-forest-labs/FLUX.1-schnell';
          const url = `https://api-inference.huggingface.co/models/${encodeURIComponent(modelId)}`;
          const resp = await fetch(url, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.HF_TOKEN}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ inputs: promptText, options: { wait_for_model: true } })
          });
          if (resp.ok) {
            const contentType = resp.headers.get('content-type') || '';
            if (contentType.startsWith('image/')) {
              const arrbuf = await resp.arrayBuffer();
              const base64 = Buffer.from(arrbuf).toString('base64');
              images = [{ url: `data:${contentType};base64,${base64}`, alt: retryParsed.title || topic, source: 'hf' }];
            } else {
              const data = await resp.json();
              const imgList = (data.images || data)?.slice?.(0, 3) || [];
              images = imgList.map((b64: string) => ({ url: `data:image/png;base64,${b64}`, alt: retryParsed.title || topic, source: 'hf' }));
            }
          }
        } catch {}
      }
      return NextResponse.json({
        title: retryParsed.title,
        content: retryParsed.content,
        keywords: retryParsed.keywords || [],
        tags: retryParsed.tags || [],
        summary: retryParsed.summary,
        images
      });
    }
    let parsedContent: any;
    try {
      parsedContent = JSON.parse(trimmed);
    } catch {
      const start = trimmed.indexOf('{');
      const end = trimmed.lastIndexOf('}');
      if (start !== -1 && end !== -1 && end > start) {
        const candidate = trimmed.slice(start, end + 1);
        parsedContent = JSON.parse(candidate);
      } else {
        throw new Error('Failed to parse blog JSON');
      }
    }
    
    // Optionally fetch related images via Hugging Face
    let images: Array<{ url: string; alt: string; source?: string }> = [];
    if (includeImages && process.env.HF_TOKEN) {
      try {
        const promptText = `Editorial, luxury brand style photo, sharp, high-quality, related to: ${parsedContent.title || topic}`;
        const modelId = process.env.HF_IMAGE_MODEL || 'black-forest-labs/FLUX.1-dev';
        const url = `https://api-inference.huggingface.co/models/${encodeURIComponent(modelId)}`;
        const resp = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.HF_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ inputs: promptText, options: { wait_for_model: true } })
        });
        if (resp.ok) {
          const contentType = resp.headers.get('content-type') || '';
          if (contentType.startsWith('image/')) {
            const arrbuf = await resp.arrayBuffer();
            const base64 = Buffer.from(arrbuf).toString('base64');
            images = [{ url: `data:${contentType};base64,${base64}`, alt: parsedContent.title || topic, source: 'hf' }];
          } else {
            const data = await resp.json();
            const imgList = (data.images || data)?.slice?.(0, 3) || [];
            images = imgList.map((b64: string) => ({ url: `data:image/png;base64,${b64}`, alt: parsedContent.title || topic, source: 'hf' }));
          }
        }
      } catch {}
    }

    // If images were generated, append into HTML content so they are visible in preview
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
