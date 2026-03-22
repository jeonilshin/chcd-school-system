# 📨 How to Use the Messaging System

## Overview
The messaging system allows communication between:
- **Parents** ↔ **Teachers**
- **Parents** ↔ **Admins**
- **Parents** ↔ **Principals**

## For Parents

### Accessing Messages
1. Login as a parent (parent@test.com / password123)
2. Click "Messages" in the left sidebar
3. You'll see a list of your conversations

### Starting a Conversation
Currently, conversations are initiated when:
- A teacher/admin messages you first
- You reply to an existing conversation

### Sending Messages
1. Click on a conversation from the list
2. Type your message in the input box at the bottom
3. Press Enter or click "Send"
4. Use Shift+Enter for new lines

### Features Available
- ✅ Real-time updates (messages refresh every 5 seconds)
- ✅ Search conversations
- ✅ Archive conversations
- ✅ File attachments (click 📎 button)
- ✅ Edit your messages (click "Edit")
- ✅ Delete your messages (click "Delete")
- ✅ Push notifications (click 🔔 bell icon)
- ✅ Unread message counter

## For Teachers

### Accessing Messages
1. Login as a teacher
2. Click "Messages" in the left sidebar
3. You'll see all conversations with parents

### Sending Messages
1. Select a parent from the conversation list
2. Type your message and press Enter or click "Send"
3. Messages appear in blue on the right side

### Creating Announcements
1. Click "Announcements" in the sidebar
2. Click "Create Announcement"
3. Fill in:
   - Title
   - Content
   - Category (General, Academic, Event, Health, Emergency)
   - Priority (Low, Normal, High)
   - Expiry Date (optional)
4. Click "Post Announcement"

## For Admins/Principals

### Accessing Messages
1. Login as admin (admin@test.com / password123)
2. Click "Messages" in the left sidebar
3. You'll see all conversations with parents

### Sending Messages
Same as teachers - select a conversation and start messaging!

## How Conversations Work

### Conversation Creation
Conversations are automatically created when:
1. A parent sends their first message to a teacher/admin
2. A teacher/admin sends their first message to a parent

### Message Flow
```
Parent → Teacher/Admin
  ↓
Teacher/Admin receives notification
  ↓
Teacher/Admin replies
  ↓
Parent receives message (auto-refresh every 5s)
```

## Testing the System

### Test Scenario 1: Parent to Teacher
1. Login as parent (parent@test.com)
2. Go to Messages
3. If no conversations exist, you need a teacher to message you first

### Test Scenario 2: Teacher to Parent
1. Login as teacher
2. Go to Messages
3. You should see conversations with parents
4. Click on a parent and send a message
5. Parent will see it when they refresh or after 5 seconds

### Test Scenario 3: Admin to Parent
1. Login as admin (admin@test.com)
2. Go to Messages
3. Select a parent conversation
4. Send a message

## Creating Initial Conversations

If you don't see any conversations, you need to create them via the API or database:

### Option 1: Via API (Recommended)
```bash
# Create a conversation between parent and teacher
curl -X POST http://localhost:3000/api/conversations \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "parentId": "parent-user-id",
    "recipientId": "teacher-user-id",
    "recipientRole": "TEACHER",
    "subject": "Question about assignment"
  }'
```

### Option 2: Via Database
Run this in your database console:
```sql
INSERT INTO "Conversation" (id, "parentId", "recipientId", "recipientRole", "lastMessageAt", "createdAt", "updatedAt")
VALUES (
  'conv_' || gen_random_uuid(),
  'parent-user-id',
  'teacher-user-id',
  'TEACHER',
  NOW(),
  NOW(),
  NOW()
);
```

### Option 3: Send First Message
When a parent or teacher sends their first message, a conversation is automatically created!

## Troubleshooting

### No conversations showing?
- Make sure you're logged in with the correct role
- Check that conversations exist in the database
- Try refreshing the page

### Messages not updating?
- Messages auto-refresh every 5 seconds
- Try manually refreshing the page
- Check browser console for errors

### Can't send messages?
- Make sure you've selected a conversation
- Check that the message input is not empty
- Verify you're logged in

### Push notifications not working?
1. Click the bell icon (🔕)
2. Allow notifications when browser prompts
3. Bell should turn to 🔔
4. Make sure you've added VAPID keys to .env.local

## Advanced Features

### File Attachments
1. Click the 📎 button
2. Select a file (max 10MB)
3. File uploads automatically
4. Message sent with attachment link

### Message Editing
1. Hover over your message
2. Click "Edit"
3. Modify the text
4. Click "Save"
5. Message shows "(edited)" label

### Message Deletion
1. Hover over your message
2. Click "Delete"
3. Confirm deletion
4. Message content replaced with "This message has been deleted"

### Push Notifications
1. Click bell icon in messages
2. Allow browser notifications
3. Receive notifications for new messages
4. Works even when tab is closed!

## API Endpoints

### Conversations
- `GET /api/conversations` - List all conversations
- `GET /api/conversations/[id]` - Get conversation with messages
- `POST /api/conversations` - Create new conversation
- `PATCH /api/conversations/[id]/archive` - Archive conversation

### Messages
- `GET /api/messages` - List messages (with filters)
- `POST /api/messages` - Send new message
- `PATCH /api/messages/[id]` - Edit message
- `DELETE /api/messages/[id]` - Delete message

### Announcements
- `GET /api/announcements` - List announcements
- `POST /api/announcements` - Create announcement
- `DELETE /api/announcements/[id]` - Delete announcement

## Tips

1. **Use Search**: Quickly find conversations by typing in the search box
2. **Archive Old Chats**: Keep your inbox clean by archiving completed conversations
3. **Check Unread Counter**: Red badge shows number of unread messages
4. **Enable Notifications**: Never miss a message with push notifications
5. **Use Shift+Enter**: Add line breaks in your messages

## Next Steps

Want to enhance the messaging system? Consider:
- Group messaging (database schema already supports it!)
- WebSocket for instant updates (currently using 5-second polling)
- Voice messages
- Video calls
- Message reactions (👍, ❤️, etc.)
- Read receipts
- Typing indicators

---

Need help? Check the other documentation files:
- `ADVANCED_FEATURES_COMPLETE.md` - All advanced features
- `FINAL_SETUP_GUIDE.md` - Complete setup guide
- `docs/SAMPLE_DATA_GUIDE.md` - Test accounts
