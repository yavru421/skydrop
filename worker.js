export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/api/turn') {
      try {
        // Note: Actual TURN key fetching would go here.
        // Returning a structured JSON error if not implemented, avoiding HTML fallback.
        return new Response(JSON.stringify({ 
            error: 'TURN credentials not configured' 
        }), { 
            status: 500, 
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
