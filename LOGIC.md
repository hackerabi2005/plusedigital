# Client Logic & Behavior Trace: Pulse PMS (mydigitalclinic.net)

This document traces client-side JavaScript architecture, state management, event pipelines, and dynamic UI interactions extracted via REA and code inspection.

---

## 1. Authentication & Session Management
- **Mechanism**: ASP.NET Forms Authentication cookie `PulseAuth`.
- **Evidence**: `captured-pages/account_login.html`, lines 120-180.
- **Login Form Post**: Submits credentials to `/account/login`. Upon 200/302, sets the `PulseAuth` cookie and redirects to `/home/index`.
- **Session Check**: Global navigation headers check user context; doctor name `Dr. Naveena Ramnath` and Clinic Location `1395 - Vaiyapuri Nagar,Kurumbpalayam` are stored in DOM hidden inputs:
  - `$("#DoctorID").val('17472')`
  - `$("#LocationID").val('1395')`

---

## 2. Dashboard Dynamic Date Scroller (`DayScrollItem`)
- **Evidence**: `captured-pages/home_index.html`, lines 1515-1560; `server.js`, lines 160-177.
- **State Variables**: Hidden input `#number` (offset counter, initialized to `0`) and `#number1` (range counter, initialized to `7`).
- **Interaction Logic**:
  - Clicking right chevron (`.dayScrollRight`) triggers `nextDate()`:
    1. Reads `#number` value and adds `7`.
    2. Issues `$.ajax({ url: '/home/getappointmentdays?start=' + nextStart })`.
    3. Replaces inner HTML of `.appointmentDays`.
    4. Automatically calls `GetAppointmentTimings` for the first day in the newly rendered chunk.
  - Clicking left chevron (`.dayScrollLeft`) triggers `prevDate()`:
    1. Decrements `#number` by `7`.
    2. Issues AJAX request and re-renders day elements.
  - Clicking individual `.DayScrollItem`:
    1. Extracts `data-appointmentdate` attribute.
    2. Clears active border on siblings and sets `border-bottom: 2px solid #1d7fff`.
    3. Calls `GetAppointmentTimings(dateStr, this)`.

---

## 3. Real-Time Patient Check-In & Queue Workflow
- **Evidence**: `captured-pages/home_index.html`, lines 3220-3265.
- **Trigger**: User clicks `.btncheckin` on any scheduled appointment row.
- **Handler**:
  ```javascript
  $(".btncheckin").click(function () {
      var patientID = $(this).attr('data-patientID');
      var userID = $(this).attr('data-userID');
      $.ajax({
          url: '../home/patientcheckin?patientID=' + patientID + '&userID=' + userID,
          type: 'GET',
          success: function (data) {
              CheckInCountGet();
              if (data == "False") {
                  DisplayMessage(Warning + "Patient already checked in.");
              } else {
                  DisplayMessage(SuccessCheck + "Patient check in successful.");
              }
          }
      });
  });
  ```
- **State Propagation**: `CheckInCountGet()` calls `POST /home/GetPatientCheckInCount` and updates badge `.todayCheckInCount` with the new integer count.

---

## 4. Interactive Odontogram (Dental Charting System)
- **Evidence**: `captured-pages/dental_consultation.html`, lines 420-560; `cleaned-partials/dc_section1.html`.
- **Anatomy Model**:
  - Permanent Adult dentition: Quadrant 1 (18-11), Quadrant 2 (21-28), Quadrant 3 (38-31), Quadrant 4 (41-48).
  - Deciduous Pediatric dentition: Quadrant 5 (55-51), Quadrant 6 (61-65), Quadrant 7 (75-71), Quadrant 8 (81-85).
- **Interactive State**:
  - Clicking a tooth SVG toggles selection state (`selectedTooth`).
  - Condition buttons (Caries, Root Stump, Impacted, Missing, Fracture) assign clinical findings:
    - Calls `POST /dental/patientdentaldetailconditions` with `dentalConditionID` and comma-separated `teethNumbers`.
    - Triggers SVG dynamic styling: applies `filter: drop-shadow(0 0 4px #fe3c60) sepia(1) hue-rotate(-50deg) saturate(3);` to indicate active pathology.
    - Updates consultation timeline and billing quote.

---

## 5. Inline Clinical Forms & Partial Loading Pattern
- **Evidence**: `captured-pages/patient_detail.html`, lines 180-260.
- **Pattern**: When tabs (Examination, Procedures, Prescriptions, Billing) are activated, the container `#LoadForms` asynchronously requests modular HTML fragments (`/patient/getclinicalexamination`, `/patient/getaddprocedure`, etc.) from the server.
- **Client Fallback**: The local server injects pre-rendered partial views directly into accordion containers (`#PatientDetailsAccordions`, `#divid`, `#billingDetail`) ensuring instantaneous load with zero network delay or missing partial bugs.

---

## 6. Settings Submodules & Loop Trap Prevention
- **Evidence**: `cleaned-pages/settings.html`, `server.js` lines 1800-1845.
- **Loop Trap Mechanism**: In the original app, each module icon on `/home/settings` was a link (`/home/users`, `/home/locations`, `/home/fees`, etc.). In early partial clones, these routes were caught by a wildcard server handler returning `settings.html`, leading to an infinite cycle where clicking a card refreshed the card list.
- **Architectural Solution**:
  - `server.js` implements `renderSettingsSubPage(title, icon, contentHtml)` injecting specific tables, master lists, and modal forms for each submodule.
  - Bidirectional navigation breadcrumbs (`<a href="/home/settings" class="btn btn-sm btn-outline-primary"><i class="fas fa-arrow-left mr-1"></i> Back to Settings</a>`) provide clean return paths without reloads or loops.

---

## 7. Patient Connect SMS & Wallet Validation Logic
- **Evidence**: `cleaned-pages/patientconnect.html`, lines 3991-4146.
- **Mechanism**:
  - `#sendMessage` validates that the message string is non-empty (`message.length > 0`) and that clinic wallet balance exceeds campaign cost (`$('#finalCost').html() <= amount`).
  - Credit amount initialized to mock credit `amount = 999999`.
  - On valid submission, issues asynchronous `POST ../PatientConnect/SendBulkPatientMessage`.
  - Dispatches `DisplayMessage(...)` which instantiates `NotificationFx({ layout: 'growl', effect: 'slide', ttl: 5000, type: 'notice' })`.
  - Eliminates legacy `href=""` traps by binding `e.preventDefault()`.

---

## 8. Reports & Analytics DataTables AJAX Integration
- **Evidence**: `cleaned-pages/reports.html`, `cleaned-partials/report_patient.html`, `server.js` lines 1870-1910.
- **Mechanism**:
  - Reports container dynamically mounts `report_patient.html` upon `/report/patientreport`.
  - DataTables plugin binds to `#example` with options:
    ```javascript
    $('#example').DataTable({
        processing: true,
        serverSide: true,
        ajax: '../Report/PatientReportResult'
    });
    ```
  - `server.js` responds with JSON payload adhering to the DataTables server-side protocol: `draw`, `recordsTotal`, `recordsFiltered`, and array of patient records.

