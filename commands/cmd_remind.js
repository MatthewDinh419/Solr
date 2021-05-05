const Discord = require("discord.js");

/*
    SendMessage Function
    Sends the embedded message of the reminder

    Args
    message: discord message object
    event: event to be reminded of
*/
function SendMessage(message, event) {
  message.channel.send(`Reminding <@${message.author["id"]}> for ${event}`);
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
