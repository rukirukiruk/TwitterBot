require('dotenv').config();
const Twit = require('twit');

const twitterClient = new Twit({
  consumer_key: process.env.API_KEY,
  consumer_secret: process.env.API_SECRET_KEY,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
});

function sendTweet(tweetText) {
  twitterClient.post('statuses/update', { status: tweetText }, (err, data, response) => {
    if (err) {
      console.error('Error sending tweet:', err);
    } else {
      console.log('Successfully sent tweet:', data.text);
    }
  });
}

module.exports = { twitterClient, sendTweet };