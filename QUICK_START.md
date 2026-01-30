# Quick Start Guide

Get the Balance Forecast app running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- Supabase account (free at supabase.com)
- Vercel account (optional, for deployment)

## Step 1: Install Dependencies (1 minute)

```bash
cd /Users/edoardorinaldi/Desktop/progetti/balance-forecast
npm install
```

## Step 2: Setup Supabase (2 minutes)

### Option A: Use Existing Database
If you have a Supabase project with a `transactions` table:

1. Get your credentials from Supabase → Settings → API
2. Edit `.env.local`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### Option B: Create New Database
See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for detailed instructions.

## Step 3: Start Development Server (1 minute)

```bash
npm run dev
```

Open browser to: **http://localhost:5173**

## Step 4: Test It! (1 minute)

1. **Add a transaction**:
   - Name: "Monthly Salary"
   - Amount: 3000
   - Start: Today
   - End: End of month
   - Frequency: 1, Unit: Month
   - Click "Add Transaction"

2. **Watch the chart update** automatically

3. **Adjust starting balance** and **forecast months** to see real-time updates

Done! 🎉

## Common Issues

### "Missing Supabase environment variables"
- Create `.env.local` file with your credentials
- See Step 2 above

### "Cannot find module '@supabase/supabase-js'"
- Run `npm install` again
- Delete `node_modules` and reinstall if needed

### Development server won't start
- Check Node.js version: `node --version`
- Need Node 18+
- Kill any other processes on port 5173

## Next: Deploy to Vercel

Once working locally:

1. Push to GitHub
2. Go to vercel.com
3. Import your repository
4. Add environment variables
5. Deploy

See [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) for details.

## Learn More

- [README.md](README.md) - Full project overview
- [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) - Technical details
- [SUPABASE_SETUP.md](SUPABASE_SETUP.md) - Database setup
- [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) - Deployment guide
- [COMPLETE_CHECKLIST.md](COMPLETE_CHECKLIST.md) - Verification checklist

## Quick Commands

```bash
# Start development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Check for errors
npm run lint
```

## Project Structure

```
src/
├── components/     # React components
├── hooks/         # Custom hooks
├── lib/          # Business logic
├── types/        # TypeScript types
├── App.tsx       # Main app
└── App.css       # Styles
```

## Environment Variables

```
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
```

Get from: Supabase → Project Settings → API

## Support

Stuck? Check:
1. Browser console for errors (F12)
2. Supabase dashboard for data
3. [COMPLETE_CHECKLIST.md](COMPLETE_CHECKLIST.md) for troubleshooting
4. Documentation files above

Good luck! 🚀
