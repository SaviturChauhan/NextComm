#!/bin/bash

echo "🚀 Setting up Wireless Q&A Hub..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

echo "✅ Dependencies installed successfully!"

# Create .env file for backend if it doesn't exist
if [ ! -f "../backend/.env" ]; then
    echo "📝 Creating .env file for backend..."
    cp ../backend/env.example ../backend/.env
    echo "⚠️  Please update backend/.env with your MongoDB Atlas connection string and JWT secret"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update backend/.env with your MongoDB Atlas connection string"
echo "2. Start the backend: cd backend && npm run dev"
echo "3. Start the frontend: cd frontend && npm start"
echo ""
echo "Backend will run on http://localhost:5000"
echo "Frontend will run on http://localhost:3000"
