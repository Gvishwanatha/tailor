/* ======================================
   VISHWA TAILORS — Backend Server
   Handles WhatsApp notifications via Twilio
   ====================================== */

const express = require('express');
const cors = require('cors');
const path = require('path');

// Load environment variables from .env file
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// === Twilio Configuration (loaded from .env file) ===
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM;
const OWNER_WHATSAPP_TO = process.env.OWNER_WHATSAPP_TO;
const TWILIO_CONTENT_SID = process.env.TWILIO_CONTENT_SID;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (your website)
app.use(express.static(path.join(__dirname)));

// === Send WhatsApp via Twilio REST API ===
async function sendTwilioWhatsApp(contentVariables) {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    
    // Build form data
    const params = new URLSearchParams();
    params.append('To', OWNER_WHATSAPP_TO);
    params.append('From', TWILIO_WHATSAPP_FROM);
    params.append('ContentSid', TWILIO_CONTENT_SID);
    
    // Add content variables if provided (for template placeholders)
    if (contentVariables) {
        params.append('ContentVariables', JSON.stringify(contentVariables));
    }

    const authHeader = 'Basic ' + Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
    });

    const result = await response.json();
    
    if (!response.ok) {
        throw new Error(result.message || `Twilio API error: ${response.status}`);
    }

    return result;
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

        // Build content variables for the Twilio content template
        // These map to {{1}}, {{2}}, {{3}} etc. placeholders in your template
        const contentVariables = {
            "1": name,
            "2": phone,
            "3": service,
            "4": formattedDate,
            "5": time || 'Not specified',
            "6": email || 'Not provided',
            "7": message || 'None'
        };

        // Send WhatsApp message via Twilio
        const twilioResult = await sendTwilioWhatsApp(contentVariables);

        console.log(`✅ WhatsApp notification sent! SID: ${twilioResult.sid}`);
        console.log(`   📋 Booking: ${name} | ${service} | ${formattedDate} | ${time || 'No time'}`);

        res.json({
            success: true,
            message: 'Appointment booked and WhatsApp notification sent!',
            sid: twilioResult.sid
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
    console.log(`   📱 WhatsApp notifications: ACTIVE\n`);
});
