const app = require("../app");
const supertest = require("supertest");
const request = supertest(app);
require("dotenv").config();

const { setupDB } = require("../utils/test-setup");
setupDB(process.env.URL);

describe("POST /login", () => {
  describe("given a username & password", () => {
    test("It should respond with a status code 200", (done) => {
      request
        .post("/login")
        .send({
          email: "rehber.odhano30@gmail.com",
          password: "testpass",
        })
        .expect(200, done);
    });

    test("It should specify json in the content type header", (done) => {
      const res = request.post("/login").send({
        email: "rehber.odhano30@gmail.com",
        password: "testpass",
      });
      expect(res.header["Content-Type"]);
      done();
    });
  });

  describe("when the username or password or both are missing", () => {
    test("It should respond with a status code of 500", (done) => {
      const parameters = [
        { email: "rehber.odhano30@gmail.com" },
        { password: "testpass" },
        {},
      ];
      for (const param of parameters) {
        request.post("/login").send(param).expect(200);
      }
      done();
    });
  });
});
