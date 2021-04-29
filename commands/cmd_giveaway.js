const Discord = require("discord.js");

let SendError = function (message, err) {
  message.channel.send("Something went wrong: " + err);
};

// function selects winners from reactions and returns the winners discord ids
function SelectWinners(message, winners, pool_size, num_winners, user_ids) {
  return new Promise(function (resolve, reject) {
    for (let i = 0; i < num_winners; i++) {
      winner_index = Math.floor(Math.random() * (pool_size - 1) + 1); // will return a number between 1 and max number of candidates. Don't want 0 because that's the bot id
      if (winner_index < 0 || winner_index > pool_size) {
        reject();
      }
      user = message.guild.members.cache.get(user_ids[winner_index]);
      winners.push("<@" + user_ids[winner_index] + ">");
    }
    resolve();
  });
}
// function collects entries via reactions
function FinishGiveaway(message, timeout, num_winners) {
  const filter = (reaction) => {
    return reaction.emoji.name === "🎉";
  };
  return new Promise(function (resolve, reject) {
    const collector = message.createReactionCollector(filter, {
      time: timeout,
    });
    collector.on("end", (collected) => {
      let user_reaction = collected.array()[0];
      let user_ids = Array.from(user_reaction.users.cache.keys());
      let winners = [];
      SelectWinners(message, winners, collected.size, num_winners, user_ids)
        .then(() => {
          resolve(winners);
        })
        .catch((err) => {
          reject(err);
        });
    });
  });
}
async function GiveawayMessage(message, giveawayObj) {
  let time_val = giveawayObj[1].split(" ")[0];
  let time_incr = giveawayObj[1].split(" ")[1];
  let time_ms;
  const giveaway_msg = new Discord.MessageEmbed()
    .setColor("#0099ff")
    .setTitle(giveawayObj[0])
    .setDescription("React to enter")
    .addFields(
      {
        name: "Time remaining",
        value: time_val + " " + time_incr,
      },
      { name: "Number of winners", value: giveawayObj[2] }
    )
    .setTimestamp();
  if (time_incr === "sec") {
    time_ms = time_val * 1000;
  } else if (time_incr === "min") {
    time_ms = time_val * 60000;
  } else if (time_incr === "hours") {
    time_ms = time_val * 3600000;
  } else if (time_incr === "days") {
    time_ms = time_val * 86400000;
  } else {
    time_ms = 0;
  }
  let sent = await message.channel.send(giveaway_msg);
  message.channel.messages.fetch(sent.id).then((message) => {
    message.react("🎉");
    FinishGiveaway(message, time_ms, giveawayObj[2])
      .then((winners) => {
        message.channel.send(
          `Congrats ${winners} on winning ${giveawayObj[0]}`
        );
      })
      .catch((err) => {
        SendError(message, err);
      });
  });
}
async function WipeMessages(message, num_wipe) {
  await message.channel.messages
    .fetch({ limit: num_wipe })
    .then((messages) => {
      // Fetches the messages
      message.channel.bulkDelete(
        messages // Bulk deletes all messages that have been fetched and are not older than 14 days (due to the Discord API)
      );
    })
    .catch((err) => {
      SendError(message, err);
    });
}
function GetResponse(message, filter, giveawayObj, question) {
  return new Promise(function (resolve, reject) {
    message.channel.send(question).then(() => {
      message.channel
        .awaitMessages(filter, { max: 1, time: 10000, errors: ["time"] })
        .then((collected) => {
          response = collected.first().content;
          if (response == "cancel") {
            giveawayObj = [];
            reject();
          } else {
            giveawayObj.push(response);
            resolve();
          }
        })
        .catch((collected) => {
          giveawayObj = [];
          reject();
        });
    });
  });
}
module.exports = {
  name: "giveaway",
  description: "Giveaway command",
  execute: (message, args) => {
    const filter1 = (m) => m.author.id === message.author.id; // only filter is checking that the person who created the giveaway is the person who enters the details
    const filter2 = (m) => {
      // filter to make sure that the time response is correct
      if (m.content.toLowerCase().split(" ").length != 2) {
        // check that theres only the time and the time incr sent
        return false;
      }
      split_obj = m.content.toLowerCase().split(" ");
      if (
        //make sure that the time incr is a valid time incr
        split_obj[1] != "sec" &&
        split_obj[1] != "min" &&
        split_obj[1] != "hours" &&
        split_obj[1] != "days"
      ) {
        return false;
      }
      return true;
    };
    var giveawayObj = []; // contains the users responses
    GetResponse(message, filter1, giveawayObj, "What do you want to giveaway?")
      .then(() => {
        GetResponse(
          message,
          filter2,
          giveawayObj,
          "How long should the giveaway be?"
        )
          .then(() => {
            GetResponse(message, filter1, giveawayObj, "How many winners?")
              .then(() => {
                WipeMessages(message, 7);
                GiveawayMessage(message, giveawayObj);
              })
              .catch((err) => {
                WipeMessages(message, 6);
                SendError(message, err);
              });
          })
          .catch((err) => {
            WipeMessages(message, 4);
            SendError(message, err);
          });
      })
      .catch((err) => {
        WipeMessages(message, 2);
        SendError(message, err);
      });
  },
};
