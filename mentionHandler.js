require('dotenv').config();
const Twit = require('twit');

const twitterBotClient = new Twit({
  consumer_key:         process.env.TWITTER_CONSUMER_KEY,
  consumer_secret:      process.env.TWITTER_CONSUMER_SECRET,
  access_token:         process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret:  process.env.TWITTER_ACCESS_TOKEN_SECRET,
  timeout_ms:           60 * 1000,  // HTTP request timeout for all requests.
  strictSSL:            true,  // Require SSL certificates to be valid.
});

const mentionsStream = twitterBotClient.stream('statuses/filter', { track: '@myBotUsername' });

mentionsStream.on('tweet', (incomingTweet) => {
  const tweetContent = incomingTweet.text.toLowerCase(); // Case-insensitive comparison
  const userHandle = `@${incomingTweet.user.screen_name}`;
  const greeting = dynamicGreeting();
  
  let replyMessage = `${userHandle} ${greeting} Thank you for the mention! If you need anything, just say the word.`;

  if (tweetContent.includes('thanks')) {
    replyMessage = `${userHandle} You're welcome! 😊`;
  } else if (tweetContent.includes('how are you')) {
    replyMessage = `${userHandle} I'm just a bot, but thank you for asking! ${greeting} How can I assist you today?`;
  } else if (tweetContent.includes('tell me a joke')) {
    replyMessage = `${userHandle} Why don't scientists trust atoms? Because they make up everything! 😂`;
  } else if (tweetContent.includes('help')) {
    replyMessage = `${userHandle} Sure, how can I help you? Feel free to ask me anything.`;
  }
  
  sendReply(replyMessage);
});

const dynamicGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning!";
  if (hour < 18) return "Good afternoon!";
  return "Good evening!";
};

const sendReply = (replyText) => {
  twitterBotClient.post('statuses/update', { status: replyText }, (error, sentTweet, response) => {
    if (error) {
      console.error(`Error while posting tweet: ${error}`);
    } else {
      console.log(`Successfully posted tweet: ${sentTweet.text}`);
    }
  });
};