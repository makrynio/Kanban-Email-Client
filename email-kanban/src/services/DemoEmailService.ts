import { DemoLabel, DemoEmail } from '../types';

export const demoEmailService = {
  getLabels: (): Promise<DemoLabel[]> => {
    return Promise.resolve([
      {
        id: 'inbox',
        name: 'Inbox',
        unreadCount: 3,
        totalCount: 12
      },
      {
        id: 'sent',
        name: 'Sent',
        unreadCount: 0,
        totalCount: 8
      },
      {
        id: 'drafts',
        name: 'Drafts',
        unreadCount: 0,
        totalCount: 2
      },
      {
        id: 'spam',
        name: 'Spam',
        unreadCount: 0,
        totalCount: 1
      }
    ]);
  },

  getMessages: (folderId: string): Promise<DemoEmail[]> => {
    const emails: DemoEmail[] = [
      {
        id: '1',
        subject: 'Project Update - Q4 Goals',
        sender: {
          name: 'Sarah Johnson',
          email: 'sarah.johnson@company.com'
        },
        recipients: [
          {
            name: 'Team Lead',
            email: 'team@company.com'
          }
        ],
        body: 'Hi team, I wanted to share an update on our Q4 project goals. We\'re making great progress on the new feature development and should be ready for testing by next week. Please review the attached roadmap and let me know if you have any questions.',
        snippet: 'Hi team, I wanted to share an update on our Q4 project goals...',
        date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        attachments: [
          {
            id: 'att1',
            name: 'Q4_Roadmap.pdf',
            size: 1024000,
            type: 'application/pdf'
          }
        ],
        unread: true,
        archived: false,
        priority: 'high'
      },
      {
        id: '2',
        subject: 'Weekly Team Meeting Reminder',
        sender: {
          name: 'Mike Chen',
          email: 'mike.chen@company.com'
        },
        recipients: [
          {
            name: 'Development Team',
            email: 'dev-team@company.com'
          }
        ],
        body: 'Just a reminder that we have our weekly team meeting tomorrow at 10 AM. Agenda items include: 1) Sprint review, 2) Bug triage, 3) Next sprint planning. Please come prepared with your updates.',
        snippet: 'Just a reminder that we have our weekly team meeting tomorrow...',
        date: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        attachments: [],
        unread: true,
        archived: false,
        priority: 'medium'
      },
      {
        id: '3',
        subject: 'Lunch plans for Friday?',
        sender: {
          name: 'Alex Rodriguez',
          email: 'alex.rodriguez@company.com'
        },
        recipients: [
          {
            name: 'Team',
            email: 'team@company.com'
          }
        ],
        body: 'Hey everyone! Anyone interested in grabbing lunch together this Friday? I was thinking we could try that new Thai place downtown. Let me know if you\'re in!',
        snippet: 'Hey everyone! Anyone interested in grabbing lunch together...',
        date: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        attachments: [],
        unread: false,
        archived: false,
        priority: 'low'
      },
      {
        id: '4',
        subject: 'Code Review Request - User Authentication',
        sender: {
          name: 'David Kim',
          email: 'david.kim@company.com'
        },
        recipients: [
          {
            name: 'Senior Developers',
            email: 'senior-dev@company.com'
          }
        ],
        body: 'I\'ve completed the implementation of the new user authentication system. The code includes JWT token handling, password hashing, and role-based access control. Please review and let me know if you spot any issues or have suggestions for improvement.',
        snippet: 'I\'ve completed the implementation of the new user authentication...',
        date: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
        attachments: [],
        unread: false,
        archived: false,
        priority: 'high'
      },
      {
        id: '5',
        subject: 'Office Supplies Order Confirmation',
        sender: {
          name: 'Procurement Team',
          email: 'procurement@company.com'
        },
        recipients: [
          {
            name: 'All Staff',
            email: 'all-staff@company.com'
          }
        ],
        body: 'Your office supplies order has been confirmed and will be delivered next Tuesday. Items include: printer paper, pens, notebooks, and coffee supplies. The order will be delivered to the main reception area.',
        snippet: 'Your office supplies order has been confirmed and will be...',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        attachments: [],
        unread: false,
        archived: true,
        priority: 'low'
      },
      {
        id: '6',
        subject: 'Holiday Schedule Update',
        sender: {
          name: 'HR Department',
          email: 'hr@company.com'
        },
        recipients: [
          {
            name: 'All Employees',
            email: 'all-employees@company.com'
          }
        ],
        body: 'We\'ve updated the holiday schedule for the upcoming year. The office will be closed on: New Year\'s Day, Memorial Day, Independence Day, Labor Day, Thanksgiving, and Christmas. Please plan your time off accordingly.',
        snippet: 'We\'ve updated the holiday schedule for the upcoming year...',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        attachments: [
          {
            id: 'att2',
            name: '2024_Holiday_Calendar.pdf',
            size: 512000,
            type: 'application/pdf'
          }
        ],
        unread: false,
        archived: true,
        priority: 'medium'
      }
    ];

    // Filter by folder if needed
    if (folderId === 'inbox') {
      return Promise.resolve(emails.filter(email => !email.archived));
    } else if (folderId === 'sent') {
      return Promise.resolve([]); // Demo doesn't have sent emails
    } else if (folderId === 'drafts') {
      return Promise.resolve([]); // Demo doesn't have drafts
    } else if (folderId === 'spam') {
      return Promise.resolve([]); // Demo doesn't have spam
    }

    return Promise.resolve(emails);
  }
};

