const Discord = require("discord.js");

/*
  Common function arguments:

  -message
    discord.js message object which represents a message on discord
  -filter
    the filter that should be applied to the user's response
  -giveaway_obj
    object that containers the users responses
*/
/*
  Notes Function
  What custom notes should be added to the giveaway
*/
function Notes(message, filter, giveaway_obj) {
  return new Promise(function (resolve, reject) {
    message.channel.send("Any extra notes?").then(() => {
      message.channel
        .awaitMessages(filter, { max: 1, time: 30000, errors: ["time"] })
        .then((collected) => {
          response = collected.first().content;
          if (response == "cancel") {
            giveaway_obj = {};
            reject();
          } else {
            giveaway_obj.notes = response;
            resolve();
          }
        })
        .catch((collected) => {
          message.channel.send(
            "Something went wrong. Try creating the giveaway again"
          );
          giveaway_obj = {};
          reject();
        });
    });
  });
}
/*
  Time Function
  Function to handle how long the giveaway should last.
*/
function Time(message, filter, giveaway_obj) {
  return new Promise(function (resolve, reject) {
    message.channel
      .send("How long is the giveaway? (x sec, x min, x hours, x days)")
      .then(() => {
        message.channel
          .awaitMessages(filter, { max: 1, time: 30000, errors: ["time"] })
          .then((collected) => {
            response = collected.first().content;
            if (response == "cancel") {
              giveaway_obj = {};
              reject();
            } else {
              split_obj = response.split(" "); // should contain the int value of the amount of time and the string value of the time (sec, min, day, hours)
              if (split_obj.length != 2) {
                message.channel.send(
                  "Incorrect time format. Try creating the giveaway again."
                );
                giveaway_obj = {};
                reject();
              }
              if (
                split_obj[1] != "sec" &&
                split_obj[1] != "min" &&
                split_obj[1] != "hours" &&
                split_obj[1] != "days"
              ) {
                message.channel.send(
                  "Incorrect time format. Try creating the giveaway again."
                );
                giveaway_obj = {};
                reject();
              }
              giveaway_obj.time_val = split_obj[0];
              giveaway_obj.time_type = split_obj[1];
              resolve();
            }
          })
          .catch((collected) => {
            message.channel.send(
              "Something went wrong. Try creating the giveaway again"
            );
            giveaway_obj = {};
            reject();
          });
      });
  });
}
function Item(message, filter, giveaway_obj) {
  return new Promise(function (resolve, reject) {
    message.channel.send("What are you giving away?").then(() => {
      message.channel
        .awaitMessages(filter, { max: 1, time: 30000, errors: ["time"] })
        .then((collected) => {
          response = collected.first().content;
          if (response == "cancel") {
            giveaway_obj = {};
            reject();
          } else {
            giveaway_obj.item = response;
            resolve();
          }
        })
        .catch((collected) => {
          message.channel.send(
            "Something went wrong. Try creating the giveaway again"
          );
          giveaway_obj = {};
          reject();
        });
    });
  });
}
function GiveawayMessage(message, giveaway_obj) {
  const giveaway_msg = new Discord.MessageEmbed()
    .setColor("#0099ff")
    .setTitle(giveaway_obj.item)
    .setDescription("React to enter")
    .addFields(
      {
        name: "Time remaining",
        value: giveaway_obj.time_val + " " + giveaway_obj.time_type,
      },
      { name: "Notes", value: giveaway_obj.notes }
    )
    .setTimestamp();
  message.channel.send(giveaway_msg);
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
      console.log(err);
    });
}
module.exports = {
  name: "giveaway",
  description: "Giveaway command",
  execute: (message, args) => {
    const filter1 = (m) => m.author.id === message.author.id;
    var giveaway_obj = {};
    Item(message, filter1, giveaway_obj)
      .then(() => {
        WipeMessages(message, 3);
        Time(message, filter1, giveaway_obj)
          .then(() => {
            WipeMessages(message, 2);
            Notes(message, filter1, giveaway_obj)
              .then(() => {
                console.log(giveaway_obj);
                WipeMessages(message, 2);
                GiveawayMessage(message, giveaway_obj);
              })
              .catch(() => {
                console.log("error");
              });
          })
          .catch(() => {
            console.log("error");
          });
      })
      .catch(() => {
        console.log("error");
      });
  },
};
