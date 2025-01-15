const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { hasPermission } = require('../utils/permissions');
const { fetchData } = require('../utils/api');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('orders')
        .setDescription('View order information')
        .addSubcommand(subcommand =>
            subcommand
                .setName('check')
                .setDescription('Check orders')
                .addStringOption(option =>
                    option
                        .setName('type')
                        .setDescription('How to check orders')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Recent Orders', value: 'recent' },
                            { name: 'Order ID', value: 'id' }
                        ))
                .addStringOption(option =>
                    option
                        .setName('orderid')
                        .setDescription('Order ID (only needed if checking specific order)')
                        .setRequired(false))),

    async execute(interaction) {
        if (!hasPermission(interaction.member, 'orders')) {
            return interaction.reply({
                content: 'You do not have permission to use this command.',
                ephemeral: true
            });
        }

        await interaction.deferReply({ ephemeral: true });
        const checkType = interaction.options.getString('type');
        const orderId = interaction.options.getString('orderid');

        try {
            if (checkType === 'recent') {
                // Fetch recent orders
                const { data: orders } = await fetchData('/orders?limit=5');
                
                const embed = new EmbedBuilder()
                    .setTitle('Recent Orders')
                    .setColor('#0099ff')
                    .setDescription('Here are the 5 most recent orders. Use `/orders check type:id orderid:<ID>` to view details of a specific order.');

                // Create select menu options
                const orderOptions = orders.map(order => ({
                    label: `Order #${order.id}`,
                    description: `${order.product.name} - $${order.total}`,
                    value: order.id
                }));

                const selectMenu = new ActionRowBuilder()
                    .addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId('order_select')
                            .setPlaceholder('Select an order to view details')
                            .addOptions(orderOptions)
                    );

                orders.forEach(order => {
                    embed.addFields({
                        name: `Order #${order.id}`,
                        value: `Product: ${order.product.name}\nTotal: $${order.total}\nStatus: ${order.status}\nDate: ${new Date(order.created_at).toLocaleString()}\n`,
                        inline: false
                    });
                });

                await interaction.editReply({
                    embeds: [embed],
                    components: [selectMenu],
                    ephemeral: true
                });

            } else if (checkType === 'id' && orderId) {
                // Fetch specific order
                const { data: order } = await fetchData(`/orders/${orderId}`);
                
                const embed = new EmbedBuilder()
                    .setTitle(`Order Details - #${order.id}`)
                    .setColor('#0099ff')
                    .addFields(
                        { name: 'Customer Email', value: order.customer_email || 'N/A', inline: true },
                        { name: 'Status', value: order.status, inline: true },
                        { name: 'Total', value: `$${order.total}`, inline: true },
                        { name: 'Created At', value: new Date(order.created_at).toLocaleString(), inline: true },
                        { name: 'Product', value: order.product.name, inline: true },
                        { name: 'Gateway', value: order.gateway || 'N/A', inline: true }
                    );

                if (order.custom_fields) {
                    embed.addFields({
                        name: 'Custom Fields',
                        value: Object.entries(order.custom_fields)
                            .map(([key, value]) => `${key}: ${value}`)
                            .join('\n') || 'None',
                        inline: false
                    });
                }

                await interaction.editReply({
                    embeds: [embed],
                    ephemeral: true
                });

            } else {
                await interaction.editReply({
                    content: 'Please provide an Order ID when using the ID check option.',
                    ephemeral: true
                });
            }
        } catch (error) {
            console.error(error);
            await interaction.editReply({
                content: 'An error occurred while fetching the order information.',
                ephemeral: true
            });
        }
    },

    // Handle select menu interactions
    async handleSelectMenu(interaction) {
        if (interaction.customId === 'order_select') {
            await interaction.deferUpdate();
            const orderId = interaction.values[0];

            try {
                const { data: order } = await fetchData(`/orders/${orderId}`);
                
                const embed = new EmbedBuilder()
                    .setTitle(`Order Details - #${order.id}`)
                    .setColor('#0099ff')
                    .addFields(
                        { name: 'Customer Email', value: order.customer_email || 'N/A', inline: true },
                        { name: 'Status', value: order.status, inline: true },
                        { name: 'Total', value: `$${order.total}`, inline: true },
                        { name: 'Created At', value: new Date(order.created_at).toLocaleString(), inline: true },
                        { name: 'Product', value: order.product.name, inline: true },
                        { name: 'Gateway', value: order.gateway || 'N/A', inline: true }
                    );

                if (order.custom_fields) {
                    embed.addFields({
                        name: 'Custom Fields',
                        value: Object.entries(order.custom_fields)
                            .map(([key, value]) => `${key}: ${value}`)
                            .join('\n') || 'None',
                        inline: false
                    });
                }

                await interaction.editReply({
                    embeds: [embed],
                    components: [], // Remove the select menu after selection
                    ephemeral: true
                });
            } catch (error) {
                console.error(error);
                await interaction.editReply({
                    content: 'An error occurred while fetching the order details.',
                    ephemeral: true
                });
            }
        }
    }
};