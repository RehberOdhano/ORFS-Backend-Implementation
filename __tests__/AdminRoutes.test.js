const app = require("../app");
const supertest = require("supertest");
const request = supertest(app);
require("dotenv").config();

const { setupDB } = require("../utils/test-setup");
setupDB(process.env.URL);

describe("USER ROUTES TESTS", () => {
  const company_id = "632487b2bed27ddbe46afd68";
  describe("GET ALL USERS", () => {
    test("It should respond with a status code 200", (done) => {
      request.get("/admin/users/all/" + company_id).expect(200, done);
    });
  });

  describe("ADD A USER", () => {
    const testcases = [
      {
        name: "Karen",
        email: "karen@example.com",
        role: "COMPLAINEE",
        status: 200,
        test: "It should successfully create a new user if it's already not exists & respond with a status code 200",
      },
      {
        name: "Karen",
        email: "karen@example.com",
        role: "COMPLAINEE",
        status: 500,
        test: "It should respond with a status code 500",
      },
    ];

    testcases.forEach((testcase) => {
      test(testcase.test, async () => {
        const res = await request.post("/admin/users/add/" + company_id).send({
          name: testcase.name,
          email: testcase.email,
          role: testcase.role,
        });
        expect(testcase.status).toBe(res.body.status);
      });
    });
  });
});
