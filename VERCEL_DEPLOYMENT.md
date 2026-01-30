# Vercel Deployment Guide

This guide walks through deploying the Balance Forecast app to Vercel.

## Prerequisites

- GitHub account
- Vercel account (free tier available)
- Repository pushed to GitHub

## Step 1: Prepare Your Code

1. **Commit your work**:
```bash
git add .
git commit -m "Complete React implementation of Balance Forecast"
git push origin main
```

2. **Verify .env.local is in .gitignore**:
```bash
cat .gitignore | grep ".env"
```

## Step 2: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up"
3. Choose "Sign up with GitHub"
4. Authorize Vercel to access your GitHub repos

## Step 3: Import Project to Vercel

1. Go to Vercel dashboard
2. Click "New Project"
3. Select your GitHub repository
4. Vercel auto-detects:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

## Step 4: Configure Environment Variables

1. In project settings, go to "Environment Variables"
2. Add two variables:
   - **Name**: `VITE_SUPABASE_URL`
   - **Value**: `https://eqcibyuosrahtlehhtdx.supabase.co`
   - **Environments**: Production, Preview, Development

3. Click "Add Another"
   - **Name**: `VITE_SUPABASE_ANON_KEY`
   - **Value**: Get from Supabase dashboard
   - **Environments**: Production, Preview, Development

## Step 5: Get Supabase Anon Key

1. Go to [supabase.com](https://supabase.com)
2. Select your project
3. Go to Settings → API
4. Copy the "Anon" key value
5. Paste in Vercel environment variable

## Step 6: Deploy

1. Click "Deploy" in Vercel
2. Wait for build to complete (~2-3 minutes)
3. See deployment status
4. Get your live URL: `https://your-project.vercel.app`

## Step 7: Test Live App

1. Open your Vercel URL
2. Test adding a transaction
3. Verify data persists in Supabase
4. Check forecast calculations
5. Test responsive design on mobile

## Continuous Deployment

Once configured, every push to main branch automatically deploys:

```bash
git push origin main → GitHub → Vercel → Live
```

To test changes before pushing:

```bash
npm run dev  # Local testing
npm run build # Verify build succeeds
git push    # Deploy to Vercel
```

## Rollback

If deployment has issues:

1. Go to Vercel dashboard
2. Click "Deployments"
3. Find previous successful deployment
4. Click "..." menu
5. Select "Promote to Production"

## Custom Domain

1. In Vercel project settings
2. Go to "Domains"
3. Add your custom domain
4. Update DNS records (instructions provided)
5. Wait for DNS propagation (5-48 hours)

## Monitor Performance

### Vercel Analytics
- Go to "Analytics" in Vercel
- Track page performance
- Monitor Core Web Vitals
- View deployment history

### Error Tracking
- Go to "Logs" in Vercel
- View build logs
- Check for deployment errors
- Monitor runtime errors

## Supabase Configuration

### Row Level Security (RLS)

For public access (development):
```sql
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read/write" ON transactions
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

For user-specific access (production):
```sql
CREATE POLICY "Users can only access their own transactions"
  ON transactions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### Database Backups

In Supabase:
1. Go to Settings → Backups
2. Enable automatic backups
3. Choose backup frequency
4. Store backups safely

## Troubleshooting Deployment

### Build Fails
```bash
# Check locally
npm run build

# Clear Vercel cache
vercel env pull  # Get production env vars
npm install      # Reinstall dependencies
npm run build    # Test build
```

### Missing Environment Variables
```bash
# Verify variables set in Vercel
vercel env list

# Should show:
# VITE_SUPABASE_URL
# VITE_SUPABASE_ANON_KEY
```

### Supabase Connection Fails
1. Check URL in Vercel env vars
2. Check anon key is valid
3. Verify table name (transactions)
4. Check RLS policies allow access

## Performance Tips

1. **Enable Caching**:
   - Static files cached at CDN edge
   - Cache busting via file hashing

2. **Optimize Images**:
   - Use Vercel Image Optimization
   - Lazy load images

3. **Monitor Bundle Size**:
   - Chart shows JS/CSS size
   - Keep below 500KB (warning threshold)

4. **Database Queries**:
   - Use indexes on frequently queried columns
   - Limit result sets

## Security Best Practices

1. **Never commit .env files**
   - Keep secrets out of version control
   - Use Vercel secrets instead

2. **Keep dependencies updated**
   - Run `npm audit fix` regularly
   - Check for security vulnerabilities

3. **Use HTTPS**
   - Vercel provides automatic SSL
   - Redirect HTTP to HTTPS

4. **Monitor access logs**
   - Check Supabase audit logs
   - Review unusual activity

## Cost Considerations

### Vercel (Free Tier)
- Unlimited deployments
- 100GB bandwidth/month
- Serverless functions: 100 invocations/day
- **Cost**: $0/month

### Supabase (Free Tier)
- 500MB database storage
- 5GB bandwidth/month
- Unlimited rows
- **Cost**: $0/month

### Total Cost
**$0/month** for small-to-medium usage!

Upgrade when needed:
- Vercel: $20/month (Pro)
- Supabase: $10+/month (Pro)

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Set up custom domain
3. ✅ Configure monitoring
4. ✅ Set up backups
5. ✅ Create incident response plan

## Support

- Vercel Issues: [vercel.com/docs](https://vercel.com/docs)
- Supabase Issues: [supabase.com/docs](https://supabase.com/docs)
- React Issues: [react.dev](https://react.dev)

## Quick Reference

```bash
# Local development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Deploy to Vercel
git push origin main

# Check Vercel CLI
npm install -g vercel
vercel --version
vercel login
vercel deploy
```

## Checklist

- [ ] Repository on GitHub
- [ ] .env.local in .gitignore
- [ ] Vercel account created
- [ ] Project imported to Vercel
- [ ] Environment variables configured
- [ ] Build successful on Vercel
- [ ] Live site accessible
- [ ] Transactions load in live app
- [ ] Can add/edit/delete transactions
- [ ] Forecast calculations work
- [ ] Responsive on mobile
- [ ] No console errors in browser
