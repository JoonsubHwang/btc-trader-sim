// functions to communicate with Coinbase Pro API

const minute = 60;
const locale = 'en-US';
const endpoint = 'https://api.pro.coinbase.com';
const productID = 'BTC-USD';

export class CbProAPI {

    // returns 1-hour historic rates of BTC-USD
    static async loadHistory() {
    
        const path = endpoint + `/products/${productID}/candles?granularity=${minute}`;
    
        try {

            let res = await fetch(path);

            // format object properties
            let data = (await res.json()).slice(60).map(rate => {
                return {
                    // Unix Timestamp to locale date string
                    time: new Date(rate[0]*1000).toLocaleString(locale),
                    low: rate[1],
                    high: rate[2],
                    open: rate[3],
                    close: rate[4],
                    volume: rate[5]
                };
            })

            return data;
        }
        catch(err) {
            console.error(err);
            throw err;
        }
    }
}
