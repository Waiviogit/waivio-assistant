# Waivio Assistant

An intelligent AI assistant service built with NestJS, LangChain, and advanced AI agents for providing contextual responses and support.

## 🚀 Features

- **Multi-Agent AI System**: Intelligent routing between different specialized agents
- **Vector Search**: Powered by Weaviate for semantic search and context retrieval
- **Chat History**: Redis-based conversation persistence
- **Image Generation**: Built-in image generation capabilities
- **Host-Based Customization**: Dynamic behavior based on host domain
- **Swagger API Documentation**: Auto-generated API docs
- **Docker Support**: Containerized deployment ready

## 🏗️ Architecture

The service uses a sophisticated agent-based architecture:

- **Initial Support Agent**: Handles first-time interactions
- **General Agent**: Provides contextual responses using vector search
- **Search Agent**: Specialized for search-related queries
- **Custom Agent**: Host-specific customizations

## 📋 Prerequisites

- Node.js 20.10+
- Redis
- Weaviate Vector Database
- OpenAI API Key

## 🛠️ Installation

```bash
# Clone the repository
git clone <repository-url>
cd waivio-assistant

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

## ⚙️ Configuration

Create a `.env` file with the following required variables:

```env
OPENAI_API_KEY=your_openai_api_key
OPENAI_API_ORG=your_openai_org_id
WEAVIATE_CONNECTION_STRING=your_weaviate_url
REDIS_URL=your_redis_url
PORT=3000
APP_HOST=your_app_host
```

## 🚀 Running the Application

### Development

```bash
# Start in development mode with hot reload
npm run start:dev

# Start in debug mode
npm run start:debug
```

### Production

```bash
# Build the application
npm run build

# Start in production mode
npm run start:prod
```

### Docker

```bash
# Build and run with Docker Compose
docker-compose up --build

# Run in background
docker-compose up -d
```

## 📊 Vector Database Setup

Initialize the vector database with your data:

```bash
# Run vector database migration
npm run addVectorAll
```

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run tests with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e

# Run tests in watch mode
npm run test:watch
```

## 📚 API Documentation

Once the application is running, access the Swagger documentation at:

```
http://localhost:3000/assistant/docs
```

## 🔌 API Endpoints

### Send Message
```http
POST /assistant
Content-Type: application/json

{
  "query": "Your question here",
  "userName": "user123",
  "id": "session-id",
  "images": ["base64-image-1", "base64-image-2"]
}
```

### Get Chat History
```http
GET /assistant/history/{sessionId}
```

## 🏗️ Project Structure

```
src/
├── assistant/           # AI assistant core
│   ├── agents/         # AI agent implementations
│   ├── constants/      # Configuration constants
│   ├── helpers/        # Utility functions
│   ├── images/         # Image generation
│   ├── intention/      # Intent detection
│   ├── lib/           # Knowledge base files
│   ├── migrations/    # Database migrations
│   └── store/         # Vector store integration
├── clients/           # External API clients
├── config/           # Configuration management
├── decorators/       # Custom decorators
├── dto/             # Data transfer objects
├── middleware/      # HTTP middleware
└── pipes/          # Validation pipes
```

## 🔧 Development

### Code Quality

```bash
# Format code
npm run format

# Lint code
npm run lint
```

### Adding New Agents

1. Create a new agent class implementing the `Agent` interface
2. Add the agent to the routing logic in `src/assistant/index.ts`
3. Update the agent constants in `src/assistant/constants/nodes.ts`

## 🐳 Docker

The application includes Docker support for easy deployment:

- **Dockerfile**: Multi-stage build optimized for production
- **docker-compose.yml**: Complete stack with environment configuration
- **Host networking**: Configured for production deployment

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 🆘 Support

For issues and questions:
- Check the API documentation at `/assistant/docs`
- Review the logs for debugging information
- Ensure all environment variables are properly configured
