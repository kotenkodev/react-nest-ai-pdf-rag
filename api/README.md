# Backend API — NestJS PDF RAG Server

NestJS REST API server for managing PDF document metadata, generating AWS S3 presigned upload URLs, executing Pinecone vector similarity searches, and generating contextual RAG responses using Google Gemini AI.

---

## 🗺️ Navigation

- 🏠 **[Root Overview](../README.md)** — Full-stack Architecture, Tech Stack & Setup
- ⚡ **[AWS Infrastructure README](../aws/README.md)** — Serverless Step Functions Pipeline & Lambda Handlers
- 💻 **[Web Application README](../web/README.md)** — React + Vite Retro Win95 Desktop Interface

---

## 🏛 Architecture & API Endpoints

### 1. Document Management (`/documents`)

| Method | Endpoint | Description | Guard |
| :--- | :--- | :--- | :--- |
| `GET` | `/documents` | Retrieve current user's document record and status | `EmailGuard` |
| `GET` | `/documents/status` | Retrieve document status (`pending`, `success`, `error`) | `EmailGuard` |
| `GET` | `/documents/download` | Generate signed S3 URL for downloading original PDF | `EmailGuard` |
| `POST` | `/documents` | Initiate PDF upload, create document record & return presigned S3 PUT URL | `EmailGuard` |
| `DELETE` | `/documents` | Delete document from DynamoDB, S3, and delete vectors from Pinecone | `EmailGuard` |

### 2. Chat & RAG Query (`/chat`)

| Method | Endpoint | Description | Guard |
| :--- | :--- | :--- | :--- |
| `POST` | `/chat` | Takes user question, embeds query via Jina AI (`jina-embeddings-v3`), searches Pinecone namespace, constructs prompt context, and returns Gemini AI answer | `EmailGuard` |

---

## ⚙️ Authentication & Security

- **`EmailGuard`**: Validates the `x-user-email` HTTP header sent by the frontend client.
- **`CurrentUserEmail` Decorator**: Extracts the authenticated user's email address in controller handlers.

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Run NestJS server in watch mode
npm run start:dev
```

Server runs on `http://localhost:3000`.

---

## 🔑 Environment Configuration

Copy `.env.example` to `.env`:

```env
PORT=3000
NODE_ENV=development
CORS_ORIGINS=http://localhost:5173

AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_BUCKET_NAME=pdf-pipeline-dev-pdf-uploads
TABLE_NAME=UserDocuments

GEMINI_API_KEY=your_gemini_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX=pdf-documents
JINA_API_KEY=your_jina_api_key
```
