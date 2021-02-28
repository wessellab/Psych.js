const { MTurk } = require('aws-sdk');

var mturk = new MTurk({
    accessKeyId: 'AKIAIXJ4LL4MSWCRCACA',
    secretAccessKey: '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',
    region: 'us-west-2'
});

console.log(mturk);

var params = {
    HITId: '302883'
};

mturk.getHIT(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data);           // successful response
});