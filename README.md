# TMJ Foods

Pre-order party jollof rice, fried rice and shawarma — pick your outlet and pickup time, pay, and collect with a QR code. No queue, no wait.

**Live site:** https://tmjfoodsapp.vercel.app

## How it works

1. Browse the menu (real photos, real prices in ₦) and customise with extras.
2. Checkout: name, phone, outlet, pickup date and time, payment method.
3. Get an order code (TMJ-XXXXXX) and a QR code.
4. Track the order live: Paid → Preparing → Ready for pickup → Collected.
5. Show the QR code at the outlet to collect.

## Kitchen dashboard

`kitchen.html` — live order queue with sound alert, status advance buttons, and QR/code validation for pickup. Demo PIN: `1234` (change before going live).

## Stack

- Static web app (HTML/CSS/JS), mobile-first
- Supabase (Postgres + Storage) for menu, outlets, orders and food photos — `tmj_*` tables
- Deployed on Vercel as `tmjfoodsapp`

## Outlets

Ilorin (Tanke, Fate) • Lagos (Allen Avenue Ikeja, Festac, UNILAG) • Ibadan (Bodija, Akala Express) • Abuja (Wuse 2)

Pickup hours: 8:00 AM – 11:00 PM.
