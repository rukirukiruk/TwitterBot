require('dotenv').config();
const Twit = require('twit');

const twitterClient = new Twit({
  consumer_key: process.env.API_KEY,
  consumer_secret: process.env.API_SECRET_KEY,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
});

let tweetsCache = new Map();

function sendTweet(tweetText) {
  const tweetCooldownPeriod = 3600000; 
  if (tweetsCache.has(tweetText) && (Date.now() - tweetsCache.get(tweetText)) < tweetCooldownPeriod) {
    console.log('Tweet was already sent recently:', tweetText);
    return;
  }

  twitterClient.post('statuses/update', { status: tweetText }, (err, data) => {
    if (err) {
      console.error('Error sending tweet:', err);
    } else {
      console.log('Successfully sent tweet:', data.text);
      tweetsCache.set(tweetText, Date.now());
    }
  });
}

function clearOldCacheEntries() {
  const expiry = 3600000;
  const now = Date.now();
  tweetsCache.forEach((timestamp, tweet) => {
    if (now - timestamp > expiry) {
      tweetsCache.delete(tweet);
    }
  });
}

setInterval(clearOldCacheEntries, 3600000);

module.exports = { twitterClient, sendTweet };