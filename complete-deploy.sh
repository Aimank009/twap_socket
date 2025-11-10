#!/bin/bash

# 🚀 Mercury TWAP Socket - Complete Deployment Script
# This script will guide you through the entire deployment process

set -e  # Exit on error

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Mercury TWAP Socket - Complete Deployment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Navigate to project directory
cd /Users/aimankhan/Desktop/ansh/mercury_twap_socket

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in the right directory!"
    exit 1
fi

echo "📁 Current directory: $(pwd)"
echo ""

# Step 1: Ensure everything is committed
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 1: Checking Git Status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -n "$(git status --porcelain)" ]; then
    echo "📝 You have uncommitted changes:"
    git status --short
    echo ""
    read -p "Commit these changes? (y/n): " commit_choice
    if [ "$commit_choice" = "y" ]; then
        git add .
        read -p "Enter commit message: " commit_msg
        git commit -m "$commit_msg"
        echo "✅ Changes committed"
    else
        echo "⚠️  Continuing with uncommitted changes..."
    fi
else
    echo "✅ No uncommitted changes"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 2: GitHub Repository Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if remote already exists
if git remote | grep -q "origin"; then
    echo "ℹ️  Git remote 'origin' already exists:"
    git remote -v | grep origin
    echo ""
    read -p "Remove existing remote and set up new one? (y/n): " remove_remote
    if [ "$remove_remote" = "y" ]; then
        git remote remove origin
        echo "✅ Remote removed"
    else
        echo "⚠️  Keeping existing remote"
    fi
fi

# Ask for GitHub repo URL if no remote or removed
if ! git remote | grep -q "origin"; then
    echo ""
    echo "📝 GitHub Repository Options:"
    echo ""
    echo "1. I already created a GitHub repo"
    echo "2. I need to create a GitHub repo now"
    echo ""
    read -p "Choose option [1-2]: " github_option
    
    if [ "$github_option" = "2" ]; then
        echo ""
        echo "🌐 Opening GitHub to create a new repository..."
        echo ""
        echo "Please create a repository named: mercury_twap_socket"
        echo "Description: Real-time TWAP WebSocket server for Mercury"
        echo ""
        open "https://github.com/new" 2>/dev/null || echo "Please visit: https://github.com/new"
        echo ""
        read -p "Press Enter after you've created the repository..."
    fi
    
    echo ""
    echo "📝 Suggested repository URL (for kunal-png account):"
    echo "   https://github.com/kunal-png/mercury_twap_socket.git"
    echo ""
    read -p "Enter your GitHub repository URL: " repo_url
    
    # Add remote
    git remote add origin "$repo_url"
    echo "✅ Remote added: $repo_url"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 3: Push to GitHub"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Rename branch to main if needed
current_branch=$(git branch --show-current)
if [ "$current_branch" != "main" ]; then
    echo "🔄 Renaming branch '$current_branch' to 'main'..."
    git branch -M main
    echo "✅ Branch renamed to 'main'"
fi

# Push to GitHub
echo "📤 Pushing to GitHub..."
if git push -u origin main 2>&1; then
    echo "✅ Successfully pushed to GitHub!"
else
    echo "⚠️  Push may have failed or repo already has content"
    echo ""
    read -p "Force push? (y/n): " force_push
    if [ "$force_push" = "y" ]; then
        git push -u origin main --force
        echo "✅ Force pushed to GitHub"
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 4: Railway Deployment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Choose deployment method:"
echo ""
echo "1. Deploy via Railway Dashboard (Recommended - Easier)"
echo "2. Deploy via Railway CLI (Requires Railway CLI)"
echo "3. Skip Railway deployment (do it later)"
echo ""
read -p "Choose option [1-3]: " deploy_option

case $deploy_option in
    1)
        echo ""
        echo "🚂 Opening Railway Dashboard..."
        echo ""
        echo "Follow these steps:"
        echo "1. Sign in with GitHub"
        echo "2. Click 'New Project'"
        echo "3. Select 'Deploy from GitHub repo'"
        echo "4. Choose 'mercury_twap_socket' repository"
        echo "5. Railway will auto-deploy!"
        echo ""
        open "https://railway.app/new" 2>/dev/null || echo "Please visit: https://railway.app/new"
        echo ""
        read -p "Press Enter after deployment is complete..."
        
        echo ""
        read -p "Enter your Railway app URL (e.g., mercury-twap-socket-production.up.railway.app): " railway_url
        
        if [ -n "$railway_url" ]; then
            # Test the deployment
            echo ""
            echo "🧪 Testing deployment..."
            if curl -s "https://$railway_url/" | grep -q "ok"; then
                echo "✅ Deployment is working!"
                echo ""
                echo "🎉 Your TWAP Socket is live at:"
                echo "   Health: https://$railway_url/"
                echo "   Price WS: wss://$railway_url/ws/prices"
                echo "   Settlement WS: wss://$railway_url/ws/settlements"
            else
                echo "⚠️  Could not verify deployment. Check Railway logs."
            fi
        fi
        ;;
    2)
        echo ""
        echo "🔧 Checking for Railway CLI..."
        if ! command -v railway &> /dev/null; then
            echo "📦 Railway CLI not found. Installing..."
            npm install -g @railway/cli
        else
            echo "✅ Railway CLI found"
        fi
        
        echo ""
        echo "🚂 Deploying via Railway CLI..."
        railway login
        railway init
        railway up
        
        echo ""
        echo "✅ Deployment complete!"
        echo ""
        echo "📊 View logs with: railway logs"
        echo "🌐 Open in browser: railway open"
        ;;
    3)
        echo ""
        echo "⏭️  Skipping Railway deployment"
        echo ""
        echo "📝 To deploy later:"
        echo "   1. Visit: https://railway.app/new"
        echo "   2. Deploy from GitHub repo"
        echo "   3. Select: mercury_twap_socket"
        ;;
    *)
        echo "❌ Invalid option"
        ;;
esac

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Deployment Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📚 Next Steps:"
echo ""
echo "1. Test your deployment:"
echo "   curl https://your-app.railway.app/"
echo ""
echo "2. Update Mercury frontend with your Railway URL:"
echo "   - Edit frontend config"
echo "   - Set TWAP_SOCKET_URL to your Railway URL"
echo ""
echo "3. Connect WebSockets in frontend:"
echo "   - Price feed: wss://your-app.railway.app/ws/prices"
echo "   - Settlements: wss://your-app.railway.app/ws/settlements"
echo ""
echo "4. Monitor your deployment:"
echo "   - Railway Dashboard: https://railway.app/dashboard"
echo "   - View logs, metrics, and settings"
echo ""
echo "📖 Full documentation:"
echo "   - See COMPLETE_DEPLOYMENT_GUIDE.md"
echo "   - See README.md"
echo ""
echo "✅ All done! Your TWAP Socket is ready to use! 🚀"
echo ""
