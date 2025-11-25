[< Back](../README.md)

# Workflow

This is the workflow document for the Instant Messaging System.

- [x] Home Page

- [x] User
    - [x] Register with username and password
        - [ ] Client: Validate username (Optional, reduce stupid requests)
        - [x] Server: Check username duplication
        - [ ] Server: Validate username (Optional, avoid stupid names)
        - [x] Server: Hash password (Argon2)
        - [x] Server: Store user into database
    - [x] Login with username and password
        - [x] Server: Search user by username
        - [x] Server: Validate password (Argon2)
        - [x] Server: Return JWT in HTTP cookie (Include ID and username)
        - [x] Client: Receive HTTP cookie and refresh state (Store ID and username in state)
    - [x] Logout
        - [x] Server: Delete JWT in HTTP cookie (And return the cookie in response)
        - [x] Client: Refresh state (Whatever the response is success or not)
    - [x] Change username
        - [x] Server: Check username duplication
        - [ ] Server: Validate username (Optional, avoid stupid names)
        - [ ] Server: Validate password (Optional, security issue)
        - [x] Server: Update username
    - [x] Change password
        - [x] Server: Validate password

- [ ] Chat Room
    - [ ] Room
        - [x] Create room with name
            - [x] Server: Create room in database
            - [x] Server: Return room ID
            - [x] Client: Receive room ID and redirect to room
        - [ ] Rename room
            - [ ] Server: Rename room in database
        - [ ] Delete room
            - [ ] Server: Delete room in database
            - [ ] Client: Redirect to home page if inside the room
        - [x] Get all rooms
            - [x] Server: Get a number of rooms from database (Cursor pagination if possible)
            - [x] Client: Request more rooms when scroll to the bottom
        - [ ] Join room
            - [ ] Server: Add user to room
            - [ ] Client: Redirect to room
        - [x] Get room info
            - [x] Server: Get room info (e.g. users, messages) by room ID
        - [ ] Leave room
            - [ ] Server: Remove user from room by room ID
            - [ ] Client: Redirect to home page if inside the room
    - [ ] Chat
        - [x] Send messages
            - [x] Server: Store message into database
            - [x] Client: Update the state of messages for all users
        - [x] Receive messages
            - [x] Server: Get a number of messages from database
            - [x] Client: Request more messages when scroll to the top (Cursor pagination if possible)
        - [ ] Edit messages (Optional, function leaking as a feature)
            - [ ] Server: Update message
            - [ ] Client: Update the state of messages for all users
        - [ ] Delete messages (Optional, function leaking as a feature)
            - [ ] Server: Delete message
            - [ ] Client: Update the state of messages for all users

- [x] Settings
    - [x] Change theme (Follow system theme by default, with light and dark themes)
        - [x] Client: Update the state of theme (React context (nesting hell?) or Zustand)
    - [ ] Change font size (Optional)
        - [ ] Client: Update the state of font size (React context (nesting hell?) or Zustand)
