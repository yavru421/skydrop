CRITICAL DEPLOYMENT RULE: When setting up a new web app or CI/CD pipeline from this template, DO NOT create or suggest GitHub Actions workflows (e.g., `.github/workflows/deploy.yml`). This template natively relies on Cloudflare Pages direct GitHub integration via the included `wrangler.toml` and `build.sh` files. Always assume Cloudflare Pages will automatically deploy the repository natively upon pushing to the `main` branch. Never attempt to overcomplicate the deployment process with external CI/CD actions.

<RULE[AGENTS.md]>
**SkyDrop ZLA Usability Guardrail:**
When working on the SkyDrop file transfer application, strictly prioritize **frictionless, zero-overhead utility**.
- **BAN** the implementation of complex lobbies, unrequested "discovery" protocols (like IP-hashing radars), and flashy "cyberpunk" or game-like aesthetics.
- **MANDATE** that the core user experience remains instantaneous. The user must be able to scan and send files within one tap.
- **MANDATE** native-feeling UX patterns (e.g., Apple-style tooltips, auto-triggering OS file pickers, OS haptics).
- **DO NOT** over-engineer solutions when a simple, direct technical approach (like standard WebRTC + TURN) solves the problem.
</RULE[AGENTS.md]>
