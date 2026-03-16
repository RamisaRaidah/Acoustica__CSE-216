start cmd /k "docker-compose up"
start cmd /k "stripe listen --forward-to localhost:8000/api/transactions/checkout/webhook"