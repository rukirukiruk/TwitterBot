const cron = require('node-cron');
const fs = require('fs').promises; // Use fs promises for non-blocking I/O
const { TwitterApi } = require('twitter-api-v2');

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const twitterClient = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET_KEY,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

// Custom log function for standardized console output and potential future logging strategies
const log = (message, isError = false) => {
    const timestamp = new Date().toISOString();
    if (isError) {
        console.error(`[${timestamp}] ERROR: ${message}`);
    } else {
        console.log(`[${timestamp}] ${message}`);
    }
};

const readTweetsToSchedule = async () => {
    try {
        const data = await fs.readFile('./scheduled_tweets.json', 'utf8');
        return JSON.parse(data);
    } catch (error) {
        log('Error reading scheduled tweets file. Ensure the file exists and it is in correct JSON format: ' + error.message, true);
        return [];
    }
};

const scheduleTweets = async () => {
    const tweets = await readTweetsToSchedule();
    
    tweets.forEach(tweet => {
        const { time, content } = tweet;

        if (!cron.validate(time)) {
            log(`Invalid cron time format for tweet: "${content}". Please review it.`, true);
            return;
        }

        if (!content) {
            log(`Missing content for tweet scheduled at ${time}. Skipping.`, true);
            return;
        }

        try {
            cron.schedule(time, async () => {
                try {
                    const response = await twitterClient.v1.tweet(content);
                    log('Tweet posted: ' + JSON.stringify(response));
                } catch (error) {
                    log('Failed to post tweet: ' + error.message, true);
                }
            }, {
                scheduled: true,
                timezone: "America/New_York"
            });
        } catch (error) {
            log(`Error scheduling tweet "${content}": ` + error.message, true);
        }
    });
};

const autoRespondToMentions = async () => {
    const replyText = "Thanks for mentioning us! How can we help you today?"; // Customize this message
    let sinceId;

    try {
        const mentions = await twitterClient.v2.mentions({
            since_id: sinceId,
            max_results: 5 // Adjust as needed
        });

        mentions.data.forEach(async (mention) => {
            try {
                await twitterClient.v2.reply(replyText, mention.id);
                log(`Replied to mention ${mention.id}`);
            } catch (error) {
                log(`Failed to reply to mention ${mention.id}: ` + error.message, true);
            }
        });

        sinceId = mentions.meta.newest_id;
    } catch (error) {
        log('Failed to fetch mentions: ' + error.message, true);
    }

    // Reschedule this task to run, say, every minute
    setTimeout(autoRespondToMentions, 60 * 1000);
};

// Initiate scheduled activities
scheduleTweets();
autoRespondToMentions();

module.exports = {
    scheduleTweets,
    autoRespondToMentions
};