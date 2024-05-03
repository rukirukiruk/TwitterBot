require('dotenv').config();
const Twit = require('twit');
const cron = require('node-cron');

const twitterClient = new Twit({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
  timeout_ms: 60 * 1000,
});

function postTweet() {
  const tweetText = 'Hello, world!';
  twitterClient.post('statuses/update', { status: tweetText }, (err, data) => {
    if (err) {
      console.error('Error during tweet posting:', err);
    } else {
      console.log('Posted:', data.text);
    }
  });
}

cron.schedule('0 * * * *', postTweetEveryHour);

function postTweetEveryHour() {
  console.log('Running a task every hour');
  postTweet();
}

const stream = twitterClient.stream('statuses/filter', { track: '@yourusername' });

stream.on('tweet', onTweetMention)
      .on('error', onStreamError)
      .on('disconnect', onStreamDisconnect)
      .on('limit', onStreamLimit)
      .on('reconnect', onStreamReconnect)
      .on('error', onStreamError);

function onTweetMention(tweet) {
  console.log('Mentioned by:', tweet.user.screen_name);
}

function onStreamError(error) {
  console.error('Stream error:', error);
}

function onStreamDisconnect(disconnectMessage) {
  console.error('Stream disconnected:', disconnectMessage);
}

function onStreamLimit(limitMessage) {
  console.error('Limit reached:', limitMessage);
}

function onStreamReconnect(request, response, connectInterval) {
  console.log('Reconnecting in ' + connectInterval + 'ms...');
}

function retweetHashtag(hashtag) {
  twitterClient.get('search/tweets', { q: hashtag, count: 10 }, (err, data) => {
    if (err) {
      console.error('Search Error:', err);
      return;
    }

    if (data.statuses && data.statuses.length) {
      const randomTweet = selectRandomTweet(data.statuses);
      attemptRetweet(randomTweet);
    } else {
      console.log('No tweets found for hashtag:', hashtag);
    }
  });
}

function selectRandomTweet(tweets) {
  return tweets[Math.floor(Math.random() * tweets.length)];
}

function attemptRetweet(tweet) {
  if (!tweet) return;

  twitterClient.post('statuses/retweet/:id', { id: tweet.id_str }, (err, response) => {
    if (err) {
      console.error('Retweet Error:', err);
    } else {
      console.log(`Retweeted: ${tweet.text}`);
    }
  });
}

cron.schedule('*/30 * * * *', () => searchAndRetweet('#yourhashtag'));

function searchAndRetweet(hashtag) {
  console.log('Searching for hashtags to retweet.');
  retweetHashtag(hashtag);
}