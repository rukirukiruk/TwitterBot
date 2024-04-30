require('dotenv').config();
const winston = require('winston'); // Add winston for logging

// Logger configuration
const logConfiguration = {
    'transports': [
        new winston.transports.Console({
            level: 'info', // Change to 'debug' for detailed logs
            format: winston.format.combine(
                winston.format.timestamp({
                   format: 'MMM-DD-YYYY HH:mm:ss'
               }),
                winston.format.align(),
                winston.format.printf(info => `${info.level}: ${[info.timestamp]}: ${info.message}`),
            )
        }),
        // File transport can be added for logging into a file
    ]
};

const logger = winston.createLogger(logConfiguration);

// Attempting to implement a simple logging and error handling example
try {
    // Example of using logger
    logger.info('Initializing application configuration');

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

    // Log configuration initialization success
    logger.info('Configuration initialized successfully');

    module.exports = config;
} catch (error) {
    logger.error('Failed to initialize application configuration', error);
}
