const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('logor')
    .setDescription('Removes all roles and assigns punishment role')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to punish')
        .setRequired(true)
    ),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const target = interaction.options.getMember('user');
    const roleId = process.env.PUNISH_ROLE_ID;
    const guild = interaction.guild;

    if (!target) return interaction.editReply('Could not find that user.');

    const backupPath = `./data/${guild.id}-${target.id}.json`;
    const rolesToRemove = target.roles.cache
      .filter(role => role.id !== guild.id && role.id !== roleId)
      .map(role => role.id);

    fs.writeFileSync(backupPath, JSON.stringify(rolesToRemove));

    try {
      await target.roles.remove(rolesToRemove);
      await target.roles.add(roleId);
      await interaction.editReply(`Removed all roles and assigned punishment role to ${target.user.tag}`);
    } catch (err) {
      console.error(err);
      await interaction.editReply('❌ Failed to update roles. Check bot permissions.');
    }
  }
};
