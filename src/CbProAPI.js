// functions to communicate with Coinbase Pro API

const minute = 60;
const locale = 'en-US';
const endpoint = 'https://api.pro.coinbase.com';
const productID = 'BTC-USD';
const historyLength = 2; // hours

export class CbProAPI {

    // returns 2-hour historic rates of BTC-USD
    static async loadHistory() {

        let currentTime = new Date();
        let startTime = new Date(currentTime);
        startTime.setHours(currentTime.getHours() - historyLength);
        
        currentTime = currentTime.toISOString();
        startTime = startTime.toISOString();
    
        const path = endpoint + `/products/${productID}/candles?start=${startTime}&end=${currentTime}&granularity=${minute}`;
    
        try {

            let res = await fetch(path);

            // format object properties
            let data = (await res.json()).map(rate => {
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

    // returns aggregated order book of BTC-SUD's top 50 bids
    static async loadOrderBook() {

        const path = endpoint + `/products/${productID}/book?level=2`;

        try {

            let res = await fetch(path);

            // format object properties
            let data = (await res.json());

            return {
                asks: data.asks.map(ask => {
                    return {
                        price: ask[0],
                        size: ask[1]
                    }
                }),
                bids: data.asks.map(bid => {
                    return {
                        price: bid[0],
                        size: bid[1]
                    };
                })
            }
        }
        catch(err) {
            console.error(err);
            throw err;
        }
    }
}
