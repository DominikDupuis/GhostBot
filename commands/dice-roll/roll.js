const { SlashCommandBuilder } = require('discord.js');
const { rollDice } = require('../../lib/dice-roll');
const { createAsciiTable } = require('../../lib/create-ascii-table');
const { updateUserRoleAndNickname } = require('../../lib/update-user-role-and-nickname');
const { determineAsciiArt } = require('../../lib/determine-ascii-art');
const { determineOdds } = require('../../lib/determine-odds');
const { determineXp } = require('../../lib/determine-xp');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roll')
    .setDescription('Rolls X dice with Y sides.')
    .addIntegerOption((option) =>
      option.setName('rolls').setDescription('The number of dice to roll.').setRequired(true),
    )
    .addIntegerOption((option) =>
      option.setName('sides').setDescription('The number of sides on the dice.').setRequired(true),
    ),
  /**
   * Executes the roll command.
   * @param {import('discord.js').CommandInteraction} interaction - The interaction object.
   */
  async execute(interaction) {
    const { member } = interaction;
    const rolls = interaction.options.getInteger('rolls');
    const sides = interaction.options.getInteger('sides');
    const deadRole = interaction.guild.roles.cache.find((role) => role.name === 'Dead');

    const odds = determineOdds(rolls, sides);
    const xp = determineXp(odds);

    const rollResults = rollDice(rolls, sides);
    const tableString = createAsciiTable(rolls, sides, rollResults);

    const outcome = rollResults.includes(1) ? 'died' : 'neutral';
    const asciiMessage = determineAsciiArt(outcome, member, odds, deadRole, xp);

    await interaction.reply(
      asciiMessage.flavor +
        '\n' +
        '```' +
        '\n' +
        asciiMessage.art +
        '\n' +
        tableString +
        '```' +
        '\n' +
        asciiMessage.end,
    );

    await updateUserRoleAndNickname(member, outcome, deadRole, xp);
  },
};
