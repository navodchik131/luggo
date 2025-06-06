const { sequelize } = require('../config/database');
const User = require('./User');
const Task = require('./Task');
const Bid = require('./Bid');
const Message = require('./Message');
const Review = require('./Review');
const Notification = require('./Notification');
const VehiclePhoto = require('./VehiclePhoto');
const News = require('./News');

// Связи между моделями

// User - Task (один пользователь может иметь много задач)
User.hasMany(Task, { foreignKey: 'userId', as: 'tasks' });
Task.belongsTo(User, { foreignKey: 'userId', as: 'customer' });

// User - Bid (один пользователь может иметь много откликов)
User.hasMany(Bid, { foreignKey: 'userId', as: 'bids' });
Bid.belongsTo(User, { foreignKey: 'userId', as: 'executor' });

// Task - Bid (одна задача может иметь много откликов)
Task.hasMany(Bid, { foreignKey: 'taskId', as: 'bids' });
Bid.belongsTo(Task, { foreignKey: 'taskId', as: 'task' });

// Task - AcceptedBid (одна задача может иметь один принятый отклик)
Task.belongsTo(Bid, { foreignKey: 'acceptedBidId', as: 'acceptedBid' });

// User - Message (отправитель и получатель)
User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'receiverId', as: 'receivedMessages' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });

// Task - Message (сообщения по задаче)
Task.hasMany(Message, { foreignKey: 'taskId', as: 'messages' });
Message.belongsTo(Task, { foreignKey: 'taskId', as: 'task' });

// User - Review (автор и цель отзыва)
User.hasMany(Review, { foreignKey: 'authorId', as: 'writtenReviews' });
User.hasMany(Review, { foreignKey: 'targetId', as: 'receivedReviews' });
Review.belongsTo(User, { foreignKey: 'authorId', as: 'author' });
Review.belongsTo(User, { foreignKey: 'targetId', as: 'target' });

// Task - Review (отзывы по задаче)
Task.hasMany(Review, { foreignKey: 'taskId', as: 'reviews' });
Review.belongsTo(Task, { foreignKey: 'taskId', as: 'task' });

// User - Notification (уведомления пользователя)
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User - VehiclePhoto (пользователь может иметь много фотографий автомобилей)
User.hasMany(VehiclePhoto, { foreignKey: 'userId', as: 'vehiclePhotos' });
VehiclePhoto.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User - News (админ может создавать новости)
User.hasMany(News, { foreignKey: 'authorId', as: 'news' });
News.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

module.exports = {
  sequelize,
  User,
  Task,
  Bid,
  Message,
  Review,
  Notification,
  VehiclePhoto,
  News
}; 