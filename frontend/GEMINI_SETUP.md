# Gemini AI Setup Guide

This guide will help you set up Google Gemini AI for blog generation in the Emilio Beaufort admin panel.

## Prerequisites

1. A Google Cloud account
2. Access to Google AI Studio or Google Cloud Console

## Setup Steps

### 1. Get Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### 2. Add API Key to Environment

Create or update your `.env.local` file in the frontend directory:

```bash
# Add this line to your .env.local file
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Restart Development Server

After adding the environment variable, restart your development server:

```bash
npm run dev
# or
yarn dev
```

## Usage

Once set up, you can use the AI blog generation feature:

1. Go to the Admin Dashboard → Blogs
2. Click "Generate New Post with AI"
3. Fill in the form with your requirements:
   - Topic
   - Tone (Luxury, Professional, Casual, Educational)
   - Length (Short, Medium, Long)
   - Keywords (optional)
   - Target Audience (optional)
4. Click "Generate Blog Post"
5. Review the generated content
6. Click "Use This Content" to load it into the editor
7. Add images and make any final edits
8. Publish your blog post

## Features

- **AI-Powered Content Generation**: Generate high-quality blog posts using Gemini 2.5 Pro
- **Blog Ideas Generator**: Get topic suggestions for your blog
- **Customizable Parameters**: Control tone, length, and target audience
- **SEO Optimization**: Automatically generates keywords and tags
- **Secure API Calls**: All API calls are made server-side for security
- **Rich Text Output**: Generated content includes proper HTML formatting

## Troubleshooting

### API Key Issues
- Ensure your API key is correctly added to `.env.local`
- Verify the API key is valid in Google AI Studio
- Check that you have sufficient quota for Gemini API calls

### Generation Errors
- Check the browser console for error messages
- Verify your internet connection
- Ensure the topic is not too vague or inappropriate

### Content Quality
- Be specific with your topic description
- Use relevant keywords to guide the AI
- Specify your target audience for better content relevance

## Security Notes

- The API key is stored server-side and never exposed to the client
- All API calls are made through secure API routes
- No sensitive data is logged or stored

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify your environment variables are set correctly
3. Ensure you have the latest version of the codebase
4. Contact the development team for assistance
