# Godavari Wave Admin Dashboard

The admin app is a dependency-free static frontend. It talks only to the FastAPI
backend; credentials and authorization stay on the backend.

## Local development

1. Configure `backend/.env` from `backend/.env.example`. Set the administrator
   username and password there, and use a unique random `JWT_SECRET` of at
   least 32 characters. Keep `.env` out of source control.
2. Start the backend from the repository root:

   ```powershell
   Set-Location backend
   python -m uvicorn server:app --host 127.0.0.1 --port 8000
   ```

3. Start the public website in another terminal:

   ```powershell
   Set-Location frontend
   $env:REACT_APP_BACKEND_URL = "http://localhost:8000"
   npm start
   ```

4. Start this dashboard in a third terminal from the repository root:

   ```powershell
   python -m http.server 3001 --bind 127.0.0.1 --directory admin-dashboard
   ```

Open the public website at `http://localhost:3000`, the admin dashboard at
`http://localhost:3001`, and the backend API at `http://localhost:8000/api`.
The backend requires a reachable MongoDB instance configured by `MONGO_URL`
and `DB_NAME`.

The existing public contact endpoint stores messages in MongoDB; the current
repository has no SMTP or email-sending configuration. This dashboard keeps
that existing submission behavior and adds query management without changing
or inventing an email sender.
