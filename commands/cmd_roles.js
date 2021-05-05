const Discord = require("discord.js");

/*
  WipeMessages function
  Will delete messages up to numWipe times

  Args
  numWipe: number of recent messages to wipe
*/
async function WipeMessages(message, numWipe) {
  return new Promise(async function (resolve, reject) {
    await message.channel.messages
      .fetch({ limit: numWipe })
      .then((messages) => {
        // Fetches the messages
        message.channel.bulkDelete(
          messages // Bulk deletes all messages that have been fetched and are not older than 14 days (due to the Discord API)
        );
        resolve();
      })
      .catch((err) => {
        reject(err);
      });
  });
}

/*
  CollectReactions Function
  Collector for reactions onto the previous message

  args
  message: discord message object
  emoji: the unicode emoji text
  role: the string text of the role which will be converted to the role object once a reaction has been collected
*/
function CollectReactions(message, emoji, role) {
  const filter = (reaction) => {
    return reaction.emoji.name === emoji;
  };
  const collector = message.createReactionCollector(filter, { dispose: true });
  collector.on("collect", (reaction, user) => {
    // if user added reaction, add corresponding role
    let guildMember = message.guild.members.cache.get(user["id"]);
    guildMember.roles.add(role);
  });
  collector.on("remove", (reaction, user) => {
    // if user removed reaction, remove corresponding role
    let guildMember = message.guild.members.cache.get(user["id"]);
    guildMember.roles.remove(role);
  });
}
// https://getemoji.com/
module.exports = {
  name: "role",
  description:
    "Setups up reactions so that when clicked on, it will add a role to the user based off the reaction",
  execute: (message, args) => {
    if (args.length != 2) {
      message.channel.send("Invalid arguments.");
      return;
    }
    const emoji = args[0];
    const attachRole = args[1];
    let foundRole = message.guild.roles.cache.find(
      (role) => role.name === attachRole
    );
    WipeMessages(message, 1)
      .then(() => {
        message.channel.messages.fetch({ limit: 1 }).then((messages) => {
          let lastMessage = messages.first();
          lastMessage.react(emoji).then(() => {
            CollectReactions(lastMessage, emoji, foundRole);
          });
        });
      })
      .catch((err) => {
        message.channel.send(`Something went wrong ${err}`);
      });
  },
};
