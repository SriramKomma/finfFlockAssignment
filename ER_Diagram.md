# Entity Relationship Diagram

```mermaid
erDiagram
    users {
        int id PK
        string name
        string email
        string password
        datetime created_at
    }
    
    tasks {
        int id PK
        int user_id FK
        string title
        text description
        string priority
        string status
        datetime due_date
        datetime created_at
        datetime updated_at
    }

    task_history {
        int id PK
        int task_id FK
        string action_type
        json previous_state
        datetime timestamp
    }
    
    feedbacks {
        int id PK
        int user_id FK
        int task_id FK
        text comment
        int rating
        datetime created_at
    }

    users ||--o{ tasks : "creates"
    users ||--o{ feedbacks : "provides"
    tasks ||--o{ task_history : "records"
    tasks ||--o| feedbacks : "receives"
```

## Relationships Explanation
1. **User (1) to (Many) Tasks**: A user can create many tasks. The `tasks.user_id` is a foreign key with `ON DELETE CASCADE` so tasks are removed if the user is deleted.
2. **User (1) to (Many) Feedbacks**: Users can leave multiple feedbacks. `ON DELETE CASCADE`.
3. **Task (1) to (Many) TaskHistory**: Every modification to a task logs an entry to the `task_history` table associating it to the specific task ID holding its previous state as a JSON object.
4. **Task (1) to (Zero Or One) Feedbacks**: Optional feedback provided to a task specifically. `ON DELETE SET NULL` protects the feedback metrics if a task is deleted.

## Indexing Decisions
- **`users.email`**: Indexed and unique for constant-time authentication lookup.
- **Foreign Keys**: `tasks.user_id`, `task_history.task_id`, `feedbacks.user_id` are natively indexed to optimize table joins which are necessary for cascading deletes and fetching dashboard data.
