import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            status: 401,
            message: "Access token required",
            data: null
        });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your_default_secret', (err, user) => {
        if (err) {
            return res.status(403).json({
                status: 403,
                message: "Invalid or expired token",
                data: null
            });
        }
        req.user = user;
        next();
    });
};
