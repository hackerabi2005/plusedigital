# Route Manifest: Pulse PMS (mydigitalclinic.net)

## 1. Primary Page Routes (Status 200 OK)

| # | Route | Method | Description | Content Type |
|---|-------|--------|-------------|--------------|
| 1 | `/account/login` | GET / POST | Clinic login gateway; sets auth session | `text/html` |
| 2 | `/account/logoff` | GET | Logs out user and redirects to login | `302 Redirect` |
| 3 | `/` or `/home/index` | GET | Main Clinic Dashboard (appointments, scroller, charts) | `text/html` |
| 4 | `/calendar/index` | GET | Interactive Diary & Appointment Scheduler | `text/html` |
| 5 | `/dental/consultation?patientid={id}` | GET | Full Odontogram Dental Consultation Workspace | `text/html` |
| 6 | `/patient/detail?patientid={id}` | GET | Comprehensive Patient EMR, History, & Demographics | `text/html` |
| 7 | `/home/appointmentlist` | GET | Tabular register of all clinic appointments | `text/html` |
| 8 | `/lab/laboratory` | GET | Dental Lab Tracking, Orders & Statuses | `text/html` |
| 9 | `/patientconnect/index` | GET | Patient SMS Broadcast, WhatsApp & Campaigns | `text/html` |
| 10 | `/report/reports` | GET | Clinical & Financial Analytics & Registers | `text/html` |
| 11 | `/social/index` | GET | Social Media Marketing & Review Hub | `text/html` |
| 12 | `/home/videos` | GET | Patient Education Dental Video Library | `text/html` |
| 13 | `/home/settings` | GET | Practice Configuration & Master Settings | `text/html` |
| 14 | `/home/search` | GET | Global Patient, File Number, & Mobile Search | `text/html` |
| 15 | `/home/profileview` | GET | Doctor Profile & Clinic Location Management | `text/html` |
| 16 | `/home/support` | GET | Support & Ticketing Portal | `text/html` |
| 17 | `/home/faq` | GET | Clinic Management Knowledge Base & FAQ | `text/html` |

---

## 2. Dynamic Backend APIs & Partial View Endpoints

| # | Endpoint | Method | Params | Response Format | Purpose |
|---|----------|--------|--------|-----------------|---------|
| 1 | `/report/homeweekly2` | GET | - | JSON | ZingChart configuration and production data series |
| 2 | `/home/getappointmentdays` | GET | `start` (int) | HTML Partial | Horizontal day scroller for appointment booking |
| 3 | `/home/getappointmenttimings` | GET | `date` (DD/MM/YYYY) | HTML Partial | Slot matrix (morning & evening) with booking state |
| 4 | `/home/getappointmentdetailspopover`| GET | `date`, `time` | HTML Partial | Hover popover card with patient, mobile & treatment |
| 5 | `/home/todayappointments` | GET | - | HTML Partial | Scheduled appointments table with check-in triggers |
| 6 | `/home/todaycheckins` | GET | - | HTML Partial | Active checked-in patients list and waiting times |
| 7 | `/home/getdoctor` | GET | - | HTML Partial | Doctor selection dropdown snippet |
| 8 | `/home/getpatientqueue` | GET | - | HTML Partial | Real-time waiting room patient queue |
| 9 | `/home/deletepatientqueue` | GET / POST| `id` | JSON `true` | Queue item removal |
| 10 | `/home/getalertdetails` | GET | - | HTML Partial | Medical alerts and clinical warning modals |
| 11 | `/home/getnotificationcount` | GET | - | JSON `int` | Unread appointment and task notification count |
| 12 | `/home/getpatientcheckincount` | GET | - | JSON `int` | Live count of checked-in patients |
| 13 | `/home/patientcheckin` | GET | `patientID`, `userID` | HTML `'True'/'False'` | Triggers patient check-in event |
| 14 | `/home/patientcheckout` | GET | `patientCheckInID` | HTML `'True'` | Patient check-out completion |
| 15 | `/home/getrecentactivity` | GET | - | HTML Partial | Audit trail of clinical actions and logs |
| 16 | `/home/quickaddpatient` | POST | Patient form data | JSON `patientId` | Rapid patient demographic intake |
| 17 | `/home/patientsearch` | GET | `term` | JSON Array | Autocomplete search for patients |
| 18 | `/calendar/getdiaryevents` | GET | `start`, `end` | JSON Array | FullCalendar event objects with color codes |
| 19 | `/calendar/saveevent` | POST | Event fields | HTML `'True'` | Booking persistence |
| 20 | `/calendar/deleteevent` | POST | `EventID` | HTML `'True'` | Appointment cancellation |
| 21 | `/dental/getteethimage` | GET | `teethNumber` | HTML `<img>` | SVG tooth image with clinical condition filter |
| 22 | `/dental/patientdentaldetailconditions`| POST | `teethNumbers`, `dentalConditionID` | JSON `true` | Updates odontogram pathology findings |
| 23 | `/dental/conditions` | GET / POST| - | HTML / JSON | Section 1: Odontogram condition matrix |
| 24 | `/dental/procedures` | GET | - | HTML Partial | Section 2: Clinical treatment plan & procedures |
| 25 | `/dental/prescriptionremedies`| GET | - | HTML Partial | Section 3: Medication prescriptions |
| 26 | `/dental/billing` | GET | - | HTML Partial | Section 4: Dental invoice & billing summary |
| 27 | `/dental/previewandprint` | GET | - | HTML Partial | Section 5: Case summary print preview |
| 28 | `/dental/consultationhistory` | GET | - | HTML Partial | Section 6: Historical consultation sessions |
| 29 | `/lab/labs` | GET | - | HTML Partial | Lab catalog menu |
| 30 | `/lab/laborders` | GET | - | HTML Partial | Active lab work orders table |
| 31 | `/patientconnect/getbulkpatientcount`| POST | Filter payload | JSON `count` | Target recipient calculation for campaigns |
| 32 | `/patientconnect/sendbulkpatientmessage`| POST | Message payload | JSON `true` | Queue bulk SMS/WhatsApp messages |
| 33 | `/patient/sendcommunication` | POST | Patient message payload | JSON `{success: true}` | Send single patient communication |
| 34 | `/report/patientreport` | GET | - | HTML Partial | Patient report filter & table container |
| 35 | `/report/patientreportresult` | GET | `draw`, `start`, `length` | JSON | DataTables paginated patient report records |

---

## 3. Submodule & Feature Routes (Cycle 4 Verified)

| # | Route | Parent | Description | Content Type |
|---|-------|--------|-------------|--------------|
| 1 | `/home/users` | Settings | Clinic Staff & User Role Management | `text/html` |
| 2 | `/home/locations` | Settings | Practice Locations & Operating Branches | `text/html` |
| 3 | `/home/fees` | Settings | Consultation & Service Fee Schedule | `text/html` |
| 4 | `/home/appointmenttiming` | Settings | Doctor Availability Timings & Slot Rules | `text/html` |
| 5 | `/home/consents` | Settings | Clinical Informed Consent Document Templates | `text/html` |
| 6 | `/home/groups` | Settings | Patient Groupings & Category Management | `text/html` |
| 7 | `/home/procedure` (or `/home/Procedure`) | Settings | Clinical Procedures Master Catalog & Pricing | `text/html` |
| 8 | `/home/medicalconditions` | Settings | Medical Condition Flags & Warning Master | `text/html` |
| 9 | `/inventory/supplier` | Settings | Dental Laboratories & Inventory Suppliers | `text/html` |
| 10 | `/home/remedies` | Settings | Prescription Drug Formulary & Dosage Master | `text/html` |
| 11 | `/home/packageremedies` | Settings | Medication Bundles & Standard Kits | `text/html` |
| 12 | `/home/referral` | Settings | Specialist Referral Directory | `text/html` |
| 13 | `/patient/patientcommunication` | Patient Detail | Patient SMS/Email Communication History & Delivery Logs | `text/html` |

