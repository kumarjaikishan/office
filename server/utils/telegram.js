const axios = require('axios');

const BOT_TOKEN = '8249382565:AAF9OUUBcUdOhzfKvuCW5bsM2lKIFwMwg7U';
const CHAT_ID = '-4814061293'; // Your group chat ID

/**
 * Sends a Telegram message using the bot.
 * @param {string} message - The message text to send
 */


// https://api.telegram.org/bot8249382565:AAF9OUUBcUdOhzfKvuCW5bsM2lKIFwMwg7U/getChatAdministrators?chat_id=-4814061293

async function sendTelegramMessage(message) {
  try {
    const response = await axios.post(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        chat_id: CHAT_ID,
        text: message
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    // console.log('✅ Message sent:', response.data);
  } catch (error) {
    console.error('❌ Error sending message:', error.response?.data || error.message);
  }
}

module.exports = { sendTelegramMessage };

