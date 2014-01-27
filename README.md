DogeApp
-------
A web app that helps you quickly calculate much your [Dogecoin][1] is worth in USD.

How It Works
------------
DogeApp uses the [cryptocoincharts API][2] to determine the best markets to buy and sell Bitcoin, Litecoin, and Dogecoin from. Then, depending
on your conversion type, the app can give you the most effective pricing on your Dogecoin or US Dollar amounts, as well as which derivative
coin to use as the intermediary. The app checks for new pricing every 60 seconds; all calculations and changes are reflected in real-time.

Getting Started
---------------
Simply visit [the public URL][3] or run `npm install` to install the app locally. Run the app using `node`, and you can visit the local version
at `localhost:8080`.

License
-------
Coming soon!

To Do
------
- Add a license
- A custom domain
- Responsive layout
- Crap browser support

[1]:http://dogecoin.com
[2]:http://cryptocoincharts.info
[3]:http://azof.fr/dogeapp