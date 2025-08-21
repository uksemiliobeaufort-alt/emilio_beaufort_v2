// Using API routes for better security - API key is stored server-side
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_API_KEY as string);

export async function generateBlogImage(topic: string) {
  const prompt = `
You are a professional blog image designer for Emilio Beaufort, a high-end B2B exporter of hair extensions. 
Your designs must be sophisticated, elegant, and reflect the premium quality of the products. 
The target audience is other businesses and professionals, so all visuals should be clean and professional.

Task: Create a stunning, high-resolution, and production-ready header image for a blog post.

Stylistic Constraints:
- Mood: Professional, elegant, and trustworthy.
- Color Palette: Subtle and refined tones, avoiding overly bright or distracting colors.
- Composition: Clean, well-designed, and uncluttered. Focus on a strong, central subject with a minimalist background.
- Output: The image should be a visually compelling piece of professional photography or digital art.

Blog Topic: ${topic}
`;

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateImages({ prompt });

  if (result?.images && result.images.length > 0) {
    return result.images.map((img: any, idx: number) => ({
      url: `data:image/png;base64,${img.b64}`, // Convert base64 into usable <img src>
      alt: `Generated blog image ${idx + 1} for topic "${topic}"`,
    }));
  }

  return [];
}

export interface BlogGenerationRequest {
  topic: string;
  tone: 'professional' | 'casual' | 'luxury' | 'educational';
  length: 'short' | 'medium' | 'long';
  keywords?: string[];
  targetAudience?: string;
  includeImages?: boolean;
}

export interface GeneratedBlogContent {
  title: string;
  content: string;
  keywords: string[];
  tags: string[];
  summary: string;
  images?: Array<{
    url: string;
    alt: string;
    source?: string;
  }>;
}

export async function generateBlogPost(request: BlogGenerationRequest): Promise<GeneratedBlogContent> {
  try {
    const response = await fetch('/api/generate-blog', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Failed to generate blog post');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error generating blog post:', error);
    throw new Error('Failed to generate blog post. Please try again.');
  }
}

export async function generateBlogIdeas(category?: string): Promise<string[]> {
  try {
    const response = await fetch('/api/generate-blog-ideas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ category }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate blog ideas');
    }

    const data = await response.json();
    return data.ideas || [];
  } catch (error) {
    console.error('Error generating blog ideas:', error);
    return [];
  }
}
