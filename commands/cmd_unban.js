module.exports = {
  name: "unban",
  description: "Unbans a member from the server",
  execute: (message, args) => {
    if (!message.member.hasPermission("BAN_MEMBERS")) {
      message.channel.send("You do not have ban permissions.");
      return;
    }
    let banMember = args[0];

    try {
      message.guild.members.unban(banMember);
    } catch (err) {
      return message.channel.send(`Failed to ban: ${err}`);
    }
  },
};
