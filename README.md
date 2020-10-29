# Robinson Science Olympiad Attendance Website
A simple application that tracks students attendance at science olympiad meetings. 

## Deploy
```bash
firebase deploy
```

## Database Structure
|               |               |                        |   |
|---------------|---------------|------------------------|---|
| Collections   | Documents     | Data                   |   |
| Q1            |               |                        |   |
| Q2            | all\-meetings |                        |   |
| all\-quarters | quarters      | collection: \[Q1, Q2\] |   |
