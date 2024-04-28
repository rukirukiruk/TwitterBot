require('dotenv').config();
const Twit = require('twit');
const cron = require('node-cron');

const T = new Twit({
  consumer_key:         process.env.CONSUMER_KEY,
  consumer_secret:      process.env.CONSUMER_SECRET,
  access_token:         process.env.ACCESS_TOKEN,
  access_token_secret:  process.env.ACCESS_TOKEN_SECRET,
  timeout_ms:           60 * 1000,  
});

function postTweet() {
  T.post('statuses/update', { status: 'Hello, world!' }, function(err, data, response) {
    if (err) {
      console.log('Error:', err);
    } else {
      console.log('Posted:', data.text);
    }
  });
}

cron.schedule('0 * * * *', () => {
  console.log('Running a task every hour');
  postTweet();
});

const stream = T.stream('statuses/filter', { track: '@yourusername' });

stream.on('tweet', function (tweet) {
  console.log('Mentioned by:', tweet.user.screen_name);
});

function retweetHashtag(hashtag) {
  T.get('search/tweets', { q: hashtag, count: 10 }, function(err, data, response) {
    if (!err) {
      let tweets = data.statuses;
      let randomTweet = tweets[Math.floor(Math.random() * tweets.length)];
      if (randomTweet) {
        T.post('statuses/retweet/:id', { id: randomTweet.id_str }, function(err, response) {
          if (err) {
            console.log('Retweet Error:', err);
          } else {
            console.log(`Retweeted: ${randomTweet.text}`);
          }
        });
      }
    } else {
      console.log('Search Error:', err);
    }
  });
}

cron.schedule('*/30 * * * *', () => {
  console.log('Searching for hashtags to retweet.');
  retweetHashtag('#yourhashtag');
});

stream.on('disconnect', function(disconnectMessage) {
  console.log('Stream disconnected:', disconnectMessage);
});

stream.on('limit', function(limitMessage) {
  console.log('Limit reached:', limitMessage);
});

stream.on('reconnect', function (request, response, connectInterval) {
  console.log('Reconnecting in ' + connectInterval + 'ms...');
});