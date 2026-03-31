-- Milestone 2 Database Changes

CREATE TABLE IF NOT EXISTS advising_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    u_id INT NOT NULL,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_term VARCHAR(50) NOT NULL,
    last_gpa DECIMAL(3, 2) NOT NULL,
    advising_term VARCHAR(50) NOT NULL,
    status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    FOREIGN KEY (u_id) REFERENCES user_info(u_id)
);

CREATE TABLE IF NOT EXISTS advising_courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    advising_id INT NOT NULL,
    level VARCHAR(50) NOT NULL,
    course_name VARCHAR(100) NOT NULL,
    FOREIGN KEY (advising_id) REFERENCES advising_records(id) ON DELETE CASCADE
);

-- Master list for dropdowns
CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_name VARCHAR(100) NOT NULL,
    level VARCHAR(50) NOT NULL
);

-- Completed courses by student (for validation)
CREATE TABLE IF NOT EXISTS student_courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    u_id INT NOT NULL,
    course_name VARCHAR(100) NOT NULL,
    term_taken VARCHAR(50) NOT NULL,
    FOREIGN KEY (u_id) REFERENCES user_info(u_id)
);

-- Sample Data for Courses
INSERT INTO courses (course_name, level) VALUES 
('CS101 - Intro to CS', 'Undergraduate'),
('CS201 - Data Structures', 'Undergraduate'),
('CS301 - Algorithms', 'Undergraduate'),
('CS418 - Web Programming', 'Undergraduate'),
('CS518 - Advanced Web', 'Graduate'),
('CS600 - Research Methods', 'Graduate');

-- Example of a course already taken by the default test user (u_id = 1)
-- Nasreen Arif (u_id=1) has taken CS101 in Fall 2023.
INSERT INTO student_courses (u_id, course_name, term_taken) VALUES 
(1, 'CS101 - Intro to CS', 'Fall 2023');
