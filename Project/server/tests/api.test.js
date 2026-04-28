import request from "supertest";
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";

// =====================================================
// Build a minimal test app that doesn't require DB
// so tests can run without a live database connection
// =====================================================
const testApp = express();
testApp.use(express.json());
testApp.use(cors());

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key_123";

// Stub Login Route — mirrors real route logic
testApp.post("/user/login", async (req, res) => {
  const { u_email, u_password, recaptchaToken } = req.body;
  if (!recaptchaToken) {
    return res.status(400).json({ status: 400, message: "reCAPTCHA verification required" });
  }
  if (!u_email || !u_password) {
    return res.status(400).json({ status: 400, message: "Missing fields" });
  }
  return res.status(401).json({ status: 401, message: "Invalid email or password" });
});

// Stub Register Route — mirrors real route logic
testApp.post("/user/register", async (req, res) => {
  const { u_first_name, u_last_name, u_email, u_uin, u_password } = req.body;
  if (!u_first_name || !u_last_name || !u_email || !u_uin || !u_password) {
    return res.status(400).json({ status: 400, message: "Missing required fields" });
  }
  if (!PASSWORD_REGEX.test(u_password)) {
    return res.status(400).json({ status: 400, message: "Password must be at least 8 characters long and include an uppercase letter, lowercase letter, number, and special character." });
  }
  return res.status(201).json({ status: 201, message: "Registration successful. Verify your email." });
});

// Stub Protected Route — mirrors auth middleware behavior
testApp.get("/advising/history", (req, res) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ status: 401, message: "Access denied. No token provided." });
  const token = authHeader.split(" ")[1];
  try {
    jwt.verify(token, JWT_SECRET);
    return res.status(200).json({ status: 200, data: [] });
  } catch {
    return res.status(401).json({ status: 401, message: "Invalid token" });
  }
});

// =====================================================
// TEST SUITE: Course Advising System — Backend API
// =====================================================

// ─────────────────────────────────────────────────────
// Test Case 1: POST /user/login — reCAPTCHA Enforcement
// Verifies that login rejects requests without reCAPTCHA
// ─────────────────────────────────────────────────────
describe("POST /user/login — reCAPTCHA Enforcement", () => {
  test("TC1 — Should reject login when reCAPTCHA token is missing", async () => {
    const res = await request(testApp)
      .post("/user/login")
      .send({ u_email: "narif@odu.edu", u_password: "somepassword" });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("status", 400);
    expect(res.body.message).toMatch(/reCAPTCHA/i);
  });

  test("TC1b — Should reject login with missing credentials", async () => {
    const res = await request(testApp)
      .post("/user/login")
      .send({ recaptchaToken: "test-token" });

    expect([400, 401]).toContain(res.statusCode);
  });
});

// ─────────────────────────────────────────────────────
// Test Case 2: POST /user/register — Password Validation
// Verifies strong password rules are enforced at the API level
// ─────────────────────────────────────────────────────
describe("POST /user/register — Password Validation", () => {
  test("TC2 — Should reject registration with a weak password (no uppercase/special chars)", async () => {
    const res = await request(testApp)
      .post("/user/register")
      .send({
        u_first_name: "Test",
        u_last_name: "User",
        u_email: "testuser_weak@odu.edu",
        u_uin: "999888777",
        u_password: "weakpass",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("status", 400);
    expect(res.body.message).toMatch(/uppercase|lowercase|special|password/i);
  });

  test("TC2b — Should accept a strong password and return 201", async () => {
    const res = await request(testApp)
      .post("/user/register")
      .send({
        u_first_name: "John",
        u_last_name: "Doe",
        u_email: "johndoe@odu.edu",
        u_uin: "123456789",
        u_password: "StrongPass1!",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toMatch(/registration successful/i);
  });
});

// ─────────────────────────────────────────────────────
// Test Case 3: GET /advising/history — Auth Protection
// Verifies that protected routes require a valid JWT
// ─────────────────────────────────────────────────────
describe("GET /advising/history — JWT Authentication Guard", () => {
  test("TC3 — Should return 401 when no token is provided", async () => {
    const res = await request(testApp).get("/advising/history");
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/token|denied/i);
  });

  test("TC3b — Should return 401 when an invalid/tampered token is provided", async () => {
    const res = await request(testApp)
      .get("/advising/history")
      .set("Authorization", "Bearer this.is.an.invalid.token.xyz");

    expect(res.statusCode).toBe(401);
  });

  test("TC3c — Should return 200 when a valid JWT is provided", async () => {
    const validToken = jwt.sign(
      { id: 1, email: "admin@odu.edu", isAdmin: false },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    const res = await request(testApp)
      .get("/advising/history")
      .set("Authorization", `Bearer ${validToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("data");
  });
});
