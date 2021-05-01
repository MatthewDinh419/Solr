const Discord = require("discord.js");

/*
  SendError Function
  Sends an error message to the user

  Args
  message: discord message object
  err: error object
*/
let SendError = function (message, customMessage = "", err) {
  if (customMessage == "") {
    message.channel.send("Something went wrong: " + err);
  } else {
    message.channel.send(customMessage);
  }
};

/*
  SelectWinners function
  Will randomly select a winner

  Args
  message: discord message object
  winners: array containing the winners' discord ids
  poolSize: total amount of candidates
  userIds: the discord ids of all the candidates
*/
function SelectWinners(message, winners, poolSize, numWinners, usersIds) {
  return new Promise(function (resolve, reject) {
    for (let i = 0; i < numWinners; i++) {
      winnerIndex = Math.floor(Math.random() * (poolSize - 1) + 1); // will return a number between 1 and max number of candidates. Don't want 0 because that's the bot id
      if (winnerIndex < 0 || winnerIndex > poolSize) {
        reject("Something went wrong indexing winners.");
      }
      user = message.guild.members.cache.get(usersIds[winnerIndex]);
      winners.push("<@" + usersIds[winnerIndex] + ">");
    }
    resolve();
  });
}
/*
  ReactionCollector Function
  Creates a collector for collecting reactions

  args
  message: discord message object
  timeout: the length of the giveaway
  numWinners: the number of winners
*/
function ReactionCollector(message, timeout, numWinners) {
  const filter = (reaction) => {
    return reaction.emoji.name === "🎉";
  };
  return new Promise(function (resolve, reject) {
    const collector = message.createReactionCollector(filter, {
      time: timeout,
    });
    collector.on("end", (collected) => {
      // Once the giveaway ends, we now have a collection of user reactions
      let userReaction = collected.array()[0];
      let usersIds = Array.from(userReaction.users.cache.keys());
      let winners = [];
      SelectWinners(message, winners, collected.size, numWinners, usersIds)
        .then(() => {
          resolve(winners);
        })
        .catch((err) => {
          reject(err);
        });
    });
  });
}

/*
  GiveawayMessage function
  The embedded giveaway message that is sent

  args
  message: discord message object
  giveawayObj: contains the user's responses
*/
async function GiveawayMessage(message, giveawayObj) {
  let timeVal = giveawayObj[1].split(" ")[0]; // contains the int value of the length of the giveaway
  let timeIncr = giveawayObj[1].split(" ")[1]; // sec, min, hour, day,
  let timeMs;
  const giveawayMsg = new Discord.MessageEmbed()
    .setColor("#0099ff")
    .setTitle(giveawayObj[0])
    .setDescription("React to enter")
    .addFields(
      {
        name: "Time remaining",
        value: timeVal + " " + timeIncr,
      },
      { name: "Number of winners", value: giveawayObj[2] }
    )
    .setTimestamp();
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
    timeMs = 0;
  }
  let sent = await message.channel.send(giveawayMsg);
  message.channel.messages.fetch(sent.id).then((message) => {
    message.react("🎉");
    ReactionCollector(message, timeMs, giveawayObj[2])
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

/*
  WipeMessages function
  Will delete messages up to numWipe times

  Args
  numWipe: number of recent messages to wipe
*/
async function WipeMessages(message, numWipe) {
  await message.channel.messages
    .fetch({ limit: numWipe })
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

/*
  GetResponse Function
  Sends question and parses the users response and stores it in giveawayObj

  Args
  message: discord message object
  filter: the function that is used to filter user messages
  giveawayObj: object containing users responses
  question: question to ask the user
*/
function GetResponse(message, filter, giveawayObj, question) {
  return new Promise(function (resolve, reject) {
    message.channel.send(question).then(() => {
      message.channel
        .awaitMessages(filter, { max: 1, time: 10000, errors: ["time"] })
        .then((collected) => {
          response = collected.first().content;
          if (response == "cancel") {
            giveawayObj = [];
            reject("Giveaway has been cancelled.");
          } else {
            giveawayObj.push(response);
            resolve();
          }
        })
        .catch((collected) => {
          giveawayObj = [];
          reject("Something went wrong getting response.");
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
      splitObj = m.content.toLowerCase().split(" ");
      if (
        //make sure that the time incr is a valid time incr
        splitObj[1] != "sec" &&
        splitObj[1] != "min" &&
        splitObj[1] != "hours" &&
        splitObj[1] != "days"
      ) {
        return false;
      }
      return true;
    };
    var giveawayObj = []; // contains the users responses
    GetResponse(message, filter1, giveawayObj, "What do you want to give away?")
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
            SendError(
              message,
              "Invalid time increment. Try creating the giveaway again.",
              err
            );
          });
      })
      .catch((err) => {
        WipeMessages(message, 2);
        SendError(message, err);
      });
  },
};
