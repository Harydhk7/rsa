Version 1.0.0.1 May 30, 2025

1. commenting gps validations
2. login api changes
3. upload button kml validations
4. users list show id and email

Version 1.0.0.2 june 4, 2025

1. critical and general section ui issue fix
2. table height in DA table
3. required in red color
4. auditor => audit => completed tab =>Report rejected/completed/accepted
5. reports => show the details of audit on click
6. floating map => show the kml file in the modal

version 1.0.0.3 june 5, 2025
1. general_observation api changes, integrated
2. general_observation_merged api changes, integrated
3. editable issue textbox in DA and delete in report in DA - validation done
4. chainage field - validation only if data is available
5. issues dropdowns - api call after the "data" is updated
6. accept only images in survey uploads
7. comments in audit acceptance is optional now

version 1.0.0.4 june 9, 2025
1. graph/ dashboard -typo in api integration
2. onload, load india details in the dashboard
3. dashboard map boundaries/ color code marker status with legends
4. user list bugs/ alignments
5. dashboard map/ui issues in Auditor/ coers login

version 1.0.0.5 june 10, 2025
1. floatingmap, api integration
2. typo in audit popup
3. location capture api integration - audio/video/image support

version 1.0.0.6 june 11, 2025
1. auto gps in gps fields in survey
2. gps in hfaz, creation, list and edit
3. hfaz  popup close button
4. questionary close button in popup
5. dashboard , zoom to geo point if avl or show india
6. DA tab => new issue/ new suggestion - api integration typo fix

version 1.0.0.7 june 12, 2025
1. users table max height fix
2. loader symbol => centered it
3. images in report , issue fixed
4. dashboard map => fix
5. responsiveness in dashboard
6. save edit type button fix to 1 time in Questionary

version 1.0.0.8 june 12, 2025
1. reports reduced margin
2. critical/genral observation bug fix in DA
3. close button in audit acceptance popup
4. hfaz/start-end images in all report related pages
5. reports -> show issues/suggestions (array as strings)

version 1.0.0.9 june 17, 2025
1. graph api fix
2. auditor login => filter in dashboard

version 1.0.0.10 june 18, 2025
1. "file_name" in DA updated
2. style issues
3. hfaz view => close
4. retrieval/suggestion page scroll up after load
5. chainage "+" to "." in answer edit api

version 1.0.0.11 june 23, 2025
1. disabled remove in suggestion DA
2. logo change/ show stretch name in report
3. legends in dashboard
4. report comments/reply api integration

version 1.0.0.12 june 23, 2025
1. In Audit , ui change to Accordion
2. way point , added current location
3. headers - fix for non coers

version 1.0.0.13 june 25
1. waypoints, show the details on map click
2. rsilt id display in suggestion-mapping
3. overflowing email id, handled as title in  users page

version 1.0.0.14 june 26/27th
1. reports => header/ footer/ table alignments
2. suggestion mapping added => bookid
3. toc in reports page and also the font size in reports

version 1.0.0.15 june 30
1. hfaz if no data, dont show in report
2. profile pic if given, will be displayed or icon will be displayed
3. audit_section payload updated
4. auditor dashboard, kms showing
5. LA show the inprogress audits

july 1
1. view audit data based on the type of audit
2. checking master_table and master table also combo box and combo_box in Survey, so that ui comes.
3. checkbox selection in survey added.
4. custom loader and alert msg in survey pages done
5. waypoints current location added
6. profile pic size same as other icons
7. 'kms' in the length for popups

version 1.0.0.16 july 2
1. suggestion mapping image issue fix
2. project title in survey pages
3. map, added extra details in popup

july 3
1. survey image back and froth => null the image
2. if api fails, page will reload
3. audit_start api value is stored in LocalStorage and used back
4. retrieval id for non dependence dropdown in Issues
5. suggestion mapping, autocomplete dropdown instead of dropdown

version 1.0.0.17 july 21
1. report - front page ui support
2. suggestion mapping - show sugg id
3. non editable gps in data analysis
4. i icon in survey
5. 3 level retrieval id fix
6. rsa to rssa - label changes
7. report -> title -> data

version 1.0.0.18 Aug 19
1. Save Section label change
2. Suggestions/ Issues can be updated in DA and reflected in Report as Bullet points
3. report alignment
4. old reports - huge images - handled in BE script. Those Audit Report will work from this build
5. OTP Login 
6. Duplicate entry UI Done and hidden now

version 1.0.0.19 Aug 22
1. reports for 9 audits

version 1.0.0.20 Aug 26
1. Permanent solution for PDF , works in Dev not in RBG Build
2. master table, removed image as mandatory field
3. Issues - word change in Landuse Category, Roadside Hazard Category,User Behaviour Category


version 1.0.0.21 Aug 29
1. build for two times loading report page fixed
2. scroll to 0,0 on load of report

version 1.0.0.22 Sep 3
1. Duplicate entry, from audit page, click on each section "All Entries" and choose an entry to prepopulate the survey page

version 1.0.0.23 Sep 4
1. Permanent PDF solution

version 1.0.0.24 Sep 9
AE ACL Done
1. Added AE in User List - user_list with filter "ae" not coming, for now hardcoded
2. Added AE in audit Assignment - no BE issue
3. AE interface must contain four distinct tabs - Dashboard, Audit, Meeting and Report - UI Done
4. In the data analysis page of AE , two extra column then auditor - Response (check box) and comment (Text Box) - Post Done, Get Yet to Integrate
5. "auditor_dashboard" api not coming data for AE, for not hardcoded

version 1.0.0.25 Sep 16
1. Print PDF - Critical Observation in Landscape Mode

version 1.0.0.26 Sep 18
1. AE - Dashboard and Reports Done

version 1.0.0.27 Sep 25
1.removed general and comments and added issues and category
2.disabled edit button for report submitted
3.webp to jpeg
4.added date/time in image canvas

version 1.0.0.28 sep 29
1. LA can create AE user

version 1.0.0.29 oct 3
1. Report Footer updated
2. Image download after survey , is commented

version 1.0.0.30 dec 8
1. audit planning includes audit type instead of stage

version 1.0.0.31 dec 11
1. labels changes
2. audit status label changes
3. audit planning error fixed
4. DA Page incresed suggestion size
5. Dashboard filter UI done
6. accordion in audit page => coers

version 1.0.0.32 dec 15
1. report tab similar for all ACL
2. api "dd_audit_name" integrated in Dashboard

version 1.0.0.33 dec 16
1. report tab - ui over. audit type not coming in API
2. dashboard legends updated for all logins

version 1.0.0.35 new acl fielduser
1	Add Field user in User List
2	Add user => add field user
3	Assign Audit => checkbox for fielduser
4	audit_assignment api add payload
5	Auditor=> Audit Tab => add condition if fielduser is not null then show if its completed
6	fielduser => Audit Tab => Remove DA
7	Set new set of ui for fielduser

version 1.0.0.35 Dec 17
1. field_user_dd updated in audit assignement
2. field_user_dashboard api integrated
3. audit id is not shown in report pdf. changed to audit_type_id which is the stretch name