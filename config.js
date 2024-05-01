require('dotenv').config();
const winston = require('winston'); // Logging library

// Logger Configuration
const loggerConfig = {
    transports: [
        new winston.transports.Console({
            level: 'info', // Consider 'debug' for in-depth logs
            format: winston.format.combine(
                winston.format.timestamp({
                   format: 'MMM-DD-YYYY HH:mm:ss'
                }),
                winston.format.align(),
                // Custom log format
                winston.format.printf(info => `${info.level}: ${[info.timestamp]}: ${info.message}`),
            )
        }),
        // Potential file logging can be added here
    ]
};

const logger = winston.createLogger(loggerConfig);

try {
    logger.info('Starting application setup');

    // App Configuration Object
    const appConfig = {
        twitter: {
            apiKey: process.env.TWITTER_API_KEY,
            apiSecret: process.env.TWITTER_API_SECRET_KEY,
            accessToken: process.env.TWITTER_ACCESS_TOKEN,
            accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET
        },
        cron: {
            // CRON schedule from env or every hour
            schedule: process.env.CRON_SCHEDULE || '0 * * * *'
        },
        // Split hashtags or default to JavaScript related if unrealized
        hashtags: process.env.HASHTAGS ? process.env.HASHTAGS.split(',') : ['javascript', 'nodejs']
    };

    logger.info('App setup successful');

    module.exports = appConfig;
} catch (error) {
    logger.error('Error during application setup', error);
}