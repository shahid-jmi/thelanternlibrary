# Multilingual Bookstore Catalog

A full-stack headless catalog system for a bookstore with support for English and Urdu (RTL). It includes a public-facing catalog to browse books and order via WhatsApp, and a protected admin panel for managing the inventory.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, react-i18next, React Router, Axios
- **Backend**: Node.js, Express, MongoDB (Mongoose), JSON Web Tokens (JWT)

## Local Development Setup

### Backend
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the environment variables example and configure it:
   ```bash
   cp .env.example .env
   ```
   *(Ensure MongoDB is running locally or provide a remote URI in the .env file).*
4. Seed the database with sample data:
   ```bash
   node seed.js
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the environment variables example and configure it:
   ```bash
   cp .env.example .env
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```

## Environment Variables

### Backend (`backend/.env`)
- `MONGO_URI`: MongoDB connection string.
- `PORT`: Port to run the server (default: 5000).
- `JWT_SECRET`: Secret key for signing admin tokens.
- `ADMIN_PASSWORD_HASH`: Bcrypt hash of the admin password.

**How to generate an admin password hash:**
Run the following in your terminal (replace `yourpassword` with your desired password):
```bash
node -e "require('bcryptjs').hash('yourpassword', 10).then(console.log)"
```

### Frontend (`frontend/.env`)
- `VITE_API_URL`: The base URL for the backend API (e.g., `http://localhost:5000/api`).
- `VITE_WHATSAPP_NUMBER`: The WhatsApp phone number for receiving orders (include country code, no `+` or spaces).

## Deployment

- **Backend**: Deploy the `backend` directory to a Node.js hosting provider like Render or Heroku. Ensure you set all the environment variables from the backend `.env` in the platform's settings. Update CORS if necessary.
- **Frontend**: Deploy the `frontend` directory to a static hosting provider like Vercel or Netlify. Set the `VITE_API_URL` to your live backend URL and configure `VITE_WHATSAPP_NUMBER`.
