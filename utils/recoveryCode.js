const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const generateRecoveryCodes = async (count = 5) => {
    const codes = [];
    for (let i = 0; i < count; i++) {
        const rawCode = crypto.randomBytes(4).toString('hex'); // 8-char code
        const hashedCode = await bcrypt.hash(rawCode, 10);
        codes.push({ rawCode, hashedCode });
    }
    return codes;
}

module.exports = generateRecoveryCodes;