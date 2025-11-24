#!/bin/bash

# Configuration
HOST="72.61.192.168"
USER="root"
REMOTE_DIR="/var/www/extrachic/frontend/"
PASSWORD="Mo@1234567891234"

echo "🚀 Starting deployment..."

# Build the project
echo "📦 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed. Aborting deployment."
    exit 1
fi

# Deploy using scp
echo "📤 Deploying to $HOST..."

# Check if sshpass is installed for password automation
if command -v sshpass &> /dev/null; then
    sshpass -p "$PASSWORD" scp -r dist/* $USER@$HOST:$REMOTE_DIR
else
    echo "⚠️ sshpass not found. You will need to enter the password manually."
    echo "Password: $PASSWORD"
    scp -r dist/* $USER@$HOST:$REMOTE_DIR
fi

if [ $? -eq 0 ]; then
    echo "✨ Deployment completed successfully!"
else
    echo "❌ Deployment failed."
    exit 1
fi
