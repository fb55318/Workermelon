const express = require("express");
const router = express.Router();
const UserController = require("../controllers/UserController");

router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.post('/search', UserController.searchUser);
router.post('/add-friend', UserController.addFriend);
router.get('/:userId/friends', UserController.getFriends);

module.exports = router;
