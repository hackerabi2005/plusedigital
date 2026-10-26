# Architectural & Operational Assumptions: Pulse PMS Clone

1. **Read-Only Operation Mode**:
   - In accordance with the project rules, all write actions, payment authorizations, and destructive deletions operate on an isolated in-memory clinic state (`state` object in `server.js`). No external mutations or network calls are dispatched to live medical databases.
   - Form buttons display live responsive feedback without risking clinical data alterations.

2. **Session & Auth State Assumption**:
   - The authenticated identity defaults to the clinic owner: `Dr. Naveena Ramnath` (`drnaveenaramnath@gmail.com`), Doctor ID `17472`, clinic location `1395 - Vaiyapuri Nagar,Kurumbpalayam`.
   - Logging in via `/account/login` or logging off via `/account/logoff` maintains parity with ASP.NET Forms Authentication cookie `PulseAuth`.

3. **Analytics & Third-Party Trackers**:
   - External tracking scripts (`googletagmanager.com`, `google-analytics.com`, zingchart CDN remote calls) are replaced with local no-ops or local assets in `cleaned-pages` to guarantee zero network leakage and ensure 100% offline functionality.

4. **Odontogram Graphics**:
   - Tooth graphic assets 11-48 and 51-85 are served from local vector SVGs under `/Content/images/dental/normal/`.
