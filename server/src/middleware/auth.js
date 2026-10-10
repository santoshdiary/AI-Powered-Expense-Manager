import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ message: "Sign in required." });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch {
    return res
      .status(401)
      .json({ message: "Invalid or expired session. Sign in again." });
  }
}
