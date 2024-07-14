# WhatsApp Chat Recap Generator

This project is a WhatsApp chat recap generator that uses AI to summarize daily conversations. It's built with TypeScript and uses Bun as the Node.js runtime.

## Project Structure

- `index.ts`: Main entry point for the WhatsApp client
- `server.ts`: Express server for handling recap generation requests
- `recap.ts`: Contains logic for generating recaps using OpenAI
- `messages.ts`: Handles fetching messages from WhatsApp
- `public/index.html`: Frontend for the recap generator
- `prisma/schema.prisma`: Database schema for storing messages

## How It Works

1. **WhatsApp Client (`index.ts`):**
   - Uses `whatsapp-web.js` to connect to WhatsApp
   - Fetches messages and saves them to the database

2. **Message Fetching (`messages.ts`):**
   - Provides functionality to fetch all messages from a chat
   - Uses WhatsApp Web's internal APIs to load messages

3. **Database (`prisma/schema.prisma`):**
   - Uses Prisma with SQLite to store messages
   - Stores message content, timestamps, and metadata

4. **Recap Generation (`recap.ts`):**
   - Fetches messages for a specific date from the database
   - Uses OpenAI's GPT model to generate a summary
   - Supports multiple languages

5. **Web Server (`server.ts`):**
   - Express server that serves the frontend and handles API requests
   - Caches generated recaps for 24 hours

6. **Frontend (`public/index.html`):**
   - Simple interface for selecting a date and language
   - Sends requests to the server and displays the generated recap

## Setup and Running

1. Install dependencies:
   ```
   bun install
   ```

2. Set up environment variables:
   - `DATABASE_URL`: SQLite database URL
   - `OPENROUTER_KEY`: OpenAI API key

3. Run the WhatsApp client:
   ```
   bun run index.ts
   ```

4. Run the web server:
   ```
   bun run server.ts
   ```

5. Open `http://localhost:3000` in your browser to use the recap generator.

## Note on Bun

This project uses Bun as the Node.js runtime. Bun is a fast all-in-one JavaScript runtime that can run most Node.js applications. It's used here for its speed and simplicity.

## Dependencies

- `whatsapp-web.js`: For interacting with WhatsApp
- `openai`: For generating recaps using AI
- `prisma`: For database operations
- `express`: For the web server
- `node-cache`: For caching generated recaps

## Future Improvements

- Add user authentication
- Support for multiple WhatsApp chats
- Implement more advanced NLP techniques for better summaries
- Add tests for critical components
