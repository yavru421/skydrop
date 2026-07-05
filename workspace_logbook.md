2026-07-04: Delegated CSP and WASM debugging. Root cause: .NET 8+ dynamic import map triggered CSP violation, leading to 404 text/html fallback for dotnet.js. Resolution: User manually applied sha256 hashes and- Pushed changes to GitHub.

## [2026-07-05 09:47:00] Emergency Protocol & Zero-Overhead Redesign
- Invoked `its_all_fucked_up` emergency reset protocol following user dissatisfaction with the over-engineered "Radar" and UI bloat.
- Executed `git reset --hard e706229` to purge the IP-hashing discovery protocol and cyberpunk aesthetic, rolling back to the clean TURN server fix.
- Re-implemented the UI to focus purely on substance: Instant QR code display, "Recent Devices" memory via `localStorage`, and native-feeling Apple tooltips for PWA installation.
- Rewrote `file-bridge.js` to automatically trigger the OS file picker the second a WebRTC connection is secured.
- Integrated `navigator.vibrate` for haptic physical feedback upon connection, transfer completion, and payload receipt.
- Built a "Clipboard Beaming" feature utilizing `navigator.clipboard` to instantly fire text/URLs across the tunnel.
- Deployed the clean, frictionless architecture to Cloudflare.

## [2026-07-05 09:50:00] Added Help Tooltips Modal
- Added a `?` help button to the `Index.razor` header.
- Implemented a dismissible overlay modal (`ShowHelp`) containing step-by-step instructions.
- Styled the modal to match the dark native aesthetic in `Index.razor.css`.
- Pushed changes to Cloudflare CI for deployment.

## [2026-07-05 09:51:00] Protocol Update: /learn Rule Added
- Executed the `/learn` workflow based on user feedback regarding over-engineering.
- Defined the **SkyDrop ZLA Usability Guardrail**, permanently banning unrequested complex "tech scene" aesthetics and discovery protocols.
- Mandated frictionless, zero-overhead utility for all future modifications.
- Saved the rule to `c:\dev\sky-drop\.agents\AGENTS.md` and committed it to the repository.html and _headers. Goal Verification Agent noted unsafe-inline weakens CSP security.

## 2026-07-05: Fix Beam Clipboard
- Diagnosed clipboard read permission issue caused by Blazor WASM async gap.
- Bypassed the Blazor interop by directly binding onclick event to JS function in Index.razor to preserve user gesture context.
- Pushed to main to trigger Cloudflare CI deployment.

- Fixed global app scrolling by replacing 'height: 100vh; overflow: hidden' with 'min-height: 100vh; overflow-x: hidden' on html, body, and root app containers in app.css.
- Pushed to main to trigger Cloudflare CI deployment.

## 2026-07-05: Remove Beam Clipboard Feature
- Removed the Beam Clipboard button and help text from Index.razor.
- Removed beamClipboard function and corresponding receiving handler logic from file-bridge.js.
- Pushed to main to trigger Cloudflare CI deployment.
