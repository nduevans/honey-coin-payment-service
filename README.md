# Steps to run the project

### Step 1: Install dependencies for the Providers (as shared by you but placed on own folder for cleaner code structure)

```bash
cd honeycoin-providers
cd stubs && npm install
```

Copy the provided honeycoin-providers/stubs/.env.example to .env to set the right webhook URL

### Step 2: Run the two providers (in different terminals)

```bash
node provider-alpha.js
node provider-beta.js
```

### Step 3: Install Dependencies for our service (on a new terminal on project root)

```bash
npm install
```

### Step 4: Start our service (feel free to start with a watch flag if you wish to re-run on file changes)

Copy the provided .env.example to .env to get the environment variables used

```bash
npm start
```

## Testing

#AlphaProvider

```bash
curl -X POST http://localhost:3000/charge -H "Content-Type: application/json" -H "Idempotency-Key: charge-123" -d '{"amount":100,"phoneNumber":"+254700000000","currency":"KES","provider":"PROVIDER_ALPHA"}'
curl -X POST http://localhost:3000/charge -H "Content-Type: application/json" -H "Idempotency-Key: charge-123" -d '{"amount":100,"phoneNumber":"+254700000000","currency":"KES","provider":"PROVIDER_ALPHA"}' # Same Indempotency KE (returns original request)
curl -X POST http://localhost:3000/charge -H "Content-Type: application/json" -H "Idempotency-Key: charge-1234" -d '{"amount":100,"phoneNumber":"+254700000000","currency":"KE","provider":"PROVIDER_ALPHA"}' # Wrong Currency -  fails
curl -X POST http://localhost:3000/charge -H "Content-Type: application/json" -H "Idempotency-Key: charge-1235" -d '{"amount":100,"phoneNumber":"+254700000000","currency":"KES","provider":"PROVIDER_ALPHA_WRONG"}' # Invalid Provider
curl -X POST http://localhost:3000/charge -H "Content-Type: application/json" -H "Idempotency-Key: charge-123667" -d '{"amount":100,"phoneNumber":"+00000000000","currency":"KES","provider":"PROVIDER_ALPHA"}' # Invalid Phone Number - failed test

```

# Key Decisions:

-H "Idempotency-Key: charge-123667" - in reuest header to confirm request if this has been done before

- providers foder with an index would help add another provider without rework -

initial POST CALLto provider alpha is synchronous since the results are expected right away to update the charge with providerRef - the call back wil be async

- Why Sqlite: ?
- Why better-sqlite3 : Faster compare to other Sqlite packages

How to run locally
Your key design decisions and why (async mechanism, persistence choice, idempotency approach)

# What you would change with more time

- Charges POST request inputs validation - types and format validation could be enhanced here given more time
