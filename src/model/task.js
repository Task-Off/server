'use strict';

import Mongoose, {Schema} from 'mongoose';

const taskSchema = new Schema({
  name: {type: String, required: true},
  group_ID: {type: String, required: false},
  groupName: {type: String, required: false },
  completed: {type: Boolean, default: false},
  completedBy: {type: String, required: false},
  createDate: {type: Date, default: Date.now()}
})

const Task = Mongoose.model('task', taskSchema);

export default Task;
