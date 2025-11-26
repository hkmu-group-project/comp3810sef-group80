Group Project Presentation Highlight

A presentation highlight for HKMU COMP3810SEF 2025 Group 80.

Before the presentation:

- Create an account to be a receiver later for the presentation
	- This account may switch to mobile size to show the mobile layout
- Create several room to show a rich UI content in the rooms page
- Create messages in 1 room to show pagination function in chat
- Page size is 30, so you may create more messages (like 60-90) to have a fallback if the first pagination to show the previous messages failed.

Part. UI https://ims.alpheus.day/ 

The URL is temporary, therefore the URL could be invalid in the future.

Frontend is created with NextJS, a library built on top of React. And Tailwind with shadcn (Shad-C-N) for the styling.

With NextJS, it gives us the ability to use RSC (React Server Components), it can render part of the UI on the server side and reduce the JavaScript overhead on the client side.

Light/Dark theme:

- Show the ability to switch between light/dark theme
- (Suggestion) Switch to light mode for the presentation 

Register (or Sign Up):

- (Optional) Goto the `register` page by using `Don’t have an account?` button
- Duplicate username validation (Enter `alpheus` as username to show it)
- Unmatched password validation (Enter unmatched pw to show it)

Login (or Sign In):

- Username or password validation (Enter wrong pw to show it)

User update:

- Show the username update
- (Optional) only show pw update and logout if we have a lot of time

Rooms:

- Show the rooms list

Room (Precreated):

- If the chat panel inside the room do not scroll to bottom on arrive, refresh
- Do the showcase on pagination (Scroll to top for older messages)

Room Create: 
- (Optional) blank content (no name) validation
- Create a room with both name and description

Room (We need 2 client here to show sender and receiver):

- (Reminder) Currently, the page refetch(not refresh) data each 5 second
- (Suggestion) Sender in desktop layout, Receiver in mobile layout
- Send a message
- Both sender and receiver scroll to bottom
- Send message in sender client
- Receiver client should automatically scroll to bottom again for the latest message

Room update:

- Show room update in name and description

Room delete:

- Show the room delete operation

Do not close the site, the API part will use the content from it.

Part. API https://ims-api.alpheus.day/openapi

The API is built with both Hono and ExpressJS.

The whole API mainly uses Hono to handle the routing because Express is leaking a lot of features compared to the framework nowadays.

The page is created with the help of OpenAPI standard.

It follows the JSON response standard I (Alpheus) created a few years ago, and it is inspired by the GraphQL standard.

GET /health:

- (Description) This is the only route using ExpressJS because it’s a non-critical task
- Show the uptime response

GET /messages:

- (Description) This is a cursor based pagination query inspired by the GraphQL standard
- Input nothing and show error
- Input the room ID and show the response
- Input the first data ID and get the first 2 messages
- Input the `last` 1 to get the latest data ID
- Input the latest data ID and get the last 2 messages before the latest data ID

Extra (if we still have time):

POST /auth/login:

- (Description) This is a login route
- Enter username and password to show the response
- Copy the access token and paste it in other tab

PATCH /rooms/{id}:

- (Description) This is a room update route
- Copy room ID and access token
- Enter room name and new description
- Update it, and switch it back

DELETE /messages/{id}

- (Description) This is a message delete route
- Create a message in client
- Get the message ID from the GET /messages route
- Delete the message with it’s ID

