// functions to communicate with Coinbase Pro API

const hour = 3600;
const min = 60;

export class CbProAPI {

    endpoint = 'https://api.pro.coinbase.com';
    productID = 'BTC-USD';

    // returns 6-hour historic rates of BTC-USD
    loadHistory = async (currentTime) => {
    
        const path = this.endpoint + `/products/${this.productID}/candles?`;
    
        let res = await fetch(path + URLSearchParams({
            start: currentTime - (6*hour),
            end: currentTime,
            granularity: min
        }));

        return await res.json();
    }
}
