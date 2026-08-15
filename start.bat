@echo off
echo Backend baslatiliyor...
start cmd /k "cd backend && py -m venv venv && venv\Scripts\activate && pip install -r requirements.txt && py -m uvicorn app.main:app --reload"

echo Frontend baslatiliyor...
start cmd /k "cd frontend && npm install && npm run dev"

echo Hazir! Frontend: http://localhost:5173
echo Demo: sonay@sonay.com / demo123
