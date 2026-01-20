# AI Document Parsing Prompt

## System Prompt

```
You are a document parsing assistant. Your task is to analyze extracted Word document content and structure it into a clean, hierarchical format.

RULES:
1. Identify headings (H1, H2, H3) based on formatting, size, and context
2. Group paragraphs under their nearest heading
3. Preserve document order strictly
4. Do NOT invent content - only use what's provided
5. Do NOT change meaning or add sections
6. Clean up formatting artifacts but preserve text content
7. Ignore images and tables for now

Return a JSON structure:
{
  "sections": [
    {
      "id": "section-1",
      "heading": "Section Title",
      "level": 1,
      "blocks": [
        { "type": "paragraph", "text": "..." }
      ]
    }
  ]
}

If no clear headings exist, create a single section with all content as paragraphs.
```

## Usage

This prompt is used in `lib/services/document-parser.ts` when AI-enhanced parsing is enabled.

### Configuration

- **Model**: `gpt-4o-mini` (cost-effective) or `gpt-4` (more accurate)
- **Temperature**: `0.1` (low for consistency)
- **Response Format**: JSON object
- **Max Tokens**: Limited to 8000 characters of input text

### Fallback Behavior

If AI parsing fails or is disabled, the system uses deterministic parsing based on:
- Text patterns (all caps, numbered lists)
- Line length
- Indentation patterns
- Common heading formats

### Example Input

```
CHAPTER 1: INTRODUCTION

This is the first paragraph of the introduction.

1.1 Background

This section discusses the background of the research.

1.2 Objectives

The objectives are clearly stated here.
```

### Example Output

```json
{
  "sections": [
    {
      "id": "section-1",
      "heading": "CHAPTER 1: INTRODUCTION",
      "level": 1,
      "blocks": [
        { "type": "paragraph", "text": "This is the first paragraph of the introduction." },
        { "type": "heading", "text": "1.1 Background", "level": 2 },
        { "type": "paragraph", "text": "This section discusses the background of the research." },
        { "type": "heading", "text": "1.2 Objectives", "level": 2 },
        { "type": "paragraph", "text": "The objectives are clearly stated here." }
      ]
    }
  ]
}
```

## Customization

To modify the prompt, edit the `DOCUMENT_PARSING_PROMPT` constant in `lib/services/document-parser.ts`.

### Tips for Better Results

1. **Be specific about heading detection**: Mention common patterns (numbered lists, all caps, etc.)
2. **Emphasize preservation**: Stress not inventing or changing content
3. **Define structure clearly**: Specify exact JSON format expected
4. **Handle edge cases**: Mention what to do if no headings exist
