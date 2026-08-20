/* ======================================
   VISHWA TAILORS — Backend Server
   Handles WhatsApp notifications via CallMeBot
   ====================================== */

const express = require('express');
const cors = require('cors');
const path = require('path');

// Load environment variables from .env file
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// === TextMeBot Configuration (loaded from .env file) ===
const TEXTMEBOT_PHONE = process.env.TEXTMEBOT_PHONE;       // Your WhatsApp number (e.g., +918660998149)
const TEXTMEBOT_API_KEY = process.env.TEXTMEBOT_API_KEY;   // Your TextMeBot API key

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (your website)
app.use(express.static(path.join(__dirname)));

// === Send WhatsApp via TextMeBot API ===
async function sendWhatsAppMessage(message) {
    const encodedMsg = encodeURIComponent(message);
    const url = `https://api.textmebot.com/send.php?recipient=${encodeURIComponent(TEXTMEBOT_PHONE)}&apikey=${TEXTMEBOT_API_KEY}&text=${encodedMsg}`;

    const response = await fetch(url);
    const text = await response.text();

    if (!response.ok || text.toLowerCase().includes('error')) {
        throw new Error(`TextMeBot error: ${text}`);
    }

    return text;
}

// === API Endpoint: Send WhatsApp notification ===
app.post('/api/book-appointment', async (req, res) => {
    try {
        const { name, phone, email, service, date, time, message } = req.body;

        // Validate required fields
        if (!name || !phone || !service || !date) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: name, phone, service, and date are required.'
            });
        }

        // Format the date nicely
        const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('en-IN', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });

        // Build the WhatsApp notification message with ALL booking details
        const whatsappMessage =
            `📋 *NEW APPOINTMENT BOOKING*\n` +
            `━━━━━━━━━━━━━━━━━━━\n\n` +
            `👤 *Name:* ${name}\n` +
            `📱 *Phone:* ${phone}\n` +
            `${email ? '📧 *Email:* ' + email + '\n' : ''}` +
            `🪡 *Service:* ${service}\n` +
            `📅 *Date:* ${formattedDate}\n` +
            `🕐 *Time:* ${time || 'Not specified'}\n` +
            `${message ? '📝 *Notes:* ' + message + '\n' : ''}\n` +
            `⏰ Booked at: ${new Date().toLocaleString('en-IN')}\n` +
            `━━━━━━━━━━━━━━━━━━━`;

        // Send WhatsApp message via CallMeBot
        const result = await sendWhatsAppMessage(whatsappMessage);

        console.log(`✅ WhatsApp notification sent!`);
        console.log(`   📋 Booking: ${name} | ${service} | ${formattedDate} | ${time || 'No time'}`);

        res.json({
            success: true,
            message: 'Appointment booked and WhatsApp notification sent!'
        });

    } catch (error) {
        console.error('❌ Failed to send WhatsApp notification:', error.message);

        // Still return success to the customer — the booking was received,
        // even if WhatsApp delivery failed
        res.json({
            success: true,
            message: 'Appointment booked! (WhatsApp notification may be delayed)',
            whatsappError: error.message
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`\n✂️  Vishwa Tailors server running at:`);
    console.log(`   🌐 Website:  http://localhost:${PORT}`);
    console.log(`   📡 API:      http://localhost:${PORT}/api/book-appointment`);
    console.log(`   📱 WhatsApp notifications: ${TEXTMEBOT_API_KEY ? 'ACTIVE' : '⚠️  Set TEXTMEBOT_API_KEY in .env'}\n`);
});
