# Kasi - AI Personal Finance Companion

A simple low-fidelity implementation of Kasi for database and backend development.

## Project Structure

```
kasi-backend/
├── db.js          # Database setup with lowdb (JSON file database)
├── context.js     # Financial snapshot and nudge trigger logic
├── ai.js          # Claude API integration
├── server.js      # Express REST API
├── package.json
├── .env.example   # Environment variables template
└── db.json        # Auto-created on first run

kasi-frontend/
├── src/
│   ├── App.jsx    # Entire frontend (login, dashboard, chat)
│   └── main.jsx   # React entry point
├── index.html
├── vite.config.js
└── package.json
```

## Setup Instructions

### 1. Backend Setup

```bash
cd kasi-backend
npm install
```

Create a `.env` file:
```
ANTHROPIC_API_KEY=your_claude_api_key_here
PORT=3001
```

Start the backend:
```bash
npm start
# or for development with auto-reload:
npm run dev
```

### 2. Frontend Setup

```bash
cd kasi-frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | Get all users for login |
| GET | `/dashboard/:userId` | Get financial snapshot |
| POST | `/chat` | Chat with Kasi AI |
| GET | `/nudge/:userId` | Get proactive nudge |
| GET | `/recap/:userId` | Get weekly recap |

## Database Schema

The database uses lowdb (JSON file storage). Schema includes:
- `users` - User profiles with personality and goals
- `accounts` - Balance and safe-to-spend amounts
- `transactions` - Spending history
- `bills` - Recurring bills
- `budgets` - Category spending limits

## Demo Users

1. **Mei Ling** - Super saver, disciplined
2. **Jason** - Big spender, needs reality checks
3. **Hakim** - Freelancer, variable income
4. **Shoko** - Student, struggles with hobby spending

## Notes

- This is a low-fidelity prototype for hackathon/development purposes
- No real bank API connection (dummy data)
- No persistent chat history across sessions
- No user registration/authentication
