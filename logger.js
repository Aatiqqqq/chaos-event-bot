module.exports = async function log(client, title, message) {
  const { LOG_CHANNEL_ID } = require("./config");
  const channel = await client.channels.fetch(LOG_CHANNEL_ID);
  channel.send(`📜 **${title}**\n${message}`);
};
