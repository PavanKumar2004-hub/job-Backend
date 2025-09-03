const SavedJob = require('../models/SavedJob');

//|> @desc    Save a job
exports.saveJob = async (req, res) => {
  try {
    const exists = await SavedJob.findOne({
      job: req.params.jobId,
      jobseeker: req.user._id,
    });
    if (exists) {
      return res.status(400).json({ message: 'Job already saved' });
    }
    const saved = await SavedJob.create({
      job: req.params.jobId,
      jobseeker: req.user._id,
    });
    res.status(201).json({ message: 'Job saved successfully', saved });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: 'Failed to save job', error: error.message });
  }
};

//|> @desc    Unsave a job
exports.unSaveJob = async (req, res) => {
  try {
    await SavedJob.findOneAndDelete({
      job: req.params.jobId,
      jobseeker: req.user._id,
    });
    res
      .status(200)
      .json({ message: 'Job removed from saved job list, successfully' });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: 'Failed to unsave job', error: error.message });
  }
};

//|> @desc    Get user's saved jobs for current user
exports.getMySavedJobs = async (req, res) => {
  try {
    const savedJobs = await SavedJob.find({ jobseeker: req.user._id }).populate(
      {
        path: 'job',
        populate: { path: 'company', select: 'name companyName companyLogo' },
      }
    );
    res.status(200).json(savedJobs);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: 'Failed to fetch saved jobs', error: error.message });
  }
};
