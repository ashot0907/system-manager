const pam = require('authenticate-pam');

pam.authenticate('User33', '12345678', (err) => {
    if (err) {
        console.error('Authentication failed:', err);
    } else {
        console.log('Authentication succeeded');
    }
});
