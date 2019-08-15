const { parse } = require('node-html-parser');
const axios = require('axios');
const moment = require('moment');
const _ = require('lodash');

const MAYBE_WORDS = ['issue', 'down', 'issues', 'error', 'errors'];
const MAYBE_CLAUSE = MAYBE_WORDS.join('%20OR%20');
const FORMAT = 'YYYY-MM-DD';
const TODAY = moment().format(FORMAT);
const TOMORROW = moment(new Date()).add(1,'days').format(FORMAT);
const TWITTER_DATE_FORMAT = 'LT - D MMM YYYY';

module.exports = async (req, res) => {
    const missing = ['monitor_account', 'must_account', 'must_word'].filter(prop => !req.query[prop]);
    if (missing.length){
        return res.status(400).json({
            code: 'invalid_params',
            message: `Missing mandatory param "${missing[0]}"`
        });
    }

    const monitorAccount = req.query.monitor_account;
    const mustAccount = req.query.must_account;
    const mustWord = req.query.must_word;
    let queryStart = TODAY;
    let queryEnd = TOMORROW;
    // by default check last 5 mins
    let end = moment();
    let start = moment(end).subtract(5, 'minutes');
    if (req.query.start_time && req.query.end_time){
        start = moment(req.query.start_time);
        end = moment(req.query.end_time);
        queryStart = start.startOf('day').format(FORMAT);
        queryEnd = end.add(1, 'day').startOf('day').format(FORMAT);
    }

    const TIME_CLAUSE = `until%3A${queryEnd}%20since%3A${queryStart}`;
    // TODO: filter out tweets from monitorAccount to itself
    const wordQuery = `https://twitter.com/search?lang=en&q=${mustWord}%20(${MAYBE_CLAUSE})%20(to%3A${monitorAccount})%20${TIME_CLAUSE}&src=typed_query`;
    const accountQuery = `https://twitter.com/search?q=(${MAYBE_CLAUSE})%20(to%3A${monitorAccount})%20(%40${mustAccount})%20${TIME_CLAUSE}&src=typed_query`;

    const SOURCES = [wordQuery, accountQuery];

    const results = await Promise.all(SOURCES.map(async source => await axios.get(source)));

    console.log(wordQuery, accountQuery);

    const timeNodes = _.flatMap(results, result => {
        const root = parse(result.data);
        return root.querySelectorAll('a.tweet-timestamp');
    });

    const totalTweets = timeNodes
        .map(n => moment(n.attributes.title, TWITTER_DATE_FORMAT))
        .filter(tweetTime => tweetTime.isSameOrAfter(start) && tweetTime.isSameOrBefore(end)).length;

    res.status(200).json({
        totalTweets,
        message: `There were ${totalTweets} tweet(s) about @${mustAccount}.${mustWord} being down to @${monitorAccount} between ${start} and ${end}`
    })
};