# Ceres Vision

AI-powered crop disease detection and field diagnostics platform.

## Stack

- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: MongoDB (local)

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB running locally on `localhost:27017`

### Frontend

```bash
npm install
npm run dev
```

Runs at http://localhost:8080

### Backend

```bash
cd server
npm install
npm run dev
```

Runs at http://localhost:3001

### Environment

The backend reads from `server/.env`:

```
MONGODB_URI=mongodb://localhost:27017/ceres-vision
PORT=3001
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server + DB status |
| GET | `/api/diagnoses` | All diagnoses (newest first) |
| GET | `/api/diagnoses/:id` | Single diagnosis |
| POST | `/api/diagnoses` | Save a new diagnosis |
| DELETE | `/api/diagnoses/:id` | Delete a diagnosis |
