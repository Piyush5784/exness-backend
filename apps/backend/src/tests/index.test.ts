import supertest from "supertest";
import { app } from "..";

const expectedObject = {
  message: "Alice",
  age: 30,
  city: "New York",
};

const dataToSendForBuy = {
  asset: "ETH",
  type: "Buy",
  margin: 0.5,
  leverage: "0",
  slippage: "0",
};

const dataToSendForSell = {
  asset: "ETH",
  type: "Sell",
  margin: 0.2,
  leverage: "0",
  slippage: "0",
};
const expectedType = {
  message: expect.any(String),
  orderId: expect.any(Number),
};

describe("POST Buy and close trade endpoint test", () => {
  let orderId = 0;
  it("Trade create endpoint for Buy", async () => {
    await supertest(app)
      .post("/api/v1/trade/create")
      .expect(200)
      .send(dataToSendForBuy)
      .set(
        "Cookie",
        "userToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InBpeXVzaGpoYTU2NjhAZ21haWwuY29tIiwiZXhwaXJhdGlvbiI6IjIwMjUtMDktMDhUMTI6MzI6MDMuMDI3WiIsImlhdCI6MTc1NzE2MTkyM30.0I2eLCPSw8KxeAGW8wnUIFQWXKmJNUZ-znxubfn5En8; Path=/; Expires=Sun, 07 Sep 2025 12:33:07 GMT;"
      )
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(async (res) => {
        expect(res.body).toEqual(expectedType);
        orderId = res.body.orderId;
      });
  });

  it("Trade close endpoint for Buy", async () => {
    await supertest(app)
      .post("/api/v1/trade/close")
      .expect(200)
      .send({ orderId })
      .set(
        "Cookie",
        "userToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InBpeXVzaGpoYTU2NjhAZ21haWwuY29tIiwiZXhwaXJhdGlvbiI6IjIwMjUtMDktMDhUMTI6MzI6MDMuMDI3WiIsImlhdCI6MTc1NzE2MTkyM30.0I2eLCPSw8KxeAGW8wnUIFQWXKmJNUZ-znxubfn5En8; Path=/; Expires=Sun, 07 Sep 2025 12:33:07 GMT;"
      )
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(async (res) => {
        expect(typeof res.body.message).toBe("string");
        expect(typeof res.body.data.orderId).toBe("number");
      });
  });
});
describe("POST POST Sell and close trade endpoint tests", () => {
  let orderId = 0;
  it("Trade create endpoint for Sell", async () => {
    await supertest(app)
      .post("/api/v1/trade/create")
      .expect(200)
      .send(dataToSendForSell)
      .set(
        "Cookie",
        "userToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InBpeXVzaGpoYTU2NjhAZ21haWwuY29tIiwiZXhwaXJhdGlvbiI6IjIwMjUtMDktMDhUMTI6MzI6MDMuMDI3WiIsImlhdCI6MTc1NzE2MTkyM30.0I2eLCPSw8KxeAGW8wnUIFQWXKmJNUZ-znxubfn5En8; Path=/; Expires=Sun, 07 Sep 2025 12:33:07 GMT;"
      )
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(async (res) => {
        expect(res.body).toEqual(expectedType);
        orderId = res.body.orderId;
      });
  });

  it("Trade close endpoint for Sell", async () => {
    await supertest(app)
      .post("/api/v1/trade/close")
      .expect(200)
      .send({ orderId })
      .set(
        "Cookie",
        "userToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InBpeXVzaGpoYTU2NjhAZ21haWwuY29tIiwiZXhwaXJhdGlvbiI6IjIwMjUtMDktMDhUMTI6MzI6MDMuMDI3WiIsImlhdCI6MTc1NzE2MTkyM30.0I2eLCPSw8KxeAGW8wnUIFQWXKmJNUZ-znxubfn5En8; Path=/; Expires=Sun, 07 Sep 2025 12:33:07 GMT;"
      )
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(async (res) => {
        expect(typeof res.body.message).toBe("string");
        expect(typeof res.body.data.orderId).toBe("number");
      });
  });
});
describe("GET Get user balances endpoint", () => {
  it("User Balance check endpoint", async () => {
    await supertest(app)
      .get("/api/v1/balances/usd")
      .expect(200)
      .set(
        "Cookie",
        "userToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InBpeXVzaGpoYTU2NjhAZ21haWwuY29tIiwiZXhwaXJhdGlvbiI6IjIwMjUtMDktMDhUMTI6MzI6MDMuMDI3WiIsImlhdCI6MTc1NzE2MTkyM30.0I2eLCPSw8KxeAGW8wnUIFQWXKmJNUZ-znxubfn5En8; Path=/; Expires=Sun, 07 Sep 2025 12:33:07 GMT;"
      )
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(async (res) => {
        expect(res.body.message).toEqual("balances successfully fetched");
      });
  });
});
describe("GET Get current balances of BTC|ETH|SOL", () => {
  it("Get Balance", async () => {
    await supertest(app)
      .get("/api/v1/balances")
      .expect(200)
      .set(
        "Cookie",
        "userToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InBpeXVzaGpoYTU2NjhAZ21haWwuY29tIiwiZXhwaXJhdGlvbiI6IjIwMjUtMDktMDhUMTI6MzI6MDMuMDI3WiIsImlhdCI6MTc1NzE2MTkyM30.0I2eLCPSw8KxeAGW8wnUIFQWXKmJNUZ-znxubfn5En8; Path=/; Expires=Sun, 07 Sep 2025 12:33:07 GMT;"
      )
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(async (res) => {
        expect(res.body.message).toEqual("balances successfully fetched");
      });
  });
});

describe("GET supported assets of the platform", () => {
  it("Get supported assets", async () => {
    await supertest(app)
      .get("/api/v1/supportedAssets")
      .expect(200)
      .set(
        "Cookie",
        "userToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InBpeXVzaGpoYTU2NjhAZ21haWwuY29tIiwiZXhwaXJhdGlvbiI6IjIwMjUtMDktMDhUMTI6MzI6MDMuMDI3WiIsImlhdCI6MTc1NzE2MTkyM30.0I2eLCPSw8KxeAGW8wnUIFQWXKmJNUZ-znxubfn5En8; Path=/; Expires=Sun, 07 Sep 2025 12:33:07 GMT;"
      )
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(async (res) => {
        expect(res.body.message).toEqual("Assets successfully fetched");
      });
  });
});
