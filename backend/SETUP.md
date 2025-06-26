# Backend Setup Instructions

## Environment Configuration

Before running the backend, you need to set up your environment variables:

1. Create a `.env` file in the backend root directory with the following content:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/emilio_beaufort"

# Server
PORT=3001

# JWT (for future authentication)
JWT_SECRET="your-super-secret-jwt-key-here"

# Environment
NODE_ENV="development"
```

2. Replace the `DATABASE_URL` with your actual PostgreSQL connection string:

   **For Local PostgreSQL:**
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/emilio_beaufort"
   ```

   **For NeonDB:**
   ```env
   DATABASE_URL="postgresql://username:password@ep-xxx-xxx-xxx.region.aws.neon.tech/emilio_beaufort"
   ```

   **For Supabase:**
   ```env
   DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"
   ```

3. Run Prisma migrations to set up the database:
   ```bash
   pnpm prisma migrate dev
   ```

4. Generate Prisma client:
   ```bash
   pnpm prisma generate
   ```

## Running the Backend

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start the development server:
   ```bash
   pnpm run start:dev
   ```

The backend will run on port 3001 by default.

## API Endpoints

- **Products**: `http://localhost:3001/api/products`
- **Posts**: `http://localhost:3001/api/posts`

## Troubleshooting

- If you get a "DATABASE_URL not found" error, make sure your `.env` file exists and has the correct database URL
- If you get a port conflict, make sure no other service is running on port 3001
- For database connection issues, verify your database is running and the connection string is correct 