const Discord = require("discord.js");

/*
    SendMessage Function
    Sends the embedded message of the catchall variations

    Args
    message: discord message object
    genCatchalls: the array containing all the generated catchalls
    authorId: discord snowflake id of the user
*/
function SendMessage(message, event) {
  const giveawayMsg = new Discord.MessageEmbed().setColor("#0099ff").addFields({
    name: "Reminding you for",
    value: event,
  });
  message.channel.send(giveawayMsg);
}

module.exports = {
  name: "remind",
  description: "Reminds you for an event after a specified time.",
  execute: (message, args) => {
    if (args.length != 3) {
      message.channel.send(
        "Invalid arguments. Check documentation for correct usage (!help)."
      );
      return;
    }
    const event = args[0];
    const timeVal = args[1];
    const timeIncr = args[2];
    let timeMs;
    // Convert the time that the user chose to ms
    if (timeIncr === "sec") {
      timeMs = timeVal * 1000;
    } else if (timeIncr === "min") {
      timeMs = timeVal * 60000;
    } else if (timeIncr === "hours") {
      timeMs = timeVal * 3600000;
    } else if (timeIncr === "days") {
      timeMs = timeVal * 86400000;
    } else {
      message.channel.send("Invalid arguments. Try again.");
      return;
    }
    message.channel.send(
      `Will remind you for ${event} in ${timeVal} ${timeIncr}`
    );
    setTimeout(() => {
      SendMessage(message, event);
    }, timeMs);
  },
};
