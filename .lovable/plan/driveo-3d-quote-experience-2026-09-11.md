# Driveo 3D quote experience

## What will be built
- Replace every external quote link with an elegant on-page quote form.
- Collect name, email, phone, service, pickup, destination, journey date/time, passenger count, preferred vehicle, and notes.
- Save each request privately so no enquiry is lost.
- Format the details into a concise text summary for both notifications.
- Send the summary to `driveolimited@gmail.com` and WhatsApp `+44 330 043 0976` when submitted.
- Show clear sending, success, partial-success, and error states without leaving the page.

## 3D visual direction
- Add a cinematic layered vehicle stage with cursor-responsive depth on desktop.
- Add subtle glass, metallic reflections, perspective movement, and scroll depth to fleet and quote areas.
- Keep the copper-on-charcoal identity restrained and professional.
- Disable motion for visitors who prefer reduced motion, and use lightweight static depth on mobile.

## Delivery setup
- Use private server-side handling so delivery credentials never reach the browser.
- Store quote requests in Lovable Cloud with public submission access but no public reading or editing.
- Deliver WhatsApp alerts through the connected Twilio account.
- Activate email delivery after a sender domain is added and verified; until then, requests remain safely stored and the form clearly reports the pending email channel.

## Needed from you
- Twilio sender: open **Twilio Console → Messaging → Senders → WhatsApp Senders**, then copy the approved WhatsApp number. If you are using the Sandbox, open **Messaging → Try it out → Send a WhatsApp message** and copy the sandbox sender instead.
- Email domain: buy or use a domain you own, then complete the email-domain setup. The destination can still be `driveolimited@gmail.com`.

## Technical details
- Add a validated TanStack server function for submission and notification orchestration.
- Use the generated private server client for persistence and the Twilio connector gateway for WhatsApp delivery.
- Add abuse-resistant validation and a hidden bot-trap field.
- Add the branded app-email template and wire it to the fixed Driveo recipient once email setup is available.
- Verify desktop and mobile layouts, form submission, stored data, and delivery error handling.
