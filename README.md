# Hyperliquid Trading Dashboard

A modern, responsive trading leaderboard dashboard built with Next.js, TypeScript, and Tailwind CSS. Features a Jupiter-inspired dark theme and real-time data integration with the Hyperliquid Auto Trade API.

## Features

- 🏆 **Real-time Leaderboard** - Track top-performing traders with live updates
- 📊 **Comprehensive Metrics** - Win rates, volume, profit/loss, and trader scores
- 🎨 **Modern UI** - Jupiter-inspired design with gradient backgrounds and smooth animations
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile devices
- ⚡ **Fast Performance** - Built with Next.js App Router and optimized for speed
- 🔄 **Auto-refresh** - Real-time data updates with caching for optimal performance

## Tech Stack

- **Framework**: Next.js 15.4.6 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **API Integration**: Fetch API with error handling
- **Build Tool**: Turbopack for fast development

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn package manager
- Hyperliquid Auto Trade API running on `http://localhost:8000`

### Installation

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment**
   Update the API URL in `.env.local`:

   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
# Build the application
npm run build

# Start production server
npm run start
```

## API Integration

The dashboard integrates with the Hyperliquid Auto Trade API endpoints:

- `GET /api/v1/leaderboard` - Fetch trader leaderboard with sorting
- `GET /traders/{id}` - Get individual trader details

### API Response Format

```json
[
  {
    "trader_id": 2342,
    "trader_address": "0xb709bb3ec955667a581d137acc38b7c6257a4c3f",
    "win_rate": 0.6,
    "total_volume_usd": 1949.36174,
    "account_age_days": 2,
    "avg_risk_ratio": 1.194936174,
    "max_drawdown": 0.10051272539831509,
    "max_profit_usd": 132.55659832,
    "max_loss_usd": 42.88595828,
    "updated_at": "2025-08-16T14:54:49.805081+00:00",
    "trader_score": 0.526
  }
]
```

## Project Structure

```
frontend/
├── src/
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # React components
│   │   └── Leaderboard.tsx  # Main leaderboard component
│   ├── lib/                 # Utilities and API functions
│   │   ├── api.ts          # API integration
│   │   └── utils.ts        # Helper functions
│   └── types/              # TypeScript type definitions
│       └── api.ts          # API response types
├── public/                 # Static assets
└── .env.local             # Environment configuration
```

## Development

### Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Environment Variables

Create a `.env.local` file in the frontend directory:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

**Built with ❤️ for the Hyperliquid trading community**
