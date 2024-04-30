require('dotenv').config();
const Twit = require('twit');

const T = new Twit({
  consumer_key:         process.env.TWITTER_CONSUMER_KEY,
  consumer_secret:      process.env.TWITTER_CONSUMER_SECRET,
  access_token:         process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret:  process.env.TWITTER_ACCESS_TOKEN_SECRET,
  timeout_ms:           60 * 1000,  
  strictSSL:            true,       
});

const stream = T.stream('statuses/filter', {track: '@myBotUsername'});

stream.on('tweet', function (tweet) {
  const mentionText = tweet.text;
  const userHandle = tweet.user.screen_name;

  if (mentionText.includes('thanks')) {
    sendTweet(`@${userHandle} You're welcome! 😊`);
  } else if (mentionText.includes('how are you')) {
    sendTweet(`@${userHandle} I'm just a bot, but thank you for asking! How can I assist you today?`);
  } else if (mentionText.includes('help')) {
    sendTweet(`@${userHandle} Sure, how can I help you? Feel free to ask me anything.`);
  } else {
    sendTweet(`@${userHandle} Thank you for the mention! If you need anything, just say the word.`);
  }
});

function sendTweet(status) {
    T.post('statuses/update', { status: status }, function(err, data, response) {
      if (err) {
        console.error(`Error sending tweet: ${err}`);
      } else {
        console.log(`Successfully sent tweet: ${data.text}`);
      }
    });
}