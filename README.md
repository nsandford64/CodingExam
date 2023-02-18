# CodingExam
In this release, the app is still early in development, so it has been marked as pre-release. Instructions for setting up the development environment can be found in the "Developer Documentation" file in the "documentation-testing" folder. This includes how to set up the docker installation, start the application in development, and have the application display in Canvas through an HTTPS proxy. Additionally, a "ResetDatabaseScript.sql" file has been included in the "database" folder if the database needs to be reset in development mode.

# Research
For this sprint, we researched both websocket connections and keystroke tracking. For keystroke tracking, we were initially tasked with investigating how the tool Codio does their keystroke tracking and see if there are any alternatives. However, upon researching this, we were unable to find any information on any free and open source libraries or plugins that we would be able to use, so we will likely have to create our own custom solution. Additionally, for the websocket reserach, although there are libraries that can perform websocket functions, such as "Sock.js", the keystroke tracking will likely need to use the websocket functionality for transferring data. Because of this, we are moving the websocket further back into the product backlog, as we will need to tackle it at the same time as the keystroke tracking.

# Documentation
User and developer documentation for this sprint can be found in the "documentation-testing" folder as well.

# Testing
For testing, the server application contain unit tests which can be run by navigating to the "server" folder and running the command "npm test". These unit tests should be run after the application has been run once as per the development environment setup instructions.

For the client testing, to test the functionality of the components for the Student and Instructor views, testing plans have been included in the "documentation-testing" folder as well. Additionally, the User Documentation can also be used to supplement the testing plans, as it walks the user through most of the application's functionality.
