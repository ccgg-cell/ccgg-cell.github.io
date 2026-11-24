# Grand Cru Passport launch plan
The static preview is not a paid service. Do not accept subscriptions until the following gates pass.

## Backend
Use a separate HTTPS backend and managed authentication. Require verified email, enforce user ownership on every cellar, trip, journal and preference record, and test cross-account access denial. Provide export and deletion. Do not place service keys in this public repository.

## Stripe
Create recurring prices only after owner approval. Proposed prices: Explorer $49/month, Reserve $149/month, Private Cellar $399/month, Founder $1500/year (pricing is provisional and the annual tier needs reconciliation with monthly tiers). Server maps approved tier IDs to Stripe Price IDs, creates Checkout sessions for authenticated users, and uses signed webhooks to reconcile subscription state. Verify signatures against raw body, deduplicate event IDs, and fetch authoritative subscription status. Gate benefits on server-side entitlement checks. Add authenticated customer portal sessions for cancellation and billing. Test successful, failed, canceled and renewed subscriptions in test mode before enabling live mode.

## Operations
Verify region content and image rights; confirm winery and hotel partnerships before advertising access. Publish approved privacy, terms, refund and cancellation policies, contact details, and any required travel seller disclosures. Do not imply live booking or concierge availability until contracted. Test mobile navigation, accessibility, persistence, export, authentication, payment flows and deployment. Current preview stores records locally, not in a secure account. 
