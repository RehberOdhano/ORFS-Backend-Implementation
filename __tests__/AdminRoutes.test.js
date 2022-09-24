const app = require("../app");
const supertest = require("supertest");
const request = supertest(app);
require("dotenv").config();

const { setupDB } = require("../utils/test-setup");
setupDB(process.env.URL);

describe("GET ROUTES", () => {
  const company_id = "632487b2bed27ddbe46afd68";
  describe("get users' list", () => {
    test("It should respond with a status code 200", (done) => {
      request.get("/admin/users/all/" + company_id).expect(200, done);
    });
  });

  describe("get complaints' list", () => {
    test("It should respond with a status code 200", (done) => {
      request.get("/admin/complaints/" + company_id).expect(200, done);
    });
  });

  describe("get departments' list", () => {
    test("It should respond with a status code 200", (done) => {
      request.get("/admin/depts/all/" + company_id).expect(200, done);
    });
  });

  describe("get departments' list", () => {
    test("It should respond with a status code 200", (done) => {
      request.get("/admin/categories/all/" + company_id).expect(200, done);
    });
  });

  describe("get departments' list", () => {
    test("It should respond with a status code 200", (done) => {
      request.get("/admin/categories/all/" + company_id).expect(200, done);
    });
  });
});

describe("POST ROUTES", () => {
  const company_id = "632487b2bed27ddbe46afd68";
  describe("get users' list", () => {
    // test("It should successfully create a user & respond with a status code 200", async () => {
    //   const res = await request.post("/admin/users/add/" + company_id).send({
    //     name: "Karen",
    //     email: "karen@example.com",
    //     role: "COMPLAINEE",
    //   });
    //   expect(res.body.status).toEqual(200);
    // });

    // user with same email already exists!
    test("It should respond with a status code 500", async () => {
      const res = await request.post("/admin/users/add/" + company_id).send({
        name: "Karen",
        email: "admin1260@gmail.com",
        role: "COMPLAINEE",
      });
      expect(res.body.status).toEqual(500);
    });
  });

  //   describe("get complaints' list", () => {
  //     test("It should respond with a status code 200", (done) => {
  //       request.get("/admin/complaints/" + company_id).expect(200, done);
  //     });
  //   });

  //   describe("get departments' list", () => {
  //     test("It should respond with a status code 200", (done) => {
  //       request.get("/admin/depts/all/" + company_id).expect(200, done);
  //     });
  //   });

  //   describe("get departments' list", () => {
  //     test("It should respond with a status code 200", (done) => {
  //       request.get("/admin/categories/all/" + company_id).expect(200, done);
  //     });
  //   });

  //   describe("get departments' list", () => {
  //     test("It should respond with a status code 200", (done) => {
  //       request.get("/admin/categories/all/" + company_id).expect(200, done);
  //     });
  //   });
});
