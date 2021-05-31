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
            let data = await res.json();

            if (!data || data.length === 0)
                throw new Error(`Failed to fetch candles from ${path}`);
                
            data = data.map(rate => {
                return {
                    // Unix Timestamp to local date
                    time: new Date(new Date(rate[0]*1000).toLocaleString(locale)),
                    low: rate[1],
                    high: rate[2],
                    open: rate[3],
                    close: rate[4],
                    openVolume: rate[4] > rate[3] ? 0 : rate[5],
                    valueVolume: rate[4] > rate[3] ? rate[5] : 0,
                    highVolume: rate[5]
                };
            })

            return data;
        }
        catch(err) {
            console.error(err);
            throw err;
        }
    }

    // returns single 1-minute candle of BTC-USD (1 minute ago)
    static async loadCandle() {

        let endTime = new Date();
        let startTime = new Date(endTime);
        startTime.setMinutes(endTime.getMinutes() - 2);
        endTime.setMinutes(endTime.getMinutes() - 1);
        
        endTime = endTime.toISOString();
        startTime = startTime.toISOString();
    
        const path = endpoint + `/products/${productID}/candles?start=${startTime}&end=${endTime}&granularity=${minute}`;
    
        try {

            let res = await fetch(path);

            // format object properties
            let data = await res.json();

            if (!data || data.length === 0)
                throw new Error(`Failed to fetch a candle from ${path}`);
            
            data = data.map(rate => {
                return {
                    // Unix Timestamp to local date 
                    time: new Date(new Date(rate[0]*1000).toLocaleString(locale)),
                    low: rate[1],
                    high: rate[2],
                    open: rate[3],
                    close: rate[4],
                    openVolume: rate[4] > rate[3] ? 0 : rate[5],
                    valueVolume: rate[4] > rate[3] ? rate[5] : 0,
                    highVolume: rate[5]
                };
            })

            return data[0];
        }
        catch(err) {
            console.error(err);
            throw err;
        }
    }

    // returns aggregated order book of BTC-USD's top 50 bids
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
