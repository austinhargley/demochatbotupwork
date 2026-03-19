# HomeReno Pros — AI Lead Qualification Chatbot

An AI-powered chatbot demo that replaces traditional contact forms with intelligent lead qualification, territory-based sales rep routing, and automated appointment booking.

## Features

- **AI Conversation**: Claude API powers natural, context-aware dialogue
- **Bilingual**: Automatically detects and responds in English or Spanish
- **Lead Scoring**: Scores leads 0–100 based on project type, budget, timeline, and ownership
- **Territory Routing**: Maps zip codes to the correct sales rep automatically
- **Disqualification Logic**: Politely filters out leads below budget minimums or non-property-owners
- **Appointment Booking**: Presents available slots and confirms bookings (simulated Zoho Bookings)
- **Lead Summary Card**: Visual summary of lead data, score, and routing

## Tech Stack

- **Frontend**: Vanilla HTML/CSS/JS (single file, no build step)
- **Backend**: Netlify Serverless Function (Node.js)
- **AI**: Claude API (claude-sonnet-4-20250514)
- **Hosting**: Netlify

## Deployment to Netlify

### Option A: Git Deploy (Recommended)

1. Push this project to a GitHub repo
2. Go to [netlify.com](https://netlify.com) → **Add new site** → **Import an existing project**
3. Connect your GitHub repo
4. Build settings are auto-detected from `netlify.toml` (no build command needed)
5. Add your environment variable:
   - Go to **Site settings** → **Environment variables**
   - Add: `ANTHROPIC_API_KEY` = your Claude API key
6. Trigger a redeploy

### Option B: Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy (from project root)
netlify deploy --prod

# Set environment variable
netlify env:set ANTHROPIC_API_KEY "your-api-key-here"
```

### Option C: Drag and Drop

1. Zip the project folder
2. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
3. Drag the zip file
4. Add the `ANTHROPIC_API_KEY` env variable in Site Settings

## Project Structure

```
lead-qualifier-chatbot/
├── index.html                  # Frontend chatbot UI
├── netlify.toml                # Netlify config
├── netlify/
│   └── functions/
│       └── chat.js             # Serverless function (Claude API proxy)
└── README.md
```

## Environment Variables

| Variable | Description |
|---|---|
| `ANTHROPIC_API_KEY` | Your Anthropic API key (get one at console.anthropic.com) |

## How It Works

1. User clicks "Launch Chatbot Demo"
2. Frontend sends messages to `/.netlify/functions/chat`
3. Serverless function forwards conversation to Claude API with a detailed system prompt
4. Claude responds with structured JSON (message, options, input type, lead data, status)
5. Frontend renders the response: chat bubbles, option buttons, input fields, slot picker, or lead summary card
6. Flow continues until lead is qualified + booked, or disqualified

## Customisation

- **Company branding**: Edit the header, logo, and colours in `index.html`
- **Qualifying questions**: Modify the system prompt in `netlify/functions/chat.js`
- **Territory mapping**: Update the zip code ranges in the system prompt
- **Available slots**: Replace simulated slots with real Zoho Bookings API calls
- **Lead storage**: Add Airtable API calls to save qualified leads

## Production Enhancements

To turn this demo into a production system:

1. **Zoho Bookings API**: Replace simulated slots with real availability checks
2. **Airtable Integration**: POST lead data to Airtable on qualification
3. **Email Notifications**: Use SendGrid/Resend to confirm bookings
4. **WordPress Widget**: Embed as a floating widget via `<script>` tag
5. **Rate Limiting**: Add rate limiting to the serverless function
6. **Analytics**: Track conversion funnel with Mixpanel or PostHog
