# eBay Product Hunter

A product-research SaaS foundation for eBay sellers: market research, trend intelligence, seasonal hunting and supplier sourcing.

## Current build

- Next.js dashboard
- Market selector for major eBay marketplaces
- Product search and seasonal filters
- Product opportunity table
- eBay Browse API provider
- Secure server-side eBay OAuth token flow
- Price-range search support
- Normalized eBay search response
- Automated unit tests for analytics and eBay query/normalization logic

## Live eBay data setup

The app uses eBay's official Browse API for item discovery. eBay's Browse API supports keyword/category search and filtering, and requires an application access token. See the official eBay Developers documentation: https://developer.ebay.com/api-docs/buy/api-browse.html

Create eBay Developer credentials and put them in your deployment environment:

```
EBAY_CLIENT_ID=
EBAY_CLIENT_SECRET=
```

Never put these values in client-side code or commit a real `.env` file.

The API route is:

```
GET /api/ebay/search?market=US&q=halloween%20lights&minPrice=10&maxPrice=50&limit=25
```

Supported markets currently include US, UK, CA, AU, DE, FR, IT and ES.

## Important data limitation

The official Browse API provides active/purchasable listings. It does **not** by itself provide the sold-count history needed to claim that an item has sold 183 units, for example. The product-hunter sold-demand engine therefore needs a separate compliant data source or seller-authorized data before those metrics are shown as real.

## Roadmap

1. Connect live eBay search to the dashboard
2. Add opportunity scoring from observable listing data
3. Add compliant sold-demand data source
4. Add supplier provider abstraction and AliExpress/CJ integration
5. Add PostgreSQL persistence
6. Add trend history and seasonal intelligence
7. Add authentication, watchlists and alerts
8. Deploy on Railway

## Run

```
npm install
npm test
npm run dev
```


### Supplier sourcing: CJdropshipping

The app now includes a CJdropshipping provider adapter and `/api/sourcing/search`.

Set either `CJ_ACCESS_TOKEN` or `CJ_API_KEY`. CJ's API 2.0 product search supports keyword, country, price-range and pagination filters. The provider normalizes results into the app's supplier model.

CJ API credentials should be kept server-side and never exposed to browser code.
