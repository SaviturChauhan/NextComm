const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * Create a notification for a user
 */
const createNotification = async ({
  userId,
  type,
  title,
  message,
  link = '',
  relatedUser = null,
  relatedQuestion = null,
  relatedAnswer = null,
  metadata = {}
}) => {
  try {
    // Don't notify if user is notifying themselves
    if (relatedUser && relatedUser.toString() === userId.toString()) {
      return null;
    }

    const notification = new Notification({
      user: userId,
      type,
      title,
      message,
      link,
      relatedUser,
      relatedQuestion,
      relatedAnswer,
      metadata
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

/**
 * Notify question author when a new answer is posted
 */
const notifyNewAnswer = async (question, answer, answerAuthor) => {
  if (!question.author || question.author.toString() === answerAuthor._id.toString()) {
    return;
  }

  return await createNotification({
    userId: question.author,
    type: 'NEW_ANSWER',
    title: 'New Answer on Your Question',
    message: `${answerAuthor.username} answered your question: "${question.title}"`,
    link: `/question/${question._id}`,
    relatedUser: answerAuthor._id,
    relatedQuestion: question._id,
    relatedAnswer: answer._id
  });
};

/**
 * Notify answer author when their answer is accepted
 */
const notifyAnswerAccepted = async (answer, questionAuthor, questionTitle = null) => {
  if (!answer.author || answer.author.toString() === questionAuthor._id.toString()) {
    return;
  }

  const questionTitleText = questionTitle || 'their question';

  return await createNotification({
    userId: answer.author,
    type: 'ANSWER_ACCEPTED',
    title: 'Your Answer Was Accepted',
    message: `${questionAuthor.username} accepted your answer on "${questionTitleText}"`,
    link: `/question/${answer.question}`,
    relatedUser: questionAuthor._id,
    relatedQuestion: answer.question,
    relatedAnswer: answer._id
  });
};

/**
 * Notify content author when their content is upvoted
 */
const notifyUpvote = async (contentType, content, voter, questionId = null) => {
  if (!content.author || content.author.toString() === voter._id.toString()) {
    return;
  }

  const type = contentType === 'answer' ? 'ANSWER_UPVOTED' : 'QUESTION_UPVOTED';
  const title = contentType === 'answer' 
    ? 'Your Answer Was Upvoted' 
    : 'Your Question Was Upvoted';
  const link = questionId 
    ? `/question/${questionId}` 
    : `/question/${content._id}`;

  return await createNotification({
    userId: content.author,
    type,
    title,
    message: `${voter.username} upvoted your ${contentType}`,
    link,
    relatedUser: voter._id,
    relatedQuestion: questionId || (contentType === 'question' ? content._id : null),
    relatedAnswer: contentType === 'answer' ? content._id : null
  });
};

/**
 * Notify user when they are mentioned
 */
const notifyMention = async (mentionedUserId, mentioner, content, contentType, questionId) => {
  if (mentionedUserId.toString() === mentioner._id.toString()) {
    return;
  }

  const link = questionId ? `/question/${questionId}` : '/dashboard';
  const contentPreview = content.length > 100 ? content.substring(0, 100) + '...' : content;

  return await createNotification({
    userId: mentionedUserId,
    type: 'MENTIONED',
    title: 'You Were Mentioned',
    message: `${mentioner.username} mentioned you in a ${contentType}`,
    link,
    relatedUser: mentioner._id,
    relatedQuestion: questionId,
    metadata: { contentPreview }
  });
};

/**
 * Notify user when they earn a new badge
 */
const notifyBadgeEarned = async (userId, badgeName, badgeDescription) => {
  return await createNotification({
    userId,
    type: 'BADGE_EARNED',
    title: 'New Badge Earned!',
    message: `Congratulations! You earned the "${badgeName}" badge: ${badgeDescription}`,
    link: `/profile/${userId}`,
    metadata: { badgeName, badgeDescription }
  });
};

/**
 * Detect mentions in text (@username)
 */
const detectMentions = (text) => {
  if (!text) return [];
  
  // Match @username pattern (username can contain letters, numbers, underscores)
  const mentionRegex = /@(\w+)/g;
  const mentions = [];
  let match;
  
  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1]);
  }
  
  return [...new Set(mentions)]; // Remove duplicates
};

/**
 * Process mentions in content and create notifications
 */
const processMentions = async (content, mentioner, contentType, questionId) => {
  const mentionedUsernames = detectMentions(content);
  
  if (mentionedUsernames.length === 0) {
    return;
  }

  // Find all mentioned users
  const mentionedUsers = await User.find({
    username: { $in: mentionedUsernames }
  });

  // Create notifications for each mentioned user
  const notifications = [];
  for (const user of mentionedUsers) {
    const notification = await notifyMention(
      user._id,
      mentioner,
      content,
      contentType,
      questionId
    );
    if (notification) {
      notifications.push(notification);
    }
  }

  return notifications;
};

module.exports = {
  createNotification,
  notifyNewAnswer,
  notifyAnswerAccepted,
  notifyUpvote,
  notifyMention,
  notifyBadgeEarned,
  detectMentions,
  processMentions
};

