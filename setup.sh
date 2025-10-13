#!/bin/bash

echo "========================================="
echo "School Result Management System - Setup"
echo "========================================="
echo ""

# Backend Setup
echo "📦 Setting up Backend..."
cd backend

echo "Running migrations..."
python manage.py migrate

echo ""
echo "✅ Backend setup complete!"
echo ""
echo "Next steps:"
echo "1. Create a superuser:"
echo "   python manage.py createsuperuser"
echo ""
echo "2. Update the superuser role to 'admin' in Django shell:"
echo "   python manage.py shell"
echo "   >>> from accounts.models import CustomUser"
echo "   >>> user = CustomUser.objects.get(username='your_username')"
echo "   >>> user.role = 'admin'"
echo "   >>> user.full_name = 'Batombari Bakpo'"
echo "   >>> user.save()"
echo "   >>> exit()"
echo ""
echo "3. Create media directories:"
echo "   mkdir -p media/profiles media/carousel media/logo"
echo ""
echo "4. Run the development server:"
echo "   python manage.py runserver"
echo ""

cd ..

# Frontend Setup
echo "📦 Setting up Frontend..."
cd frontend

echo "Installing dependencies..."
npm install

echo ""
echo "✅ Frontend setup complete!"
echo ""
echo "Run the frontend:"
echo "   npm run dev"
echo ""
echo "========================================="
echo "Setup complete! Check README.md for more details."
echo "========================================="
