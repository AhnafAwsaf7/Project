import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't include passwordHash in queries by default
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    role: {
      type: String,
      enum: ['ENTREPRENEUR', 'INVESTOR', 'MENTOR', 'ADMIN'],
      required: [true, 'Role is required'],
    },
    verificationStatus: {
      type: String,
      enum: ['UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED'],
      default: 'UNVERIFIED',
    },
    verificationMethod: {
      type: String,
      enum: ['DOMAIN', 'DOCUMENT', 'NONE'],
      default: 'NONE',
    },
    verificationRejectionReason: {
      type: String,
      default: null,
    },
    isDuplicate: {
      type: Boolean,
      default: false,
    },
    duplicateOf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    duplicateNotes: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    profile: {
      // Generic fields
      bio: String,
      location: String,
      websiteUrl: String,
      linkedinUrl: String,
      logoUrl: String,
      achievements: [String], // Array of achievement strings
      
      // Startup-specific fields
      entrepreneurData: {
        startupName: String,
        startupPitch: String, // Text block for pitch
        fundingGoal: Number, // Currency amount
        industryCategory: String,
      },
      
      // Investor-specific fields
      investorData: {
        companyName: String,
        expertiseArea: [String], // Array of tags
        investmentThesis: String,
        typicalCheckSize: Number, // Currency amount
      },
      
      // Mentor-specific fields
      mentorData: {
        expertiseAreas: [String],
        yearsExperience: Number,
        specialization: String,
      },
      
      // Admin-specific fields
      adminData: {
        department: String,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

// Method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

const User = mongoose.model('User', userSchema);

export default User;
