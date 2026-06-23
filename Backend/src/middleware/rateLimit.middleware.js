const rateLimitStore = {};

const createLimiter = (windowMs, maxRequests, message) => {
  return (req, res, next) => {
    // Obtain client IP (trust x-forwarded-for if behind reverse proxy like Render)
    const ip = req.headers["x-forwarded-for"]?.split(",")[0].trim() || req.ip || req.socket.remoteAddress;
    const now = Date.now();
    
    if (!rateLimitStore[ip]) {
      rateLimitStore[ip] = [];
    }
    
    // Filter out timestamps older than the window
    rateLimitStore[ip] = rateLimitStore[ip].filter(timestamp => now - timestamp < windowMs);
    
    if (rateLimitStore[ip].length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: message || "Too many requests. Please try again later."
      });
    }
    
    rateLimitStore[ip].push(now);
    next();
  };
};

module.exports = {
  loginLimiter: createLimiter(15 * 60 * 1000, 5, "Too many login attempts. Please try again after 15 minutes."),
  forgotPasswordLimiter: createLimiter(15 * 60 * 1000, 3, "Too many password reset requests. Please try again after 15 minutes.")
};
