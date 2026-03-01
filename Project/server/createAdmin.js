import { connection } from "./database/connection.js";
import { hashPassword } from "./helper/util.js";

async function createAdmin() {
    const firstName = "System";
    const lastName = "Admin";
    const email = "admin@example.com";
    const uin = "000000000";
    const password = "adminpassword123";
    const hashedPassword = hashPassword(password);

    try {
        await connection.execute(
            `INSERT INTO user_info (u_first_name, u_last_name, u_email, u_uin, u_password, u_is_verified, u_is_admin)
            VALUES (?, ?, ?, ?, ?, 1, 1)`,
            [firstName, lastName, email, uin, hashedPassword]
        );
        console.log("Admin user created successfully!");
        console.log("Email: " + email);
        console.log("Password: " + password);
    } catch (err) {
        console.error("Error creating admin:", err.message);
    } finally {
        process.exit();
    }
}

createAdmin();
