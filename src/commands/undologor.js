const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('undologor')
    .setDescription('Restores saved roles and removes punishment role')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to restore')
        .setRequired(true)
    ),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const target = interaction.options.getMember('user');
    const guild = interaction.guild;
    const backupPath = `./data/${guild.id}-${target.id}.json`;
    const roleId = process.env.PUNISH_ROLE_ID;

    if (!fs.existsSync(backupPath)) {
      return interaction.editReply('No saved roles found for that user.');
    }

    const savedRoles = JSON.parse(fs.readFileSync(backupPath));

    try {
      await target.roles.remove(roleId);
      await target.roles.add(savedRoles);
      fs.unlinkSync(backupPath);
      await interaction.editReply(`Restored roles to ${target.user.tag} and removed punishment role.`);
    } catch (err) {
      console.error(err);
      await interaction.editReply('Failed to restore roles.');
    }
  }
};
