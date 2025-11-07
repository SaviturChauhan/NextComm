# NextComm Points System - Complete Implementation

## 📊 Points & Reputation System

### ✅ Ways to EARN Points

| Action | Points | Reputation | Location | Description |
|--------|--------|------------|----------|-------------|
| **Ask a Question** | +5 | +1 | Dashboard → Ask Question | Post a well-formatted question |
| **Post an Answer** | +10 | +2 | Question Page → Answer Form | Provide a helpful answer |
| **Question Gets Upvoted** | +2 | +2 | Question Page | Someone upvotes your question |
| **Answer Gets Upvoted** | +3 | +3 | Question Page | Someone upvotes your answer |
| **Answer Gets Accepted** | +50 | +50 | Question Page | Your answer is marked as best solution |

### ❌ Ways to LOSE Points

| Action | Points | Reputation | Location | Description |
|--------|--------|------------|----------|-------------|
| **Question Gets Downvoted** | -1 | -1 | Question Page | Someone downvotes your question |
| **Answer Gets Downvoted** | -2 | -2 | Question Page | Someone downvotes your answer |
| **Delete Your Question** | -5 | -1 | Question Page | Remove your own question |
| **Delete Your Answer** | -10 + (-3/upvote) | -2 + (-1/upvote) | Question Page | Remove your own answer |

## 🎮 Available Actions in UI

### Question Detail Page

**For Everyone (Authenticated):**
- ✅ Upvote Question
- ✅ Downvote Question  
- ✅ Upvote Answers
- ✅ Downvote Answers
- ✅ Post New Answer

**For Question Author Only:**
- ✅ Delete Question (red button at top)
- ✅ Accept Answer (green button on answers)

**For Answer Author Only:**
- ✅ Delete Answer (red button on their own answer)

### Dashboard Page
- ✅ View Questions
- ✅ See Vote Counts
- ✅ Search Questions
- ✅ Filter Questions

### Points Guide Page (`/points-guide`)
- ✅ Complete breakdown of all point-earning actions
- ✅ Visual cards showing points for each action
- ✅ Badge milestones table
- ✅ Pro tips to maximize points

## 🏆 Badge Milestones

| Badge | Points Required | Description |
|-------|----------------|-------------|
| Beginner | 0 | Starting level |
| Contributor | 100 | Active participant |
| Scholar | 250 | Consistent contributor |
| Expert | 500 | Subject matter expert |
| Master | 1000 | Master level |
| Legend | 2000 | Top contributor |
| Elite | 3000 | Elite member |
| Guru | 5000 | Ultimate guru |

## 🔄 Vote Change Handling

The system intelligently handles vote changes:

1. **Change from Upvote to Downvote:**
   - Question: -3 points (removes +2, adds -1)
   - Answer: -5 points (removes +3, adds -2)

2. **Change from Downvote to Upvote:**
   - Question: +3 points (removes -1, adds +2)
   - Answer: +5 points (removes -2, adds +3)

3. **Remove Vote:**
   - Reverts to original points before vote

## 💻 Implementation Details

### Backend Files Modified:
- `routes/questions.js` - Question voting, creation, deletion
- `routes/answers.js` - Answer voting, creation, deletion, acceptance

### Frontend Files Created/Modified:
- `pages/QuestionDetails.js` - Added delete buttons and handlers
- `pages/PointsGuide.js` - NEW complete points guide page
- `App.js` - Added /points-guide route
- `components/layout/Navbar.js` - Added Points link
- `components/layout/Footer.js` - Added Points link

## 🎯 Quick Access

- **View Points Guide:** Click "Points" in navigation bar
- **Delete Question:** Question detail page (author only)
- **Delete Answer:** Question detail page (author only)
- **Vote:** Click thumbs up/down on any question or answer
- **Accept Answer:** Question detail page (question author only)

## 📈 Example Point Calculation

**User Journey Example:**
1. Ask a question: +5 points
2. Question gets 3 upvotes: +6 points (3 × +2)
3. Post an answer: +10 points
4. Answer gets 5 upvotes: +15 points (5 × +3)
5. Answer gets accepted: +50 points

**Total: 86 points from one successful Q&A interaction!**

---

*All points and reputation changes are real-time and immediately reflected in the leaderboard.*
