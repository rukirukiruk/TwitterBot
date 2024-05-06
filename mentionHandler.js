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

mentionsStream.on('tweet', processIncomingTweet);

function processIncomingTweet(incomingTweet) {
  const tweetContent = incomingTweet.text.toLowerCase(); // Case-insensitive comparison
  const userHandle = `@${incomingTweet.user.screen_name}`;
  const greeting = dynamicGreeting();
  
  let replyMessage = generateReplyMessage(userHandle, tweetContent, greeting);

  if(replyMessage) {
    sendReply(replyMessage);
  }
}

const generateReplyMessage = (userHandle, tweetContent, greeting) => {
  if (tweetContent.includes('thanks')) {
    return `${userHandle} You're welcome! 😊`;
  }
  if (tweetContent.includes('how are you')) {
    return `${userHandle} I'm just a bot, but thank you for asking! ${greeting} How can I assist you today?`;
  }
  if (tweetContent.includes('tell me a joke')) {
    return `${userHandle} Why don't scientists trust atoms? Because they make up everything! 😂`;
  }
  if (tweetContent.includes('help')) {
    return `${userHandle} Sure, how can I help you? Feel free to ask me anything.`;
  }
  
  // Default message if none of the conditions above are met
  return `${userHandle} ${greeting} Thank you for the mention! If you need anything, just say the word.`;
};

const dynamicGreeting = () => {
  const hour = new Date().getHours();
  return hour < 12 ? "Good morning!" : hour < 18 ? "Good afternoon!" : "Good evening!";
};

const sendReply = (replyText) => {
  twitterBotClient.post('statuses/update', { status: replyText }, (error, sentTweet) => {
    if (error) {
      console.error(`Error while posting tweet: ${error}`);
      // Optionally, implement a retry mechanism or logging for analysis
    } else {
      console.log(`Successfully posted tweet: ${sentTweet.text}`);
    }
  });
};