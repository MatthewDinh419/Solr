module.exports = {
  name: "clear",
  description: "clear messages",
  execute: (message, args) => {
    const numWipe = args[0];
    message.channel.messages
      .fetch({ limit: numWipe })
      .then((messages) => {
        // Fetches the messages
        message.channel.bulkDelete(
          messages // Bulk deletes all messages that have been fetched and are not older than 14 days (due to the Discord API)
        );
      })
      .catch((err) => {
        message.channel.send(err);
      });
  },
};
