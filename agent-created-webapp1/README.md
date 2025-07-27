# Express API Backend

Minor change for testing

A production-ready Express.js backend with modern features:

- **API Validation** - Express-validator for request validation
- **Structured Logging** - Winston/Morgan for request and application logging
- **Centralized Error Handling** - Consistent error responses
- **API Documentation** - Swagger/OpenAPI for interactive documentation
- **JWT Authentication** - Secure route protection
- **MongoDB Integration** - Data persistence with Mongoose ODM
- **WebSocket Support** - Real-time updates with Socket.IO
- **Docker Support** - Easy containerization

## Quick Start

### Prerequisites

- Node.js (v14+)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Copy the example environment file:

```bash
cp .env-example .env
```

4. Update the environment variables in the `.env` file

### Running the Application

#### Development Mode

```bash
npm run dev
```

#### Production Mode

```bash
npm start
```

### Using Docker

To run the application with Docker and MongoDB:

```bash
docker-compose up
```

## API Documentation

When running, the API documentation is available at:

- **Swagger UI**: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)
- **OpenAPI JSON**: [http://localhost:3000/api/docs.json](http://localhost:3000/api/docs.json)

## API Endpoints

### Status/Utility Endpoints

- `GET /api/status` - Server status information
- `POST /api/echo` - Echo request data with timestamp
- `GET /api/data` - Return dummy data
- `GET /api/random` - Return random data

### Item Endpoints

- `GET /api/items` - List all items
- `GET /api/items/:id` - Get a specific item
- `POST /api/items` - Create a new item
- `PUT /api/items/:id` - Update an item
- `DELETE /api/items/:id` - Delete an item
- `GET /api/items/search` - Search items with pagination

### Authentication Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user profile (requires authentication)

## Authentication

To access protected routes, include the JWT token in the Authorization header:

```
Authorization: Bearer your-token-here
```

## Project Structure

```
backend/
├── config/              # Configuration files
├── controllers/         # Request handlers
├── middleware/          # Custom middleware
├── models/              # Mongoose models
├── routes/              # Express routes
├── utils/               # Utility functions
├── server.js            # Main application file
```

## Testing

```bash
npm test
```

## License

MIT 