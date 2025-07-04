# DD Voice Agent Demo

## 1. Prerequisites

- Node.js 18+
- npm or pnpm
- Docker (for PostgreSQL)

## 2. Install Dependencies

```bash
npm install
```

## 3. Set Up Environment Variables

Create a `.env` file in the root directory with the following:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/voice_agent"
ELEVENLABS_API_KEY="your-elevenlabs-api-key"
OPENAI_API_KEY="your-openai-api-key"
GEMINI_API_KEY="your-gemini-api-key"
```

## 4. Start PostgreSQL with Docker

```bash
docker-compose up
```

## 5. Set Up the Database

```bash
npx prisma generate
npx prisma db push
```

## 6. Start the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

## 7. Recording Storage

Voice recordings are automatically saved to the `public/recordings/` directory with the following structure:

- **File Location**: `public/recordings/`
- **File Naming**: `recording_{timestamp}.wav` (e.g., `recording_1703123456789.wav`)
- **Access URL**: `/recordings/{filename}` (e.g., `/recordings/recording_1703123456789.wav`)
- **Database Storage**: Recording metadata (filename, duration, language, transcript, etc.) is stored in PostgreSQL
- **File Format**: WAV format for optimal compatibility

The recordings directory is automatically created when the first recording is processed.
