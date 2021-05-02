const Discord = require("discord.js");

/*
    SendMessage Function
    Sends the embedded message of the catchall variations

    Args
    message: discord message object
    genCatchalls: the array containing all the generated catchalls
    authorId: discord snowflake id of the user
*/
function SendMessage(message, randRoll) {
  const giveawayMsg = new Discord.MessageEmbed().setColor("#0099ff").addFields({
    name: "Rolled a",
    value: randRoll,
  });
  message.channel.send(giveawayMsg);
}

module.exports = {
  name: "roll",
  description: "Rolls a random number up to a specified max",
  execute: (message, args) => {
    const maxRoll = args[0];
    randRoll = Math.floor(Math.random() * (maxRoll - 1) + 1);
    SendMessage(message, randRoll);
  },
};
