# Deployment Guide - Sparken Branding Tool

## ✅ Pre-Deployment Checklist

All completed:
- [x] Build verified (passes successfully)
- [x] All changes committed to git
- [x] Documentation organized
- [x] PDF cleaning system working
- [x] Table formatting fixed
- [x] No linter errors

## 🚀 Quick Deploy (3 Steps)

### Step 1: Push to GitHub

```bash
cd /Users/andreagonzalezh/Documents/Sparken/sparken-branding
git push origin master
```

If you haven't set up authentication:
```bash
# Configure git credentials (if needed)
git config credential.helper store
git push origin master  # Will prompt for credentials once
```

### Step 2: Deploy to Vercel

**Option A: Using Vercel Dashboard (Recommended)**

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository: `sparken-branding`
4. Vercel will auto-detect Next.js settings
5. Click "Deploy"

**Option B: Using Vercel CLI**

```bash
# Install Vercel CLI (if not installed)
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
cd /Users/andreagonzalezh/Documents/Sparken/sparken-branding
vercel --prod
```

### Step 3: Verify Deployment

Once deployed, test:
1. Upload a markdown file with tables
2. Verify tables render correctly
3. Check that PDF artifacts are cleaned
4. Download and review branded PDF

## 📋 What's Been Deployed

### New Features
- ✅ Automatic PDF artifact cleaning
- ✅ Enhanced table detection (both formats)
- ✅ Reorganized documentation
- ✅ Comprehensive error handling

### Files Changed (50 files)
- **Modified**: `lib/python-bridge.ts`, `python/sparken_pdf_generator.py`
- **Added**: `python/clean_pdf_text.py` (cleaning utility)
- **Added**: 8 new documentation files in `docs/`
- **Reorganized**: All docs moved to `docs/` folder
- **Reorganized**: Assets moved to `public/logos/` and `public/icons/`

## ⚙️ Vercel Configuration

Your `vercel.json` is already configured:
```json
{
  "buildCommand": "npm run build",
  "framework": "nextjs",
  "regions": ["sfo1"],
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

**Important Note**: Python dependencies (`reportlab`) are NOT available on Vercel serverless. The system will automatically fall back to TypeScript PDF generation. For full Python support, you'll need to:
1. Use Vercel's Docker runtime, OR
2. Deploy to a different platform (Railway, Render, etc.), OR
3. Keep using TypeScript generation (works great for most use cases)

## 🔍 Post-Deployment Testing

Test these scenarios:
1. **Standard markdown table**:
   ```
   Column 1 | Column 2
   Data 1 | Data 2
   ```

2. **PDF with artifacts** (should auto-clean):
   ```
   **[TITLE](#link)**
   -- 1 of 5 --
   Content here
   ```

3. **Large file** (verify 30s timeout is enough)

4. **Multiple formats**: PDF, .md, .txt files

## 📊 Deployment Status

```
Commit: af229a2
Branch: master
Status: Ready to deploy
Build: ✅ Passing
Tests: ✅ All features verified
```

## 🐛 Troubleshooting

### If build fails on Vercel:
```bash
# Test build locally first
npm run build

# Check for any errors
npm run lint
```

### If Python features don't work on Vercel:
This is expected - Vercel serverless doesn't support Python packages. The system will automatically fall back to TypeScript PDF generation.

### If tables don't render:
Tables now support both formats. Verify your markdown has pipe characters (`|`).

### If artifacts still appear:
Check the cleaning script is executable:
```bash
chmod +x python/clean_pdf_text.py
```

## 🔐 Environment Variables

No environment variables required for basic deployment. All branding assets are included in the repository.

## 📈 Monitoring

After deployment, monitor:
- **Build logs** in Vercel dashboard
- **Function logs** for API errors
- **Analytics** for usage patterns
- **Error reporting** for issues

## 🔄 Future Deployments

For subsequent deployments:
```bash
# Make changes
git add .
git commit -m "Your changes"
git push origin master

# Vercel auto-deploys on push (if configured)
# Or manually: vercel --prod
```

## 📞 Support

If you encounter issues:
1. Check Vercel build logs
2. Review `docs/DEVELOPER_REFERENCE.md`
3. Test locally with `npm run dev`
4. Check `docs/PDF_FORMATTING_FIXES.md` for troubleshooting

## ✨ What's New in This Deployment

### PDF Artifact Cleaning
Automatically removes:
- Page markers (`-- X of Y --`)
- Footer text (`Page X of Y Brand`)
- Link wrappers (`**[TITLE](#link)**`)
- Random symbols (`##`, `###`)
- TOC artifacts

### Enhanced Table Support
Now handles both formats:
- Standard: `col1 | col2`
- GitHub: `| col1 | col2 |`

Tables render with full Sparken branding!

### Better Organization
- All docs in `docs/` folder
- Assets organized in `public/logos/` and `public/icons/`
- Test files in `tests/` folder

---

## 🎯 Next Steps

1. **Push to GitHub**: `git push origin master`
2. **Deploy to Vercel**: Use dashboard or CLI
3. **Test deployment**: Upload sample files
4. **Share**: Send deployment URL to team

Your application is ready to deploy! 🚀
