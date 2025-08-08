const sanitizeInput = (input) => {
    if (typeof input === 'string') {
        return input.replace(/[<>$]/g, ''); // basic remove of HTML tags and injection characters
    }
    return input;
};

module.exports = sanitizeInput; 