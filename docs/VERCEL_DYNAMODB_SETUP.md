# Vercel + DynamoDB Setup Guide

This guide will help you set up DynamoDB for template storage on Vercel.

## Step 1: Create DynamoDB Table

1. **Go to AWS Console**
   - Navigate to DynamoDB service
   - Click "Create table"

2. **Table Configuration**
   - **Table name**: `knimbu-templates`
   - **Partition key**: `id` (String)
   - **Sort key**: Leave empty (or add `userId` if you want composite key)
   - **Table settings**: Use default settings

3. **Add Global Secondary Index (GSI)**
   - Click "Create index"
   - **Index name**: `userId-index`
   - **Partition key**: `userId` (String)
   - This allows querying templates by user ID

4. **Create Table**
   - Click "Create table"
   - Wait for table to be created

## Step 2: Set Up IAM User/Role

### Option A: IAM User (Recommended for Vercel)

1. **Create IAM User**
   - Go to IAM Console
   - Click "Users" → "Add users"
   - **User name**: `vercel-knimbu`
   - **Access type**: Programmatic access

2. **Attach Policy**
   - Click "Attach policies directly"
   - Search and select: `AmazonDynamoDBFullAccess` (or create custom policy with minimal permissions)
   - Click "Next" → "Create user"

3. **Save Credentials**
   - Copy the **Access key ID** and **Secret access key**
   - You'll need these for Vercel environment variables

### Option B: IAM Role (For AWS Lambda/ECS)

If deploying to AWS Lambda or ECS, use IAM roles instead of access keys.

## Step 3: Configure Vercel Environment Variables

1. **Go to Vercel Dashboard**
   - Select your project
   - Go to "Settings" → "Environment Variables"

2. **Add Environment Variables**

   ```
   AWS_REGION=us-east-1
   DYNAMODB_TABLE_NAME=knimbu-templates
   AWS_ACCESS_KEY_ID=your_access_key_id
   AWS_SECRET_ACCESS_KEY=your_secret_access_key
   ```

   **Note**: For production, use Vercel's environment variable settings to set these per environment.

3. **Optional Variables**
   ```
   NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
   ```

## Step 4: Install AWS SDK

The AWS SDK will be installed automatically when you deploy, but you can also install it locally:

```bash
npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb
```

## Step 5: Deploy to Vercel

1. **Connect Repository**
   - Push your code to GitHub/GitLab/Bitbucket
   - Import project in Vercel

2. **Configure Build Settings**
   - Framework Preset: Next.js
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

3. **Deploy**
   - Click "Deploy"
   - Vercel will automatically use your environment variables

## Step 6: Verify Setup

1. **Test Template Creation**
   - Create a template in your app
   - Check DynamoDB console to see if item was created

2. **Check Logs**
   - Go to Vercel Dashboard → "Deployments" → "Functions"
   - Check for any DynamoDB errors

## DynamoDB Table Structure

### Primary Key
- `id` (String) - Unique template identifier

### Attributes
- `userId` (String) - Owner of the template
- `documentContent` (Map) - Full document content
- `templateConfig` (Map) - Template configuration
- `features` (Map) - Enabled features
- `sections` (Map) - Enabled sections
- `createdAt` (String) - ISO timestamp
- `updatedAt` (String) - ISO timestamp
- `deployed` (Boolean) - Deployment status (optional)
- `deployedUrl` (String) - Deployment URL (optional)

### Global Secondary Index
- `userId-index`
  - Partition key: `userId`
  - Allows querying all templates for a user

## Cost Estimation

DynamoDB pricing (as of 2024):
- **On-Demand**: $1.25 per million write units, $0.25 per million read units
- **Provisioned**: $0.00065 per write unit, $0.00013 per read unit per hour

For a small application:
- ~1000 templates
- ~100 reads/day
- ~10 writes/day
- **Estimated cost**: < $1/month

## Security Best Practices

1. **Use IAM Roles** (if possible) instead of access keys
2. **Limit Permissions** - Create custom IAM policy with only necessary DynamoDB permissions
3. **Rotate Keys** - Regularly rotate access keys
4. **Use Vercel Secrets** - Store sensitive values in Vercel's environment variables
5. **Enable Encryption** - Enable encryption at rest in DynamoDB

## Custom IAM Policy (Minimal Permissions)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query"
      ],
      "Resource": [
        "arn:aws:dynamodb:us-east-1:YOUR_ACCOUNT_ID:table/knimbu-templates",
        "arn:aws:dynamodb:us-east-1:YOUR_ACCOUNT_ID:table/knimbu-templates/index/*"
      ]
    }
  ]
}
```

## Troubleshooting

### Error: "Access Denied"
- Check IAM user permissions
- Verify access keys are correct
- Ensure table name matches environment variable

### Error: "Table not found"
- Verify `DYNAMODB_TABLE_NAME` environment variable
- Check table exists in the correct region
- Verify `AWS_REGION` matches table region

### Error: "Index not found"
- Ensure GSI `userId-index` is created
- Wait for index to finish creating (can take a few minutes)

### Local Development
- For local development, the app will use in-memory storage
- DynamoDB is only used when environment variables are set
- To test DynamoDB locally, set environment variables in `.env.local`

## Next Steps

1. Set up monitoring with CloudWatch
2. Configure DynamoDB backups
3. Set up alerts for high usage
4. Consider using DynamoDB Streams for additional features
5. Implement caching if needed
