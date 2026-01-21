# Knowledge Extraction & Content Mapping Architecture

## Overview

The system now intelligently extracts knowledge from Word documents and maps it to UI sections. The document is **never ignored** - it always contributes meaningful, enriched content.

## Core Principle

**UI selections decide WHERE content goes.**
**Word document decides WHAT content says.**

## Processing Pipeline

### Step 1: Document Parsing
- Extract headings, paragraphs, lists, tables
- Maintain content order
- Convert to structured format

### Step 2: Knowledge Extraction (MANDATORY)
- **Topics**: Extracted from headings and section titles
- **Facts**: Extracted from paragraphs with numbers, statistics, dates
- **Definitions**: Extracted from text with "is", "means", "refers to"
- **Steps**: Extracted from numbered lists and process descriptions
- **Summaries**: Created from paragraphs and key content
- **Related Content**: Grouped by section/topic

### Step 3: Intelligent Section Mapping
- Map extracted knowledge to enabled UI sections
- Even if document headings don't match section names
- Distribute content intelligently across sections
- **Never leave sections empty**

### Step 4: Content Enrichment
- Use AI to enhance and summarize content points
- Preserve domain knowledge
- Make content informative and concise
- Remove generic filler

## Knowledge Extraction Logic

### Topic Extraction
```typescript
// Headings become topics
section.heading → knowledge.topics
block.text (if heading) → knowledge.topics
```

### Fact Extraction
```typescript
// Text with numbers, statistics, dates
if (text contains numbers || percentages || dates) {
  → knowledge.facts
}
```

### Definition Extraction
```typescript
// Text with definition patterns
if (text matches "is|means|refers to|defined as") {
  → knowledge.definitions
}
```

### Step Extraction
```typescript
// Numbered lists, process descriptions
if (text starts with "1." || contains "first|then|next") {
  → knowledge.steps
}
```

## Section Mapping Logic

### Mapping Rules

| Section | Knowledge Types Used | Priority |
|---------|---------------------|----------|
| Overview | summaries, topics, facts | 1 |
| Executive Summary | summaries, facts | 2 |
| Key Resources | relatedContent, facts | 3 |
| Related Articles | topics, summaries | 4 |
| FAQs | definitions, facts | 5 |
| Learning Zone | steps, definitions | 6 |
| Case Studies | facts, relatedContent | 7 |
| Webinars | topics, summaries | 8 |

### Fallback Strategy
- If section has no specific content → use any available knowledge
- If no knowledge extracted → use document title, subtitle, any available text
- **NEVER return empty sections**

## Content Enrichment

### AI Enhancement (Optional)
- Uses GPT-4o-mini to enhance content points
- Makes content more informative while preserving meaning
- Ensures no generic filler text
- Falls back to original content if AI fails

### Enrichment Rules
- Max 120 characters per point
- Preserve domain knowledge
- Remove redundancy
- Enhance clarity

## Implementation Files

### Core Services
- `lib/services/knowledge-extractor.ts` - Extracts knowledge from documents
- `lib/services/content-mapper.ts` - Maps knowledge to sections
- `app/api/preview/route.ts` - Orchestrates extraction and mapping

### Template Components
- `components/templates/knowledge-hub-template.tsx` - Uses mapped content

## Data Flow

```
Word Document Upload
    ↓
Parse Document (parseDocxDocument)
    ↓
Extract Knowledge (extractKnowledge)
    ├─ Topics
    ├─ Facts
    ├─ Definitions
    ├─ Steps
    ├─ Summaries
    └─ Related Content
    ↓
Map to Sections (mapContentToSections)
    ├─ Match knowledge types to sections
    ├─ Distribute content intelligently
    └─ Ensure no empty sections
    ↓
Enrich with AI (optional)
    ├─ Enhance content points
    ├─ Preserve domain knowledge
    └─ Remove filler
    ↓
Reconstruct Document Content
    ├─ Create sections from mapped content
    ├─ Convert to list blocks
    └─ Maintain structure
    ↓
Template Rendering
    └─ Display enriched content in UI
```

## Key Decisions

### 1. Knowledge Extraction is Mandatory
- Document content is ALWAYS processed
- Knowledge is ALWAYS extracted
- Never skip extraction step

### 2. Section Mapping is Intelligent
- Content is mapped even if headings don't match
- Knowledge types are matched to section purposes
- Fallback ensures sections are never empty

### 3. Content Enrichment Preserves Meaning
- AI enhancement is optional but recommended
- Original meaning is preserved
- Generic text is removed
- Domain knowledge is maintained

### 4. Empty Content Safeguard
- Multiple fallback strategies
- Always provide meaningful content
- Never show empty sections
- Never use generic placeholders

## Testing Checklist

- [ ] Upload Word document → Knowledge extracted
- [ ] Enable sections → Content mapped to sections
- [ ] Disable section → Section hidden (not empty)
- [ ] No document → Fallback content provided
- [ ] AI enabled → Content enriched
- [ ] AI disabled → Original content used
- [ ] All sections have meaningful content
- [ ] Content feels informative, not generic
