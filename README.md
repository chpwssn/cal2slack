# cal2slack

A script to process events from an ics format calendar URL and listing events into slack.

1. Copy `.env.example` to `.env`
2. Enter your calendar URL
3. Enter your Slack webhook URL
4. `node main.js` when you want the events evaluated

# Output

When there are events currently happening, example run on Nov 11:

    Current Vacation Events:
    Person On Vacation    Sun Nov 4, 8 PM - Wed Nov 21, 8 PM
    Another User - Kansai    Sat Nov 10, 12 AM - Sun Nov 18, 11:59 PM

When there are no events:

    No Vacation events right now.
