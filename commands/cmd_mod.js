module.exports = {
  name: "mod",
  description: "Adds or removes words from banned list",
  execute: (message, bannedWords, args) => {
    if (args.length < 2) {
      message.channel.send("Invalid arguments.");
      return;
    }
    action = args[0];
    const numWipe = 1;
    message.channel.messages // wipe the user message so that their catchall doesn't stay in the channel
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
    if (action != "add" && action != "remove") {
      message.channel.send("Invalid arguments.");
      return;
    }
    args.slice(1).forEach((ele) => {
      // go through each argument to add/remove the word
      ele = ele.toLowerCase();
      if (action === "add") {
        bannedWords.push(ele);
      } else if (action === "remove") {
        bannedWords.splice(bannedWords.indexOf(ele));
      }
    });
  },
};
