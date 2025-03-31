# Enterprise r/place Clone

A real-time collaborative pixel canvas inspired by Reddit's r/place experiment. Place pixels on a shared canvas and watch as a community artwork emerges.

## Features

- **Interactive Canvas**: 50x50 grid where users can place colored pixels
- **Color Selection**: Choose from predefined colors or use a custom color picker
- **Cooldown System**: 15-second cooldown between placing pixels to prevent spamming
- **Real-time Updates**: Canvas refreshes every 5 seconds to show other users' changes
- **User Attribution**: Hover over pixels to see who placed them
- **User Authentication**: Sign in to track your pixels and cooldown

## Technologies

- **Frontend**: Next.js 15, React 19, Tailwind CSS, Zustand for state management
- **Backend**: Next.js server components and server actions
- **Database**: MongoDB for storing canvas state and user cooldowns
- **Authentication**: Clerk for user management

## Getting Started

1. Clone the repository
2. Install dependencies
   ```bash
   npm install
   ```
3. Set up environment variables in a `.env.local` file:
   ```
   MONGODB_URI=your_mongodb_connection_string
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   ```
4. Run the development server
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## How It Works

1. Sign in with your account
2. Select a color from the color picker
3. Click on any pixel on the canvas to change its color
4. Wait for the 15-second cooldown to expire before placing another pixel
5. Collaborate with others to create art, pixel by pixel

## Implementation Details

- Canvas data is stored in MongoDB with two collections:
  - `canvas` for the pixel grid
  - `users` for cooldown tracking
- User interactions trigger server actions that update the database
- Client-side optimistically updates the UI before server confirmation
- Canvas state includes color information, timestamp, and username for each pixel

## Deployment

The application can be deployed on Vercel or any platform that supports Next.js:

```bash
npm run build
npm run start
```

Or deploy directly to Vercel:

```bash
vercel
```

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## License

MIT