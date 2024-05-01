require('dotenv').config();
const Twit = require('twit');

const twitterClient = new Twit({
  consumer_key:         process.env.TWITTER_CONSUMER_KEY,
  consumer_secret:      process.env.TWITTER_CONSUMER_SECRET,
  access_token:         process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret:  process.env.TWITTER_ACCESS_TOKEN_SECRET,
  timeout_ms:           60 * 1000,  
  strictSSL:            true,       
});

const mentionStream = twitterClient.stream('statuses/filter', {track: '@myBotUsername'});

mentionStream.on('tweet', function (tweetDetails) {
  const tweetText = tweetDetails.text;
  const username = tweetDetails.user.screen_name;

  if (tweetText.includes('thanks')) {
    postResponseTweet(`@${username} You're welcome! 😊`);
  } else if (tweetText.includes('how are you')) {
    postResponseTweet(`@${username} I'm just a bot, but thank you for asking! How can I assist you today?`);
  } else if (tweetText.includes('help')) {
    postResponseTweet(`@${username} Sure, how can I help you? Feel free to ask me anything.`);
  } else {
    postResponseTweet(`@${username} Thank you for the mention! If you need anything, just say the word.`);
  }
});

function postResponseTweet(responseText) {
    twitterClient.post('statuses/update', { status: responseText }, function(error, tweetData, response) {
      if (error) {
        console.error(`Error while sending tweet: ${error}`);
      } else {
        console.log(`Tweet sent successfully: ${tweetData.text}`);
      }
    });
}