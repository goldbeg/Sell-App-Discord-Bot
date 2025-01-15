const { WebhookClient, EmbedBuilder } = require('discord.js');

class WebhookHandler {
    constructor() {
        this.purchaseWebhook = new WebhookClient({ 
            url: process.env.PURCHASE_WEBHOOK_URL 
        });
    }

    async sendPurchaseNotification(orderData) {
        const embed = new EmbedBuilder()
            .setTitle('🛍️ New Purchase')
            .setColor('#00ff00')
            .setTimestamp()
            .addFields(
                { name: 'Order ID', value: orderData.id, inline: true },
                { name: 'Product', value: orderData.product.name, inline: true },
                { name: 'Amount', value: `$${orderData.total}`, inline: true },
                { name: 'Customer', value: orderData.customer_email || 'Anonymous', inline: true },
                { name: 'Payment Method', value: orderData.gateway || 'N/A', inline: true },
                { name: 'Status', value: orderData.status, inline: true }
            );

        if (orderData.custom_fields) {
            embed.addFields({
                name: 'Custom Fields',
                value: Object.entries(orderData.custom_fields)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join('\n'),
                inline: false
            });
        }

        try {
            await this.purchaseWebhook.send({
                embeds: [embed],
                username: 'Purchase Notification'
            });
        } catch (error) {
            console.error('Failed to send webhook:', error);
        }
    }
}

module.exports = new WebhookHandler();