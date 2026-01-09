const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const fs = require("fs");
const log = require("./logger");
const { CHAOS_CHANNEL_ID } = require("./config");

// ================= STORAGE =================
const DATA_DIR = "./data";
const COIN_FILE = "./data/chaosCoins.json";

// Ensure folder + file exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

if (!fs.existsSync(COIN_FILE)) {
  fs.writeFileSync(COIN_FILE, JSON.stringify({}, null, 2));
}

// Load coins
let coins = JSON.parse(fs.readFileSync(COIN_FILE, "utf8"));

function saveCoins() {
  fs.writeFileSync(COIN_FILE, JSON.stringify(coins, null, 2));
}

function getCoins(id) {
  return coins[id] || 0;
}

function addCoins(id, amount) {
  coins[id] = getCoins(id) + amount;
  saveCoins();
}

function removeCoins(id, amount) {
  if (getCoins(id) < amount) return false;
  coins[id] -= amount;
  saveCoins();
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
    // /chaos
    if (interaction.commandName === "chaos") {
      if (interaction.channelId !== CHAOS_CHANNEL_ID) {
        return interaction.reply({
          content: "❌ Use this command only in **#chaos-events**",
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
        content: "😈 **CHAOS PANEL**\nEarn chaos coins:",
        components: [row]
      });

      return log(
        client,
        "CHAOS PANEL",
        `${interaction.user.tag} opened chaos panel`
      );
    }

    // /profile
    if (interaction.commandName === "profile") {
      return interaction.reply({
        ephemeral: true,
        content:
          `🪙 **CHAOS PROFILE**\n\n` +
          `👤 ${interaction.user.username}\n` +
          `💰 Coins: **${getCoins(interaction.user.id)}**`
      });
    }

    // /shop
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
          `🛒 **CHAOS SHOP**\n\n` +
          `💰 Your coins: **${getCoins(interaction.user.id)}**`,
        components: [row]
      });
    }
  }

  // ---------- BUTTONS ----------
 // ---------- BUTTONS ----------
if (interaction.isButton()) {
  await interaction.deferReply(); // 🔥 VERY IMPORTANT

  const userId = interaction.user.id;

  // ===== EARN COINS =====
  let reward = 0;
  let action = "";

  if (interaction.customId === "chaos_lucky") {
    reward = Math.floor(Math.random() * 50) + 10;
    action = "Lucky Drop 🎁";
  }

  if (interaction.customId === "chaos_duel") {
    reward = Math.floor(Math.random() * 40) + 20;
    action = "Duel ⚔️";
  }

  if (interaction.customId === "chaos_guess") {
    reward = Math.floor(Math.random() * 30) + 5;
    action = "Guess 🎯";
  }

  if (reward > 0) {
    addCoins(userId, reward);

    await interaction.editReply({
      content: `😈 ${interaction.user} won **${reward} chaos coins**!`
    });

    log(
      client,
      "COINS EARNED",
      `${interaction.user.tag} earned ${reward} coins (${action})`
    );
    return;
  }

  // ===== SHOP BUY =====
  const buyMap = {
    buy_boost: "boost",
    buy_vip: "vip",
    buy_mystery: "mystery"
  };

  const itemKey = buyMap[interaction.customId];
  if (!itemKey) {
    return interaction.editReply("❌ Unknown action.");
  }

  const item = SHOP[itemKey];

  if (!removeCoins(userId, item.price)) {
    return interaction.editReply("❌ Not enough chaos coins!");
  }

  await interaction.editReply(
    `✅ ${interaction.user} bought **${item.name}** for **${item.price} coins**`
  );

  log(
    client,
    "SHOP PURCHASE",
    `${interaction.user.tag} bought ${item.name} (${item.price})`
  );
}
