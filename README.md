# My Muhasabah

A personal accountability application designed to track expenses, goals, and daily religious activities. Built with a modern, high-performance tech stack focusing on a premium glassmorphism design and seamless light/dark mode adaptation.

## Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Database ORM:** Prisma
- **Database:** PostgreSQL
- **Styling:** Vanilla CSS (CSS Variables)
- **Icons:** Lucide React

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL running locally

### 1. Installation

Clone the repository and install the dependencies:

```bash
git clone https://github.com/kaisarnajar/my-muhasabah.git
cd my-muhasabah
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory of the project with the following configuration:

```env
# Database connection string (replace with your local postgres credentials)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/my_muhasabah?schema=public"

# Password required to access the application
APP_PASSWORD="mysecretpassword123"
```

### 3. Database Initialization

Sync the database schema and push the test data to your local PostgreSQL instance:

```bash
npx prisma db push
npx prisma db seed
```

### 4. Running the Development Server

Start the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You will be prompted to enter the `APP_PASSWORD` configured in your `.env` file to access the dashboard.

## Deployment

This application is optimized for deployment on Vercel. 
Simply import the GitHub repository into your Vercel dashboard, and make sure to add both `DATABASE_URL` and `APP_PASSWORD` to your Vercel Environment Variables before deploying.
