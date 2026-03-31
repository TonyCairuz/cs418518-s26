import { Router } from "express";
import { connection } from "../database/connection.js";
import { authenticateToken } from "../middleware/auth.js";

const advising = Router();

// =======================
// GET ADVISING HISTORY
// =======================
advising.get("/history", authenticateToken, async (req, res) => {
    try {
        const [rows] = await connection.execute(
            "SELECT id, date, advising_term, status FROM advising_records WHERE u_id = ? ORDER BY date DESC",
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
    try {
        await connection.beginTransaction();

        const { last_term, last_gpa, advising_term, courses } = req.body;

        // Validation for missing fields
        if (!last_term || !last_gpa || !advising_term || !courses || courses.length === 0) {
            return res.status(400).json({ status: 400, message: "Missing required fields" });
        }

        // Insert Header Record
        const [result] = await connection.execute(
            `INSERT INTO advising_records (u_id, last_term, last_gpa, advising_term, status)
            VALUES (?, ?, ?, ?, 'Pending')`,
            [req.user.id, last_term, last_gpa, advising_term]
        );

        const advisingId = result.insertId;

        // Insert Course Plan
        for (const course of courses) {
            await connection.execute(
                "INSERT INTO advising_courses (advising_id, level, course_name) VALUES (?, ?, ?)",
                [advisingId, course.level, course.course_name]
            );
        }

        await connection.commit();
        res.status(201).json({ status: 201, message: "Advising record submitted successfully", id: advisingId });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ status: 500, message: err.message });
    }
});

// =======================
// UPDATE ADVISING
// =======================
advising.put("/update/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { last_term, last_gpa, advising_term, courses } = req.body;

        // Check if record exists and is pending
        const [records] = await connection.execute(
            "SELECT status FROM advising_records WHERE id = ? AND u_id = ?",
            [id, req.user.id]
        );

        if (records.length === 0) {
            return res.status(404).json({ status: 404, message: "Record not found" });
        }

        if (records[0].status !== 'Pending') {
            return res.status(403).json({ status: 403, message: "Only pending records can be edited" });
        }

        await connection.beginTransaction();

        // Update Header
        await connection.execute(
            "UPDATE advising_records SET last_term = ?, last_gpa = ?, advising_term = ? WHERE id = ?",
            [last_term, last_gpa, advising_term, id]
        );

        // Delete old courses and insert new ones
        await connection.execute("DELETE FROM advising_courses WHERE advising_id = ?", [id]);
        for (const course of courses) {
            await connection.execute(
                "INSERT INTO advising_courses (advising_id, level, course_name) VALUES (?, ?, ?)",
                [id, course.level, course.course_name]
            );
        }

        await connection.commit();
        res.status(200).json({ status: 200, message: "Record updated" });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ status: 500, message: err.message });
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

        // Get courses from completed student_courses table
        const [completed] = await connection.execute(
            "SELECT course_name FROM student_courses WHERE u_id = ?",
            [req.user.id]
        );

        // Get courses from existing advising plans that are NOT rejected
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

        const [advising] = await connection.execute(advisingQuery, params);

        // Combine and deduplicate course names
        const combined = Array.from(new Set([
            ...completed.map(c => c.course_name),
            ...advising.map(c => c.course_name)
        ]));

        res.status(200).json({ status: 200, data: combined.map(name => ({ course_name: name })) });
    } catch (err) {
        res.status(500).json({ status: 500, message: err.message });
    }
});

export default advising;
