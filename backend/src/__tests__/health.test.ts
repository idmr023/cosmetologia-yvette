import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

describe("Backend Health", () => {
  it("should have required env vars", () => {
    expect(process.env.DATABASE_URL).toBeDefined();
    expect(process.env.JWT_SECRET).toBeDefined();
  });

  it("should load db module", () => {
    const db = require("../lib/db");
    expect(db).toBeDefined();
  });
});
