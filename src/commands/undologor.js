const fs = require('fs');
module.exports = {
  data: { name: 'undologor', description: 'Restore saved roles and remove punishment', options: [{ name: 'user', type: 6, required: true }] },
  async execute(interaction) {
    const target = interaction.options.getMember('user');
    const guild = interaction.guild;
    const ks = `./data/${guild.id}-${target.id}.json`;
    if (!fs.existsSync(ks)) return interaction.reply(`No saved roles for ${target}.`);
    const saved = JSON.parse(fs.readFileSync(ks));
    await target.roles.remove(process.env.PUNISH_ROLE_ID);
    await target.roles.add(saved);
    fs.unlinkSync(ks);
    await interaction.reply(`Restored roles for ${target}.`);
  }
};
