// utils/internalToken.js
const jwt = require('jsonwebtoken');

function generateInternalServiceToken() {
    return jwt.sign(
        { service: 'main-backend', role: 'internal' }, // payload
        process.env.JWT_Handshake,
        { expiresIn: '2m' } // short expiry
    );
}

module.exports = { generateInternalServiceToken };
