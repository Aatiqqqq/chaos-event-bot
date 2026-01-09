const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const fs = require("fs");
const path = require("path");
const log = require("./logger");
const { CHAOS_CHANNEL_ID } = require("./config");

// ================= STORAGE =================
const DATA_DIR = path.join(process.cwd(), "data");
const COIN_FILE = path.join(DATA_DIR, "chaosCoins.json");

// Ensure folder + file exist (ALWAYS safe)
function ensureStorage() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(COIN_FILE)) {
    fs.writeFileSync(COIN_FILE, JSON.stringify({}, null, 2));
  }
}

// Load coins safely
function loadCoins() {
  ensureStorage();
  return JSON.parse(fs.readFileSync(COIN_FILE, "utf8"));
}

// Save coins safely
function saveCoins(coins) {
  ensureStorage();
  fs.writeFileSync(COIN_FILE, JSON.stringify(coins, null, 2));
}

let coins = loadCoins();

function getCoins(id) {
  return coins[id] || 0;
}

function addCoins(id, amount) {
  coins[id] = getCoins(id) + amount;
  saveCoins(coins);
}

function removeCoins(id, amount) {
  if (getCoins(id) < amount) return false;
  coins[id] -= amount;
  saveCoins(coins);
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

  let reward = 0;
  let action = "";

  if (interaction.customId === "chaos_lucky") {
    reward = Math.floor(Math.random() * 50) + 10;
    action = "Lucky Drop";
  }

  if (interaction.customId === "chaos_duel") {
    reward = Math.floor(Math.random() * 40) + 20;
    action = "Duel";
  }

  if (interaction.customId === "chaos_guess") {
    reward = Math.floor(Math.random() * 30) + 5;
    action = "Guess";
  }

  if (reward > 0) {
    addCoins(userId, reward);

    await interaction.followUp({
      content: `😈 You won **${reward} chaos coins**!`,
      ephemeral: true
    });

    return log(
      client,
      "COINS EARNED",
      `${interaction.user.tag} +${reward} (${action})`
    );
  }

  const buyMap = {
    buy_boost: "boost",
    buy_vip: "vip",
    buy_mystery: "mystery"
  };

  const key = buyMap[interaction.customId];
  if (!key) return;

  const item = SHOP[key];

  if (!removeCoins(userId, item.price)) {
    return interaction.followUp({
      content: "❌ Not enough chaos coins!",
      ephemeral: true
    });
  }

  await interaction.followUp({
    content: `✅ You bought **${item.name}** for **${item.price} coins**`,
    ephemeral: true
  });

  log(
    client,
    "SHOP PURCHASE",
    `${interaction.user.tag} bought ${item.name}`
  );
};
