# Mixed Content Incident - Amplify Frontend vs ALB Backend

## Problem summary

Frontend is served from Amplify over HTTPS:

- `https://main.d3d9qouplswbzo.amplifyapp.com`

But API calls are sent to backend over HTTP:

- `http://spendwise-dev-alb-....elb.amazonaws.com/auth/login`

Browser blocks this request with **Mixed Content**:

- HTTPS page cannot fetch insecure HTTP resources.

---

## Why this happened in this repo

In Terraform (`infrastructure/environments/dev/main.tf`), frontend API URL is set from ALB DNS using HTTP:

- `frontend_api_url = "http://${module.alb.alb_dns_name}"`
- exported to Amplify env as `NEXT_PUBLIC_API_URL`

Then frontend (`frontend/lib/api.ts`) uses `NEXT_PUBLIC_API_URL` as API base URL.  
Result: browser on HTTPS page tries to call HTTP backend and gets blocked.

---

## Selected approach (A): Move backend API to HTTPS

This is the recommended production-grade fix.

### Goal

Expose backend via TLS endpoint, then set:

- `NEXT_PUBLIC_API_URL=https://api.<your-domain>`

### Required infra changes

1. Add ACM certificate (same region as ALB).
2. Add ALB HTTPS listener on port 443.
3. Attach certificate to listener.
4. Forward HTTPS listener to existing target group (ECS service).
5. Add a DNS record at your provider:
   - `api.<your-domain>` -> ALB (CNAME or alias as your DNS supports)
6. Keep security group allowing inbound 443 on ALB.
7. (Optional) redirect 80 -> 443.

### App config changes

1. Update Terraform local/env variable used by Amplify:
   - from `http://...` to `https://api.<your-domain>`
2. `terraform apply`
3. Trigger Amplify rebuild/redeploy so new `NEXT_PUBLIC_API_URL` is applied.

### Verification checklist

1. Open browser devtools -> Network:
   - API requests must go to `https://api.<your-domain>/...`
2. No more Mixed Content warning in console.
3. Login/signup API calls return backend responses (no browser block).

---

## Alternative approach (B): Same-origin `/api` proxy via Amplify rewrites

Use this when backend TLS setup is not ready yet.

### Goal

Frontend calls same-origin path:

- `/api/auth/login`

Amplify rewrite/proxy forwards `/api/*` to backend origin.

### How it works

1. In frontend, API base URL is `/api` (or fallback to `/api` on cloud).
2. Amplify rewrite rule maps:
   - source: `/api/<*>`
   - target: `http://<alb-dns>/api/<*>` (or backend path equivalent)
3. Browser sees HTTPS same-origin request, so no Mixed Content.

### Notes

- This is useful for fast rollout.
- Long-term, backend HTTPS is still preferred for security/compliance.

---

## Decision

Current decision is **Approach A (HTTPS backend)**.

Reason:

- Clean architecture.
- End-to-end TLS.
- Fewer edge cases than rewrite/proxy workaround.
- Better fit for production and future custom domain setup.

