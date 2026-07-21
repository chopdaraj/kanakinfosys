# Kanak Infosys — Algo Trading Platform PRD

## Original problem statement (verbatim)
Build a website for Kanak Infosys — a client-managed algo trading business.
- Client side: Login/Register (name, email, referral code system). Profile (2-line address, bank details, referral code generator, deposit amount). Company policy (6-month lock-in, min 1 lakh deposit).
- Admin side: All client data, referral tree, Excel export, total revenue, daily revenue chart, daily payouts (3% monthly = ~0.1% daily on each client's principal, e.g. ₹1,00,000 → ₹3,000/mo, ₹2,00,000 → ₹6,000/mo).

## User choices
- Auth: JWT email/password
- Currency: INR with Indian numbering (lakh/crore)
- Admin: admin@kanakinfosys.com / raj12@
- Referral tree: unlimited depth
- Payout: 3% per month distributed daily

## Architecture
- Backend: FastAPI + Motor (MongoDB) + JWT + bcrypt + pandas/openpyxl for Excel export
- Frontend: React 19 + Tailwind + shadcn + Recharts + sonner toasts
- Auth: Bearer token in localStorage + httpOnly cookie fallback

## Personas
- Client (default role) — invests, tracks earnings & referrals
- Admin — sees all clients, revenue, tree, exports

## Core requirements (static)
1. Registration with optional referral code
2. Profile management: address, bank
3. Deposit with ₹1,00,000 minimum + 6-month lock
4. Daily earning at 3%/month rate visible on dashboard
5. Referral code generator per user
6. Admin dashboard with revenue, payout, daily chart
7. Admin client list + Excel export
8. Admin referral tree (unlimited depth)

## What's been implemented (2026-02)
- Landing, Login, Register, Client Dashboard, Profile, Policy pages
- Admin Dashboard, Clients list w/ Excel export, Referral tree
- Backend endpoints for auth, deposits, earnings, referrals, admin analytics
- Admin auto-seeded on startup

## Backlog / next
- P1: Withdrawal request flow post lock-in expiry
- P1: Auto-generate referral link with prefilled code (share button)
- P2: Email notifications on deposit/payout
- P2: KYC document upload
- P2: Multi-tier commission on referrals
