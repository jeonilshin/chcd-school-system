# Student Enrollment System

Digital student enrollment system for Circular Home Child Development (CHCD).

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Database**: PostgreSQL (Neon serverless)
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Testing**: Vitest + fast-check (property-based testing)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (Neon recommended)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your Neon database connection strings:
```
# Pooled connection for application runtime
DATABASE_URL="postgresql://username:password@host-pooler.region.aws.neon.tech:5432/database?sslmode=require&pgbouncer=true"

# Direct connection for migrations
DIRECT_URL="postgresql://username:password@host.region.aws.neon.tech:5432/database?sslmode=require"
```

**Note**: See [docs/NEON_DATABASE_SETUP.md](docs/NEON_DATABASE_SETUP.md) for detailed Neon configuration instructions.

3. Initialize the database:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

4. (Optional) Seed the database with test data:
```bash
npx prisma db seed
```

### Development

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Testing

Run tests:
```bash
npm test
```

Run tests with UI:
```bash
npm run test:ui
```

Run tests with coverage:
```bash
npm run test:coverage
```

### Database Management

Generate Prisma client after schema changes:
```bash
npx prisma generate
```

Create and apply migrations:
```bash
npx prisma migrate dev --name migration_name
```

Open Prisma Studio to view/edit data:
```bash
npx prisma studio
```

## Project Structure

```
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/                   # Next.js app router pages
│   │   ├── api/              # API routes
│   │   ├── globals.css       # Global styles
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Home page
│   ├── components/           # React components
│   │   └── ui/              # shadcn/ui components
│   ├── lib/                  # Utility functions
│   │   ├── prisma.ts        # Prisma client
│   │   └── utils.ts         # Helper utilities
│   └── test/                 # Test utilities
│       └── setup.ts          # Test setup
├── .env                      # Environment variables
├── components.json           # shadcn/ui config
├── next.config.ts           # Next.js config
├── tailwind.config.ts       # Tailwind config
├── tsconfig.json            # TypeScript config
└── vitest.config.ts         # Vitest config
```

## Features

- **Parent Portal**: Submit enrollment applications online
- **Admin Dashboard**: Review and manage enrollment submissions
- **Role-Based Access**: Parent, Admin, and Principal roles
- **Document Upload**: Secure file storage for student documents
- **Validation**: Comprehensive input validation
- **Property-Based Testing**: Automated testing with fast-check

## Environment Variables

Required environment variables:

- `DATABASE_URL`: PostgreSQL pooled connection string (Neon with PgBouncer)
- `DIRECT_URL`: PostgreSQL direct connection string (Neon for migrations)
- `NEXTAUTH_URL`: Application URL (http://localhost:3000 for development)
- `NEXTAUTH_SECRET`: Secret key for NextAuth.js (generate with `openssl rand -base64 32`)
- `UPLOAD_DIR`: Directory for file uploads (default: ./uploads)

See [docs/NEON_DATABASE_SETUP.md](docs/NEON_DATABASE_SETUP.md) for detailed database configuration.

## License

Private - Circular Home Child Development
