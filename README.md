# AI-Powered Expense Manager

AI-Powered Expense Manager is a full-stack personal finance application for recording income and expenses, reviewing monthly spending, scanning receipts, and exploring spending patterns with optional AI assistance.

The repository contains a React/Vite client and an Express/MongoDB API.

## Features

- JWT-based registration and login
- Income and expense transaction management
- Category, date, merchant, and payment-method tracking
- Monthly overview with income, expense, and balance totals
- Spending charts and category summaries
- Natural-language transaction parsing
- Receipt OCR with Tesseract.js
- AI-generated spending insights and an expense assistant
- Simple monthly spending forecast and unusual-transaction detection
- Light and dark themes
- Local monthly budget planning

## Tech Stack

### Frontend

- React 18
- Vite 6
- React Router 7
- Tailwind CSS 3
- Recharts
- Browser `localStorage` for session, theme, and local budget preferences

### Backend

- Node.js
- Express 4
- MongoDB and Mongoose
- JSON Web Tokens
- bcryptjs
- Multer
- Tesseract.js

## Project Structure

```text
ai-expense-manager/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── asset/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── api.js
│   │   ├── main.jsx
│   │   └── style.css
│   └── package.json
└── server/
    ├── src/
    │   ├── middleware/
    │   ├── routes/
    │   ├── services/
    │   ├── index.js
    │   └── models.js
    ├── eng.traineddata
    └── package.json
```

## Prerequisites

- Node.js 18 or newer
- npm
- A MongoDB database (local or hosted)
- Optional: an OpenAI-compatible AI provider API key

## Environment Variables

Create `server/.env`:

```dotenv
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB=expense_manager
JWT_SECRET=replace-with-a-long-random-secret

# Optional AI configuration
AI_API_KEY=your-api-key
AI_BASE_URL=https://generativelanguage.googleapis.com
AI_MODEL=gemini-2.5-flash
```

The AI integration sends OpenAI-compatible chat-completion requests to `${AI_BASE_URL}/chat/completions`. It can be left unconfigured:

- Natural-language parsing uses a basic local amount/category parser.
- The finance assistant uses a local totals-based fallback.
- Spending insights use a local summary fallback.

Create `client/.env`:

```dotenv
VITE_API_URL=http://localhost:5000/api
```

The frontend and backend `.env` files are excluded by the repository `.gitignore`. Never commit real secrets.

## Installation

From the repository root:

```powershell
cd server
npm install

cd ..\client
npm install
```

## Running the Application

Start the API in one terminal:

```powershell
cd server
npm run dev
```

Start the frontend in another terminal:

```powershell
cd client
npm run dev
```

Open the Vite URL printed in the terminal, normally <http://localhost:5173>.

The API health endpoint is available at <http://localhost:5000/api/health>.

## Available Scripts

### Client

```powershell
npm run dev      # Start the Vite development server
npm run build    # Build production assets
npm run preview  # Preview the production build
```

### Server

```powershell
npm run dev      # Start the API with nodemon
npm start        # Start the API with Node.js
```

## API Overview

All protected routes require:

```text
Authorization: Bearer <JWT>
```

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/health` | API health check |
| `POST` | `/api/auth/register` | Register a user |
| `POST` | `/api/auth/login` | Log in and receive a JWT |
| `GET` | `/api/expenses` | List transactions |
| `POST` | `/api/expenses` | Create a transaction |
| `PUT` | `/api/expenses/:id` | Update a transaction |
| `DELETE` | `/api/expenses/:id` | Delete a transaction |
| `POST` | `/api/expenses/receipt/ocr` | Extract text from a receipt image |
| `POST` | `/api/ai/parse-expense` | Parse natural-language transaction text |
| `GET` | `/api/ai/insights` | Get monthly category insights |
| `GET` | `/api/ai/analytics` | Get forecast and anomaly data |
| `POST` | `/api/ai/assistant` | Ask a question about current expense aggregates |

## Receipt Scanning

The receipt scanner accepts JPG, PNG, and WEBP images up to 5 MB. OCR runs on the server with Tesseract.js and the bundled English language data. Extracted text and a possible total are returned for review; the transaction is not saved automatically.

OCR accuracy depends on image quality, receipt layout, and text legibility.

## Security and Data Notes

- Passwords are hashed with bcrypt.
- API routes use JWT authentication.
- Expense records are scoped to the authenticated user.
- AI requests use only transaction aggregates or prompted text; review provider policies before sending personal data.
- JWT secrets and database credentials should remain in environment variables.
- The budget and budget-member UI currently stores budget data locally and is a planning prototype. Cross-user sharing is not implemented by the backend.

## Production Build

Build the frontend:

```powershell
cd client
npm run build
```

The generated `client/dist` directory can be hosted by a static web host. Configure `VITE_API_URL` to the deployed API URL before building, and set `CLIENT_ORIGIN` on the server to the frontend origin.
