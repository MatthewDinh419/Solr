module.exports = {
  name: "ban",
  description: "Bans a member from the discord guild",
  execute: (message, args) => {
    if (!message.member.hasPermission("BAN_MEMBERS")) {
      message.channel.send("You do not have ban permissions.");
      return;
    }
    if (args.length < 1) {
      message.channel.send("Invalid arguments.");
      return;
    }
    let banMember = args[0];
    const reason = args[1];

    // Parses mention into a user id
    banMember = banMember.slice(2, -1);
    if (banMember.startsWith("!")) {
      banMember = banMember.slice(1);
    }

    try {
      message.guild.members.ban(banMember, { reason });
    } catch (err) {
      return message.channel.send(`Failed to ban: ${err}`);
    }
  },
};
