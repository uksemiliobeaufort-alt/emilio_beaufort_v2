// Using API routes for better security - API key is stored server-side

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
  metadata?: {
    estimatedSize: number;
    compressionApplied: boolean;
    imageCount: number;
  };
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
