require('dotenv').config();
const Twit = require('twit');

const twitterClient = new Twit({
  consumer_key:         process.env.API_KEY,
  consumer_secret:      process.env.API_SECRET_KEY,
  access_token:         process.env.ACCESS_TOKEN,
  access_token_secret:  process.env.ACCESS_TOKEN_SECRET,
});

let tweetsCache = new Map();

function sendTweet(tweetText) {
  const tweetCooldownPeriod = 3600000; // 1 hour
  
  if (tweetsCache.has(tweetText) && (Date.now() - tweetsCache.get(tweetText) < tweetCooldownPeriod)) {
    console.log('Tweet was already sent recently:', tweetText);
    return;
  }

  twitterClient.post('statuses/update', { status: tweetText }, function(err, data, response) {
    if (err) {
      console.error('Error sending tweet:', err);
    } else {
      console.log('Successfully sent tweet:', data.text);
      // Store the tweet text with the current timestamp
      tweetsCache.set(tweetText, Date.now());
    }
  });
}

function clearOldCacheEntries() {
  const expiry = 3600000; // 1 hour
  const now = Date.now();
  
  tweetsCache.forEach((timestamp, tweet) => {
    if (now - timestamp > expiry) {
      tweetsCache.delete(tweet);
    }
  });
}

// Setup a routine to clear old cache entries every hour
setInterval(clearOldCacheEntries, 3600000);

module.exports = { twitterClient, sendTweet };