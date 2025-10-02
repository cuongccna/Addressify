# Master Data Directory

This directory contains cached master data from GHN API:
- `ghn-provinces.json` - List of provinces
- `ghn-districts.json` - List of all districts
- `ghn-wards-{districtId}.json` - Wards for each district
- `ghn-all-wards.json` - All wards combined

## How to sync

1. Make sure GHN_API_TOKEN is set in your environment
2. Visit `/master-data` page in the app
3. Click "Sync Master Data từ GHN"
4. Wait for sync to complete

Or use API directly:
```bash
curl -X POST http://localhost:3000/api/master-data/sync
```

## Usage

The cached data is used by:
- Address normalization and matching
- Auto-complete for address fields
- GHN API calls with proper district/ward IDs
