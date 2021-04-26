// Discord Client Setup
const Discord = require("discord.js");
const client = new Discord.Client();

const config = require("./config.json");
const token = config.token;
client.login(config["token"]);

// Dynamic Command Files Setup
const fs = require("fs");
client.commands = new Discord.Collection();
const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

// Command Handling
client.on("message", (message) => {
  prefix = "!solr";
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === "ping") {
    message.channel.send("Pong.");
  } else if (command === "giveaway") {
    client.commands.get("giveaway").execute(message, args);
  }
});