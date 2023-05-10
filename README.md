# Important
Double, triple, quadruple check the raw SQL query within the '20230413145122_add_unique_constraint.js' migration file before it is run. It has been checked by Dr. Bean already, but if it does not perform correctly it could drop the entire database of responses.

# Changelog
- Ability to set if possible points display or not
- Ability to delete questions from the exam
- Changed student_responses table to not store historical responses
- Run multiple exams and students in development mode

# CodingExam
In this release, the app is still early in development, so it has been marked as pre-release. Instructions for setting up the development environment can be found in the "Developer Documentation" file in the "documentation-testing" folder. This includes how to set up the docker installation, start the application in development, and have the application display in Canvas through an HTTPS proxy. Additionally, a "ResetDatabaseScript.sql" file has been included in the "database" folder if the database needs to be reset in development mode.

# Documentation
User and developer documentation for this sprint can be found in the "documentation-testing" folder as well.

# Testing
To initialize the test database for unit tests, the command "node serverTestEntry.js" should be run first to setup and seed the database. To run the unit tests, navigate to the "server" folder and run the command "npm test".

For testing the client, to test the functionality of the components for the Student and Instructor views, testing plans have been included in the "documentation-testing" folder as well. Additionally, the User Documentation can also be used to supplement the testing plans, as it walks the user through most of the application's functionality.
