require('dotenv').config();

const Twit = require('twit');

const twitterClient = new Twit({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  timeout_ms: 60 * 1000,
  strictSSL: true,
});

const retweetConfig = {
  searchHashtags: ['#exampleHashtag1', '#exampleHashtag2'],
  searchResultType: 'recent',
  searchCount: 10,
  retweetInterval: 60000,
};

const retweetBasedOnHashtags = () => {
  const searchTerm = retweetConfig.searchHashtags.join(' OR ');
  
  twitterClient.get('search/tweets', { q: searchTerm, count: retweetConfig.searchCount, result_type: retweetConfig.searchResultType }, function(err, data) {
    if (!err) {
      const foundTweets = data.statuses;
      
      foundTweets.forEach(tweet => {
        twitterClient.post('statuses/retweet/:id', { id: tweet.id_str }, (retweetErr, response) => {
          if (response) {
            console.log('Retweeted:', `https://twitter.com/${response.user.screen_name}/status/${response.id_str}`);
          }
          if (retweetErr) {
            console.error('Retweet Failed:', retweetErr);
          }
        });
      });
    } else {
      console.error('Search Failed:', err);
    }
  });
};

const initializeRetweetProcess = () => {
  retweetBasedOnHashtags();
  setInterval(retweetBasedOnHashtags, retweetConfig.retweetInterval);
};

initializeRetweetProcess();