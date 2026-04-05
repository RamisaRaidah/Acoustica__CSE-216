# Acoustica

This web application was developed as a term project for **CSE 216: DBMS Sessional** (Level 2, Term 1).

## Infrastructure
- **Backend:** Flask
- **Frontend:** React and Typescript
- **Database:** PostgreSQL
- **Cloud Services:** 
                        - [Supabase](https://supabase.com) (database hosting)
                        - [Backblaze B2](https://www.backblaze.com/cloud-storage) (Media Storage)

## Getting Started

**Prerequisites:** [Docker](https://www.docker.com/get-started) must be installed on your machine.

**1. Unzip the project folder**

**2. Start the application**

Navigate to the `Acoustica` folder in your terminal and run:
```bash
docker-compose up --build -d
```

**3. Start the Stripe webhook listener**
```bash
stripe listen --forward-to localhost:8000/api/transactions/checkout/webhook
```

**4. Open the app**

Open Docker Desktop, go to **Containers**, and click on the `acoustica` container. You will find links to both the frontend and backend there.

## Stopping & Cleanup

Stop the running container:
```bash
docker-compose down
```
View backend logs:
```bash
docker-compose logs -f backend
```

Clear Docker system cache:
```bash
docker system prune -f
```


