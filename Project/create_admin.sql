-- Add an admin user manually to the database
-- Note: Replace with actual hashed password for production
-- The password 'admin123' hashed with bcrypt (standard 10 rounds) is roughly:
-- $2b$10$q.F0c6kXzH/E0g1q1j6I7.6yU4H8Z8e8T0j0n0n0n0n0n0n0n0n0n (this is a placeholder, use util.js to hash if needed)

-- For simplicity, let's use the register endpoint or a script.
-- Since I need to do it "from the backend", I'll provide the SQL.

INSERT INTO `user_info` (`u_first_name`, `u_last_name`, `u_email`, `u_uin`, `u_password`, `u_is_verified`, `u_is_admin`) 
VALUES ('System', 'Admin', 'admin@example.com', '000000000', 'HASHED_PASSWORD_HERE', 1, 1);
