# Product Page Architecture - Template System Redesign

## Overview

The template generation system has been completely redesigned to generate **product page layouts** instead of document-style previews. Template selection now controls the **entire UI structure**, not just styling.

## Core Principle

**Template selection = Layout control**

When a user selects "Knowledge Hub", the system generates a product page that matches the Knowledge Hub reference design, NOT a Word document rendered in HTML.

## Architecture

### 1. Template Router (`components/document-preview.tsx`)

**Decision Logic:**
- Routes to template-specific components based on `templateConfig.id`
- Knowledge Hub → `KnowledgeHubTemplate` (product page)
- Other templates → `DocumentPreviewLegacy` (fallback)

**Priority Handling:**
1. Template ID is the primary routing key
2. Features and sections are passed to template components
3. Word document content is used ONLY to populate content

### 2. Knowledge Hub Template (`components/templates/knowledge-hub-template.tsx`)

**Mandatory UI Blocks:**
- ✅ Hero banner with title + subtitle
- ✅ Search bar
- ✅ Filter panel (Collections, Authors)
- ✅ Card-based content grid
- ✅ Accelerator badges on cards
- ✅ Feature icons in header

**Layout Structure:**
```
Header (with feature UI elements)
  ↓
Hero Banner (title, subtitle, metadata)
  ↓
Search Bar
  ↓
Main Content Area
  ├─ Filter Panel (sidebar)
  └─ Content Grid (sections as cards)
```

### 3. Feature-to-UI Mapping

**Features create visible UI elements:**

| Feature Selected | UI Element Rendered |
|-----------------|---------------------|
| `languageSwitcher: true` | Language toggle button (top right) |
| `downloadPDF: true` | Download PDF button |
| `aiChatbot: true` | Bookmark icon button |
| `audioNarration: true` | Share button |
| `complexitySlider: true` | (Can be added as slider UI) |

**Implementation:**
- Features are passed from API → PreviewModal → DocumentPreview → Template Component
- Each feature is conditionally rendered as an interactive UI element
- If feature is `false`, the UI element is NOT rendered

### 4. Section-to-Block Mapping

**Sections define page blocks:**

| Section Enabled | Block Rendered |
|----------------|----------------|
| `about: true` | Overview section with card grid |
| `executiveSummary: true` | Executive Summary card with bullets |
| `additionalresources: true` | Key Resources card grid |
| `relatedreports: true` | Related Articles card grid |
| `asktheauthor: true` | FAQs section |

**Content Population:**
- Word document content is used ONLY to populate bullets/descriptions
- Document sections are mapped to UI sections
- Each section displays content as bullet points in cards

### 5. Word Document Usage

**Word document is used ONLY for:**
- ✅ Populating bullet points in section cards
- ✅ Filling card descriptions
- ✅ Creating summaries

**Word document does NOT:**
- ❌ Define layout structure
- ❌ Create sections (sections come from form selection)
- ❌ Control UI components (template controls this)

**Transformation Rules:**
- Paragraphs → Bullet points (automatic conversion)
- Long text → Scannable bullets (max 120 chars per bullet)
- Document headings → Ignored if they don't match selected sections

## Data Flow

```
User fills form
  ↓
Select Template: "Knowledge Hub"
  ↓
Select Features: languageSwitcher, downloadPDF, etc.
  ↓
Select Sections: about, executiveSummary, etc.
  ↓
Upload Word Document (optional)
  ↓
Click "Create"
  ↓
API processes:
  - Extracts Word content → bullets
  - Maps to template structure
  ↓
DocumentPreview routes to KnowledgeHubTemplate
  ↓
KnowledgeHubTemplate renders:
  - Header with feature buttons
  - Hero banner
  - Search bar
  - Filter panel
  - Section blocks (populated with Word bullets)
```

## Key Files

### Template Components
- `components/templates/knowledge-hub-template.tsx` - Knowledge Hub product page
- `components/document-preview-legacy.tsx` - Fallback for other templates

### Router
- `components/document-preview.tsx` - Routes to template-specific components

### API
- `app/api/preview/route.ts` - Returns features and sections in response

### Form
- `components/create-document-view.tsx` - Collects features, sections, template selection

## Implementation Details

### Feature Rendering

```typescript
// In KnowledgeHubTemplate
{features.languageSwitcher && (
  <button className="...">
    <Globe className="..." />
    <span>EN</span>
  </button>
)}
```

**Decision:** Only render if feature is enabled. No text descriptions.

### Section Rendering

```typescript
// In KnowledgeHubTemplate
{sections.about && (
  <section>
    <h2>Overview</h2>
    <div className="grid gap-4">
      {getSectionContent("about").map((item, index) => (
        <Card key={index}>
          <CardContent>{item}</CardContent>
        </Card>
      ))}
    </div>
  </section>
)}
```

**Decision:** Only render if section is enabled. Use Word content to populate.

### Content Extraction

```typescript
const getSectionContent = (sectionKey: keyof Sections) => {
  // Extract bullets from Word document
  // Map to UI section
  // Return array of bullet points
}
```

**Decision:** Word document provides content only, not structure.

## Adding New Templates

To add a new template:

1. **Create template component** (`components/templates/my-template.tsx`):
   - Define mandatory UI blocks
   - Map features to UI elements
   - Map sections to page blocks
   - Use Word content to populate

2. **Add to router** (`components/document-preview.tsx`):
   ```typescript
   if (templateConfig.id === "my-template") {
     return <MyTemplate ... />
   }
   ```

3. **Update template registry** (`lib/templates/template-registry.ts`):
   - Add template configuration
   - Define layout, typography, metadata placement

## Validation

✅ **Template selection controls layout** - Knowledge Hub renders product page
✅ **Features create UI elements** - Language switcher, download button visible
✅ **Sections create page blocks** - Overview, Executive Summary render as cards
✅ **Word document fills content** - Bullets populated from document
✅ **No document-style rendering** - Output looks like product page, not Word export

## Comments in Code

All key decision points are documented with comments:

- **Decision logic:** Why template selection routes to specific component
- **Priority handling:** Order of operations (template → features → sections → content)
- **Feature-to-UI mapping:** How each feature becomes a UI element
- **Content transformation:** How Word content becomes bullets

## Testing Checklist

- [ ] Select Knowledge Hub template → Product page layout appears
- [ ] Enable languageSwitcher → Language button appears in header
- [ ] Enable downloadPDF → Download button appears
- [ ] Enable about section → Overview cards appear
- [ ] Upload Word document → Bullets populate in cards
- [ ] Disable feature → UI element disappears
- [ ] Disable section → Section block disappears
- [ ] Generated output looks like product page (NOT Word document)
