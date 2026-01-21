/**
 * Form Data Parser Service
 * Extracts and validates all form inputs from the Create Document form
 */

import { DocumentMetadata, PublicationOptions, Features, Sections, Accelerators } from "@/lib/types/document"

export interface FormInputs {
  // Basic metadata
  title: string
  subtitle?: string
  listedPublicationDate?: string
  
  // Selections
  selectedTemplate: string
  selectedAuthors: number[]
  selectedCollections: number[]
  
  // Features, sections, accelerators
  features: Features
  sections: Sections
  accelerators: Accelerators
  
  // Publication options
  publicationOption: "immediatePublish" | "schedulePublish" | "draftOnly"
  publishOnOrgWebsite: boolean
  publishOnKnimbu: boolean
  
  // File upload
  uploadedFile: File | null
}

export interface ParsedFormData {
  metadata: DocumentMetadata
  templateId: string
  features: Features
  sections: Sections
  accelerators: Accelerators
  publicationOptions: PublicationOptions
  file: File | null
}

/**
 * Parse and validate form inputs
 * @param formInputs Raw form inputs from the component
 * @param authorsList List of available authors (for mapping IDs to objects)
 * @param collectionsList List of available collections (for mapping IDs to objects)
 * @returns Parsed and validated form data
 */
export function parseFormData(
  formInputs: FormInputs,
  authorsList: Array<{ id: number; name: string; image?: string }>,
  collectionsList: Array<{ id: number; name: string; icon?: any }>
): ParsedFormData {
  // Validate required fields
  if (!formInputs.title || !formInputs.title.trim()) {
    throw new Error("Document title is required")
  }

  if (!formInputs.selectedTemplate) {
    throw new Error("Please select a template")
  }

  // Map selected author IDs to author objects
  const authors = authorsList
    .filter((author) => formInputs.selectedAuthors.includes(author.id))
    .map((author) => ({
      id: author.id,
      name: author.name,
      image: author.image,
    }))

  // Map selected collection IDs to collection objects
  const collections = collectionsList
    .filter((collection) => formInputs.selectedCollections.includes(collection.id))
    .map((collection) => ({
      id: collection.id,
      name: collection.name,
    }))

  // Build metadata object
  const metadata: DocumentMetadata = {
    title: formInputs.title.trim(),
    subtitle: formInputs.subtitle?.trim() || undefined,
    publicationDate: formInputs.listedPublicationDate || undefined,
    authors,
    collections,
  }

  // Build publication options
  const publicationOptions: PublicationOptions = {
    immediatePublish: formInputs.publicationOption === "immediatePublish",
    schedulePublish:
      formInputs.publicationOption === "schedulePublish"
        ? formInputs.listedPublicationDate || undefined
        : undefined,
    draftOnly: formInputs.publicationOption === "draftOnly",
    publishOnOrgWebsite: formInputs.publishOnOrgWebsite,
    publishOnKnimbu: formInputs.publishOnKnimbu,
  }

  // Validate file if provided
  if (formInputs.uploadedFile) {
    validateFile(formInputs.uploadedFile)
  }

  return {
    metadata,
    templateId: formInputs.selectedTemplate,
    features: formInputs.features,
    sections: formInputs.sections,
    accelerators: formInputs.accelerators,
    publicationOptions,
    file: formInputs.uploadedFile,
  }
}

/**
 * Validate uploaded file
 * @param file File to validate
 * @throws Error if file is invalid
 */
export function validateFile(file: File): void {
  // Check file size (max 20MB)
  const maxSize = 20 * 1024 * 1024 // 20MB in bytes
  if (file.size > maxSize) {
    throw new Error("File size exceeds 20MB limit")
  }

  // Check file type
  const validTypes = [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    "application/msword", // .doc
  ]
  const validExtensions = [".docx", ".doc"]

  const fileType = file.type || ""
  const fileName = file.name || ""
  const isValidType =
    validTypes.includes(fileType) ||
    validExtensions.some((ext) => fileName.toLowerCase().endsWith(ext))

  if (!isValidType) {
    throw new Error("Invalid file type. Please upload a .docx or .doc file.")
  }

  // Verify file is actually a File instance
  if (!(file instanceof File) && !(file instanceof Blob)) {
    throw new Error("Invalid file object received")
  }
}

/**
 * Convert parsed form data to FormData for API submission
 * @param parsedData Parsed form data
 * @returns FormData object ready for API call
 */
export function toFormData(parsedData: ParsedFormData): FormData {
  const formData = new FormData()

  // Append basic fields
  formData.append("title", parsedData.metadata.title)
  if (parsedData.metadata.subtitle) {
    formData.append("subtitle", parsedData.metadata.subtitle)
  }
  if (parsedData.metadata.publicationDate) {
    formData.append("publicationDate", parsedData.metadata.publicationDate)
  }
  formData.append("templateName", parsedData.templateId)

  // Append JSON fields
  formData.append("authors", JSON.stringify(parsedData.metadata.authors))
  formData.append("collections", JSON.stringify(parsedData.metadata.collections))
  formData.append("features", JSON.stringify(parsedData.features))
  formData.append("sections", JSON.stringify(parsedData.sections))
  formData.append("accelerators", JSON.stringify(parsedData.accelerators))
  formData.append("publicationOptions", JSON.stringify(parsedData.publicationOptions))

  // Append file if present
  if (parsedData.file) {
    formData.append("file", parsedData.file)
  }

  return formData
}
