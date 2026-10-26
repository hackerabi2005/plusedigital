# API Map: Pulse PMS (mydigitalclinic.net)

This document provides a comprehensive mapping of all backend endpoints discovered via network captures and REA analysis.

---

## 1. Dashboard & General Clinic APIs

### `GET /report/homeweekly2`
- **Auth**: Cookie `PulseAuth`
- **Params**: None
- **Response Shape**:
```json
{
  "graphset": [
    {
      "type": "bar",
      "title": { "text": "Weekly Production & Visits" },
      "scale-x": { "values": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] },
      "series": [
        { "values": [3500, 7000, 4200, 8500, 6000, 3500], "text": "Production" },
        { "values": [2, 4, 3, 5, 4, 2], "text": "Visits" }
      ]
    }
  ]
}
```

### `GET /home/getappointmentdays`
- **Auth**: Cookie `PulseAuth`
- **Params**: `start` (Integer offset, e.g., `0`, `7`, `-7`)
- **Response Shape**: HTML string of 7 `<div class="col-2 DayScrollItem" data-appointmentdate="DD/MM/YYYY">...</div>` elements.
- **Client Handler**: Injected into `.appointmentDays` container; activates clicked date styling.

### `GET /home/getappointmenttimings`
- **Auth**: Cookie `PulseAuth`
- **Params**: `date` (string `DD/MM/YYYY`)
- **Response Shape**: HTML partial (`appointment_timings.html`) containing Morning and Evening slot badges.
- **Client Handler**: Replaces `.AppointmentTimeSection` inner HTML; binds popover events.

### `GET /home/getappointmentdetailspopover`
- **Auth**: Cookie `PulseAuth`
- **Params**: `date` (string), `time` (string)
- **Response Shape**: HTML snippet rendered inside Bootstrap popover:
```html
<div style="padding:10px;width:280px;">
  <a href="/patient/detail?patientid=...">Ms. Yalini</a>
  <div><i class="far fa-clock"></i> 10:30 AM</div>
  <div><i class="fas fa-mobile-alt"></i> 7548801024</div>
  <div>Dr. Naveena Ramnath</div>
  <div>Treatment: Root Canal Treatment (RCT)</div>
  <a href="/dental/consultation?patientid=..." class="btn btn-sm btn-primary">Start Consultation</a>
</div>
```

### `GET /home/patientcheckin`
- **Auth**: Cookie `PulseAuth`
- **Params**: `patientID` (string), `userID` (string)
- **Response Shape**: `'True'` if check-in successful, `'False'` if already checked in.
- **Client Action**: Updates badge count in `.todayCheckInCount` and fires notification banner.

### `GET /home/patientcheckout` / `GET /home/patientremovecheckin`
- **Auth**: Cookie `PulseAuth`
- **Params**: `patientCheckInID` (string)
- **Response Shape**: `'True'`
- **Client Action**: Removes row from `.todaycheckins` container.

### `GET /home/patientsearch`
- **Auth**: Cookie `PulseAuth`
- **Params**: `term` (string)
- **Response Shape**: JSON Array of strings formatted as `"{patientId} - {fullName} - {mobile} - {fileNumber}"`.

---

## 2. Calendar & Scheduler APIs

### `GET /calendar/getdiaryevents`
- **Auth**: Cookie `PulseAuth`
- **Params**: `start` (ISO date), `end` (ISO date)
- **Response Shape**: JSON Array:
```json
[
  {
    "id": "900101",
    "title": "Ms.  Yalini (Root Canal Treatment)",
    "start": "2026-10-24T10:30:00.000Z",
    "end": "2026-10-24T11:00:00.000Z",
    "allDay": false,
    "color": "#9b6ce8",
    "patientId": "2223997",
    "mobile": "7548801024"
  }
]
```

### `POST /calendar/saveevent`
- **Auth**: Cookie `PulseAuth`
- **Body**: Form-encoded / JSON:
  - `Title`: Patient name
  - `Mobile`: Mobile number
  - `UserID`: Doctor ID
  - `Location`: Location ID
  - `NewEventDate`: Date string (`DD/MM/YYYY`)
  - `NewEventTime`: Time string (`hh:mm AM/PM`)
  - `NewEventDuration`: Duration in minutes
  - `Treatment`: Treatment name
- **Response Shape**: `'True'`

---

## 3. Dental Odontogram Consultation APIs

### `GET /dental/getteethimage`
- **Auth**: Cookie `PulseAuth`
- **Params**: `teethNumber` (Integer 11-48, 51-85)
- **Response Shape**: HTML string: `<img src="/Content/images/dental/normal/{teethNumber}.svg" class="upper|lower" style="...">`

### `POST /dental/patientdentaldetailconditions`
- **Auth**: Cookie `PulseAuth`
- **Body**:
  - `dentalConditionID`: Condition ID (1 = Caries, 2 = Fracture, 3 = Mobility, 4 = Root Stump, etc.)
  - `teethNumbers`: Comma-delimited tooth numbers (e.g., `'16, 26'`)
  - `CreateDateTime`: Date string
- **Response Shape**: `true` (JSON boolean)

### `GET /dental/consultationhistory`
- **Auth**: Cookie `PulseAuth`
- **Params**: `patientid`
- **Response Shape**: HTML partial (`dc_section6.html`) detailing previous dates, notes, and treatments.

---

## 4. Patient Communication & Messaging APIs

### `POST /patientconnect/sendbulkpatientmessage`
- **Auth**: Cookie `PulseAuth`
- **Body**: `Type`, `Patients`, `Gender`, `MinAge`, `MaxAge`, `MedicalConditions`, `Group`, `Message`, `Cost`, `PatientCount`, `ClinicLocation`
- **Response Shape**: `true` (JSON boolean)
- **Client Handler**: Triggers `NotificationFx` sliding alert ("Successfully queued messages. They will be delivered shortly.").

### `POST /patient/sendcommunication`
- **Auth**: Cookie `PulseAuth`
- **Body**: `patientId`, `type`, `templateId`, `message`
- **Response Shape**: `{ success: true, message: "Communication queued successfully" }`
- **Client Handler**: Displays success confirmation; prepends new delivery log entry to `#commLogsTable`.

---

## 5. Reporting & Analytics APIs

### `GET /report/patientreport`
- **Auth**: Cookie `PulseAuth`
- **Params**: None
- **Response Shape**: HTML snippet (`report_patient.html`) containing the patient filter form and `#example` table structure.

### `GET /report/patientreportresult` (or `/report/patientreportresult1`)
- **Auth**: Cookie `PulseAuth`
- **Params**: `draw` (int), `start` (int), `length` (int), `search[value]` (string)
- **Response Shape**: DataTables server-side JSON:
```json
{
  "draw": 1,
  "recordsTotal": 10,
  "recordsFiltered": 10,
  "data": [
    {
      "PatientID": 2223997,
      "Name": "Ms. Yalini",
      "Mobile": "7548801024",
      "FileNo": "7241",
      "Gender": "Female",
      "Age": 28,
      "Doctor": "Dr. Naveena Ramnath",
      "CreatedDate": "2026-10-24"
    }
  ]
}
```
- **Client Handler**: Initialized via `$('#example').DataTable(...)`; supports client-side search, sorting, and pagination.

