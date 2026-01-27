#!/bin/bash
# Quick Deploy Script for Sparken Branding
# This script handles the complete deployment process

set -e  # Exit on error

echo "🚀 Sparken Branding - Deployment Script"
echo "========================================"
echo ""

# Check if in correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this script from the project root"
    exit 1
fi

# Step 1: Verify build works
echo "📦 Step 1: Verifying build..."
npm run build
if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed. Fix errors before deploying."
    exit 1
fi

# Step 2: Check git status
echo ""
echo "📝 Step 2: Checking git status..."
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  You have uncommitted changes:"
    git status --short
    echo ""
    read -p "Commit these changes? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add -A
        echo "Enter commit message:"
        read commit_msg
        git commit -m "$commit_msg"
        echo "✅ Changes committed"
    else
        echo "⚠️  Continuing with uncommitted changes..."
    fi
else
    echo "✅ No uncommitted changes"
fi

# Step 3: Push to GitHub
echo ""
echo "📤 Step 3: Pushing to GitHub..."
git push origin master
if [ $? -eq 0 ]; then
    echo "✅ Pushed to GitHub"
else
    echo "❌ Failed to push. Check your git credentials."
    exit 1
fi

# Step 4: Deploy to Vercel
echo ""
echo "🚀 Step 4: Deploying to Vercel..."
if command -v vercel &> /dev/null; then
    vercel --prod
    echo "✅ Deployed to Vercel!"
else
    echo "⚠️  Vercel CLI not installed"
    echo ""
    echo "To deploy:"
    echo "1. Install Vercel CLI: npm install -g vercel"
    echo "2. Run: vercel --prod"
    echo ""
    echo "Or deploy via Vercel Dashboard:"
    echo "1. Go to vercel.com"
    echo "2. Import your repository"
    echo "3. Click Deploy"
fi

echo ""
echo "======================================"
echo "✨ Deployment process complete!"
echo "======================================"
echo ""
echo "📋 What was deployed:"
echo "  • PDF artifact cleaning system"
echo "  • Enhanced table formatting"
echo "  • Reorganized documentation"
echo "  • All latest fixes"
echo ""
echo "🔍 Next steps:"
echo "  • Test your deployment"
echo "  • Upload a sample file"
echo "  • Verify tables render correctly"
echo ""
