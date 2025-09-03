const fs = require('fs');
const path = require('path');
const User = require('../models/User');

// @desc    Update user profile (name,avatar,company details )
exports.updateProfile = async (req, res) => {
  try {
    const {
      name,
      avatar,
      resume,
      companyName,
      companyDescription,
      companyLogo,
    } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.name = name || user.name;
    user.avatar = avatar || user.avatar;
    user.resume = resume || user.resume;

    // if employer, update company details
    if (user.role === 'employer') {
      user.companyName = companyName || user.companyName;
      user.companyDescription = companyDescription || user.companyDescription;
      user.companyLogo = companyLogo || user.companyLogo;
    }

    await user.save();
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      resume: user.resume || '',
      companyName: user.companyName,
      companyDescription: user.companyDescription,
      companyLogo: user.companyLogo,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete resume file (job seeker only)
exports.deleteResume = async (req, res) => {
  try {
    const { resumeUrl } = req.body;
    const fileName = resumeUrl?.split('/')?.pop();

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.role !== 'jobseeker') {
      return res
        .status(403)
        .json({ message: 'Only job seekers can delete resumes' });
    }

    // construct full file path
    const filePath = path.join(__dirname, '../uploads', fileName);

    // check if file exists
    if (fs.existsSync(filePath)) {
      // delete file
      fs.unlinkSync(filePath);
    }
    user.resume = '';
    await user.save();
    return res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get public profile by user ID
exports.getPublicProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
