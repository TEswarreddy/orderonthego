const express = require("express");
const router = express.Router();
const {
  createStaffInvite,
  completeStaffInvite,
  listStaff,
  approveStaff,
  getPendingStatusRequests,
  approveStatusRequest,
  rejectStatusRequest,
} = require("../controllers/staffController");
const { protect, authorize } = require("../middlewares/authMiddleware");

// Public completion endpoint for invited staff
router.post("/invites/:token/complete", completeStaffInvite);

// Restaurant owner endpoints
router.post("/invites", protect, authorize("RESTAURANT"), createStaffInvite);
router.get("/members", protect, authorize("RESTAURANT"), listStaff);
router.put("/members/:id/approve", protect, authorize("RESTAURANT"), approveStaff);

router.get("/status-requests", protect, authorize("RESTAURANT"), getPendingStatusRequests);
router.put("/status-requests/:id/approve", protect, authorize("RESTAURANT"), approveStatusRequest);
router.put("/status-requests/:id/reject", protect, authorize("RESTAURANT"), rejectStatusRequest);

module.exports = router;
