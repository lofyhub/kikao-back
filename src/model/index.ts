import mongoose from 'mongoose';
import Role from './role-model';
import User from './user-model';

mongoose.Promise = global.Promise;
mongoose.set('strictQuery', false);

const db: any = {};

db.mongoose = mongoose;
db.user = User;
db.role = Role;

db.ROLES = ['user', 'admin', 'moderator'];

export default db;
