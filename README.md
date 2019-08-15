# tweetops
Poll twitter for outages with your favorite product

# Usage
Check if there have been any issue reports for AWS in the past 5 minutes:
```bash
curl -s https://tweetops.damianschenkelman.now.sh/api/run\?monitor_account\=awscloud\&must_word\=aws\&must_account\=awscloud | jq
{
  "totalTweets": 0,
  "message": "There were 0 tweet(s) about @awscloud.aws being down to @awscloud between Thu Aug 15 2019 15:36:10 GMT+0000 and Thu Aug 15 2019 15:41:10 GMT+0000"
}
```

Check if there were any issues between two dates:
```bash
curl -s https://tweetops.damianschenkelman.now.sh/api/run\?start_time\=2019-01-11\&end_time\=2019-01-12\&monitor_account\=awscloud\&must_word\=aws\&must_account\=awscloud | jq
{
  "totalTweets": 6,
  "message": "There were 6 tweet(s) about @awscloud.aws being down to @awscloud between Fri Jan 11 2019 00:00:00 GMT+0000 and Sun Jan 13 2019 00:00:00 GMT+0000"
}
```

# License
MIT