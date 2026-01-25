# Quick Start: Vercel Deployment

## Prerequisites

1. Vercel account (free tier works)
2. AWS account (for DynamoDB)
3. GitHub/GitLab/Bitbucket repository

## Quick Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up DynamoDB

Follow the detailed guide in `docs/VERCEL_DYNAMODB_SETUP.md` or use these quick steps:

1. Go to AWS Console → DynamoDB
2. Create table: `knimbu-templates`
   - Partition key: `id` (String)
   - Add GSI: `userId-index` with partition key `userId` (String)
3. Create IAM user with DynamoDB access
4. Save Access Key ID and Secret Access Key

### 3. Deploy to Vercel

1. Push code to GitHub
2. Go to vercel.com → Import Project
3. Add Environment Variables:
   ```
   AWS_REGION=us-east-1
   DYNAMODB_TABLE_NAME=knimbu-templates
   AWS_ACCESS_KEY_ID=your_key_here
   AWS_SECRET_ACCESS_KEY=your_secret_here
   ```
4. Deploy!

## Test Users

Three dummy users are configured:

1. **Admin**
   - Email: `admin@knimbu.com`
   - Password: `password123`
   - User ID: `user-admin-001`

2. **John**
   - Email: `john@knimbu.com`
   - Password: `password123`
   - User ID: `user-john-002`

3. **Sarah**
   - Email: `sarah@knimbu.com`
   - Password: `password123`
   - User ID: `user-sarah-003`

Each user will only see their own templates.

## Features

✅ Multiple user authentication (dummy)
✅ Template creation and storage
✅ Deploy button on template preview
✅ DynamoDB integration (with in-memory fallback)
✅ User-based access control

## Local Development

For local development, the app uses in-memory storage. DynamoDB is only used when environment variables are set.

To test DynamoDB locally, create `.env.local`:

```env
AWS_REGION=us-east-1
DYNAMODB_TABLE_NAME=knimbu-templates
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
```

## Troubleshooting

- **Templates not saving?** Check DynamoDB table exists and IAM permissions
- **Access denied?** Verify AWS credentials are correct
- **Table not found?** Ensure table name matches environment variable

For detailed setup, see `docs/VERCEL_DYNAMODB_SETUP.md`
