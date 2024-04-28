require('dotenv').config();
const config = {
    twitter: {
        apiKey: process.env.TWITTER_API_KEY,
        apiSecretKey: process.env.TWITTER_API_SECRET_KEY,
        accessToken: process.env.TWITTER_ACCESS_TOKEN,
        accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET
    },
    cron: {
        schedule: process.env.CRON_SCHEDULE || '0 * * * *'
    },
    hashtags: process.env.HASHTAGS ? process.env.HASHTAGS.split(',') : ['javascript', 'nodejs']
};
module.exports = config;