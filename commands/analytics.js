const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { fetchData } = require('../utils/api');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('analytics')
        .setDescription('View detailed analytics')
        .addStringOption(option =>
            option.setName('period')
                .setDescription('Time period')
                .setRequired(true)
                .addChoices(
                    { name: 'Today', value: 'today' },
                    { name: 'Week', value: 'week' },
                    { name: 'Month', value: 'month' },
                    { name: 'Year', value: 'year' }
                ))
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Type of analytics')
                .setRequired(true)
                .addChoices(
                    { name: 'Revenue', value: 'revenue' },
                    { name: 'Orders', value: 'orders' },
                    { name: 'Products', value: 'products' },
                    { name: 'Customers', value: 'customers' }
                )),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const period = interaction.options.getString('period');
        const type = interaction.options.getString('type');

        try {
            const { data: stats } = await fetchData(`/analytics/${period}/${type}`);
            
            const embed = new EmbedBuilder()
                .setTitle(`${type.charAt(0).toUpperCase() + type.slice(1)} Analytics - ${period}`)
                .setColor('#0099ff');

            // Add relevant fields based on type
            switch (type) {
                case 'revenue':
                    embed.addFields(
                        { name: 'Total Revenue', value: `$${stats.total}`, inline: true },
                        { name: 'Average Order Value', value: `$${stats.average}`, inline: true },
                        { name: 'Highest Order', value: `$${stats.highest}`, inline: true },
                        { name: 'Growth Rate', value: `${stats.growth_rate}%`, inline: true }
                    );
                    break;
                case 'orders':
                    embed.addFields(
                        { name: 'Total Orders', value: stats.total.toString(), inline: true },
                        { name: 'Successful Orders', value: stats.successful.toString(), inline: true },
                        { name: 'Failed Orders', value: stats.failed.toString(), inline: true },
                        { name: 'Conversion Rate', value: `${stats.conversion_rate}%`, inline: true }
                    );
                    break;
                // add more cases for products here 
            }

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            await interaction.editReply({
                content: 'Error fetching analytics.',
                ephemeral: true
            });
        }
    },
};