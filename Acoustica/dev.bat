start cmd /k "docker compose up --build"
start cmd /k "stripe listen --forward-to localhost:8000/api/transactions/checkout/webhook"