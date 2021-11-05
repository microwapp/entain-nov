import axios from "axios";
axios.defaults.timeout = 10000;
axios.defaults.headers.post["Content-Type"] = "application/json";

/**
 * @param {String} url 
 * @param {Object} params 
 */
export function get(url, params) {
    return new Promise((resolve, reject) => {
        axios
            .get(url, {
                params: params,
            })
            .then((res) => {
                resolve(res.data);
            })
            .catch((err) => {
                reject(err.data);
            });
    });
}