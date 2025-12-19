# StartupConnect Frontend

React.js frontend application for StartupConnect platform.

## Setup

1. Install dependencies:
```bash
npm install
```

2. (Optional) Create `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

3. Start development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Features

- User registration with role selection
- User login with JWT authentication
- Protected routes
- Responsive design with Tailwind CSS
- Toast notifications
- Form validation

## Tech Stack

- React 18
- Vite
- React Router v6
- Axios
- Tailwind CSS
- react-hot-toast

## Project Structure

```
src/
├── components/     # Reusable components
├── context/        # React Context providers
├── pages/          # Page components
├── utils/          # Utility functions
├── App.jsx         # Main app component
└── main.jsx        # Entry point
```

