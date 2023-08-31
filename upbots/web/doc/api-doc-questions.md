# api doc and questions

- List of available currency pairs endpoint

  - answer: not existing yet: depends on the exchange (api key selected)
    we could agree on something like
    GET /api/exchanges which would return a list of exchanges and currency symbols for each exchange that are allowed for trading in this platform.

  ```json
  {
    "exchanges": {
      "binance": ["BTCUSDT", "BTCETH"],
      "otherexchange": ["BTCUSDT", "BTCETH"]
    }
  }
  ```

* Selected currency pairs price endpoint

  - answer: not existing yet but see also [prices](#prices)

* Base and Quote currency prices endpoint

  - see [prices](#prices) GET ​/api​/cryptoPrice​/{provider}​/{baseCurrency}​/{quoteCurrency}

* Current price of the created order

  - answer: could you be more explicit ?

* Notifications / Alerts endpoints

  - answer: websocket endpoint: not existing yet

* Create/Edit/Delete Order endpoint

  - create a manual trade see [manual trade](#manual-trade)

* Favorite currency pairs endpoint

  - answer: not existing yet (keep it the front store ?)

* User authorization and registration endpoints

  - see [authentication enpoints](#authentication-enpoints)

* User information (user balance)
  - [see portfolio](#portfolio)

## authentication enpoints

User authorization and registration is already implemented in a cross cutting manner. You don't need to worry about it.

- POST /api/auth/login
  request:

```JSON
{
"email": "string",
"password": "string"
}
```

response: jwt

- POST /api/auth/totp-deactivate
- GET /api/auth/totp-secret
- POST /api/auth/totp-verify
- POST /api/auth/register
  request:

```json
{
  "email": "string",
  "password": "string",
  "firstname": "string"
}
```

- POST /api/auth/send-recover-link
- POST /api/auth/recover-password
- POST /api/auth/resendEmail

## prices

GET ​/api​/cryptoPrice​/{provider}​/{baseCurrency}​/{quoteCurrency}
returns price evolution details

example:
Request URL: http://localhost:3000/api/cryptoprice/watch/LTC/EUR
response:

```json
{
  "Data": {
    "Aggregated": null,
    "DailyData": [
      {
        "time": 1385424000,
        "open": 11.5,
        "high": 15.5,
        "low": 11.5,
        "close": 15.2336,
        "volumefrom": 9842.865234,
        "volumeto": 0,
        "conversionType": "LTC",
        "conversionSymbol": "EUR"
      },
      {
        "time": 1385510400,
        "open": 15.2336,
        "high": 40,
        "low": 14.8,
        "close": 28,
        "volumefrom": 13446.769531,
        "volumeto": 0,
        "conversionType": "LTC",
        "conversionSymbol": "EUR"
      },
      {
        "time": 1385596800,
        "open": 28,
        "high": 45,
        "low": 26.111,
        "close": 37.59,
        "volumefrom": 9489.475586,
        "volumeto": 0,
        "conversionType": "LTC",
        "conversionSymbol": "EUR"
      },
      {
        "time": 1592611200,
        "open": 38.77,
        "high": 39.03,
        "low": 38.26,
        "close": 38.74,
        "volumefrom": 2605.18891478,
        "volumeto": 100535.9204006685,
        "conversionType": "LTC",
        "conversionSymbol": "EUR"
      }
    ],
    "HourlyData": null,
    "TimeFrom": 1385424000,
    "TimeTo": 1592611200
  },
  "HasWarning": null,
  "Latest": {
    "time": 1592611200,
    "open": 38.77,
    "high": 39.03,
    "low": 38.26,
    "close": 38.74,
    "volumefrom": 2605.18891478,
    "volumeto": 100535.9204006685,
    "conversionType": "LTC",
    "conversionSymbol": "EUR"
  },
  "LatestPreviousDay": {
    "time": 1592524800,
    "open": 39.2,
    "high": 39.28,
    "low": 38.33,
    "close": 38.84,
    "volumefrom": 6774.77439693,
    "volumeto": 264278.2849263751,
    "conversionType": "LTC",
    "conversionSymbol": "EUR"
  },
  "Message": null,
  "RateLimit": 4000000000,
  "Response": null,
  "Type": null
}
```

## manual trade

Exchange key management and portfolio distribution (already implemented).

GET /api/trade/summary
Lists opened manual trades (not implemented yet)

POST /api/trade
Creates new manual trade, Adds a new trade request to the trading engine

resquest:

```json
{
  "exchange": "bitmex_test",
  "apiKeyRef": "5f0d84536998c221d9af0f9d", //exchange key ObjectId
  "symbol": "XBTUSD",
  "side": "BUY",
  "quantity": 1,
  "entries": [
    {
      "isMarket": true,
      "triggerPrice": 9000,
      "quantity": 1
    }
  ],
  "takeProfits": [
    {
      "triggerPrice": 9050,
      "quantity": 1
    }
  ],
  "stopLoss": 8950
}
```

## portfolio

- GET /api/keys
  get all keys

```json
[
  {
    "id": "njhgfytdrstfyguh",
    "name": "upt dev-trading-2",
    "created": "2020-05-15T13:49:37.157Z",
    "exchange": "binance",
    "publicKey": "kjiuhygtfrdeszedrftgyhujkilokijuhygtfrdesdrft",
    "updated": "2020-05-15T13:49:37.157Z"
  }
]
```

- POST /api/keys
  add new key

request

```json
{
  "name": "mykey friendly name",
  "exchange": "binance",
  "publicKey": "pubexmaplenjhgfdserfghjkl",
  "secretKey": "secretexugutfyrdesrdtfyuhjk"
}
```

response:

```json
[
  //list of keys
]
```

- PUT /api/keys
- DELETE /api/keys/{id}
- GET /api/portfolio/summary
  get all portfolio and accounts details (non filtered) (user account balance)

  ```json
  {
    "accounts": [
      {
        "name": "upt dev-trading-2",
        "exchange": "binance",
        "total": {
          "btc": 0.030112520816568643,
          "eur": 252.28571065329376,
          "usd": 282.5006140406387,
          "conversionDate": "2020-06-19T00:00:00.000Z"
        }
      }
    ],
    "aggregated": {
      "btc": 0.030112520816568643,
      "eur": 252.28571065329376,
      "usd": 282.5006140406387,
      "conversionDate": "2020-06-19T00:00:00.000Z"
    },
    "distribution": {
      "BTC": {
        "btc": 0.01413033,
        "eur": 118.38531777300001,
        "usd": 132.563690895,
        "conversionDate": "2020-06-19T00:00:00.000Z",
        "percentage": 4693,
        "currency": "BTC",
        "currencyAmount": 0.01413033
      },
      "USDT": {
        "btc": 0.011953649268996643,
        "eur": 100.14886894058078,
        "usd": 112.14316061709201,
        "conversionDate": "2020-06-19T00:00:00.000Z",
        "percentage": 3970,
        "currency": "USDT",
        "currencyAmount": 112.27789409
      },
      "XTZ": {
        "btc": 0.002575645897572,
        "eur": 21.579018894447973,
        "usd": 24.16342198807172,
        "conversionDate": "2020-06-19T00:00:00.000Z",
        "percentage": 855,
        "currency": "XTZ",
        "currencyAmount": 9.07556694
      },
      "ETH": {
        "btc": 0.0014528956499999998,
        "eur": 12.172505045265,
        "usd": 13.630340540474998,
        "conversionDate": "2020-06-19T00:00:00.000Z",
        "percentage": 482,
        "currency": "ETH",
        "currencyAmount": 0.058941
      }
    }
  }
  ```

- GET /api/portfolio/filter
  get filtered portfolio from key names filter
- GET /api/portfolio/filter/all
  get all portfolios (no filter and no account details)
