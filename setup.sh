#!/bin/bash

echo "🚀 Guess Game Cron Service Setup"
echo "================================"

# Check if .env exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists. Skipping setup."
    echo "   Edit .env manually if needed."
    exit 0
fi

# Create .env file
cat > .env << EOL
# Main INNO API Configuration
INNO_API_URL=http://localhost:3000
CRON_SECRET=your-secure-cron-secret-here

# Service Configuration
PORT=3002
NODE_ENV=development
EOL

echo "✅ .env file created successfully!"
echo ""
echo "📝 Please edit the .env file with your actual values:"
echo "   - INNO_API_URL: URL of your main INNO application"
echo "   - CRON_SECRET: Same secret used in your main app"
echo ""
echo "🔧 Then run:"
echo "   pnpm install"
echo "   pnpm run dev"
