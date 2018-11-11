require("dotenv").config();
let ical = require("ical");
let moment = require("moment-timezone");
let axios = require("axios");
require("twix");

const getEvents = async calUrl => {
  return new Promise((resolve, reject) => {
    ical.fromURL(calUrl, {}, (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  });
};

const eventToTwixRange = event => {
  const start = moment.tz(event.start.toString(), "UTC");
  let end = moment.tz(event.end.toString(), "UTC");
  if (end.hours() === 0 && end.minutes() === 0) {
    end = end.subtract(1, "minutes");
  }
  return start.twix(end);
};

const isTimeWithinEvent = (time, event) => {
  if (!event) return false;
  if (event.type !== "VEVENT") return false;
  const range = eventToTwixRange(event);
  return range.contains(time);
};

const sendMessageToSlack = async data => {
  const { SLACK_WEBHOOK } = process.env;
  if (!SLACK_WEBHOOK) {
    console.error("SLACK_WEBHOOK environment variable not defined");
    process.exit(-1);
  }
  return new Promise((resolve, reject) => {
    axios
      .post(process.env.SLACK_WEBHOOK, data)
      .then(response => {
        resolve(response);
      })
      .catch(error => {
        reject(error);
      });
  });
};

const processEvents = async () => {
  const { CAL_URL, SLACK_CHANNEL, SLACK_EMOJI } = process.env;
  if (!CAL_URL) {
    console.error("CAL_URL environment variable not defined");
    process.exit(-1);
  }
  const events = await getEvents(CAL_URL);
  const now = moment.now();
  const lines = [];
  for (const key in events) {
    const event = events[key];
    if (isTimeWithinEvent(now, event)) {
      const range = eventToTwixRange(event);
      const time = range.format({
        showDayOfWeek: true,
        lastNightEndsAt: "12:00"
      });
      lines.push(`${event.summary}    ${time}`);
    }
  }
  let message = "Current Vacation Events:\n" + lines.join("\n");
  if (lines.length === 0) {
    message = "No Vacation events right now.";
  }
  sendMessageToSlack({
    channel: SLACK_CHANNEL,
    text: message,
    username: "Vacation Bot",
    icon_emoji: SLACK_EMOJI
  });
};

processEvents();
