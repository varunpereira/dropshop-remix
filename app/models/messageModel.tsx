import mongoose from 'mongoose'

var schema = new mongoose.Schema(
  {
    email1: {
      type: String,
    },
    email2: {
      type: String,
    },
    messages: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.models.messages ||
  mongoose.model('messages', schema, 'messages')
