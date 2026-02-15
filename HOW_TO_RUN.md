# How to Run the Student Enrollment System

This guide will help you get the application running on your local machine.

---

## Prerequisites

Before you start, make sure you have:

- ✅ Node.js 18+ installed
- ✅ npm or yarn package manager
- ✅ Neon PostgreSQL database account (or local PostgreSQL)
- ✅ Git (for version control)

---

## Step 1: Install Dependencies

Open your terminal in the project directory and run:

```bash
npm install
```

This will install all required packages (Next.js, Prisma, NextAuth, etc.)

---

## Step 2: Set Up Environment Variables

1. **Copy the example environment file:**

```bash
copy .env.example .env.local
```

2. **Edit `.env.local` with your actual values:**

```env
# Database - Get these from Neon Console (https://console.neon.tech)
DATABASE_URL="postgresql://username:password@host-pooler.region.aws.neon.tech:5432/database?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://username:password@host.region.aws.neon.tech:5432/database?sslmode=require"

# NextAuth - For local development
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# File Storage - Local directory for uploads
UPLOAD_DIR="./uploads"
```

3. **Generate a NextAuth secret:**

```bash
# On Windows (PowerShell)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Copy the output and paste it as NEXTAUTH_SECRET
```

---

## Step 3: Set Up the Database

### Option A: Using Neon (Recommended - Free Tier Available)

1. **Go to [Neon Console](https://console.neon.tech)**
2. **Create a new project** (e.g., "student-enrollment-dev")
3. **Copy the connection strings:**
   - Pooled connection → DATABASE_URL
   - Direct connection → DIRECT_URL
4. **Paste them in your `.env.local` file**

### Option B: Using Local PostgreSQL

1. **Install PostgreSQL** on your machine
2. **Create a database:**
   ```sql
   CREATE DATABASE enrollment_dev;
   ```
3. **Update `.env.local`:**
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/enrollment_dev"
   DIRECT_URL="postgresql://postgres:password@localhost:5432/enrollment_dev"
   ```

---

## Step 4: Run Database Migrations

This creates all the tables in your database:

```bash
npx prisma migrate deploy
```

You should see output like:
```
✔ Generated Prisma Client
✔ Applied migration 20260209070159_init
```

---

## Step 5: Seed the Database (Create Test Users)

Create initial users for testing:

```bash
npx prisma db seed
```

This creates:
- **Admin user:** admin@example.com / password123
- **Parent user:** parent@example.com / password123
- **Principal user:** principal@example.com / password123

---

## Step 6: Create Upload Directory

```bash
mkdir uploads
```

---

## Step 7: Run the Development Server

```bash
npm run dev
```

You should see:
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
- Ready in 2.5s
```

---

## Step 8: Access the Application

Open your browser and go to:

**🌐 http://localhost:3000**

---

## Quick Test: Login and Explore

### Test as Parent

1. Go to http://localhost:3000/auth/signin
2. Login with:
   - Email: `parent@example.com`
   - Password: `password123`
3. You'll see the enrollment form
4. Fill out and submit an enrollment

### Test as Admin

1. Logout (if logged in as parent)
2. Login with:
   - Email: `admin@example.com`
   - Password: `password123`
3. Go to http://localhost:3000/admin/dashboard
4. You'll see all submitted enrollments
5. Click on an enrollment to view details
6. Approve or reject enrollments

---

## Common Commands

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Run tests in watch mode
npm test -- --watch
```

### Database

```bash
# Generate Prisma Client (after schema changes)
npx prisma generate

# Create a new migration
npx prisma migrate dev --name migration_name

# Deploy migrations to production
npx prisma migrate deploy

# Open Prisma Studio (database GUI)
npx prisma studio

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Seed database
npx prisma db seed
```

### Code Quality

```bash
# Run linter
npm run lint

# Format code
npm run format
```

---

## Troubleshooting

### Issue: "Cannot connect to database"

**Solution:**
1. Check your DATABASE_URL is correct
2. Verify database server is running
3. Check firewall/network settings
4. For Neon: Verify project is active in console

### Issue: "Module not found"

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### Issue: "Prisma Client not generated"

**Solution:**
```bash
npx prisma generate
```

### Issue: "Port 3000 already in use"

**Solution:**
```bash
# Kill the process using port 3000
# On Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use a different port:
npm run dev -- -p 3001
```

### Issue: "File upload failed"

**Solution:**
1. Check `uploads` directory exists
2. Verify write permissions
3. Check UPLOAD_DIR in .env.local

---

## Project Structure

```
student-enrollment-system/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/               # API routes
│   │   ├── admin/             # Admin pages
│   │   ├── parent/            # Parent pages
│   │   └── auth/              # Auth pages
│   ├── components/            # React components
│   ├── lib/                   # Utility functions
│   ├── test/                  # Test files
│   └── types/                 # TypeScript types
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # Database migrations
│   └── seed.ts                # Seed script
├── public/                    # Static files
├── uploads/                   # File uploads (created at runtime)
├── .env.local                 # Environment variables (create this)
├── .env.example               # Example environment file
├── package.json               # Dependencies
└── README.md                  # Project documentation
```

---

## Next Steps

1. ✅ Application running locally
2. 📝 Read [SYSTEM_FLOW.md](./SYSTEM_FLOW.md) to understand how it works
3. 🧪 Test the enrollment flow
4. 🎨 Customize the UI if needed
5. 🚀 Deploy to production (see [QUICK_DEPLOYMENT_GUIDE.md](./QUICK_DEPLOYMENT_GUIDE.md))

---

## Need Help?

- **Documentation:** Check the docs/ folder
- **API Reference:** See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Deployment:** See [QUICK_DEPLOYMENT_GUIDE.md](./QUICK_DEPLOYMENT_GUIDE.md)
- **Issues:** Check [TEST_FAILURES_ANALYSIS.md](./TEST_FAILURES_ANALYSIS.md)

---

**Last Updated:** February 9, 2026  
**Version:** 1.0
