const express = require('express');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all notifications for current user
router.get('/', auth, async (req, res) => {
  try {
    const { limit = 50, unreadOnly = false } = req.query;
    
    const query = { user: req.userId };
    if (unreadOnly === 'true') {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .populate('relatedUser', 'username avatar')
      .populate('relatedQuestion', 'title')
      .populate('relatedAnswer')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    const unreadCount = await Notification.countDocuments({
      user: req.userId,
      read: false
    });

    res.json({
      notifications,
      unreadCount
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get unread count
router.get('/count', auth, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.userId,
      read: false
    });

    res.json({ count });
  } catch (error) {
    console.error('Error fetching notification count:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark notification as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.read = true;
    await notification.save();

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark all notifications as read
router.put('/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.userId, read: false },
      { read: true }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete notification
router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete all read notifications
router.delete('/read/all', auth, async (req, res) => {
  try {
    await Notification.deleteMany({
      user: req.userId,
      read: true
    });

    res.json({ message: 'All read notifications deleted' });
  } catch (error) {
    console.error('Error deleting read notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;








