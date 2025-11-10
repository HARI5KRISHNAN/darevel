# AI Integration Setup Guide

## Phase 2 - AI Integration Complete! 🤖

This guide explains how to set up and use the AI features in your PowerPoint editor.

---

## Table of Contents

1. [Features Overview](#features-overview)
2. [Ollama Setup](#ollama-setup-recommended)
3. [OpenAI Setup (Optional)](#openai-setup-optional)
4. [Unsplash Setup (Optional)](#unsplash-setup-optional)
5. [Using the AI Assistant](#using-the-ai-assistant)
6. [API Endpoints](#api-endpoints)
7. [Troubleshooting](#troubleshooting)

---

## Features Overview

### ✅ Implemented Features

1. **AI Slide Generation** (Ollama + OpenAI fallback)
   - Generate slide title and content from a topic
   - Automatic layout suggestions
   - Context-aware content generation

2. **AI Image Search** (Unsplash API with placeholders)
   - Search for relevant images
   - Automatic keyword generation
   - Fallback to placeholder images

3. **Ollama Integration** (Local AI)
   - Privacy-focused local AI processing
   - No API costs
   - Faster response times

4. **Complete UI**
   - AI Assistant tab in Properties Panel
   - Image search interface
   - Provider selection (Ollama/OpenAI)

---

## Ollama Setup (Recommended)

Ollama allows you to run AI models locally for FREE!

### Installation

#### macOS/Linux
```bash
curl https://ollama.ai/install.sh | sh
```

#### Windows
Download from: https://ollama.ai/download

### Pull a Model

```bash
# Recommended: Llama 3.2 (smaller, faster)
ollama pull llama3.2

# Alternative: Llama 2
ollama pull llama2

# Alternative: Mistral
ollama pull mistral
```

### Start Ollama

```bash
ollama serve
```

This starts Ollama on `http://localhost:11434`

### Verify Installation

```bash
# Test if Ollama is running
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.2",
  "prompt": "Hello world",
  "stream": false
}'
```

---

## OpenAI Setup (Optional)

If you want to use OpenAI instead of Ollama:

### 1. Get API Key

1. Visit https://platform.openai.com/api-keys
2. Create a new API key

### 2. Set Environment Variable

```bash
# Create .env.local file
echo "OPENAI_API_KEY=your-api-key-here" > .env.local
```

### 3. Use OpenAI in UI

Select "OpenAI (Cloud)" in the AI Provider dropdown.

---

## Unsplash Setup (Optional)

For real images instead of placeholders:

### 1. Create Unsplash Account

Visit https://unsplash.com/developers

### 2. Create New Application

1. Go to "Your apps"
2. Click "New Application"
3. Accept terms
4. Fill in application details

### 3. Get Access Key

Copy your "Access Key"

### 4. Set Environment Variable

```bash
# Add to .env.local file
echo "UNSPLASH_ACCESS_KEY=your-access-key-here" >> .env.local
```

**Note:** Without this key, the app uses placeholder images (still works fine!).

---

## Using the AI Assistant

### 1. Open the Editor

Navigate to http://localhost:3000/editor

### 2. Open AI Tab

Click the **"AI"** tab in the Properties Panel (right side).

### 3. Generate a Slide

#### Generate Slide Tab:

1. **Select AI Provider:**
   - Ollama (Local) - Free, private, fast
   - OpenAI (Cloud) - Requires API key

2. **Enter Topic:**
   ```
   Example: "Benefits of Remote Work"
   ```

3. **Add Context (Optional):**
   ```
   Example: "Focus on productivity and work-life balance"
   ```

4. **Select Image (Optional):**
   - Switch to "Find Images" tab
   - Search for images
   - Click to select

5. **Click "Generate Slide"**

The AI will:
- Generate a compelling title
- Create 3-5 bullet points
- Suggest the best layout
- Add your selected image

### 4. Search for Images

#### Find Images Tab:

1. Enter search query (e.g., "business meeting")
2. Click search icon
3. Browse 9 image results
4. Click an image to select it
5. Switch back to "Generate Slide" tab
6. Generate slide with the image included

---

## API Endpoints

### POST /api/ai/generate-slide

Generate slide content using AI.

**Request:**
```json
{
  "topic": "Digital Marketing Trends",
  "context": "Focus on social media",
  "provider": "ollama"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "title": "Digital Marketing Trends 2024",
    "content": "• Social media dominance...\n• Video content...",
    "layout": "content",
    "suggestions": ["chart", "social icons", "graph"],
    "imageKeywords": ["marketing", "social media", "trends"]
  }
}
```

### POST /api/ai/search-images

Search for images via Unsplash.

**Request:**
```json
{
  "query": "business charts",
  "perPage": 9
}
```

**Response:**
```json
{
  "success": true,
  "images": [
    {
      "id": "abc123",
      "url": "https://...",
      "thumbnail": "https://...",
      "description": "Business chart",
      "author": "John Doe"
    }
  ]
}
```

---

## Troubleshooting

### Ollama Connection Error

**Error:** "Cannot connect to Ollama"

**Solutions:**

1. **Check if Ollama is running:**
   ```bash
   curl http://localhost:11434/api/version
   ```

2. **Start Ollama:**
   ```bash
   ollama serve
   ```

3. **Check port:**
   ```bash
   lsof -i :11434
   ```

4. **Pull model if not present:**
   ```bash
   ollama pull llama3.2
   ```

### Model Not Found

**Error:** "Model not found"

**Solution:**
```bash
# List available models
ollama list

# Pull the required model
ollama pull llama3.2
```

### OpenAI API Error

**Error:** "OpenAI API key not configured"

**Solution:**
1. Check `.env.local` file exists
2. Verify key is correct
3. Restart dev server: `npm run dev`

### Image Search Not Working

**Note:** Without Unsplash API key, placeholder images are used automatically.

**To use real images:**
1. Get Unsplash access key
2. Add to `.env.local`:
   ```
   UNSPLASH_ACCESS_KEY=your-key-here
   ```
3. Restart server

---

## Quick Start Checklist

- [ ] Install Ollama
- [ ] Pull llama3.2 model
- [ ] Start Ollama server
- [ ] Start dev server (`npm run dev`)
- [ ] Open editor at localhost:3000/editor
- [ ] Click AI tab in Properties Panel
- [ ] Generate your first AI slide!

---

## Environment Variables Summary

Create a `.env.local` file in the project root:

```bash
# Optional: Ollama base URL (default: http://localhost:11434)
OLLAMA_BASE_URL=http://localhost:11434

# Optional: OpenAI API Key (for OpenAI provider)
OPENAI_API_KEY=sk-...

# Optional: Unsplash Access Key (for real images)
UNSPLASH_ACCESS_KEY=...
```

---

## Example Workflow

1. **Start Ollama:**
   ```bash
   ollama serve
   ```

2. **Start Dev Server:**
   ```bash
   npm run dev
   ```

3. **Open Editor:**
   http://localhost:3000/editor

4. **Generate Slide:**
   - Click "AI" tab
   - Select "Ollama (Local)"
   - Enter topic: "Cloud Computing"
   - Click "Generate Slide"

5. **Add Image:**
   - Switch to "Find Images"
   - Search: "cloud server"
   - Select image
   - Back to "Generate Slide"
   - Generate new slide with image

---

## Performance Tips

### Faster Generation

1. Use Ollama for faster local processing
2. Use smaller models (llama3.2 > llama2 > mistral)
3. Keep Ollama running in background

### Better Results

1. Provide specific topics
2. Add detailed context
3. Use layout suggestions
4. Experiment with different models

---

## Support

For issues or questions:
1. Check troubleshooting section
2. Verify Ollama is running
3. Check browser console for errors
4. Review API endpoint responses

---

## What's Next?

Phase 2 Complete! ✅

**Future Enhancements:**
- Image generation (DALL-E, Stable Diffusion)
- Slide refinement
- Bulk presentation generation
- Custom AI prompts
- Style transfer

Enjoy your AI-powered presentations! 🎉
