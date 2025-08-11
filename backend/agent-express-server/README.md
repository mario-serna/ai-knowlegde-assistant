# Express TypeScript Server

A simple Express.js server built with TypeScript, featuring security middleware, logging, and basic API endpoints.

## Features

- 🚀 **Express.js** - Fast, unopinionated web framework
- 📝 **TypeScript** - Type-safe JavaScript development
- 🔒 **Security** - Helmet.js for security headers
- 🌐 **CORS** - Cross-origin resource sharing enabled
- 📊 **Logging** - Morgan HTTP request logger
- 🔄 **Hot Reload** - Development server with auto-restart
- 🏗️ **Build System** - TypeScript compilation to JavaScript

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Installation

1. Navigate to the express directory:

   ```bash
   cd backend/express
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Available Scripts

- **`npm run dev`** - Start development server with hot reload
- **`npm run build`** - Compile TypeScript to JavaScript
- **`npm start`** - Start production server (requires build first)
- **`npm run clean`** - Remove build artifacts

## Development

Start the development server:

```bash
npm run dev
```

The server will start on port 3001 (or the port specified in the `PORT` environment variable).

## API Endpoints

### Base Routes

- **`GET /`** - Welcome message and server status
- **`GET /health`** - Health check endpoint
- **`GET /api/hello?name=YourName`** - Personalized greeting

### Example Usage

```bash
# Test the server
curl http://localhost:3001/

# Health check
curl http://localhost:3001/health

# Hello endpoint
curl "http://localhost:3001/api/hello?name=Alice"
```

## Project Structure

```
src/
├── index.ts          # Main server file
├── routes/           # Route definitions (to be added)
├── controllers/      # Route controllers (to be added)
├── middleware/       # Custom middleware (to be added)
└── types/           # TypeScript type definitions (to be added)
```

## Environment Variables

- **`PORT`** - Server port (default: 3001)
- **`NODE_ENV`** - Environment mode (development/production)

## Production Build

1. Build the project:

   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## Adding New Routes

To add new routes, you can either:

1. Add them directly in `src/index.ts`
2. Create separate route files in a `routes/` directory
3. Use Express Router for better organization

## Security Features

- **Helmet.js** - Sets various HTTP headers for security
- **CORS** - Configurable cross-origin requests
- **Input Validation** - Basic request validation (can be enhanced)

## Next Steps

Consider adding:

- Database integration (MongoDB, PostgreSQL, etc.)
- Authentication middleware
- Request validation (Joi, Yup, etc.)
- Testing framework (Jest, Mocha, etc.)
- API documentation (Swagger/OpenAPI)
- Rate limiting
- File upload handling
