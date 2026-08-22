# GlobeTrotter — Product Context

## What it is
A multi-city travel planning web app. Users create trips, add city stops with dates, schedule activities per stop-day, view a live budget breakdown, and share trips publicly via a unique slug URL.

## Mode
Operate — users are completing real tasks (building itineraries, managing budgets, sharing trips). This is not a marketing page.

## Audience
Independent travelers, 20s–40s, planning-minded and budget-conscious but aspirational. They value clarity and speed over decoration.

## Stack
React + Vite + Tailwind CSS. No third-party component library — all components are custom. Chart.js via react-chartjs-2 for budget charts. React Router v6 for routing.

## Design tokens (frozen — do not override)
- primary: #1E3A5F  (deep navy)
- accent:  #FF6B6B  (warm coral)
- surface: #F8F9FA  (off-white)

## Pages
Login, Signup, Dashboard, Create Trip, My Trips, Itinerary Builder, Itinerary View, Budget, Public Trip View, Profile.

## Fonts
Plus Jakarta Sans (display/headings) + Inter (body/UI). Installed via @fontsource packages, never Google Fonts link tags.

## Design intent
Clean, trustworthy, travel-aspirational. Cards with subtle shadows and rounded corners. The data — itinerary, budget — is the hero, not decoration. One signature moment: the Dashboard hero banner and the Recommended destinations row should feel curated and alive, not like a generic data grid.

## What is out of scope
No admin dashboard. No payments. No calendar drag-drop (stretch only). No multi-currency. No real-time collaboration.
