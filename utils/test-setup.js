const mongoose = require("mongoose");

module.exports = {
  setupDB(databaseURL) {
    // connecting to the database before testing the endpoint...
    beforeAll(async () => {
      //   jest.setTimeout(120000);
      await mongoose.connect(databaseURL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    });

    // disconnecting from the database...
    afterAll(async () => {
      await mongoose.connection.close();
    });
  },
};
