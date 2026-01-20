# Knimbu Document Preview System

## Overview

The Knimbu preview system generates web template previews from Word documents (.docx) and user-provided metadata. When a user clicks "Create", the system:

1. Parses the uploaded Word document
2. Extracts structured content (headings, paragraphs)
3. Merges with user metadata
4. Generates a preview based on the selected template
5. Displays an immediately renderable preview

## Architecture

### Components

#### 1. **Backend API** (`app/api/preview/route.ts`)
- Handles POST requests with form data
- Processes Word documents using mammoth
- Optionally uses AI (OpenAI) for enhanced parsing
- Returns structured document content

#### 2. **Document Parser** (`lib/services/document-parser.ts`)
- **Deterministic Parsing**: Pattern-based extraction of headings and content
- **AI-Enhanced Parsing**: Uses GPT-4o-mini for better structure detection
- Extracts H1, H2, H3 headings and paragraphs
- Preserves document order

#### 3. **Template System** (`lib/templates/template-registry.ts`)
- Defines template configurations:
  - Layout (sidebar type, navigation levels)
  - Typography hierarchy
  - Metadata placement (authors, date, collections)
- Currently supports 4 templates:
  - Knowledge Hub (single sidebar, H1-H2)
  - Global Economic Prospects (single sidebar, H1)
  - Academic Papers (single sidebar, H1-H2)
  - In-depth Report (double sidebar, H1-H3)

#### 4. **Preview Generator** (`lib/services/preview-generator.ts`)
- Generates navigation from document sections
- Creates HTML structure based on template config
- Handles metadata placement

#### 5. **Preview Components**
- **DocumentPreview** (`components/document-preview.tsx`): Main preview renderer
- **PreviewModal** (`components/preview-modal.tsx`): Modal wrapper for preview

#### 6. **Create View** (`components/create-document-view.tsx`)
- Updated Create button handler
- Collects form data
- Calls API and displays preview

## Data Flow

```
User clicks "Create"
    ↓
Collect form data (metadata, template, file)
    ↓
POST /api/preview
    ↓
Parse Word document (mammoth + optional AI)
    ↓
Extract structured content (sections, blocks)
    ↓
Merge with user metadata
    ↓
Get template configuration
    ↓
Return preview data
    ↓
Display preview in modal
```

## Document Structure

### Input Schema
```typescript
{
  metadata: {
    title: string
    subtitle?: string
    publicationDate?: string
    authors: Array<{id, name, image}>
    collections: Array<{id, name}>
  }
  templateId: string
  features: {...}
  sections: {...}
  accelerators: {...}
  publicationOptions: {...}
  file?: File (.docx)
}
```

### Output Schema
```typescript
{
  document: {
    title: string
    subtitle?: string
    publicationDate?: string
    authors: Array<...>
    collections: Array<...>
  }
  content: [
    {
      id: "section-1"
      heading: "Section Title"
      level: 1 | 2 | 3
      blocks: [
        { type: "paragraph" | "heading", text: "...", level?: number }
      ]
    }
  ]
}
```

## AI Integration

### Document Parsing Prompt

The system uses the following prompt for AI-assisted parsing:

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
```

### AI Configuration

- **Model**: GPT-4o-mini (or GPT-4 for better accuracy)
- **Temperature**: 0.1 (for consistency)
- **Response Format**: JSON object
- **Fallback**: If AI fails, uses deterministic parsing

## Environment Variables

Create a `.env.local` file:

```env
# Optional: Enable AI-enhanced parsing
OPENAI_API_KEY=sk-...
ENABLE_AI_PARSING=true
```

**Note**: The system works without AI using deterministic parsing. AI is optional for improved accuracy.

## Usage

### 1. User fills out form
- Document title (required)
- Subtitle (optional)
- Publication date
- Authors (multi-select)
- Collections (multi-select)
- Template selection
- Features (checkboxes)
- Sections (checkboxes)
- Accelerators (file upload + options)
- Publication options

### 2. User uploads Word document (optional)
- Supports .docx files up to 20MB
- Document is parsed to extract structure

### 3. User clicks "Create"
- Form data is validated
- API is called with all data
- Preview is generated and displayed

### 4. Preview displays
- Fully renderable HTML/React component
- Matches selected template exactly
- Shows metadata, navigation, content
- Editable in future steps

## Template Customization

To add a new template, update `lib/templates/template-registry.ts`:

```typescript
export const TEMPLATE_REGISTRY: Record<string, TemplateConfig> = {
  "my-template": {
    id: "my-template",
    name: "My Template",
    description: "...",
    layout: {
      sidebar: "single" | "double" | "none",
      header: true,
      navigationLevels: [1, 2], // Which heading levels appear in nav
    },
    typography: {
      headingHierarchy: ["text-4xl", "text-3xl", "text-2xl"],
      bodyFont: "font-sans",
    },
    metadataPlacement: {
      authors: "header" | "sidebar" | "footer",
      date: "header" | "sidebar" | "footer",
      collections: "header" | "sidebar" | "footer",
    },
  }
}
```

## Error Handling

- **Missing title**: Returns 400 error
- **Invalid template**: Returns 400 error
- **Document parsing failure**: Returns 500 error with message
- **AI parsing failure**: Falls back to deterministic parsing
- **Network errors**: Displayed via toast notifications

## Future Enhancements

1. **Image Support**: Extract and render images from Word documents
2. **Table Support**: Parse and render tables
3. **Editing**: Allow inline editing of preview
4. **Multiple Templates**: Support selecting multiple templates
5. **Export**: Export preview as HTML/PDF
6. **Versioning**: Save preview versions
7. **Collaboration**: Multi-user editing

## Dependencies

- `mammoth`: Word document parsing
- `openai`: AI-enhanced parsing (optional)
- `next`: Framework
- `react`: UI library
- `zod`: Type validation
- `sonner`: Toast notifications

## Testing

To test the system:

1. Start the dev server: `npm run dev`
2. Navigate to Create Document view
3. Fill out the form
4. Upload a sample Word document (optional)
5. Select a template
6. Click "Create"
7. Preview should appear in modal

## Troubleshooting

### Preview not generating
- Check browser console for errors
- Verify API route is accessible
- Check file size (max 20MB)
- Verify template ID is valid

### AI parsing not working
- Check `OPENAI_API_KEY` is set
- Verify `ENABLE_AI_PARSING=true`
- Check API quota/limits
- System will fallback to deterministic parsing

### Template not matching
- Verify template ID matches registry
- Check template configuration
- Review preview component rendering logic
