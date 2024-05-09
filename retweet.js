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

let tweetSearchCache = {};
const cacheExpiry = 5 * 60 * 1000; // 5 minutes

const retweetBasedOnHashtags = async () => {
  const searchTerm = retweetConfig.searchHashtags.join(' OR ');
  const currentTime = new Date().getTime();

  if (tweetSearchCache[searchTerm] && (currentTime - tweetSearchCache[searchTerm].timestamp) < cacheExpiry) {
    console.log("Using cached search results.");
    await processTweets(tweetSearchCache[searchTerm].data).catch(error => {
      console.error('Error processing tweets from cache:', error.message || error);
    });
  } else {
    try {
      const { data } = await twitterClient.get('search/tweets', {
        q: searchTerm,
        count: retweetConfig.searchCount,
        result_type: retweetConfig.searchResultType,
      });

      tweetSearchCache[searchTerm] = {
        data,
        timestamp: currentTime,
      };

      await processTweets(data);
    } catch (err) {
      console.error('Failed to search tweets or process them:', err.message || err);
    }
  }
};

const processTweets = async (data) => {
  const foundTweets = data.statuses || [];

  if (foundTweets.length === 0) {
    console.log("No tweets found for the hashtags specified.");
    return;
  }

  const promises = foundTweets.map(tweet => new Promise((resolve, reject) => {
    twitterClient.post('statuses/retweet/:id', { id: tweet.id_str }, (retweetErr, response) => {
      if (response) {
        console.log('Retweeted:', `https://twitter.com/${response.user.screen_name}/status/${response.id_str}`);
        resolve(response);
      } else if (retweetErr) {
        console.error('Retweet Failed:', retweetErr.message || retweetErr);
        reject(retweetErr);
      }
    });
  }));

  try {
    await Promise.all(promises);
  } catch (errors) {
    console.error('An error occurred during the retweet process.', errors);
  }
};

const initializeRetweetProcess = () => {
  retweetBasedOnHashtags();
  setInterval(retweetBasedOnHashtags, retweetConfig.retweetInterval);
};

initializeRetweetProcess();