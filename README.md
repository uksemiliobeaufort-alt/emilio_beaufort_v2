# Emilio Beaufort - Luxury Grooming Brand

A complete digital presence for Emilio Beaufort, featuring a decoupled architecture with a sophisticated backend API and a minimalist, professional frontend.

## 🏗️ Architecture

- **Backend**: NestJS + Prisma + PostgreSQL
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Design System**: Monochrome palette with muted gold accents
- **Fonts**: Playfair Display (headings) + Inter (body)

## 📁 Project Structure

```
emilio_beaufort_v2/
├── backend/          # NestJS API server
│   ├── src/
│   │   ├── products/     # Product management
│   │   ├── posts/        # Journal/blog posts
│   │   ├── partnership-inquiries/  # Partnership form handling
│   │   └── prisma/       # Database layer
│   └── prisma/
│       └── schema.prisma # Database schema
└── frontend/         # Next.js application
    ├── app/          # App router pages
    ├── components/   # Reusable UI components
    └── lib/          # Utilities and API client
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- PostgreSQL database

### Backend Setup

```bash
cd backend
pnpm install
cp .env.example .env  # Configure your database URL
pnpm prisma generate
pnpm prisma db push
pnpm run start:dev
```

### Frontend Setup

```bash
cd frontend
pnpm install
pnpm run dev
```

## 🎨 Design Philosophy

- **Minimalist**: Clean, uncluttered interfaces
- **Professional**: Sophisticated typography and spacing
- **Luxury**: Premium feel with subtle animations
- **Accessible**: WCAG compliant design patterns

## 📱 Features

### Backend API
- Product catalog with featured items
- Journal/blog post management
- Partnership inquiry form handling
- Optimized data fetching with combined endpoints

### Frontend
- Single-page application with smooth scrolling
- Sticky navigation with anchor links
- Responsive design for all devices
- Framer Motion animations
- Form validation with shadcn/ui components

## 🔧 Development

### Backend Development
```bash
cd backend
pnpm run start:dev    # Development server
pnpm run build        # Production build
pnpm run test         # Run tests
```

### Frontend Development
```bash
cd frontend
pnpm run dev          # Development server
pnpm run build        # Production build
pnpm run lint         # Lint code
```

## 🌐 API Endpoints

- `GET /api/products/featured` - Featured products
- `GET /api/posts/recent` - Recent journal posts
- `GET /api/home` - Combined home page data
- `POST /api/partnership-inquiries` - Submit partnership inquiry

## 📄 License

Private - Emilio Beaufort Luxury Grooming Brand 