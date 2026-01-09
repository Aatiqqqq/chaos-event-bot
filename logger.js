module.exports = async function log(client, title, message) {
  const { LOG_CHANNEL_ID } = require("./config");

  try {
    const channel = await client.channels.fetch(LOG_CHANNEL_ID);
    channel.send(
      `📜 **${title}**\n${message}\n<t:${Math.floor(Date.now() / 1000)}:R>`
    );
  } catch (err) {
    console.error("Logger error:", err);
  }
};
