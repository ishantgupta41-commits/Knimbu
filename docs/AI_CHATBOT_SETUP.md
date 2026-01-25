# AI Chatbot Setup Guide

## Overview

The AI Chatbot feature allows users to:
- Modify templates through natural language
- Ask questions about templates
- Republish or discard changes

## Environment Variables

Create a `.env.local` file (for local development) or add to Vercel environment variables:

```env
# Required for AI Chatbot
OPENAI_API_KEY=sk-your-openai-api-key-here

# Optional: Enable AI parsing for document processing
ENABLE_AI_PARSING=true
```

## Getting an OpenAI API Key

1. Go to https://platform.openai.com/
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new secret key
5. Copy the key and add it to your environment variables

## Features

### Template Modification
Users can request changes like:
- "Change the title to 'New Report 2025'"
- "Add a new section about sustainability"
- "Enable the audio narration feature"
- "Update the subtitle"
- "Remove the FAQs section"

### Q&A
Users can ask questions like:
- "What features are enabled?"
- "What sections are available?"
- "Tell me about this template"

## How It Works

1. **User opens published template** → Floating AI button appears
2. **User clicks button** → Chat interface opens
3. **User types request** → AI processes and responds
4. **If modification** → Template updates in real-time
5. **User can republish** → Changes saved to database
6. **User can discard** → Changes reverted

## API Endpoints

### POST /api/ai-chat
Handles chat messages and template modifications.

**Request:**
```json
{
  "message": "Change the title to 'New Title'",
  "messages": [...conversation history],
  "documentContent": {...},
  "templateConfig": {...},
  "features": {...},
  "sections": {...}
}
```

**Response:**
```json
{
  "success": true,
  "response": "I've updated the title to 'New Title'",
  "updatedContent": {...},
  "updatedFeatures": {...},
  "updatedSections": {...}
}
```

## Cost Considerations

- Uses GPT-4o-mini (cost-effective)
- Can switch to GPT-4 for better quality
- Typical conversation: ~$0.01-0.05 per interaction
- Monitor usage in OpenAI dashboard

## Troubleshooting

### "OpenAI API key not configured"
- Check `.env.local` file exists
- Verify `OPENAI_API_KEY` is set
- Restart development server after adding key

### "Failed to parse response"
- AI sometimes returns non-JSON
- System handles gracefully with fallback
- Try rephrasing the request

### Template not updating
- Check browser console for errors
- Verify API response includes `updatedContent`
- Ensure template state is properly managed

## Security

- API key stored in environment variables (never in code)
- User authentication required
- Only template owner can modify
- Changes validated before saving

## Future Enhancements

- Conversation history persistence
- Undo/redo functionality
- Batch modifications
- Template versioning
- Change preview before applying
