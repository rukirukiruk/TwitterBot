require('dotenv').config()
const Twit = require('twit')
const T = new Twit({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  timeout_ms: 60 * 1000,
  strictSSL: true,
});
const RETWEET_CONFIG = {
  hashtags: ['#exampleHashtag1', '#exampleHashtag2'],
  result_type: 'recent',
  count: 10,
  retweet_rate: 60000,
};
const retweet = () => {
  const query = RETWEET_CONFIG.hashtags.join(' OR ');
  T.get('search/tweets', { q: query, count: RETWEET_CONFIG.count, result_type: RETWEET_CONFIG.result_type }, function(err, data) {
    if (!err) {
      const tweets = data.statuses;
      tweets.forEach(tweet => {
        T.post('statuses/retweet/:id', { id: tweet.id_str }, function(err, response) {
          if (response) {
            console.log('Retweeted: ', `https://twitter.com/${response.user.screen_name}/status/${response.id_str}`);
          }
          if (err) {
            console.error('Retweet Error: ', err);
          }
        });
      });
    } else {
      console.error('Search Error: ', err);
    }
  });
}
const startRetweeting = () => {
  retweet();
  setInterval(retweet, RETWEET_CONFIG.retweet_rate);
}
startRetweeting();