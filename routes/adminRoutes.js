const { getPendingDoctors, verifyDoctor, getAllUsers, getAllDoctors, blockUser, unblockUser, deleteUser, auditLog, sendNotification } = require('../controllers/adminController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

const express = require('express');
const adminRouter = express.Router();


adminRouter.use(protect, restrictTo('admin'));

//Verify Doctor
adminRouter.get('/doctors/pending', getPendingDoctors);
adminRouter.patch('/doctors/:id/approve', verifyDoctor);
adminRouter.patch('/doctors/:id/reject', verifyDoctor);

//Get Users (Patients, Doctors)
adminRouter.get('/users', getAllUsers);
adminRouter.get('/doctors', getAllDoctors);

//Control Users
adminRouter.patch("/users/:id/block", blockUser);
adminRouter.patch("/users/:id/unblock", unblockUser);
adminRouter.delete("/users/:id", deleteUser);

//Auditlog
adminRouter.get("/logs", auditLog); 

//Send Notification
adminRouter.post('/notify', sendNotification);

module.exports = adminRouter;