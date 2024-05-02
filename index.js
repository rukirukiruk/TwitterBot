require('dotenv').config();
const Twit = require('twit');
const cron = require('node-cron');

const T = new Twit({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
  timeout_ms: 60 * 1000, // 60-second timeout
});

function postTweet() {
  T.post('statuses/update', { status: 'Hello, world!' }, function (err, data, response) {
    if (err) {
      console.error('Error during tweet posting:', err);
    } else {
      console.log('Posted:', data.text);
    }
  });
}

// Scheduled task every hour
cron.schedule('0 * * * *', () => {
  console.log('Running a task every hour');
  postTweet();
});

const stream = T.stream('statuses/filter', { track: '@yourusername' });

// Handling tweets where your bot is mentioned
stream.on('tweet', function (tweet) {
  console.log('Mentioned by:', tweet.user.screen_name);
})
.on('error', function (error) {
  console.error('Stream error:', error);
})
.on('disconnect', function (disconnectMessage) {
  console.error('Stream disconnected:', disconnectMessage);
})
.on('limit', function (limitMessage) {
  console.error('Limit reached:', limitMessage);
})
.on('reconnect', function (request, response, connectInterval) {
  console.log('Reconnecting in ' + connectInterval + 'ms...');
})
.on('error', function (error) {
  console.error('Stream error:', error);
});

function retweetHashtag(hashtag) {
  T.get('search/tweets', { q: hashtag, count: 10 }, function (err, data, response) {
    if (err) {
      console.error('Search Error:', err);
      return;
    } 

    if (data.statuses && data.statuses.length) {
      let tweets = data.statuses;
      // Selecting a random tweet
      let randomTweet = tweets[Math.floor(Math.random() * tweets.length)];
      if (randomTweet) {
        T.post('statuses/retweet/:id', { id: randomTweet.id_str }, function (err, response) {
          if (err) {
            console.error('Retweet Error:', err);
          } else {
            console.log(`Retweeted: ${randomTweet.text}`);
          }
        });
      }
    } else {
      console.log('No tweets found for hashtag:', hashtag);
    }
  });
}

// Searching and retweeting every 30 minutes for a specific hashtag
cron.schedule('*/30 * * * *', () => {
  console.log('Searching for hashtags to retweet.');
  retweetHashtag('#yourhashtag');
});