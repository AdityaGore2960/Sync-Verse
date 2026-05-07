const User = require('../models/User.model');

// ─── Get User Profile ─────────────────────────────────────────────────────────
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, user: user.toPublicJSON() });
  } catch (err) {
    next(err);
  }
};

// ─── Update Own Profile ───────────────────────────────────────────────────────
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, avatar },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, user: user.toPublicJSON() });
  } catch (err) {
    next(err);
  }
};

// ─── Search Users (for sharing) ───────────────────────────────────────────────
exports.searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.status(400).json({ success: false, message: 'Query too short' });
    }

    const users = await User.find({
      $or: [
        { name:  { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ],
      _id: { $ne: req.user.id },   // Exclude self
    }).limit(10).select('name email avatar');

    res.status(200).json({ success: true, users });
  } catch (err) {
    next(err);
  }
};
// ─── Get Favorite Documents ──────────────────────────────────────────────────
exports.getFavorites = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'favorites',
      populate: [
        { path: 'owner', select: 'name email avatar' },
        { path: 'lastEditedBy', select: 'name email avatar' }
      ]
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, documents: user.favorites });
  } catch (err) {
    next(err);
  }
};

// ─── Toggle Favorite Status ──────────────────────────────────────────────────
exports.toggleFavorite = async (req, res, next) => {
  try {
    const { docId } = req.params;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isFavorited = user.favorites.includes(docId);

    if (isFavorited) {
      user.favorites.pull(docId);
    } else {
      user.favorites.push(docId);
    }

    await user.save();

    res.status(200).json({
      success: true,
      isFavorited: !isFavorited,
      message: !isFavorited ? 'Added to favorites' : 'Removed from favorites'
    });
  } catch (err) {
    next(err);
  }
};
