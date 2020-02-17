### React Test

The goal here is to create a React app that gets data from an API and displays it according to wireframe.

Wireframes can be found [here](https://wireframe.cc/uR5ws6) and [here](https://wireframe.cc/pro/pp/03c2675b7310060).

## How

All your code must be pushed to a branch with your name.
You must create two pages on your app, one for each wireframe.

## Back-end API

This repository provides an API that returns trading orders (BUY / SELL / ALL) on the endpoint `/orders/:type`.

```
GET /orders/TYPE?page=...
{
 "pages": ... // an int that indicates how many pages exist for this request,
 data: [
  {
     "datetime": "2018-03-01T12:02:00Z",
     "type": "BUY",
     "volume": 10.4,
     "price": 1.6,
     "currency": "EUR"
   },
   ...
 ]
}
```
Where type in the URL can be :
  * SELL: only returns the orders that have a type set to SELL
  * BUY: only returns the orders that have a type set to BUY
  * ALL: return all the data, regardless of the type

The `page` query string attribute starts from 0. If you omit the `page` parameter, then all the data will be returned (that's what you need to call for the charts).
All pages returned by the API contain ten elements.

The api exposes a second endpoint `/pricing` to calculate energy pricing between two dates.
To get the result you must do a GET request with the following query parameters :
```
Types :
{
  dateStart: Date,
  dateEnd: Date,
  basePrice: Number,
  name: String,
}
```
`htt://localhost:3001/pricing?dateStart=2018-03-01&dateEnd=2018-03-03&basePrice=2.1&pricingName=Name`

And you will get the result in the following format :
```json
{
  "data": [
    {
      "date": "2018-03-01",
      "estimatedPricing": 2,
      "maxPricing": 3.42,
      "name": "Name"
    },
    {
      "date": "2018-03-02",
      "estimatedPricing": 1.85,
      "maxPricing": 2.4,
      "name": "Name"
    },
    // ...
  ]
}
```

The API can be started by running `npm start` from the api folder.
Don't forget to run `npm install` before that.

## Outages

In the [api](api/) folder, you can find a small express app that emits every second an event through a websocket.
In order to connect to the websocket:
 * Run `npm run-script start-ws` from the api folder
 * Connect to [ws://localhost:8080](ws://localhost:8080)

Every second you should receive something like:

```json
{
 "uuid"         : "8e200006-1ff2-469a-84e1-7b2d29c79b00",
 "power_plant"  : "Somewhere...",
 "start_time"   : "2018-07-09T15:14:37.449Z",
 "end_time"     : "2018-07-14T15:14:37.449Z"
}
```
For each event, a new bootstrap [alert](https://getbootstrap.com/docs/4.0/components/alerts/) must be displayed at the bottom right of the screen (on every pages). See [wireframe.cc](https://wireframe.cc/uR5ws6) for the text to display

## Constraints

 - Bootstrap 4.x must be used for the UI
 - There is no link between the pagination on the table and the graphs underneath. The graph must display all the data per type (no pagination)
 - The HTML table should display 10 rows and add pagination in order to browse the data.
 - The times in the test dataset are in UTC, whereas the times in the UI are in UTC + 1.
 - You must use [recharts](http://recharts.org/en-US/api) for the plot library.
 - The pages links must be accessible from the sidebar
 - For the pricing page, you are free to choose the way of displaying the result (graph or table), only performance matters (eg: is it fast to display a ten years pricing ?)
 - Feel free to add any feature you consider usefull