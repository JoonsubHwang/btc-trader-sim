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

            let data = await res.json();

            if (!data || data[0].length != 6)
                throw new Error(`Failed to fetch a candle from ${path}. (data[0].length: ` +data[0].length + `)`);
            
            // format object properties
            data = {
                // Unix Timestamp to local date 
                time: new Date(new Date(data[0][0]*1000).toLocaleString(locale)),
                low: data[0][1],
                high: data[0][2],
                open: data[0][3],
                close: data[0][4],
                openVolume: data[0][4] > data[0][3] ? 0 : data[0][5],
                valueVolume: data[0][4] > data[0][3] ? data[0][5] : 0,
                highVolume: data[0][5]
            };

            return data;
        }
        catch(err) {
            console.error('[CbProAPI] ' + err);
            throw 'Error: Failed to load a candle from CbProAPI.';
        }
    }

    // returns the last price
    static async loadNewPrice() {

        const path = endpoint + `/products/${productID}/ticker`;

        try {
            let res = await fetch(path);
            let data = (await res.json());

            return data.price;
        }
        catch(err) {
            console.error(err);
            throw err;
        }
    }
}
