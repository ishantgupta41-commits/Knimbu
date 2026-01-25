# AWS Deployment Guide

This document outlines how to deploy the Knimbu application to AWS with user-based template hosting.

## Architecture Overview

The application is designed to be deployed on AWS with the following components:

### Current Setup (Development)
- **Storage**: In-memory Map (temporary)
- **Authentication**: Dummy credentials (localStorage)
- **Hosting**: Next.js development server

### Production Setup (AWS)
- **Storage**: DynamoDB or RDS for template data
- **Authentication**: AWS Cognito or custom JWT-based auth
- **Hosting**: AWS Amplify, Vercel, or EC2 + ECS
- **File Storage**: S3 for document uploads

## Deployment Steps

### Option 1: AWS Amplify (Recommended for Next.js)

1. **Connect Repository**
   ```bash
   # Install AWS Amplify CLI
   npm install -g @aws-amplify/cli
   
   # Initialize Amplify
   amplify init
   ```

2. **Add Authentication**
   ```bash
   amplify add auth
   # Select: Default configuration with Social Provider (Federated Identity Provider)
   ```

3. **Add Storage (DynamoDB)**
   ```bash
   amplify add storage
   # Select: NoSQL Database (DynamoDB)
   # Table name: Templates
   # Partition key: id (String)
   # Sort key: userId (String)
   ```

4. **Deploy**
   ```bash
   amplify push
   ```

### Option 2: Vercel (Easiest)

1. **Connect GitHub Repository**
   - Go to vercel.com
   - Import your repository
   - Configure environment variables

2. **Set Environment Variables**
   ```
   OPENAI_API_KEY=your_key_here
   ENABLE_AI_PARSING=true
   ```

3. **Deploy**
   - Vercel automatically deploys on git push

### Option 3: EC2 + Docker

1. **Build Docker Image**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build
   CMD ["npm", "start"]
   ```

2. **Deploy to EC2**
   - Launch EC2 instance
   - Install Docker
   - Run container

## Database Migration

### Replace In-Memory Store with DynamoDB

1. **Install AWS SDK**
   ```bash
   npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb
   ```

2. **Update `lib/storage/template-store.ts`**
   ```typescript
   import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
   import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb"

   const client = new DynamoDBClient({ region: process.env.AWS_REGION })
   const docClient = DynamoDBDocumentClient.from(client)

   export async function saveTemplate(template: StoredTemplate): Promise<void> {
     await docClient.send(new PutCommand({
       TableName: process.env.TEMPLATES_TABLE_NAME,
       Item: template
     }))
   }

   export async function getTemplate(id: string): Promise<StoredTemplate | undefined> {
     const result = await docClient.send(new GetCommand({
       TableName: process.env.TEMPLATES_TABLE_NAME,
       Key: { id }
     }))
     return result.Item as StoredTemplate | undefined
   }
   ```

## Authentication Integration

### Replace Dummy Auth with AWS Cognito

1. **Update `contexts/auth-context.tsx`**
   ```typescript
   import { Auth } from '@aws-amplify/auth'

   const login = async (email: string, password: string) => {
     try {
       const user = await Auth.signIn(email, password)
       setIsAuthenticated(true)
       localStorage.setItem("knimbu_user_id", user.username)
       return true
     } catch (error) {
       return false
     }
   }
   ```

2. **Update API Routes**
   ```typescript
   // Get user from Cognito JWT token
   import { getServerSession } from 'next-auth'
   
   const session = await getServerSession()
   const userId = session?.user?.id
   ```

## Environment Variables

Create `.env.production`:

```env
# AWS Configuration
AWS_REGION=us-east-1
TEMPLATES_TABLE_NAME=knimbu-templates
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# Authentication
NEXT_PUBLIC_COGNITO_USER_POOL_ID=your_pool_id
NEXT_PUBLIC_COGNITO_CLIENT_ID=your_client_id

# OpenAI (Optional)
OPENAI_API_KEY=your_key
ENABLE_AI_PARSING=true
```

## User-Based Access Control

The current implementation uses:
- **User ID**: Stored in localStorage (development) or JWT token (production)
- **Template Ownership**: Each template has a `userId` field
- **API Protection**: Templates are filtered by `userId` in API routes

### Security Considerations

1. **Always validate user ID on the server**
2. **Use JWT tokens instead of localStorage in production**
3. **Implement rate limiting**
4. **Add CORS restrictions**
5. **Use HTTPS only**

## File Upload to S3

For document uploads, use AWS S3:

```typescript
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

const s3Client = new S3Client({ region: process.env.AWS_REGION })

export async function uploadDocument(file: File, userId: string) {
  const key = `${userId}/${Date.now()}-${file.name}`
  await s3Client.send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    Body: await file.arrayBuffer(),
    ContentType: file.type
  }))
  return key
}
```

## Monitoring & Logging

- **CloudWatch**: Monitor API logs and errors
- **X-Ray**: Trace requests across services
- **Sentry**: Error tracking (optional)

## Cost Optimization

- **DynamoDB**: Use on-demand pricing for variable traffic
- **S3**: Use lifecycle policies to archive old documents
- **CloudFront**: Cache static assets
- **Lambda**: Use for serverless functions if needed

## Next Steps

1. Set up AWS account and configure IAM roles
2. Create DynamoDB table with proper indexes
3. Set up Cognito user pool
4. Update environment variables
5. Deploy application
6. Test user-based access control
7. Monitor and optimize
