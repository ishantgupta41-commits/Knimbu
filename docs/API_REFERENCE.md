# API Reference

## POST /api/preview

Generates a document preview from user metadata and uploaded Word document.

### Request

**Content-Type**: `multipart/form-data`

#### Form Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Document title |
| `subtitle` | string | No | Document subtitle |
| `publicationDate` | string | No | Publication date (ISO format) |
| `templateName` | string | Yes | Template name (e.g., "Knowledge Hub") |
| `file` | File | No | Word document (.docx, max 20MB) |
| `authors` | JSON string | No | Array of author objects |
| `collections` | JSON string | No | Array of collection objects |
| `features` | JSON string | No | Features configuration object |
| `sections` | JSON string | No | Sections configuration object |
| `accelerators` | JSON string | No | Accelerators configuration object |
| `publicationOptions` | JSON string | No | Publication options object |

#### Example Authors JSON
```json
[
  { "id": 1, "name": "Albert Einstein", "image": "/albert-einstein-portrait.png" }
]
```

#### Example Collections JSON
```json
[
  { "id": 1, "name": "Technology" }
]
```

#### Example Features JSON
```json
{
  "languageSwitcher": true,
  "aiChatbot": true,
  "audioNarration": true,
  "complexitySlider": true,
  "downloadPDF": true
}
```

#### Example Publication Options JSON
```json
{
  "immediatePublish": true,
  "schedulePublish": null,
  "draftOnly": false,
  "publishOnOrgWebsite": false,
  "publishOnKnimbu": false
}
```

### Response

#### Success (200)

```json
{
  "success": true,
  "preview": {
    "document": {
      "title": "Document Title",
      "subtitle": "Document Subtitle",
      "publicationDate": "2024-01-01",
      "authors": [...],
      "collections": [...]
    },
    "content": [
      {
        "id": "section-1",
        "heading": "Section Title",
        "level": 1,
        "blocks": [
          {
            "type": "paragraph",
            "text": "Paragraph text..."
          }
        ]
      }
    ]
  },
  "templateId": "knowledge-hub",
  "templateConfig": {
    "id": "knowledge-hub",
    "name": "Knowledge Hub",
    "layout": {
      "sidebar": "single",
      "header": true,
      "navigationLevels": [1, 2]
    },
    "typography": {
      "headingHierarchy": ["text-4xl", "text-3xl", "text-2xl"],
      "bodyFont": "font-sans"
    },
    "metadataPlacement": {
      "authors": "header",
      "date": "header",
      "collections": "sidebar"
    }
  }
}
```

#### Error (400)

```json
{
  "success": false,
  "error": "Title is required"
}
```

#### Error (500)

```json
{
  "success": false,
  "error": "Failed to parse document: ..."
}
```

### Example Usage

#### JavaScript/TypeScript

```typescript
const formData = new FormData()
formData.append("title", "My Document")
formData.append("subtitle", "Subtitle")
formData.append("templateName", "Knowledge Hub")
formData.append("authors", JSON.stringify([{ id: 1, name: "Author" }]))
formData.append("file", file) // File object

const response = await fetch("/api/preview", {
  method: "POST",
  body: formData,
})

const result = await response.json()
```

#### cURL

```bash
curl -X POST http://localhost:3000/api/preview \
  -F "title=My Document" \
  -F "subtitle=Subtitle" \
  -F "templateName=Knowledge Hub" \
  -F "authors=[{\"id\":1,\"name\":\"Author\"}]" \
  -F "file=@document.docx"
```

### Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Missing required fields or invalid template |
| 500 | Internal Server Error - Document parsing failed or server error |

### Notes

- File size limit: 20MB
- Supported file types: .docx, .doc
- If no file is provided, creates empty document structure
- AI parsing is optional (requires `OPENAI_API_KEY` and `ENABLE_AI_PARSING=true`)
