const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const log = require("./logger");
const { CHAOS_CHANNEL_ID } = require("./config");

module.exports = async function chaosHandler(client, interaction) {
  // Slash command
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName !== "chaos") return;

    if (interaction.channelId !== CHAOS_CHANNEL_ID) {
      return interaction.reply({
        content: "❌ Use this command only in #chaos-events",
        ephemeral: true
      });
    }

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("chaos_lucky")
        .setLabel("🎁 Lucky Drop")
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId("chaos_duel")
        .setLabel("⚔️ Duel")
        .setStyle(ButtonStyle.Danger),

      new ButtonBuilder()
        .setCustomId("chaos_guess")
        .setLabel("🎯 Guess")
        .setStyle(ButtonStyle.Primary)
    );

    await interaction.reply({
      content: "😈 **CHAOS PANEL**\nChoose your fate:",
      components: [row]
    });

    log(
      client,
      "CHAOS PANEL OPENED",
      `${interaction.user.tag} opened chaos panel`
    );
  }

  // BUTTONS
  if (!interaction.isButton()) return;

  if (interaction.customId === "chaos_lucky") {
    const reward = Math.floor(Math.random() * 100) + 1;

    await interaction.reply({
      content: `🎁 ${interaction.user} won **${reward} chaos coins**!`
    });

    log(
      client,
      "LUCKY DROP",
      `${interaction.user.tag} won ${reward} coins`
    );
  }

  if (interaction.customId === "chaos_duel") {
    await interaction.reply({
      content: `⚔️ ${interaction.user} is looking for a duel...`
    });

    log(client, "DUEL STARTED", `${interaction.user.tag} started a duel`);
  }

  if (interaction.customId === "chaos_guess") {
    const num = Math.floor(Math.random() * 5) + 1;

    await interaction.reply({
      content: `🎯 Guess a number (1–5)\n🤫 Secret: **${num}**`
    });

    log(client, "GUESS GAME", `${interaction.user.tag} started guess game`);
  }
};
