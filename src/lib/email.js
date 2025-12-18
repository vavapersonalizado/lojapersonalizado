// Email utility for sending order notifications
// Using Resend API (https://resend.com)

export async function sendOrderNotification(orderData) {
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || 'projetovanava@gmail.com';

    if (!RESEND_API_KEY) {
        console.warn('RESEND_API_KEY not configured. Email notification skipped.');
        return { success: false, error: 'API key not configured' };
    }

    try {
        // Format order items for email
        const itemsList = orderData.items.map(item =>
            `- ${item.name} (x${item.quantity}) - ¥${item.price * item.quantity}${item.customization ? ' [Personalizado]' : ''}`
        ).join('\n');

        // Customer info
        const customerInfo = orderData.user
            ? `Nome: ${orderData.user.name}\nEmail: ${orderData.user.email}\nTelefone: ${orderData.user.phone || 'N/A'}`
            : `Nome: ${orderData.guestName}\nEmail: ${orderData.guestEmail}\nTelefone: ${orderData.guestPhone}`;

        // Address info (if available)
        let addressInfo = '';
        if (orderData.guestAddress && orderData.guestAddress.prefecture) {
            const addr = orderData.guestAddress;
            addressInfo = `\n\nEndereço de Entrega:\n${addr.postalCode ? `CEP: ${addr.postalCode}\n` : ''}${addr.prefecture ? `Província: ${addr.prefecture}\n` : ''}${addr.city ? `Cidade: ${addr.city}\n` : ''}${addr.town ? `Bairro: ${addr.town}\n` : ''}${addr.street ? `Rua: ${addr.street}\n` : ''}${addr.building ? `Edifício: ${addr.building}` : ''}`;
        }

        const emailBody = `
🎉 NOVO PEDIDO RECEBIDO!

Pedido #${orderData.id.slice(-8).toUpperCase()}
Data: ${new Date(orderData.createdAt).toLocaleString('pt-BR', { timeZone: 'Asia/Tokyo' })}

📦 ITENS DO PEDIDO:
${itemsList}

💰 VALORES:
Subtotal: ¥${orderData.total}
${orderData.discount > 0 ? `Desconto: -¥${orderData.discount}` : ''}
${orderData.couponCode ? `Cupom: ${orderData.couponCode}` : ''}
TOTAL: ¥${orderData.finalTotal}

👤 INFORMAÇÕES DO CLIENTE:
${customerInfo}${addressInfo}

🔗 Ver pedido completo no admin:
${process.env.NEXTAUTH_URL || 'https://projetovava.vercel.app'}/admin/orders

---
Este é um email automático de notificação de pedido.
        `.trim();

        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'Vanessa Yachiro Personalizados <pedidos@projetovava.com>',
                to: [NOTIFICATION_EMAIL],
                subject: `🛍️ Novo Pedido #${orderData.id.slice(-8).toUpperCase()} - ¥${orderData.finalTotal}`,
                text: emailBody
            })
        });

        const result = await response.json();

        if (!response.ok) {
            console.error('Resend API error:', result);
            return { success: false, error: result.message || 'Failed to send email' };
        }

        console.log('Order notification email sent:', result.id);
        return { success: true, emailId: result.id };

    } catch (error) {
        console.error('Error sending order notification email:', error);
        return { success: false, error: error.message };
    }
}
