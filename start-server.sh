#!/bin/bash

# Sparken PDF Branding - Simple Startup Script
# This script works around Next.js server issues on macOS

echo "🚀 Starting Sparken PDF Branding System"
echo "========================================="

# Kill any existing processes
echo "🧹 Cleaning up existing processes..."
pkill -9 node 2>/dev/null
sleep 2

# Clear Next.js cache
echo "🗑️  Clearing Next.js cache..."
rm -rf .next 2>/dev/null

# Build the application
echo "🔨 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

# Try different ports until one works
for port in 3000 3001 3002 3003; do
    echo "🔍 Trying port $port..."
    
    # Check if port is free
    if ! lsof -ti:$port > /dev/null 2>&1; then
        echo "✅ Port $port is available"
        
        # Start server
        PORT=$port npm start &
        SERVER_PID=$!
        
        # Wait for server
        sleep 5
        
        # Test if it's responding
        if curl -s http://localhost:$port | grep -q "Sparken"; then
            echo ""
            echo "========================================="
            echo "✅ SUCCESS! Server running on port $port"
            echo "========================================="
            echo ""
            echo "📱 Open in browser:"
            echo "   http://localhost:$port"
            echo ""
            echo "📝 To test Python PDF generator:"
            echo "   Upload test-python-pdf.md"
            echo ""
            echo "⏹️  To stop:"
            echo "   Press Ctrl+C or run: kill $SERVER_PID"
            echo ""
            
            # Keep script running
            wait $SERVER_PID
            exit 0
        else
            echo "❌ Server not responding on port $port"
            kill $SERVER_PID 2>/dev/null
        fi
    fi
done

echo "❌ Could not start server on any port"
echo ""
echo "💡 Try manually:"
echo "   npm run build && PORT=3000 npm start"
exit 1
