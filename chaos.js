const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const log = require("./logger");
const { CHAOS_CHANNEL_ID } = require("./config");

// ================= IN-MEMORY COINS =================
const coins = new Map();

function getCoins(id) {
  return coins.get(id) || 0;
}

function addCoins(id, amount) {
  coins.set(id, getCoins(id) + amount);
}

function removeCoins(id, amount) {
  if (getCoins(id) < amount) return false;
  coins.set(id, getCoins(id) - amount);
  return true;
}

// ================= SHOP =================
const SHOP = {
  boost: { name: "⚡ XP Boost", price: 100 },
  vip: { name: "👑 VIP Pass", price: 250 },
  mystery: { name: "🎁 Mystery Box", price: 150 }
};

// ================= HANDLER =================
module.exports = async function chaosHandler(client, interaction) {
  // ---------- SLASH COMMANDS ----------
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === "chaos") {
      if (interaction.channelId !== CHAOS_CHANNEL_ID) {
        return interaction.reply({
          content: "❌ Use this only in #chaos-events",
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
        content: "😈 **CHAOS PANEL**",
        components: [row]
      });

      return log(client, "CHAOS PANEL", `${interaction.user.tag} opened panel`);
    }

    if (interaction.commandName === "profile") {
      return interaction.reply({
        ephemeral: true,
        content:
          `🪙 **CHAOS PROFILE**\n\n` +
          `👤 ${interaction.user.username}\n` +
          `💰 Coins: **${getCoins(interaction.user.id)}**`
      });
    }

    if (interaction.commandName === "shop") {
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("buy_boost")
          .setLabel("⚡ XP Boost (100)")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("buy_vip")
          .setLabel("👑 VIP Pass (250)")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId("buy_mystery")
          .setLabel("🎁 Mystery Box (150)")
          .setStyle(ButtonStyle.Secondary)
      );

      return interaction.reply({
        ephemeral: true,
        content:
          `🛒 **CHAOS SHOP**\n💰 Coins: **${getCoins(interaction.user.id)}**`,
        components: [row]
      });
    }
  }

// ---------- BUTTONS ----------
if (!interaction.isButton()) return;

await interaction.deferUpdate();

const userId = interaction.user.id;

// 🎁 LUCKY DROP
if (interaction.customId === "chaos_lucky") {
  const reward = Math.floor(Math.random() * 50) + 10;
  addCoins(userId, reward);

  await interaction.followUp({
    content: `🎁 **Lucky Drop!** You won **${reward} chaos coins** 💰`,
    ephemeral: true
  });

  return log(client, "LUCKY DROP", `${interaction.user.tag} +${reward}`);
}

// ⚔️ DUEL
if (interaction.customId === "chaos_duel") {
  const win = Math.random() > 0.5;

  if (win) {
    const reward = Math.floor(Math.random() * 40) + 20;
    addCoins(userId, reward);

    await interaction.followUp({
      content: `⚔️ **You won the duel!** Earned **${reward} chaos coins** 🏆`,
      ephemeral: true
    });

    return log(client, "DUEL WIN", `${interaction.user.tag} +${reward}`);
  } else {
    await interaction.followUp({
      content: `⚔️ **You lost the duel!** No coins this time 😈`,
      ephemeral: true
    });

    return log(client, "DUEL LOSS", `${interaction.user.tag} lost duel`);
  }
}

// 🎯 GUESS GAME
if (interaction.customId === "chaos_guess") {
  const correct = Math.floor(Math.random() * 5) + 1;
  const userGuess = Math.floor(Math.random() * 5) + 1;

  if (userGuess === correct) {
    const reward = 60;
    addCoins(userId, reward);

    await interaction.followUp({
      content:
        `🎯 **Perfect Guess!**\n` +
        `Your guess: ${userGuess}\n` +
        `Correct: ${correct}\n` +
        `💰 You earned **${reward} chaos coins**`,
      ephemeral: true
    });

    return log(client, "GUESS WIN", `${interaction.user.tag} +${reward}`);
  } else {
    await interaction.followUp({
      content:
        `🎯 **Wrong Guess!**\n` +
        `Your guess: ${userGuess}\n` +
        `Correct: ${correct}\n` +
        `❌ No coins this time`,
      ephemeral: true
    });

    return log(client, "GUESS FAIL", `${interaction.user.tag} failed guess`);
  }
}
  