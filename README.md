# Steps to run the project

### Step 1: Install dependencies for the Providers (as shared by you but placed on own folder for cleaner code structure)

```bash
cd honeycoin-providers
cd stubs && npm install
```

### Step 2: Run the two providers (in different terminals)

```bash
node provider-alpha.js
node provider-beta.js
```

### Step 3: Install Dependencies for our service (on a new terminal on project root)

```bash
npm install
```

### Step 4: Start our service

Copy the provided .env.example to .env to get the environment variables used

```bash
npm start
```

## Testing

For both, watch logs on terminal for the change of state especially for polling charges

### AlphaProvider

```bash
curl -X POST http://localhost:3000/charge -H "Content-Type: application/json" -H "Idempotency-Key: charge-123" -d '{"amount":100,"phoneNumber":"+254700000000","currency":"KES","provider":"PROVIDER_ALPHA"}'
curl -X POST http://localhost:3000/charge -H "Content-Type: application/json" -H "Idempotency-Key: charge-123" -d '{"amount":100,"phoneNumber":"+254700000000","currency":"KES","provider":"PROVIDER_ALPHA"}' # Same Indempotency KE (returns original request)
curl -X POST http://localhost:3000/charge -H "Content-Type: application/json" -H "Idempotency-Key: charge-1234" -d '{"amount":100,"phoneNumber":"+254700000000","currency":"KE","provider":"PROVIDER_ALPHA"}' # Wrong Currency -  fails
curl -X POST http://localhost:3000/charge -H "Content-Type: application/json" -H "Idempotency-Key: charge-1235" -d '{"amount":100,"phoneNumber":"+254700000000","currency":"KES","provider":"PROVIDER_ALPHA_WRONG"}' # Invalid Provider
curl -X POST http://localhost:3000/charge -H "Content-Type: application/json" -H "Idempotency-Key: charge-1236" -d '{"amount":100,"phoneNumber":"+00000000000","currency":"KES","provider":"PROVIDER_ALPHA"}' # Invalid Phone Number - failed test
```

### BetaProvider

```bash
curl -X POST http://localhost:3000/charge -H "Content-Type: application/json" -H "Idempotency-Key: charge-456" -d '{"amount":100,"phoneNumber":"+254700000000","currency":"KES","provider":"PROVIDER_BETA"}'
curl -X POST http://localhost:3000/charge -H "Content-Type: application/json" -H "Idempotency-Key: charge-456" -d '{"amount":100,"phoneNumber":"+254700000000","currency":"KES","provider":"PROVIDER_BETA"}' # Same Indempotency KE (returns original request)
curl -X POST http://localhost:3000/charge -H "Content-Type: application/json" -H "Idempotency-Key: charge-457" -d '{"amount":100,"phoneNumber":"+254700000000","currency":"KE","provider":"PROVIDER_BETA"}' # Wrong Currency -  fails
curl -X POST http://localhost:3000/charge -H "Content-Type: application/json" -H "Idempotency-Key: charge-458" -d '{"amount":100,"phoneNumber":"+254700000000","currency":"KES","provider":"PROVIDER_BETA_WRONG"}' # Invalid Provider
curl -X POST http://localhost:3000/charge -H "Content-Type: application/json" -H "Idempotency-Key: charge-459" -d '{"amount":100,"phoneNumber":"+00000000000","currency":"KES","provider":"PROVIDER_BETA"}' # Invalid Phone Number - failed test
```

### Indompotency Test script:

```bash
 node --test tests/**/*.test.js
```

### View Charges - Extra for visibility: This helps confirm for both Beta and Alpha

```bash
# All charges
curl http://localhost:3000/charges

# Single charge
curl http://localhost:3000/charges/your-idempotency-key
```

# Key Decisions:

## Idempotency:

- Using Idempotency-Key in request header to confirm request if this has been done before

## Response times:

- Provider Alpha's actual call happens synchronously (fast HTTP round-trip to provider) - so sync
- Alpha's 2–3 second delay before the webhook fires is on the provider side — our application does no block it and in async

## Durability:

- Why Sqlite: ? This persistence method survives restarts. It uses a file-backed DB and is not in-memory.This is also a simple durable local storage method.
- Why better-sqlite3 : Faster compare to other Sqlite packages

## Extensibility:

- The providers folder comes with an index to the providers and that would help add another provider without rework

## What I would change with more time

- Charges POST request inputs validation - types and format validation could be enhanced here given more time
- If/When Alpha stub is down when we call it, we throw a 500 but the charge will be in the DB as pending 9(default) with no providerRef. We have no retry if there is a call failure. This can be improved
- It would have been great to be allowed to register a callback URL with either of the services via an API call instead of having to try edit the provider code/env to register the URLs
- Possibly consider Typescript migration to improve on types

# Conclusion

- Alpha working as expected with webhooks updating DB
- Beta polling is confirmed working and updating via GET /charges/:requestId getting polled until status changes from pending to successful
- There was some learing involved and so I enjoyed the test while at it
