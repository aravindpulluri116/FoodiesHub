#!/bin/bash

# Google OAuth Deployment Script for Pickles Hub
# This script helps deploy the monorepo to Vercel with proper configuration

echo "🚀 Starting Google OAuth Deployment for Pickles Hub..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if we're in the right directory
if [ ! -f "vercel.json" ]; then
    echo "❌ vercel.json not found. Please run this script from the project root."
    exit 1
fi

echo "✅ Found vercel.json"

# Check for environment variables
echo "🔍 Checking environment variables..."

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
    echo "⚠️  backend/.env not found. Creating from .env.example..."
    if [ -f "backend/.env.example" ]; then
        cp backend/.env.example backend/.env
        echo "📝 Please update backend/.env with your actual values:"
        echo "   - GOOGLE_CLIENT_ID"
        echo "   - GOOGLE_CLIENT_SECRET"
        echo "   - MONGODB_URI"
        echo "   - FRONTEND_URL"
        echo "   - BACKEND_URL"
    else
        echo "❌ backend/.env.example not found"
        exit 1
    fi
fi

if [ ! -f "frontend/.env" ]; then
    echo "⚠️  frontend/.env not found. Creating from .env.example..."
    if [ -f "frontend/.env.example" ]; then
        cp frontend/.env.example frontend/.env
        echo "📝 Please update frontend/.env with your actual values:"
        echo "   - VITE_API_URL"
        echo "   - VITE_FRONTEND_URL"
    else
        echo "❌ frontend/.env.example not found"
        exit 1
    fi
fi

# Check if Google OAuth files exist
echo "🔍 Checking Google OAuth files..."

required_files=(
    "backend/api/auth/google.js"
    "backend/api/auth/google/callback.js"
    "backend/api/auth/me.js"
    "backend/api/auth/logout.js"
    "backend/api/auth/test.js"
)

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Missing required file: $file"
        exit 1
    fi
done

echo "✅ All required files found"

# Check User model
if [ ! -f "backend/models/User.js" ]; then
    echo "❌ User model not found"
    exit 1
fi

echo "✅ User model found"

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."

# Check if already linked to Vercel
if [ ! -f ".vercel/project.json" ]; then
    echo "🔗 Linking to Vercel project..."
    vercel --yes
else
    echo "✅ Already linked to Vercel project"
fi

# Deploy
echo "📦 Deploying..."
vercel --prod

echo "✅ Deployment complete!"

# Post-deployment instructions
echo ""
echo "🎉 Deployment successful! Next steps:"
echo ""
echo "1. Set environment variables in Vercel dashboard:"
echo "   - GOOGLE_CLIENT_ID"
echo "   - GOOGLE_CLIENT_SECRET"
echo "   - MONGODB_URI"
echo "   - FRONTEND_URL"
echo "   - BACKEND_URL"
echo ""
echo "2. Update Google OAuth redirect URIs:"
echo "   - Add: https://your-vercel-domain.vercel.app/api/auth/google/callback"
echo ""
echo "3. Test the OAuth flow:"
echo "   - Visit: https://your-vercel-domain.vercel.app/api/auth/test"
echo "   - Try logging in with Google"
echo ""
echo "4. Check the documentation:"
echo "   - README: GOOGLE_OAUTH_SETUP.md"
echo "   - Migration: MIGRATION_GUIDE.md"
echo ""

echo "🔗 Useful URLs:"
echo "   - Test endpoint: /api/auth/test"
echo "   - Google OAuth: /api/auth/google"
echo "   - Session check: /api/auth/me"
echo "   - Logout: /api/auth/logout"
echo ""

echo "📞 Need help? Check the documentation or Vercel function logs." 