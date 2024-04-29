const cron = require('node-cron');
const fs = require('fs');
const dotenv = require('dotenv');
const { TwitterApi } = require('twitter-api-v2');

dotenv.config();

const twitterClient = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET_KEY,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

const readTweetsToSchedule = () => {
    try {
        const data = fs.readFileSync('./scheduled_tweets.json', 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading scheduled tweets file:', error);
        return [];
    }
};

const scheduleTweets = () => {
    const tweets = readTweetsToSchedule();
    
    tweets.forEach(tweet => {
        const { time, content } = tweet;
        
        cron.schedule(time, async () => {
            try {
                const response = await twitterClient.v1.tweet(content);
                console.log('Tweet posted:', response);
            } catch (error) {
                console.error('Failed to post tweet:', error);
            }
        }, {
            scheduled: true,
            timezone: "America/New_York"
        });
    });
};

scheduleTweets();

module.exports = {
    scheduleTweets
};