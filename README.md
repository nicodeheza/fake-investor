# Fake Investor

## About

Fake Investor is a simple investment simulator where you can see stock stats, buy and sell stocks and follow your progress.

All users start with one million FUD (fake United States Dollar), the fake currency of the application.

All the stock purchases in the application are fake, nevertheless the stock data is fetched from Yahoo Finance Api so is real data. Unfortunately, the free tier of Yahoo Finance Api only allows you **100 api calls per day**. I did my best to optimize the api calls by caching them with Redis. Nevertheless, if you reach this limit the application will display a message informing you of this situation.

If you want to try the app, you can create your own user or login with the test user.

- Email: test@test.com
- Password: testuser

You can visit the live demo [here](https://fi.nicolasdeheza.com).

## Built With

Here are some of the technologies I used to build this project:

### Frontend:

- Typescript
- React
- React Router

### Backend:

- Typescript
- Express
- Passaport (for authentication)

### Databases:

- Redis
- MySql

### Testing:

- Mocha
- Chai
- Sinon
