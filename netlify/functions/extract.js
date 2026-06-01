const https = require('https');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { images } = JSON.parse(event.body);

  const payload = JSON.stringify({
    model: 'claude-opus-4-5',
    max_tokens: 300,
    messages: [{
      role: 'user',
      content: [
        ...images.map(img => ({
          type: 'image',
          source: { type: 'base64', media_type: 'image/jpeg', data: img }
        })),
        {
          type: 'text',
          text: `You are reading Catapult GPS performance screenshots from an AFL football session.
Extract ONLY these numeric values. Return ONLY a JSON object with these exact keys, no markdown, no explanation:
{
  "distance": <total distance in km, number>,
  "hsd": <sprint distance in metres divided by 1000 to convert to km, number>,
  "load": <player load, number>,
  "speed": <top speed in km/h, number>,
  "sprints": <power plays count, integer>
}
If a value is not visible use null. Return only the JSON object, nothing else.`
        }
      ]
    }]
  });

  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const text = (parsed.content || []).map(c => c.text || '').join('').trim();
          const clean = text.replace(/```json|```/g, '').trim();
          resolve({
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: clean
          });
        } catch (e) {
          resolve({ statusCode: 500, body: JSON.stringify({ error: e.message }) });
        }
      });
    });

    req.on('error', (e) => {
      resolve({ statusCode: 500, body: JSON.stringify({ error: e.message }) });
    });

    req.write(payload);
    req.end();
  });
};
