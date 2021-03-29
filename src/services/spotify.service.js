import axios from 'axios';
import qs from 'qs';

import SpotifyWebApi from "spotify-web-api-js";

class SpotifyService {
    constructor() {
        this.clientId = 'fb34f7a3c9234f31a63cd764a2250e9c';
        this.clientSecret = '382d23b2673740ccb03d89af45b6c4f4';
        this.spotifyApi = new SpotifyWebApi();
    }

    _getAuth() {
        return new Promise((resolve, reject) => {
            const headers = {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                auth: { username: this.clientId, password: this.clientSecret, },
            };

            axios.post(
                'https://accounts.spotify.com/api/token',
                qs.stringify({ grant_type: 'client_credentials' }),
                headers
            ).then((response) => {
                resolve(response.data.access_token)
            }).catch((err) => {
                console.log(err)
                reject(err)
            });
        });
    }

    getSpotify(search) {
        return new Promise((resolve, reject) => {
            this._getAuth().then((access_token) => {
                this.spotifyApi.setAccessToken(access_token)
                this.spotifyApi.searchTracks(search).then(
                    (data) => {
                        resolve(data)
                    },
                    (err) => {
                        reject(err)
                    }
                );
            })
        });
    }

}

export default new SpotifyService()