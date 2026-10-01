# Miaan eBay Product Hunter + AI Listing Studio

A Next.js product-research and listing workflow for eBay sellers: product hunting, trend intelligence, supplier sourcing, market-specific AI listing generation, and workflow tracking.

## Miaan workflow

1. Hunt an eBay product
2. Match a supplier through the sourcing layer
3. Open Miaan AI Listing Studio
4. Choose USA or UK
5. Generate Title, Description, Options and Image Prompt
6. Generate All or individual sections
7. Download a market-specific listing bundle
8. Track Hunted → Sourced → Listing Generated → Ready

## Environment

AI generation is server-side. Never expose API keys in browser code or commit real environment files.

```
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
EBAY_CLIENT_ID=
EBAY_CLIENT_SECRET=
CJ_ACCESS_TOKEN=
DATABASE_URL=
```

## Run

```
npm install
npm test
npm run build
npm run dev
```

## Data limitation

The official eBay Browse API provides active/purchasable listings. It does not by itself provide sold-count history. Active-listing data must not be presented as verified sold-demand data without a compliant data source.

## Security

Keep eBay, CJ and AI credentials server-side. Do not commit real API secrets.

## Release

The Miaan AI Listing Studio work is on feature/miaan-listing-studio. Merge into main only after npm test and npm run build pass.