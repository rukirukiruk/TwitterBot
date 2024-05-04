require('dotenv').config();
const Twit = require('twit');

const twitterBotClient = new Twit({
  consumer_key:         process.env.TWITTER_CONSUMER_KEY,
  consumer_secret:      process.env.TWITTER_CONSUMER_SECRET,
  access_token:         process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret:  process.env.TWITTER_ACCESS_TOKEN_SECRET,
  timeout_ms:           60 * 1000,  // HTTP request timeout to apply to all requests.
  strictSSL:            true,  // Require SSL certificates to be valid.
});

const mentionsStream = twitterBotClient.stream('statuses/filter', {track: '@myBotUsername'});

mentionsStream.on('tweet', function (incomingTweet) {
  const tweetContent = incomingTweet.text.toLowerCase(); // Making sure the comparison is case-insensitive
  const userHandle = incomingTweet.user.screen_name;

  // Dynamic response based on the current time of day
  const greeting = dynamicGreeting();

  if (tweetContent.includes('thanks')) {
    sendReply(`@${userHandle} You're welcome! 😊`);
  } else if (tweetContent.includes('how are you')) {
    sendReply(`@${userHandle} I'm just a bot, but thank you for asking! ${greeting} How can I assist you today?`);
  } else if (tweetContent.includes('tell me a joke')) {
    sendReply(`@${userHandle} Why don't scientists trust atoms? Because they make up everything! 😂`);
  } else if (tweetContent.includes('help')) {
    sendReply(`@${userHandle} Sure, how can I help you? Feel free to ask me anything.`);
  } else {
    sendReply(`@${userHandle} ${greeting} Thank you for the mention! If you need anything, just say the word.`);
  }
});

function dynamicGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) {
    return "Good morning!";
  } else if (hour < 18) {
    return "Good afternoon!";
  } else {
    return "Good evening!";
  }
}

function sendReply(replyText) {
    twitterBotClient.post('statuses/update', { status: replyText }, function(error, sentTweet, response) {
      if (error) {
        console.error(`Error while posting tweet: ${error}`);
      } else {
        console.log(`Successfully posted tweet: ${sentTweet.text}`);
      }
    });
}