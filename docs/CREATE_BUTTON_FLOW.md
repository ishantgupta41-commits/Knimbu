# Create Button Flow - Architecture Documentation

## Overview

The Create button flow implements a modular architecture for processing form inputs, parsing Word documents, mapping content to templates, and generating live previews. The system is designed to be maintainable, extensible, and follows separation of concerns.

## Architecture

### Modular Services

The system is organized into four main service modules:

1. **formDataParser** (`lib/services/form-data-parser.ts`)
   - Extracts and validates all form inputs
   - Handles form data conversion
   - Validates required fields, file types, and sizes

2. **docxParser** (`lib/services/docx-parser.ts`)
   - Parses Word documents (.docx)
   - Extracts structured content: headings, paragraphs, lists, tables
   - Uses mammoth library for document parsing
   - Supports AI-enhanced parsing (optional)

3. **templateMapper** (`lib/services/template-mapper.ts`)
   - Maps extracted content to template-specific layouts
   - Filters sections based on template navigation levels
   - Applies template-specific transformations
   - Validates content matches template requirements

4. **templateRenderer** (`lib/services/template-renderer.ts`)
   - Generates preview data for frontend rendering
   - Ensures styling and layout match selected template
   - Handles dynamic preview rendering

## Flow Diagram

```
User clicks "Create" button
    ↓
[formDataParser]
    ├─ Extract all form inputs
    ├─ Validate required fields
    ├─ Validate file (type, size)
    └─ Convert to FormData
    ↓
POST /api/preview
    ↓
[docxParser]
    ├─ Parse Word document
    ├─ Extract headings (H1, H2, H3)
    ├─ Extract paragraphs → bullet points
    ├─ Extract lists
    └─ Extract tables
    ↓
[templateMapper]
    ├─ Map content to template structure
    ├─ Filter by navigation levels
    └─ Apply template transformations
    ↓
[templateRenderer]
    ├─ Generate preview data
    ├─ Validate content
    └─ Return preview structure
    ↓
Frontend receives preview
    ↓
Display in PreviewModal (no page reload)
```

## Form Inputs Captured

The system captures all form inputs:

### Basic Metadata
- **Document title** (required)
- **Subtitle** (optional)
- **Listed publication date** (optional)

### Selections
- **Selected template** (required) - from "Select Template" dropdown
- **Selected authors** (array of IDs)
- **Selected collections** (array of IDs)

### Features
- Language Switcher
- AI Chatbot
- Audio Narration
- Complexity Slider
- Download PDF

### Sections
- About
- Executive Summary
- AV Learning Zone
- Case Study Explorer
- Webinars and Events
- Ask the Author
- Additional Resources
- Related Reports

### Accelerators
- Pre-populate Chapter Banners
- Pre-populate Subchapter Images

### Publication Options
- Immediate Publish
- Schedule Publication (with date)
- Draft Only
- Publish on Org Website
- Publish on Knimbu

### File Upload
- Word document (.docx or .doc)
- Max size: 20MB
- Validates file type and structure

## Document Parsing

### Extracted Elements

1. **Headings**
   - H1 (Level 1): Main chapters/sections
   - H2 (Level 2): Subsections
   - H3 (Level 3): Sub-subsections
   - Detection uses multiple signals: formatting, numbering, position, length

2. **Paragraphs**
   - Converted to concise bullet points
   - Maximum 2-3 points per paragraph
   - Each point max 100 characters
   - Focus on key information only

3. **Lists**
   - Bulleted lists
   - Numbered lists
   - Preserved as structured list items

4. **Tables**
   - Headers extracted
   - Rows extracted (max 5 rows for conciseness)
   - Rendered in preview with proper styling

## Template Mapping

### Template-Specific Rules

Each template has its own configuration:

- **Layout**: Sidebar type (single/double/none), header presence, navigation levels
- **Typography**: Heading hierarchy, body font (sans/serif)
- **Metadata Placement**: Authors, date, collections (header/sidebar/footer)

### Content Filtering

- Sections filtered based on template navigation levels
- Only matching heading levels included in navigation
- Content blocks transformed per template rules

## Preview Generation

### Dynamic Rendering

- Preview renders immediately without page reload
- Uses React components for rendering
- Styling matches selected template exactly
- All metadata positioned correctly per template

### Preview Components

- **DocumentPreview** (`components/document-preview.tsx`)
  - Renders document content based on template config
  - Handles headings, paragraphs, lists, tables
  - Applies template typography and layout

- **PreviewModal** (`components/preview-modal.tsx`)
  - Modal wrapper for preview
  - Handles scrolling and sizing
  - Accessible with proper ARIA labels

## Error Handling

### Validation Errors

- **Missing title**: "Document title is required"
- **Missing template**: "Please select a template"
- **Invalid file type**: "Invalid file type. Please upload a .docx or .doc file."
- **File too large**: "File size exceeds 20MB limit"
- **Invalid template**: "Invalid template ID: {templateId}"

### Parsing Errors

- **Document parsing failure**: Falls back to deterministic parsing
- **AI parsing failure**: Falls back to deterministic parsing
- **File corruption**: Returns error with clear message

### API Errors

- **400 Bad Request**: Validation errors
- **500 Internal Server Error**: Processing errors
- All errors include clear error messages

## Code Structure

### Key Files

```
lib/
├── services/
│   ├── form-data-parser.ts    # Form input parsing and validation
│   ├── docx-parser.ts          # Word document parsing (with tables)
│   ├── document-parser.ts      # Core parsing logic
│   ├── template-mapper.ts      # Template mapping logic
│   ├── template-renderer.ts    # Preview rendering
│   └── content-summarizer.ts   # Content conciseness logic
├── templates/
│   └── template-registry.ts    # Template configurations
└── types/
    └── document.ts              # TypeScript interfaces

components/
├── create-document-view.tsx    # Create form and handler
├── document-preview.tsx        # Preview renderer
└── preview-modal.tsx          # Preview modal wrapper

app/
└── api/
    └── preview/
        └── route.ts            # API endpoint
```

## Adding New Templates

To add a new template:

1. **Add template config** to `lib/templates/template-registry.ts`:
```typescript
"my-template": {
  id: "my-template",
  name: "My Template",
  description: "...",
  layout: {
    sidebar: "single",
    header: true,
    navigationLevels: [1, 2],
  },
  typography: {
    headingHierarchy: ["text-4xl", "text-3xl", "text-2xl"],
    bodyFont: "font-sans",
  },
  metadataPlacement: {
    authors: "header",
    date: "header",
    collections: "sidebar",
  },
}
```

2. **Add template option** to `components/create-document-view.tsx`:
```typescript
{
  id: 5,
  name: "My Template",
  description: "...",
  tags: [...],
  image: "/my-template.jpg",
  clickable: true,
}
```

3. **Template will automatically work** - no other changes needed!

## Future Enhancements

- Support for images in documents
- Support for charts and graphs
- Enhanced table formatting options
- Custom template builder
- Batch document processing
- Export preview as HTML/PDF

## Testing

To test the Create button flow:

1. Fill out all form fields
2. Select a template
3. Upload a Word document (optional)
4. Click "Create"
5. Verify preview appears immediately
6. Verify content matches template format
7. Verify all metadata displays correctly

## Notes

- All content is converted to concise bullet points for readability
- Tables are limited to 5 rows for performance
- AI parsing is optional (requires OPENAI_API_KEY)
- System works without AI using deterministic parsing
- Preview renders without page reload for better UX
