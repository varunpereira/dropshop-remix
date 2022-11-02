import mongoose from 'mongoose'

var schema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.models.task || mongoose.model('task', schema, 'task')
