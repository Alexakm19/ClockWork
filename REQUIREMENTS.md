# ClockWork charter coverage

The page is a responsive browser prototype. Open `ClockWork/Index.html` to use it.

| Charter requirement | Current implementation | Remaining work |
| --- | --- | --- |
| Track and analyse study, work and personal time | Start/finish sessions, persistent running timer, session history, deletion and daily category totals | Richer analytics and API-backed records; sessions crossing midnight are attributed to their finish date |
| Personalised lifespan countdown using average lifespan data | Birthday and editable planning horizon with remaining days and progress | Select and cite a reliable demographic dataset; the default 80 years is an illustrative planning horizon |
| Intelligent cross-device reminders | Create, view, edit, complete and delete reminders; in-page alerts and optional browser notifications | Background scheduling, personalised allocation logic, push delivery and device synchronisation |
| Diary and emotional state tracking | Create, read, edit and delete dated reflections with mood | Secure account-backed persistence |
| Web and mobile front ends, API, database and full CRUD | Responsive web interface with browser storage | Mobile app, authenticated API and database; tracking currently supports creation, reading and deletion |
| Encryption and access controls | No server transmission; entries rendered as text | Authentication, authorisation, encryption and a data retention/deletion policy; browser storage is not an encrypted diary vault |
| Minimal, accessible interface | Responsive layout, visible focus, labelled forms, semantic sections and status announcements | Browser/device checks and accessibility audit |
| Usability testing with peers and supervisor | Suggested acceptance checks below | Run supervised usability sessions and document feedback |

## Prototype acceptance checks

1. Check that the large clock shows local time as HH:MM:SS and advances every second.
2. Start a session, reload, finish it and verify its category total. Delete the session.
3. Enter a birthday and horizon. Check the countdown, including a horizon already passed.
4. Create, edit, complete, reopen and delete a reminder. Check an alert when due with the page open, and an overdue alert after returning.
5. Create, reload, edit and delete a diary entry. Confirm its mood and line breaks remain intact.
6. Check keyboard navigation, narrow mobile widths and notification permission denial.
7. With browser storage blocked, check that the page explains that edits last only for the visit.

Do not use sensitive diary content in this prototype. Data belongs to this browser profile, is not synchronised, and can be removed through browser site-data settings.
