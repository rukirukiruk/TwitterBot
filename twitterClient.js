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
  if (tweetsCache.has(tweetText) && (Date.now() - tweetsCache.get(tweetText)) < 3600000) {
    console.log('Tweet was already sent recently:', tweetText);
    return;
  }

  twitterClient.post('statuses/update', { status: tweetText }, (err, data, response) => {
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
  tweetsCache.forEach((value, key) => {
    if (now - value > expiry) {
      tweetsCache.delete(key);
    }
  });
}

setInterval(clearOldCacheEntries, 3600000);

module.exports = { twitterClient, sendTweet };