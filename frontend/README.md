# Emilio Beaufort - Frontend

A luxury grooming website built with Next.js 14, TypeScript, Tailwind CSS, and shadcn/ui.

## Features

- **Modern Design**: Minimalist luxury aesthetic with custom brand colors
- **Responsive**: Mobile-first design that works on all devices
- **Animations**: Smooth transitions and micro-interactions with Framer Motion
- **Forms**: Validated forms with React Hook Form and Zod
- **API Integration**: Ready to connect with the NestJS backend

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod
- **Package Manager**: pnpm

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment variables:
Create a `.env.local` file in the root directory with:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here
```

3. Run the development server:
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Homepage
│   ├── products/          # Products listing
│   ├── philosophy/        # Brand philosophy
│   ├── journal/           # Blog posts
│   ├── partnerships/      # B2B inquiry form
│   ├── careers/           # Job application form
│   └── waitlist/          # Email signup form
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   ├── Navbar.tsx        # Navigation component
│   ├── Footer.tsx        # Footer component
│   └── ProductCard.tsx   # Product display component
├── lib/                  # Utilities and API functions
│   ├── api.ts           # API integration functions
│   └── utils.ts         # Utility functions
└── public/              # Static assets
```

## Design System

### Colors
- **Background**: #FDFDFD (off-white)
- **Text**: #111111 (black)
- **Accent**: #A18A68 (muted gold)

### Typography
- **Headings**: Playfair Display (Google Fonts)
- **Body**: Inter (Google Fonts)

### Animations
- Character-by-character reveal for hero headlines
- Fade-in animations on scroll
- Smooth hover transitions

## API Integration

The frontend is designed to work with the NestJS backend API. Key endpoints:

- `GET /api/products` - Fetch all products
- `GET /api/products/featured` - Get featured product
- `GET /api/posts` - Fetch blog posts
- `POST /api/partnerships` - Submit partnership inquiry
- `POST /api/careers` - Submit job application
- `POST /api/waitlist` - Join waitlist

## Forms

All forms include:
- Real-time validation with Zod schemas
- Error handling and user feedback
- Success states with confirmation messages
- Responsive design

## Deployment

The application can be deployed to Vercel, Netlify, or any other Next.js-compatible platform.

### Build for Production

```bash
pnpm build
pnpm start
```

## Contributing

1. Follow the existing code style and patterns
2. Use TypeScript for all new code
3. Ensure responsive design works on all screen sizes
4. Test forms and API integration thoroughly

## License

This project is proprietary to Emilio Beaufort.
