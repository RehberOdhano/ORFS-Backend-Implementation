const { mongoose } = require("./packages");

exports.setupDB = (databaseURL) => {
  // connecting to the database before testing the endpoint...
  beforeAll(async () => {
    //   jest.setTimeout(120000);
    try {
      await mongoose.connect(databaseURL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    } catch (e) {
      console.log("ERROR: " + e.message);
    }
  });

  // disconnecting from the database...
  afterAll(async () => {
    await mongoose.connection.close();
  });
};
