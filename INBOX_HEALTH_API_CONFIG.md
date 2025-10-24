# Inbox Health API Configuration

## Authentication Method

The Inbox Health Partner API v2 uses **API Key authentication** via the `x-api-key` header.

### Correct Configuration:

```
Base URL: https://api.demo.inboxhealth.com/partner/v2
Authentication Header: x-api-key
API Key: IZ7xtwJUBJbcrgw3FTF0nSimK1w5UCYhVlYbdQCC
```

### Example API Call:

```bash
curl -X GET "https://api.demo.inboxhealth.com/partner/v2/patients" \
  -H "x-api-key: IZ7xtwJUBJbcrgw3FTF0nSimK1w5UCYhVlYbdQCC" \
  -H "Content-Type: application/json"
```

### Code Example:

```javascript
const response = await fetch(`${process.env.NEXT_PUBLIC_INBOX_HEALTH_API_URL}/patients`, {
  method: 'GET',
  headers: {
    'x-api-key': process.env.INBOX_HEALTH_API_KEY,
    'Content-Type': 'application/json',
  },
});
```

## Updated Files:

1. **/.env.local** - Updated API key and confirmed correct base URL
2. **/app/api/patients/route.ts** - Fixed authentication header from `Authorization: Bearer` to `x-api-key`
3. **/app/api/invoices/route.ts** - Fixed authentication header in commented code

## Webhook Configuration:

- **Webhook URL**: `https://ih003.advancedcare.ai/api/webhook`
- **Endpoint**: `/api/webhook/route.ts`
- Make sure to configure this URL in your Inbox Health dashboard

## API Documentation:

- Full API Docs: https://rest.demo.inboxhealth.com/api
- Swagger Spec: https://rest.demo.inboxhealth.com/partner/v2/docs

## Common Mistakes to Avoid:

❌ **Wrong**: Using `Authorization: Bearer <token>` header
✅ **Correct**: Using `x-api-key: <token>` header

❌ **Wrong**: Using `https://rest.demo.inboxhealth.com` for API calls
✅ **Correct**: Using `https://api.demo.inboxhealth.com` for API calls

❌ **Wrong**: Webhook URL pointing to `/webhook/` (page route)
✅ **Correct**: Webhook URL pointing to `/api/webhook` (API route)
