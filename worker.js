export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/api/turn') {
      try {
        const turnResponse = await fetch('https://rtc.live.cloudflare.com/v1/turn/keys/d2a03c2ffa31eacbbb620039e0e66e20/credentials/generate-ice-servers', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${env.TURN_API_TOKEN || 'a19dc87ca6b690fa18b20c1d3c5211697882acca39c373cd6a7b3ac664b7738c'}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ttl: 86400 })
        });

        if (!turnResponse.ok) {
            throw new Error(`Cloudflare TURN API failed: ${turnResponse.status}`);
        }

        const data = await turnResponse.json();
        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Serve static frontend assets
    return env.ASSETS.fetch(request);
  }
};
