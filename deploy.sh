#!/bin/bash

# Mercury TWAP Socket - Quick Deploy Script
# This script helps you deploy to Railway

echo "🚀 Mercury TWAP Socket - Railway Deployment"
echo "=========================================="
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "❌ Git not initialized. Run 'git init' first."
    exit 1
fi

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "📦 Railway CLI not found. Installing..."
    npm install -g @railway/cli
else
    echo "✅ Railway CLI found"
fi

echo ""
echo "Choose deployment method:"
echo "1. Deploy via Railway CLI (Quick)"
echo "2. Deploy via GitHub (Recommended)"
echo "3. Install Railway CLI only"
echo ""
read -p "Enter choice [1-3]: " choice

case $choice in
    1)
        echo ""
        echo "🚂 Deploying via Railway CLI..."
        railway login
        railway init
        railway up
        echo ""
        echo "✅ Deployment complete!"
        echo "Run 'railway open' to view your app"
        ;;
    2)
        echo ""
        echo "📝 GitHub Deployment Steps:"
        echo ""
        echo "1. Create a new GitHub repository:"
        echo "   https://github.com/new"
        echo ""
        echo "2. Run these commands:"
        echo "   git remote add origin https://github.com/YOUR_USERNAME/mercury_twap_socket.git"
        echo "   git branch -M main"
        echo "   git push -u origin main"
        echo ""
        echo "3. Go to Railway:"
        echo "   https://railway.app/new"
        echo ""
        echo "4. Click 'Deploy from GitHub repo'"
        echo "5. Select your repository"
        echo "6. Railway will auto-deploy! 🎉"
        echo ""
        read -p "Press Enter to open GitHub..."
        open https://github.com/new
        ;;
    3)
        echo ""
        echo "📦 Installing Railway CLI..."
        npm install -g @railway/cli
        echo ""
        echo "✅ Installation complete!"
        echo "Run './deploy.sh' again to deploy"
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "📚 For detailed instructions, see DEPLOYMENT.md"
