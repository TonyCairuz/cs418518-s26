import { Router } from "express";
import { connection } from "../database/connection.js";
import { sendEmail } from '../helper/sendmail.js';
import { comparePassword, hashPassword } from "../helper/util.js";
import jwt from 'jsonwebtoken';
import { authenticateToken } from "../middleware/auth.js";
import axios from 'axios';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const user = Router();

// =======================
// REGISTER USER
// =======================
user.post("/register", async (req, res) => {
    try {
        const { u_first_name, u_last_name, u_email, u_uin, u_password } = req.body;

        if (!u_first_name || !u_last_name || !u_email || !u_uin || !u_password) {
            return res.status(400).json({ status: 400, message: "Missing required fields" });
        }

        if (!PASSWORD_REGEX.test(u_password)) {
            return res.status(400).json({ status: 400, message: "Password must be at least 8 characters long and include an uppercase letter, lowercase letter, number, and special character." });
        }

        const hashedPassword = hashPassword(u_password);

        const [result] = await connection.execute(
            `INSERT INTO user_info (u_first_name, u_last_name, u_email, u_uin, u_password, u_is_verified, u_is_admin)
            VALUES (?, ?, ?, ?, ?, 0, 0)`,
            [u_first_name, u_last_name, u_email, u_uin, hashedPassword]
        );

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await connection.execute(
            `INSERT INTO email_otp (email, otp, type, expires_at) VALUES (?, ?, 'verification', ?)`,
            [u_email, otp, expiresAt]
        );

        console.log(`[TESTING] VERIFICATION OTP for ${u_email}: ${otp}`);

        sendEmail(u_email, "Verify your email", `<h2>Welcome!</h2><p>Your verification OTP is: <b>${otp}</b></p>`);

        res.status(201).json({ status: 201, message: "Registration successful. Verify your email." });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ status: 400, message: "Email or UIN already exists" });
        res.status(500).json({ status: 500, message: err.message });
    }
});

// =======================
// VERIFY EMAIL
// =======================
user.post("/verify-email", async (req, res) => {
    try {
        const { email, otp } = req.body;
        const [rows] = await connection.execute(
            "SELECT * FROM email_otp WHERE email = ? AND otp = ? AND type = 'verification'",
            [email, otp]
        );

        if (rows.length === 0 || new Date() > new Date(rows[0].expires_at)) {
            return res.status(400).json({ status: 400, message: "Invalid or expired OTP" });
        }

        await connection.execute("UPDATE user_info SET u_is_verified = 1 WHERE u_email = ?", [email]);
        await connection.execute("DELETE FROM email_otp WHERE email = ? AND type = 'verification'", [email]);

        res.status(200).json({ status: 200, message: "Email verified" });
    } catch (err) {
        res.status(500).json({ status: 500, message: err.message });
    }
});

// =======================
// LOGIN (Step 1)
// =======================
user.post("/login", async (req, res) => {
    try {
        const { u_email, u_password, recaptchaToken } = req.body;

        if (!recaptchaToken) {
            return res.status(400).json({ status: 400, message: "reCAPTCHA verification required" });
        }

        // Verify reCAPTCHA with Google
        const secretKey = process.env.RECAPTCHA_SECRET_KEY || '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe'; // Default test secret
        const recaptchaRes = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`
        );
        if (!recaptchaRes.data.success) {
            return res.status(400).json({ status: 400, message: "Failed reCAPTCHA verification" });
        }

        const [rows] = await connection.execute("SELECT * FROM user_info WHERE u_email = ? LIMIT 1", [u_email]);
        if (rows.length === 0 || !comparePassword(u_password, rows[0].u_password)) {
            return res.status(401).json({ status: 401, message: "Invalid email or password" });
        }

        const userRecord = rows[0];
        if (!userRecord.u_is_verified) {
            return res.status(403).json({ status: 403, message: "Please verify your email first" });
        }

        // Check if 2FA is enabled
        if (!userRecord.u_2fa_enabled) {
            const { u_password: _, ...safeUser } = userRecord;
            const token = jwt.sign(
                { id: userRecord.u_id, email: userRecord.u_email, isAdmin: !!userRecord.u_is_admin },
                process.env.JWT_SECRET || 'secret',
                { expiresIn: '1h' }
            );
            return res.status(200).json({ status: 200, message: "Login successful", data: safeUser, token });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        await connection.execute(
            "INSERT INTO email_otp (email, otp, type, expires_at) VALUES (?, ?, '2fa', ?) ON DUPLICATE KEY UPDATE otp=VALUES(otp), type=VALUES(type), expires_at=VALUES(expires_at)",
            [u_email, otp, expiresAt]
        );

        console.log(`[TESTING] LOGIN 2FA OTP for ${u_email}: ${otp}`);

        sendEmail(u_email, "Your Login OTP", `<p>Your 2FA OTP is: <b>${otp}</b></p>`);
        res.status(200).json({ status: 200, message: "OTP sent", email: u_email });
    } catch (err) {
        res.status(500).json({ status: 500, message: err.message });
    }
});

// =======================
// VERIFY LOGIN OTP (Step 2)
// =======================
user.post("/verify-login-otp", async (req, res) => {
    try {
        const { email, otp } = req.body;
        const [rows] = await connection.execute(
            "SELECT * FROM email_otp WHERE email = ? AND otp = ? AND type = '2fa'",
            [email, otp]
        );

        if (rows.length === 0 || new Date() > new Date(rows[0].expires_at)) {
            return res.status(400).json({ status: 400, message: "Invalid or expired OTP" });
        }

        await connection.execute("DELETE FROM email_otp WHERE email = ? AND type = '2fa'", [email]);

        const [userRows] = await connection.execute("SELECT * FROM user_info WHERE u_email = ?", [email]);
        const userRec = userRows[0];
        const { u_password: _, ...safeUser } = userRec;

        const token = jwt.sign(
            { id: userRec.u_id, email: userRec.u_email, isAdmin: !!userRec.u_is_admin },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1h' }
        );

        res.status(200).json({ status: 200, message: "Login successful", data: safeUser, token });
    } catch (err) {
        res.status(500).json({ status: 500, message: err.message });
    }
});

// =======================
// PROFILE
// =======================
user.get("/profile", authenticateToken, async (req, res) => {
    try {
        const [rows] = await connection.execute(
            "SELECT u_id, u_first_name, u_last_name, u_email, u_uin, u_is_verified, u_is_admin FROM user_info WHERE u_id = ?",
            [req.user.id]
        );
        res.status(200).json({ status: 200, data: rows[0] });
    } catch (err) {
        res.status(500).json({ status: 500, message: err.message });
    }
});

user.put("/profile", authenticateToken, async (req, res) => {
    try {
        const { u_first_name, u_last_name } = req.body;
        await connection.execute("UPDATE user_info SET u_first_name = ?, u_last_name = ? WHERE u_id = ?", [u_first_name, u_last_name, req.user.id]);
        res.status(200).json({ status: 200, message: "Updated" });
    } catch (err) {
        res.status(500).json({ status: 500, message: err.message });
    }
});

user.post("/toggle-2fa", authenticateToken, async (req, res) => {
    try {
        const { enabled } = req.body;
        await connection.execute("UPDATE user_info SET u_2fa_enabled = ? WHERE u_id = ?", [enabled ? 1 : 0, req.user.id]);
        res.status(200).json({ status: 200, message: `2FA ${enabled ? 'enabled' : 'disabled'}` });
    } catch (err) {
        res.status(500).json({ status: 500, message: err.message });
    }
});

// =======================
// PASSWORD MANAGEMENT
// =======================
user.post("/change-password", authenticateToken, async (req, res) => {
    try {
        const { current_password, new_password } = req.body;
        
        if (!PASSWORD_REGEX.test(new_password)) {
            return res.status(400).json({ status: 400, message: "Password must be at least 8 characters long and include an uppercase letter, lowercase letter, number, and special character." });
        }

        const [rows] = await connection.execute("SELECT u_password FROM user_info WHERE u_id = ?", [req.user.id]);
        if (!comparePassword(current_password, rows[0].u_password)) return res.status(400).json({ status: 400, message: "Wrong password" });

        await connection.execute("UPDATE user_info SET u_password = ? WHERE u_id = ?", [hashPassword(new_password), req.user.id]);
        res.status(200).json({ status: 200, message: "Changed" });
    } catch (err) {
        res.status(500).json({ status: 500, message: err.message });
    }
});

user.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        const [rows] = await connection.execute("SELECT u_id FROM user_info WHERE u_email = ?", [email]);
        if (rows.length === 0) return res.status(404).json({ status: 404, message: "Not found" });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await connection.execute("INSERT INTO email_otp (email, otp, type, expires_at) VALUES (?, ?, 'reset', ?) ON DUPLICATE KEY UPDATE otp=VALUES(otp), type=VALUES(type), expires_at=VALUES(expires_at)",
            [email, otp, new Date(Date.now() + 15 * 60 * 1000)]);

        console.log(`[TESTING] PASSWORD RESET OTP for ${email}: ${otp}`);

        sendEmail(email, "Reset OTP", `OTP: ${otp}`);
        res.status(200).json({ status: 200, message: "Sent" });
    } catch (err) {
        res.status(500).json({ status: 500, message: err.message });
    }
});

user.post("/reset-password", async (req, res) => {
    try {
        const { email, otp, new_password } = req.body;

        if (!PASSWORD_REGEX.test(new_password)) {
            return res.status(400).json({ status: 400, message: "Password must be at least 8 characters long and include an uppercase letter, lowercase letter, number, and special character." });
        }

        const [rows] = await connection.execute("SELECT * FROM email_otp WHERE email=? AND otp=? AND type='reset'", [email, otp]);
        if (rows.length === 0 || new Date() > new Date(rows[0].expires_at)) return res.status(400).json({ status: 400, message: "Invalid/Expired" });

        await connection.execute("UPDATE user_info SET u_password = ? WHERE u_email = ?", [hashPassword(new_password), email]);
        await connection.execute("DELETE FROM email_otp WHERE email=? AND type='reset'", [email]);
        res.status(200).json({ status: 200, message: "Reset" });
    } catch (err) {
        res.status(500).json({ status: 500, message: err.message });
    }
});

export default user;
