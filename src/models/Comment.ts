import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
  articleId: string;
  name: string;
  email: string;
  content: string;
  createdAt: Date;
  isApproved: boolean;
}

const CommentSchema: Schema = new Schema({
  articleId: { 
    type: String, 
    required: true, 
    index: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  isApproved: { 
    type: Boolean, 
    default: true 
  }
});

// Create the model if it doesn't exist
export const Comment = mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);
