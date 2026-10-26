# Stack Fingerprint & Architecture Analysis: Pulse PMS (mydigitalclinic.net)

## 1. Overview
Pulse PMS (`mydigitalclinic.net`) is an enterprise Dental Practice Management System (PMS) authored by Ashish Durve. It serves dental clinics with clinical documentation, appointment scheduling, patient check-in queues, interactive odontograms (dental charting), laboratory tracking, patient communications (SMS/Connect), and financial billing.

## 2. Server & Backend Architecture
- **Original Platform**: Microsoft ASP.NET MVC 5 running on Microsoft-IIS.
- **Rendering Model**: Hybrid server-rendered HTML views and AJAX-injected partial HTML templates (Razor `.cshtml` rendered as HTML snippets).
- **Session & Auth**: Form authentication via `PulseAuth` cookie; Doctor profile `drnaveenaramnath@gmail.com` (Doctor ID: `17472`, `Dr. Naveena Ramnath`).
- **Clone Architecture**: High-performance local Node.js engine (`server.js`) reproducing ASP.NET MVC route handling, query parameter normalization, JSON serialization, and dynamic HTML partial composition.

## 3. Frontend Technology Stack
- **CSS Framework**: Bootstrap 4 with Bootstrap Material Design (`bootstrap-material-design.min.css`, `ripples.min.css`) and AdminLTE theme (`AdminLTE.css`, `skin-black.css`).
- **JavaScript Core**: jQuery `1.9.1`, jQuery UI `1.10.3` (with UI Touch Punch for mobile drag-and-drop), modernizr `2.6.2`.
- **UI Components & Widgets**:
  - `bootstrap-timepicker.js`: Appointment time picker
  - `bootstrap-editable.js` (X-Editable): In-place editing of patient records and demographic details
  - `dataTables.bootstrap4.min.js`: Patient rosters, appointment tables, and report registers
  - `zingchart.min.js`: HTML5 canvas rendering for dashboard analytics (production & visit charts)
  - `notificationFx.js` & `classie.js`: Slide-in snackbar notifications
  - `jquery.dropdown.js` & `jquery.hotkeys.js`: Navigation dropdowns and keyboard shortcuts
- **Odontogram (Dental Charting)**:
  - Vector SVG tooth assets: Permanent teeth numbered 11 through 48 and primary/deciduous teeth numbered 51 through 85.
  - Dynamic CSS filter manipulation (`drop-shadow`, `hue-rotate`, `sepia`) for pathology condition overlays (caries, root canal, fracture).
- **Progressive Web App (PWA)**:
  - `manifest.json`: Web application manifest declaring app icons, display modes, and orientations.
  - `serviceWorker.js`: Offline caching and client network routing.
  - Multi-resolution Apple touch icons and splash launch images.

## 4. False Premise Correction (Prompt Deconstruction)
- **WebGL / 3D Engine**: The website does **NOT** use WebGL shaders, Three.js 3D pipelines, or GPU post-processing effects. The string `webgl` in the root DOM is an artifact of Modernizr's automated feature-detection class list (`class="... webgl ..."`).
- **Animation Driver**: Animations are CSS3 keyframe transitions (`animate.min.css`) and jQuery DOM animations.
- **Textures**: "Textures" on this site refer strictly to SVG vector assets for human tooth morphology and UI raster icons.
