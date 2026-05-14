const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    description: { type: String, default: "" },
    tag: {
      type: String,
      enum: ["required", "review", "tip", "none"],
      default: "none",
    },
    // createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isCompleted: { type: Boolean, default: false },
    completedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    completedAt: { type: Date },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const stepSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    color: { type: String, default: "#E6F1FB" },
    textColor: { type: String, default: "#185FA5" },
    order: { type: Number, default: 0 },
    items: [itemSchema],
  },
  { timestamps: true },
);

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lead: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        role: { type: String, enum: ["lead", "user"], default: "user" },
        addedAt: { type: Date, default: Date.now },
        inviteToken: { type: String, select: false },
      },
    ],
    steps: [stepSchema],
    status: {
      type: String,
      enum: ["active", "completed", "archived"],
      default: "active",
    },
    isPublic: { type: Boolean, default: false },
    color: { type: String, default: "#4F46E5" },
  },
  { timestamps: true },
);

// Virtual: total items and completed items
projectSchema.virtual("stats").get(function () {
  let total = 0,
    completed = 0;
  this.steps.forEach((step) => {
    step.items.forEach((item) => {
      total++;
      if (item.isCompleted) completed++;
    });
  });
  return {
    total,
    completed,
    percent: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
});

projectSchema.set("toJSON", { virtuals: true });
projectSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Project", projectSchema);
