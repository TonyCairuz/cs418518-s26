import { Router } from "express";
import { connection } from "../database/connection.js";
import { authenticateToken } from "../middleware/auth.js";
import { sendEmail } from "../helper/sendmail.js";

const advising = Router();

// =======================
// GET ADVISING HISTORY
// =======================
advising.get("/history", authenticateToken, async (req, res) => {
    try {
        const [rows] = await connection.execute(
            "SELECT id, date, advising_term, status, feedback FROM advising_records WHERE u_id = ? ORDER BY date DESC",
            [req.user.id]
        );
        res.status(200).json({ status: 200, data: rows });
    } catch (err) {
        res.status(500).json({ status: 500, message: err.message });
    }
});

// =======================
// GET SPECIFIC RECORD
// =======================
advising.get("/record/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const [recordRows] = await connection.execute(
            "SELECT * FROM advising_records WHERE id = ? AND u_id = ?",
            [id, req.user.id]
        );

        if (recordRows.length === 0) {
            return res.status(404).json({ status: 404, message: "Record not found" });
        }

        const [courseRows] = await connection.execute(
            "SELECT level, course_name FROM advising_courses WHERE advising_id = ?",
            [id]
        );

        res.status(200).json({ status: 200, data: { ...recordRows[0], courses: courseRows } });
    } catch (err) {
        res.status(500).json({ status: 500, message: err.message });
    }
});

// =======================
// SUBMIT NEW ADVISING
// =======================
advising.post("/submit", authenticateToken, async (req, res) => {
    const conn = await connection.getConnection();
    try {
        await conn.beginTransaction();

        const { last_term, last_gpa, advising_term, courses } = req.body;

        if (!last_term || !last_gpa || !advising_term || !courses || courses.length === 0) {
            await conn.release();
            return res.status(400).json({ status: 400, message: "Missing required fields" });
        }

        const [result] = await conn.execute(
            `INSERT INTO advising_records (u_id, last_term, last_gpa, advising_term, status)
            VALUES (?, ?, ?, ?, 'Pending')`,
            [req.user.id, last_term, last_gpa, advising_term]
        );

        const advisingId = result.insertId;

        for (const course of courses) {
            await conn.execute(
                "INSERT INTO advising_courses (advising_id, level, course_name) VALUES (?, ?, ?)",
                [advisingId, course.level, course.course_name]
            );
        }

        await conn.commit();
        res.status(201).json({ status: 201, message: "Advising record submitted successfully", id: advisingId });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ status: 500, message: err.message });
    } finally {
        conn.release();
    }
});

// =======================
// UPDATE ADVISING
// =======================
advising.put("/update/:id", authenticateToken, async (req, res) => {
    const conn = await connection.getConnection();
    try {
        const { id } = req.params;
        const { last_term, last_gpa, advising_term, courses } = req.body;

        const [records] = await conn.execute(
            "SELECT status FROM advising_records WHERE id = ? AND u_id = ?",
            [id, req.user.id]
        );

        if (records.length === 0) {
            await conn.release();
            return res.status(404).json({ status: 404, message: "Record not found" });
        }

        if (records[0].status !== 'Pending') {
            await conn.release();
            return res.status(403).json({ status: 403, message: "Only pending records can be edited" });
        }

        await conn.beginTransaction();

        await conn.execute(
            "UPDATE advising_records SET last_term = ?, last_gpa = ?, advising_term = ? WHERE id = ?",
            [last_term, last_gpa, advising_term, id]
        );

        await conn.execute("DELETE FROM advising_courses WHERE advising_id = ?", [id]);
        for (const course of courses) {
            await conn.execute(
                "INSERT INTO advising_courses (advising_id, level, course_name) VALUES (?, ?, ?)",
                [id, course.level, course.course_name]
            );
        }

        await conn.commit();
        res.status(200).json({ status: 200, message: "Record updated" });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ status: 500, message: err.message });
    } finally {
        conn.release();
    }
});

// =======================
// DROPDOWNS & VALIDATION
// =======================
advising.get("/available-courses", authenticateToken, async (req, res) => {
    try {
        const [rows] = await connection.execute("SELECT * FROM courses");
        res.status(200).json({ status: 200, data: rows });
    } catch (err) {
        res.status(500).json({ status: 500, message: err.message });
    }
});

advising.get("/taken-courses", authenticateToken, async (req, res) => {
    try {
        const { exclude_id } = req.query;

        const [completed] = await connection.execute(
            "SELECT course_name FROM student_courses WHERE u_id = ?",
            [req.user.id]
        );

        let advisingQuery = `
            SELECT DISTINCT ac.course_name 
            FROM advising_courses ac
            JOIN advising_records ar ON ac.advising_id = ar.id
            WHERE ar.u_id = ? AND ar.status != 'Rejected'
        `;
        let params = [req.user.id];

        if (exclude_id) {
            advisingQuery += " AND ar.id != ?";
            params.push(exclude_id);
        }

        const [advisingCourses] = await connection.execute(advisingQuery, params);

        const combined = Array.from(new Set([
            ...completed.map(c => c.course_name),
            ...advisingCourses.map(c => c.course_name)
        ]));

        res.status(200).json({ status: 200, data: combined.map(name => ({ course_name: name })) });
    } catch (err) {
        res.status(500).json({ status: 500, message: err.message });
    }
});

// =======================
// ADMIN — GET ALL RECORDS
// =======================
advising.get("/admin/all", authenticateToken, async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ status: 403, message: "Forbidden" });
        }
        const [rows] = await connection.execute(`
            SELECT ar.id, ar.advising_term, ar.last_gpa, ar.status,
                   ui.u_first_name, ui.u_last_name, ui.u_email
            FROM advising_records ar
            JOIN user_info ui ON ar.u_id = ui.u_id
            ORDER BY ar.date DESC
        `);
        res.status(200).json({ status: 200, data: rows });
    } catch (err) {
        res.status(500).json({ status: 500, message: err.message });
    }
});

// =======================
// ADMIN — GET SINGLE RECORD
// =======================
advising.get("/admin/record/:id", authenticateToken, async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ status: 403, message: "Forbidden" });
        }
        const { id } = req.params;
        const [recordRows] = await connection.execute(`
            SELECT ar.*, ui.u_first_name, ui.u_last_name, ui.u_email
            FROM advising_records ar
            JOIN user_info ui ON ar.u_id = ui.u_id
            WHERE ar.id = ?
        `, [id]);

        if (recordRows.length === 0) {
            return res.status(404).json({ status: 404, message: "Record not found" });
        }

        const [courseRows] = await connection.execute(
            "SELECT level, course_name FROM advising_courses WHERE advising_id = ?",
            [id]
        );

        res.status(200).json({ status: 200, data: { record: recordRows[0], courses: courseRows } });
    } catch (err) {
        res.status(500).json({ status: 500, message: err.message });
    }
});

// =======================
// ADMIN — APPROVE / REJECT
// =======================
advising.put("/admin/:id", authenticateToken, async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ status: 403, message: "Forbidden" });
        }

        const { id } = req.params;
        const { status, feedback } = req.body;

        if (!["Approved", "Rejected"].includes(status)) {
            return res.status(400).json({ status: 400, message: "Invalid status" });
        }
        if (!feedback || !feedback.trim()) {
            return res.status(400).json({ status: 400, message: "Feedback is required" });
        }

        const [recordRows] = await connection.execute(`
            SELECT ar.id, ui.u_email, ui.u_first_name, ar.advising_term
            FROM advising_records ar
            JOIN user_info ui ON ar.u_id = ui.u_id
            WHERE ar.id = ?
        `, [id]);

        if (recordRows.length === 0) {
            return res.status(404).json({ status: 404, message: "Record not found" });
        }

        await connection.execute(
            "UPDATE advising_records SET status = ?, feedback = ? WHERE id = ?",
            [status, feedback.trim(), id]
        );

        // Send email notification to student (Extra Credit)
        const { u_email, u_first_name, advising_term } = recordRows[0];
        const statusColor = status === "Approved" ? "#10b981" : "#ef4444";
        // Send email notification in background
        sendEmail(
            u_email,
            `Your Course Advising for ${advising_term} has been ${status}`,
            `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: ${statusColor};">Advising Record ${status}</h2>
                <p>Dear ${u_first_name},</p>
                <p>Your course advising request for <strong>${advising_term}</strong> has been reviewed.</p>
                <div style="background: #f5f5f5; border-left: 4px solid ${statusColor}; padding: 1rem; margin: 1rem 0; border-radius: 4px;">
                    <strong>Status:</strong> ${status}<br/><br/>
                    <strong>Admin Feedback:</strong><br/>
                    ${feedback}
                </div>
                <p>Please log in to view the full details of your advising record.</p>
            </div>
            `
        );

        res.status(200).json({ status: 200, message: `Record ${status} successfully` });
    } catch (err) {
        res.status(500).json({ status: 500, message: err.message });
    }
});

export default advising;
