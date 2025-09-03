const Application = require('../models/Application');
const Job = require('../models/Job');

//|> @desc    Apply to a job
exports.applyToJob = async (req, res) => {
  try {
    if (req.user.role !== 'jobseeker') {
      return res
        .status(403)
        .json({ message: 'Only jobseekers can apply to jobs' });
    }
    const exiting = await Application.findOne({
      job: req.params.jobId,
      applicant: req.user._id,
    });
    if (exiting) {
      return res
        .status(400)
        .json({ message: 'You have already applied to this job' });
    }
    const application = await Application.create({
      job: req.params.jobId,
      applicant: req.user._id,
      resume: req.user.resume, // Assuming resume is stored in user profile
    });
    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//|> @desc    Get logged in user's applications
exports.getMyApplications = async (req, res) => {
  try {
    const apps = await Application.find({ applicant: req.user._id })
      .populate('job', 'title company location type')
      .sort({ createdAt: -1 });
    res.json(apps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//|> @desc    Get all applications for a job (employer)
exports.getApplicationsForJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job || job.company.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: 'Not authorized to view applications for this job' });
    }
    const applications = await Application.find({ job: req.params.jobId })
      .populate('job', 'title company location type category')
      .populate('applicant', 'name email avatar resume');

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//|> @desc    Get application by ID (jobseeker or employer )
exports.getApplicationById = async (req, res) => {
  try {
    const app = await Application.findById(req.params.id)
      .populate('job', 'title')
      .populate('applicant', 'name email avatar resume');

    if (!app) {
      return res
        .status(404)
        .json({ message: 'Application not found', id: req.params.id });
    }
    const isOwner =
      app.applicant._id.toString() === req.user._id.toString() ||
      app.job.company.toString() === req.user._id.toString();
    if (!isOwner) {
      return res
        .status(403)
        .json({ message: 'Not authorized to view this application' });
    }
    res.json(app);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//|> @desc    Update application status (employer)
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const app = await Application.findById(req.params.id).populate('job');
    if (!app || app.job.company.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: 'Not authorized to update this application' });
    }
    app.status = status;
    await app.save();
    res.json({ message: 'Application status updated', status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
