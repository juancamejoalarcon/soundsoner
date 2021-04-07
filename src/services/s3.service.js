const AWS = require('aws-sdk');

class Aws {
    constructor() {
        this.setAwsConfig();
    }
    setAwsConfig() {
        AWS.config.update({
            secretAccessKey: 'beM/dSbKQCO/l8LEseY+eLPauLn4PDGe9Jd001gm',
            accessKeyId: 'AKIAJL2ELB6XHO4FQOKQ',
            region: 'eu-west-3'
        });
        this.s3 = new AWS.S3();
    }
    encode(data) {
        var str = data.reduce(function(a,b){ return a+String.fromCharCode(b) },'');
        return btoa(str).replace(/.{76}(?=.)/g,'$&\n');
    }
    getObj(key, inBase64 = true, bucket = 'soundsonner-data', encode = false) {
        return new Promise((resolve, reject) => {
            this.s3.getObject({
                Bucket: bucket,
                Key: key
            }, (err, data) => {
                if (err) {
                    console.log(err);
                    reject()
                }
                if (encode) {
                    resolve("data:image/png;base64," + this.encode(data.Body))
                } else {
                    if (inBase64) resolve(data.Body.toString('base64'));
                    else resolve(JSON.parse(data.Body));
                }
            });
        });
    }
    saveObj(key, body, bucket = 'soundsonner-data') {
        return new Promise((resolve, reject) => {
            this.s3.putObject({
                Bucket: bucket,
                Key: key,
                Body: JSON.stringify(body),
                ContentType: 'application/json; charset=utf-8'
           }, (err, data) => {
            if (err) {
                console.log(err);
                reject()
            }
            resolve(data);
        })
        });
    }
}

export default new Aws()