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
    getObj(key, inBase64 = true) {
        return new Promise((resolve, reject) => {
            this.s3.getObject({
                Bucket: 'soundsonner-data',
                Key: key
            }, (err, data) => {
                if (err) {
                    console.log(err);
                    reject()
                }
                if (inBase64) resolve(data.Body.toString('base64'));
                else resolve(JSON.parse(data.Body));
            });
        });
    }
    saveObj(key, body) {
        return new Promise((resolve, reject) => {
            this.s3.putObject({
                Bucket: 'soundsonner-data',
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