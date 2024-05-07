require('dotenv').config();

const Twit = require('twit');

const twitterClient = new Twit({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  timeout_ms: 60 * 1000,  // 60 seconds
  strictSSL: true,
});

const retweetConfig = {
  searchHashtags: ['#exampleHashtag1', '#exampleHashtag2'],
  searchResultType: 'recent',
  searchCount: 10,
  retweetInterval: 60000,  // 1 minute
};

const retweetBasedOnHashtags = async () => {
  const searchTerm = retweetConfig.searchHashtags.join(' OR ');

  try {
    const { data } = await twitterClient.get('search/tweets', {
      q: searchTerm,
      count: retweetConfig.searchCount,
      result_type: retweetConfig.searchResultType
    });

    const foundTweets = data.statuses;

    if (foundTweets.length === 0) {
      console.log("No tweets found for the hashtags specified.");
      return;
    }

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
  } catch (err) {
    console.error('Failed to search tweets or process them:', err);
  }
};

const initializeRetweetProcess = () => {
  retweetBasedOnHashtags();
  setInterval(retweetBasedOnHashtags, retweetConfig.retweetInterval);
};

initializeRetweetProcess();