const {
  Client,
  GatewayIntentBits,
  REST,
  Routes
} = require("discord.js");

const chaosHandler = require("./chaos");
const TOKEN = process.env.TOKEN;
const CLIENT_ID = "1455664767363715293";

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once("ready", async () => {
  console.log(`🤖 Chaos Bot online as ${client.user.tag}`);

  const rest = new REST({ version: "10" }).setToken(TOKEN);

  await rest.put(Routes.applicationCommands(CLIENT_ID), {
    body: [
      {
        name: "chaos",
        description: "Open chaos control panel"
      }
    ]
  });

  console.log("✅ Slash command /chaos registered");
});

client.on("interactionCreate", async interaction => {
  chaosHandler(client, interaction);
});

client.login(TOKEN);
