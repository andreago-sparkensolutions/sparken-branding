# 🚀 Vercel Deployment Guide

## Your GitHub Repo
**Repository:** https://github.com/andreago-sparkensolutions/sparken-branding

---

## Quick Deploy to Vercel (Recommended - 2 minutes)

### Step 1: Go to Vercel
1. Visit: https://vercel.com/new
2. Sign in with your GitHub account (if not already signed in)

### Step 2: Import Your Repository
1. Click **"Import Git Repository"**
2. Find `andreago-sparkensolutions/sparken-branding` in the list
   - If you don't see it, click "Adjust GitHub App Permissions" to grant access
3. Click **"Import"**

### Step 3: Configure Project
Vercel will auto-detect Next.js. You just need to:

1. **Framework Preset:** Next.js (should be auto-detected)
2. **Build Command:** Leave as default (`npm run build`)
3. **Install Command:** Add this to ensure Python deps are installed:
   ```
   npm install && pip3 install -r python/requirements.txt
   ```
4. **Root Directory:** `.` (leave as default)

### Step 4: Deploy
1. Click **"Deploy"**
2. Wait 2-3 minutes for the build
3. You'll get a live URL like: `https://sparken-branding.vercel.app`

---

## Alternative: Deploy via CLI

If you prefer the command line:

```bash
# Install Vercel CLI (one-time)
npx vercel --version

# Login to Vercel
npx vercel login

# Deploy (follow the prompts)
npx vercel

# Or deploy to production directly
npx vercel --prod
```

---

## After Deployment

### Test Your Deployed App
1. Visit your Vercel URL
2. Upload `test-python-pdf.md` to test the Python generator
3. Upload any PDF to test the overlay branding

### Environment Variables (if needed later)
If you need to add any secrets or API keys:
1. Go to your project on Vercel
2. Settings → Environment Variables
3. Add your variables
4. Redeploy

---

## Important Notes for Vercel

✅ **What Works:**
- TypeScript PDF overlay branding (pdf-lib)
- Next.js frontend and API routes
- Static file serving (logos, etc.)

⚠️ **Python Generator on Vercel:**
Vercel's serverless functions have Python 3.9 available, but with limitations:
- Functions timeout after 10 seconds (Hobby plan) or 60 seconds (Pro plan)
- Python packages must be compatible with the serverless environment
- ReportLab should work, but complex PDFs might hit the timeout

**If Python doesn't work on Vercel**, you have options:
1. Use Railway, Render, or Fly.io (better Python support)
2. Keep Python for local use only
3. Use Vercel just for the TypeScript overlay functionality

---

## 🎉 Your Project is Now Live!

GitHub: https://github.com/andreago-sparkensolutions/sparken-branding
Vercel: Deploy now at https://vercel.com/new

---

## Troubleshooting

**Build fails?**
- Check the build logs in Vercel dashboard
- Most common issue: Python dependencies
- Solution: May need to simplify or skip Python on Vercel

**Functions timeout?**
- Upgrade to Vercel Pro for 60s timeout
- Or use a different platform for Python

**Need help?**
- Check Vercel docs: https://vercel.com/docs
- View build logs in the Vercel dashboard
