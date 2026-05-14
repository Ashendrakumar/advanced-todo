const express = require("express");
const router = express.Router();
const passport = require("passport");
const authController = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");

router.post("/register", authController.register);
router.get("/verify-email/:token", authController.verifyEmail);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.post("/accept-invite", authController.acceptInvite);
router.post("/guest", authController.guestAccess);
router.get("/me", protect, authController.getMe);

// Google OAuth
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/auth/login?error=oauth_failed",
  }),
  authController.googleCallback,
);

module.exports = router;
