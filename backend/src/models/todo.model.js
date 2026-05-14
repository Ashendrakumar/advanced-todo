const mongoose = require("mongoose");

const simpleItemSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    description: { type: String, default: "" },
    isCompleted: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const simpleStepSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    items: [simpleItemSchema],
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const simpleTodoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "private",
    },
    steps: [simpleStepSchema],
    useSteps: { type: Boolean, default: false },
  },
  { timestamps: true },
);

simpleTodoSchema.virtual("stats").get(function () {
  let total = 0,
    completed = 0;
  if (this.useSteps) {
    this.steps.forEach((s) =>
      s.items.forEach((i) => {
        total++;
        if (i.isCompleted) completed++;
      }),
    );
  } else {
    const flat = this.steps[0]?.items || [];
    flat.forEach((i) => {
      total++;
      if (i.isCompleted) completed++;
    });
  }
  return {
    total,
    completed,
    percent: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
});

simpleTodoSchema.set("toJSON", { virtuals: true });
simpleTodoSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("SimpleTodo", simpleTodoSchema);
