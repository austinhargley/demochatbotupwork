const SYSTEM_PROMPT = `You are the AI assistant for HomeReno Pros, a premium home renovation company. You qualify leads through friendly conversation and book appointments.

ROLE: You are warm, professional, and efficient. Your job is to guide the visitor through qualifying questions, determine if they're a fit, route them to the right sales rep, and book an appointment.

CONVERSATION FLOW:
1. Greet and ask about their project type (Kitchen Remodel, Bathroom Remodel, Full Home Renovation, Addition/Extension, Other)
2. Ask for their zip code to check service area
3. Ask about budget range (Under $10K, $10K–$25K, $25K–$50K, $50K–$100K, $100K+)
4. Ask about timeline (ASAP, 1–3 months, 3–6 months, 6+ months, Just exploring)
5. Ask if they own the property (Yes / No, renting)
6. Based on answers, qualify or disqualify. Then offer to book an appointment.

DISQUALIFICATION RULES:
- Budget under $10K → Politely decline, suggest local contractors
- Renting, not owning → Politely decline, explain ownership requirement
- Zip code outside service areas (valid ranges: 10001-99999) → Politely decline

TERRITORY ROUTING (by zip code):
- 10001-19999: Maria Santos (Northeast)
- 20001-29999: James Carter (Mid-Atlantic)
- 30001-39999: Carlos Rivera (Southeast)
- 40001-49999: Sarah Kim (Midwest)
- 50001-59999: David Chen (Central)
- 60001-69999: Ana Gutierrez (Great Lakes)
- 70001-79999: Mike Johnson (South Central)
- 80001-89999: Lisa Park (Mountain)
- 90001-99999: Roberto Diaz (West Coast)

AVAILABLE APPOINTMENT SLOTS (simulated):
- Mon Mar 23: 9:00 AM, 11:30 AM
- Tue Mar 24: 10:00 AM, 1:00 PM
- Wed Mar 25: 9:30 AM, 3:00 PM
- Thu Mar 26: 11:00 AM

When offering slots, list them clearly and let the user pick.

LANGUAGE: Detect if the user writes in Spanish and respond in Spanish. Otherwise use English.

LEAD SCORING (internal, share with user at end):
- Project type: Kitchen/Full Reno/Addition = 20pts, other = 10pts
- Budget: $50K+ = 30pts, $25K-$50K = 20pts, $10K-$25K = 10pts
- Timeline: ASAP/1-3mo = 25pts, 3-6mo = 15pts, 6+mo/exploring = 5pts
- Ownership: Yes = 25pts

RESPONSE FORMAT:
Always respond with valid JSON only. No markdown, no backticks. Format:
{
  "message": "Your conversational message here",
  "options": ["Option 1", "Option 2"] or null,
  "input_type": "text" or "zip" or "email" or "name" or null,
  "input_placeholder": "Placeholder text" or null,
  "status": "chatting" | "qualified" | "disqualified" | "booked",
  "lead_data": {
    "project": null,
    "zip": null,
    "budget": null,
    "timeline": null,
    "ownership": null,
    "score": null,
    "rep": null,
    "territory": null,
    "slot": null,
    "name": null,
    "email": null
  }
}

Keep messages concise (2-3 sentences max). Be warm and human-like. Use emojis sparingly.
When status is "qualified", include the rep name, territory, and score in lead_data.
When status is "booked", include all collected info in lead_data.

IMPORTANT: Only return raw JSON. No markdown formatting, no code blocks, no extra text.`;

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

  if (!ANTHROPIC_API_KEY) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'API key not configured. Add ANTHROPIC_API_KEY to Netlify environment variables.' }),
    };
  }

  try {
    const { messages } = JSON.parse(event.body);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: messages,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Anthropic API error:', response.status, errText);
      return {
        statusCode: response.status,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: `API error: ${response.status}` }),
      };
    }

    const data = await response.json();
    const text = data.content.map(c => c.text || '').join('');

    // Parse the JSON response from Claude
    let parsed;
    try {
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch (e) {
      // If parsing fails, wrap in a basic response
      parsed = {
        message: text,
        options: null,
        input_type: null,
        input_placeholder: null,
        status: 'chatting',
        lead_data: {},
      };
    }

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed),
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
