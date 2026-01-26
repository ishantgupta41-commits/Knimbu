/**
 * Template Storage Module
 * 
 * Supports both DynamoDB (production) and in-memory storage (development)
 * For AWS deployment, use DynamoDB
 * For local development, falls back to in-memory storage
 */

export interface StoredTemplate {
  id: string
  userId: string
  documentContent: any
  templateConfig: any
  features: any
  sections: any
  createdAt: string
  updatedAt: string
  deployed?: boolean
  deployedUrl?: string
}

// In-memory store (fallback for development)
const templatesStore = new Map<string, StoredTemplate>()

// Check if DynamoDB is configured
const isDynamoDBConfigured = () => {
  return !!(
    process.env.AWS_REGION &&
    process.env.DYNAMODB_TABLE_NAME &&
    (process.env.AWS_ACCESS_KEY_ID || process.env.AWS_EXECUTION_ENV) // Support IAM roles
  )
}

// DynamoDB functions (only used if configured)
async function getTemplateFromDynamoDB(id: string, userId?: string): Promise<StoredTemplate | undefined> {
  if (!isDynamoDBConfigured()) return undefined

  try {
    const { DynamoDBClient } = await import("@aws-sdk/client-dynamodb")
    const { DynamoDBDocumentClient, GetCommand, QueryCommand, ScanCommand } = await import("@aws-sdk/lib-dynamodb")

    const client = new DynamoDBClient({ region: process.env.AWS_REGION })
    const docClient = DynamoDBDocumentClient.from(client)

    // Strategy 1: Try Query with just id (if id is partition key)
    // This works whether userId is a sort key or just an attribute
    try {
      const queryResult = await docClient.send(new QueryCommand({
        TableName: process.env.DYNAMODB_TABLE_NAME,
        KeyConditionExpression: "id = :id",
        ExpressionAttributeValues: {
          ":id": id
        },
        Limit: 1
      }))
      
      if (queryResult.Items && queryResult.Items.length > 0) {
        // If userId was provided, filter to match
        let item: any
        if (userId) {
          item = queryResult.Items.find((item: any) => item.userId === userId)
        } else {
          item = queryResult.Items[0]
        }
        
        if (item) {
          // Validate and normalize the structure
          if (item.documentContent && typeof item.documentContent === 'object') {
            // Ensure documentContent has the correct structure
            if (!item.documentContent.document) {
              console.warn("Template from DynamoDB missing document structure, attempting to fix")
              // Try to reconstruct if possible
              if (item.documentContent.title) {
                item.documentContent = {
                  document: {
                    title: item.documentContent.title,
                    subtitle: item.documentContent.subtitle,
                    authors: item.documentContent.authors || [],
                    collections: item.documentContent.collections || [],
                    publicationDate: item.documentContent.publicationDate
                  },
                  content: item.documentContent.content || []
                }
              }
            }
          }
          return item as StoredTemplate
        }
      }
    } catch (queryError: any) {
      // If Query fails, try GetItem (for simple key) or composite key Query
      if (queryError?.name === 'ValidationException' || queryError?.__type?.includes('ValidationException')) {
        // Try GetItem with just id (in case it's a simple key)
        try {
          const result = await docClient.send(new GetCommand({
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: { id }
          }))
          
          if (result.Item) {
            const item = result.Item
            // Validate structure
            if (item.documentContent && !item.documentContent.document) {
              console.warn("Template from DynamoDB missing document structure")
            }
            return item as StoredTemplate
          }
        } catch (getError: any) {
          // If GetItem also fails, try composite key Query
          if (userId) {
            try {
              const compositeQueryResult = await docClient.send(new QueryCommand({
                TableName: process.env.DYNAMODB_TABLE_NAME,
                KeyConditionExpression: "id = :id AND userId = :userId",
                ExpressionAttributeValues: {
                  ":id": id,
                  ":userId": userId
                }
              }))
              
              const item = compositeQueryResult.Items?.[0]
              if (item && item.documentContent && !item.documentContent.document) {
                console.warn("Template from DynamoDB missing document structure")
              }
              return item as StoredTemplate | undefined
            } catch (compositeError) {
              console.warn("Composite key query failed:", compositeError)
            }
          }
          
          // Last resort: Scan with filter
          const scanResult = await docClient.send(new ScanCommand({
            TableName: process.env.DYNAMODB_TABLE_NAME,
            FilterExpression: "id = :id",
            ExpressionAttributeValues: {
              ":id": id
            },
            Limit: 1
          }))
          
          const item = scanResult.Items?.[0]
          if (item && item.documentContent && !item.documentContent.document) {
            console.warn("Template from DynamoDB missing document structure")
          }
          return item as StoredTemplate | undefined
        }
      } else {
        // Re-throw if it's not a validation error
        throw queryError
      }
    }

    return undefined
  } catch (error: any) {
    // If it's a validation error (schema mismatch), log and return undefined to fall back to in-memory
    if (error?.name === 'ValidationException' || error?.__type?.includes('ValidationException')) {
      console.warn("DynamoDB schema mismatch - falling back to in-memory storage. Error:", error.message)
      return undefined
    }
    console.error("DynamoDB get error:", error)
    return undefined
  }
}

async function getAllTemplatesFromDynamoDB(userId: string): Promise<StoredTemplate[]> {
  if (!isDynamoDBConfigured()) return []

  try {
    const { DynamoDBClient } = await import("@aws-sdk/client-dynamodb")
    const { DynamoDBDocumentClient, QueryCommand, ScanCommand } = await import("@aws-sdk/lib-dynamodb")

    const client = new DynamoDBClient({ region: process.env.AWS_REGION })
    const docClient = DynamoDBDocumentClient.from(client)

    // Try using GSI first, fall back to scan if index doesn't exist
    try {
      const result = await docClient.send(new QueryCommand({
        TableName: process.env.DYNAMODB_TABLE_NAME,
        IndexName: "userId-index", // GSI for querying by userId
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
          ":userId": userId
        }
      }))

      return (result.Items || []) as StoredTemplate[]
    } catch (queryError: any) {
      // If GSI doesn't exist, fall back to scan (less efficient but works)
      if (queryError?.name === 'ResourceNotFoundException' || queryError?.__type?.includes('ResourceNotFoundException')) {
        console.warn("GSI not found, using scan (less efficient)")
        const scanResult = await docClient.send(new ScanCommand({
          TableName: process.env.DYNAMODB_TABLE_NAME,
          FilterExpression: "userId = :userId",
          ExpressionAttributeValues: {
            ":userId": userId
          }
        }))
        return (scanResult.Items || []) as StoredTemplate[]
      }
      throw queryError
    }
  } catch (error: any) {
    if (error?.name === 'ValidationException' || error?.__type?.includes('ValidationException')) {
      console.warn("DynamoDB schema mismatch - falling back to in-memory storage")
      return []
    }
    console.error("DynamoDB query error:", error)
    return []
  }
}

async function saveTemplateToDynamoDB(template: StoredTemplate): Promise<void> {
  if (!isDynamoDBConfigured()) return

  try {
    const { DynamoDBClient } = await import("@aws-sdk/client-dynamodb")
    const { DynamoDBDocumentClient, PutCommand } = await import("@aws-sdk/lib-dynamodb")

    const client = new DynamoDBClient({ region: process.env.AWS_REGION })
    const docClient = DynamoDBDocumentClient.from(client)

    await docClient.send(new PutCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Item: template
    }))
  } catch (error: any) {
    if (error?.name === 'ValidationException' || error?.__type?.includes('ValidationException')) {
      console.warn("DynamoDB schema mismatch - template not saved to DynamoDB. Error:", error.message)
      // Don't throw - allow fallback to in-memory storage
      return
    }
    console.error("DynamoDB save error:", error)
    throw error
  }
}

// Public API - automatically uses DynamoDB if configured, otherwise in-memory
// Published templates are public - userId is optional for public access
export async function getTemplate(id: string, userId?: string): Promise<StoredTemplate | undefined> {
  if (isDynamoDBConfigured()) {
    const result = await getTemplateFromDynamoDB(id, userId)
    // If DynamoDB fails or returns nothing, fall back to in-memory
    if (result) return result
  }
  // Fall back to in-memory storage - return template by ID (public access)
  return templatesStore.get(id)
}

export async function getAllTemplates(userId: string): Promise<StoredTemplate[]> {
  if (isDynamoDBConfigured()) {
    const result = await getAllTemplatesFromDynamoDB(userId)
    // If DynamoDB returns results, use them; otherwise fall back
    if (result.length > 0) return result
  }
  // Fall back to in-memory storage
  return Array.from(templatesStore.values())
    .filter(t => t.userId === userId)
}

export async function saveTemplate(template: StoredTemplate): Promise<void> {
  // Always save to in-memory first (for immediate availability)
  templatesStore.set(template.id, template)
  
  // Also try to save to DynamoDB if configured (but don't fail if it doesn't work)
  if (isDynamoDBConfigured()) {
    try {
      await saveTemplateToDynamoDB(template)
    } catch (error) {
      // Log but don't throw - in-memory storage already succeeded
      console.warn("Failed to save to DynamoDB, using in-memory storage only:", error)
    }
  }
}

export async function deleteTemplate(id: string, userId: string): Promise<boolean> {
  if (isDynamoDBConfigured()) {
    try {
      const { DynamoDBClient } = await import("@aws-sdk/client-dynamodb")
      const { DynamoDBDocumentClient, DeleteCommand } = await import("@aws-sdk/lib-dynamodb")

      const client = new DynamoDBClient({ region: process.env.AWS_REGION })
      const docClient = DynamoDBDocumentClient.from(client)

      // First check ownership
      const template = await getTemplate(id, userId)
      if (template && template.userId === userId) {
        // Try delete with just id first
        try {
          await docClient.send(new DeleteCommand({
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: { id }
          }))
          return true
        } catch (deleteError: any) {
          // If that fails, try with composite key
          if (deleteError?.name === 'ValidationException') {
            await docClient.send(new DeleteCommand({
              TableName: process.env.DYNAMODB_TABLE_NAME,
              Key: { id, userId }
            }))
            return true
          }
          throw deleteError
        }
      }
      return false
    } catch (error) {
      console.error("DynamoDB delete error:", error)
      return false
    }
  } else {
    const template = templatesStore.get(id)
    if (template && template.userId === userId) {
      templatesStore.delete(id)
      return true
    }
    return false
  }
}

export function templateExists(id: string): boolean {
  // For DynamoDB, we'd need to check, but for now return false
  // In production, you might want to implement this
  if (isDynamoDBConfigured()) {
    return false // Would need async check
  }
  return templatesStore.has(id)
}

// Export store for API routes (temporary - in production use database)
export { templatesStore }
