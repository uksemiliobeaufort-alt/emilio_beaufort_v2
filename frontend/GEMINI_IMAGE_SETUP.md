# Gemini 2.0 Flash Image Generation Setup

## **Important Information**
The image generation API comes with a minimal amount of free tokens , so use the image generation wisely.

## ✅ **What's Implemented**

The blog generation API now includes **Gemini 2.0 Flash image generation** using the official `@google/genai` SDK with `responseModalities` support.


## 🔧 **Prerequisites**

### 1. **Google Cloud Project Setup**
- Active Google Cloud project
- Generative AI API enabled
- API key with access to Gemini models

### 2. **Environment Variables**
Create or update `frontend/.env.local`:
```bash
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 3. **Package Installation**
The required package is already installed:
```bash
npm install @google/genai
```

## 🚀 **How It Works**

### **Image Generation Flow**
1. User toggles "Include related images" in the AI Blog Generator
2. API calls `gemini-2.0-flash-preview-image-generation` model
3. Uses `responseModalities: [Modality.TEXT, Modality.IMAGE]`
4. Extracts base64 images from response
5. Embeds images directly into the generated blog content

### **API Structure**
```typescript
const response = await genAIv2.models.generateContent({
  model: "gemini-2.0-flash-preview-image-generation",
  contents: [{ text: "Create professional header image for..." }],
  config: {
    responseModalities: [Modality.TEXT, Modality.IMAGE],
  },
});
```

## 📝 **Features**

- **Professional Branding**: Images tailored for Emilio Beaufort luxury hair extension brand
- **B2B Focus**: Clean, sophisticated styling suitable for business audience
- **Automatic Integration**: Images are embedded directly into blog content
- **Error Handling**: Graceful fallback if image generation fails
- **Limit Control**: Maximum 3 images per blog post

## 🔍 **Model Details**

- **Primary Model**: `gemini-2.0-flash-preview-image-generation`
- **Capabilities**: Text + Image generation
- **Response Format**: Base64 encoded images with MIME type detection
- **Quality**: High-resolution, production-ready images

## 🚨 **Important Notes**

1. **API Access**: Ensure your API key has access to the preview image generation model
2. **Regional Availability**: This model may not be available in all regions
3. **Rate Limits**: Subject to Google's current quota and rate limiting policies
4. **Preview Status**: This is a preview feature - API structure may change

## 🧪 **Testing**

1. Open Admin Dashboard → Blogs
2. Click "Generate New Post with AI"
3. Toggle "Include related images"
4. Generate blog post
5. Check console logs for image generation status

## 🔧 **Troubleshooting**

### **Common Issues**
- **401 Unauthorized**: Check `GEMINI_API_KEY` in `.env.local`
- **Model not found**: Verify API key has access to preview models
- **No images generated**: Check console logs for error details

### **Fallback Behavior**
- If image generation fails, blog content is still generated
- Images are optional - blog posts work without them
- Failed image generation doesn't break the blog generation process

## 📚 **Resources**

- [Google GenAI SDK Documentation](https://ai.google.dev/docs)
- [Gemini 2.0 Flash Preview](https://ai.google.dev/models/gemini)
- [API Quotas and Limits](https://ai.google.dev/pricing)
