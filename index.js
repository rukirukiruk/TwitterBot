require('dotenv').config();
const Twit = require('twit');
const cron = require('node-cron');

const twitterBotClient = new Twit({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  timeout_ms: 60 * 1000, // 1 minute timeout
});

function publishTweet() {
  const message = 'Hello, world!';
  twitterBotClient.post('statuses/update', { status: message }, (error, tweet) => {
    if (error) {
      console.error('Error posting tweet:', error);
    } else {
      console.log('Successfully posted:', tweet.text);
    }
  });
}

cron.schedule('0 * * * *', function scheduledTweetPosting() {
  console.log('Executing scheduled tweet posting every hour');
  publishTweet();
});

const mentionsStream = twitterBotClient.stream('statuses/filter', { track: '@yourusername' });

mentionsStream
  .on('tweet', handleMention)
  .on('error', handleStreamError)
  .on('disconnect', handleStreamDisconnect)
  .on('limit', handleStreamLimit)
  .on('reconnect', handleStreamReconnection)
  .on('error', handleStreamError); 

function handleMention(tweet) {
  console.log('Mentioned by:', tweet.user.screen_name);
}

function handleStreamError(error) {
  console.error('Stream encountered an error:', error);
}

function handleStreamDisconnect(message) {
  console.error('Stream disconnected:', message);
}

function handleStreamLimit(message) {
  console.error('Stream hit limit:', message);
}

function handleStreamReconnection(request, response, reconnectInterval) {
  console.log('Attempting reconnection in ' + reconnectInterval + 'ms...');
}

function retweetBasedOnHashtag(hashtag) {
  twitterBotClient.get('search/tweets', { q: hashtag, count: 10 }, (error, result) => {
    if (error) {
      console.error('Error during hashtag search:', error);
      return;
    }

    if (result.statuses && result.statuses.length) {
      const tweetToRetweet = getRandomTweet(result.statuses);
      retweet(tweetToRetweet);
    } else {
      console.log('No tweets found for hashtag:', hashtag);
    }
  });
}

function getRandomTweet(tweets) {
  return tweets[Math.floor(Math.random() * tweets.length)];
}

function retweet(tweet) {
  if (!tweet) return;

  twitterBotClient.post('statuses/retweet/:id', { id: tweet.id_str }, (error) => {
    if (error) {
      console.error('Error during retweet:', error);
    } else {
      console.log(`Successfully retweeted: ${tweet.text}`);
    }
  });
}

cron.schedule('*/30 * * * *', function findAndRetweetHashtag() {
  console.log('Initiating hashtag search for retweeting.');
  retweetBasedOnHashtag('#yourhashtag');
});