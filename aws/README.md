# AWS Serverless Step Functions PDF Processing Pipeline

Serverless Framework service deploying AWS Step Functions, Lambda functions, S3 EventBridge triggers, and DynamoDB infrastructure for automatic PDF text extraction, chunking, embedding, and vector indexing.

---

## ⚡ Step Functions Pipeline Workflow

```
[S3 PDF Upload] ──> (EventBridge Object Created) ──> [Step Functions State Machine]
                                                              │
        ┌─────────────────────────────────────────────────────┤
        │                                                     │
        ▼                                                     ▼
 [ExtractTextStep] ──> [ChunkTextStep] ──> [ProcessAndIndexChunksStep] ──> [UpdateStatusSuccessStep]
        │                     │                       │
        └─────────────────────┴───────────────────────┴───────────────────> [UpdateStatusErrorStep]
```

### Lambda Handlers Overview:

1. **`extractText`**:
   - Downloads PDF object from S3.
   - Extracts plain text using `pdf-parse`.
   - Extracts `userEmail` from file key path (`documents/user@example.com/document.pdf`).

2. **`chunkText`**:
   - Splits extracted text into semantic chunks (~500 characters).

3. **`processAndIndexChunks`**:
   - Generates text embeddings using Google Gemini `text-embedding-004`.
   - Upserts vector embeddings and metadata (`fileKey`, `userEmail`, `chunkIndex`, `text`) to Pinecone namespace.

4. **`updateStatus`**:
   - Updates `UserDocuments` DynamoDB table record (`status: success` or `status: error`).

---

## 🚀 Deployment

```bash
# Install dependencies
npm install

# Deploy to AWS via Serverless Framework
npm run deploy
```

---

## 🔑 Environment Configuration

Copy `.env.example` to `.env`:

```env
TABLE_NAME=UserDocuments
GEMINI_API_KEY=your_gemini_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX=pdf-documents
```
