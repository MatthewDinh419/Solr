const axios = require("axios");
const Discord = require("discord.js");

/*
    SendMessage Function
    Sends the embedded message of the variants

    Args
    message: discord message object
    productTitle: the title of the shopify product
    items: contains the size and variant of the product
    massVars: contains only the variants of the product for simple copy and pasting
*/
function SendMessage(message, productTitle, items, massVars) {
  const giveawayMsg = new Discord.MessageEmbed()
    .setColor("#0099ff")
    .setTitle(productTitle)
    .addFields(
      {
        name: "Variants",
        value: items,
      },
      {
        name: "Mass Variants",
        value: massVars,
      }
    );
  message.channel.send(giveawayMsg);
}

module.exports = {
  name: "build",
  description: "generates a list of variants for a shopify product",
  execute: (message, args) => {
    const link = args[0] + ".json";
    let items = []; // contains the size and variant of the product
    let massVars = []; // contains only the variants of the product
    axios // get the shopify json response of the product
      .get(link)
      .then((response) => {
        response.data["product"]["variants"].forEach((variant) => {
          // append the specified data to the arrays
          items.push(variant["title"] + " - " + variant["id"]);
          massVars.push(variant["id"]);
        });
        SendMessage(
          message,
          response.data["product"]["title"],
          items,
          massVars
        );
      })
      .catch((err) => {
        console.log(err);
      });
  },
};
