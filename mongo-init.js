// MongoDB initialization script
db = db.getSiblingDB('hostel_management');

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'email', 'password', 'role'],
      properties: {
        name: { bsonType: 'string', minLength: 1 },
        email: { bsonType: 'string', pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$' },
        password: { bsonType: 'string', minLength: 6 },
        role: { enum: ['STUDENT', 'CARETAKER', 'MANAGEMENT'] }
      }
    }
  }
});

db.createCollection('issues', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['title', 'description', 'category', 'priority', 'reporter'],
      properties: {
        title: { bsonType: 'string', minLength: 1 },
        description: { bsonType: 'string', minLength: 1 },
        category: { enum: ['plumbing', 'electrical', 'internet', 'cleaning', 'furniture', 'security', 'pest_control'] },
        priority: { enum: ['low', 'medium', 'high', 'emergency'] },
        status: { enum: ['reported', 'assigned', 'in_progress', 'resolved', 'closed'] }
      }
    }
  }
});

db.createCollection('announcements');
db.createCollection('polls');
db.createCollection('lostandfound');

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.issues.createIndex({ reporter: 1 });
db.issues.createIndex({ status: 1 });
db.issues.createIndex({ createdAt: -1 });
db.announcements.createIndex({ createdBy: 1 });
db.announcements.createIndex({ createdAt: -1 });
db.polls.createIndex({ createdBy: 1 });
db.polls.createIndex({ expiresAt: 1 });
db.lostandfound.createIndex({ type: 1 });
db.lostandfound.createIndex({ status: 1 });
db.lostandfound.createIndex({ createdAt: -1 });

print('Database initialized successfully');
