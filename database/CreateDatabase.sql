--Copyright 2022 under MIT License
SET search_path TO 'CodingExam';

DROP TABLE IF EXISTS "CodingExam".StudentResponse;
DROP TABLE IF EXISTS "CodingExam".QuestionAnswer;
DROP TABLE IF EXISTS "CodingExam".ExamQuestion;
DROP TABLE IF EXISTS "CodingExam".QuestionType;
DROP TABLE IF EXISTS "CodingExam".UserExam;
DROP TABLE IF EXISTS "CodingExam".Exam;
DROP TABLE IF EXISTS "CodingExam".Users;

CREATE TABLE "CodingExam".Users
(
	UserID INT NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	CanvasUserID VARCHAR(60) NOT NULL,
	UNIQUE(CanvasUserID)
);

CREATE TABLE "CodingExam".Exam
(
	ExamID INT NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	CanvasExamID VARCHAR(60) NOT NULL,
	TotalPoints INT NOT NULL,
	UNIQUE(CanvasExamID)
);

CREATE TABLE "CodingExam".UserExam
(
	UserID INT NOT NULL REFERENCES "CodingExam".Users(UserID),
	ExamID INT NOT NULL REFERENCES "CodingExam".Exam(ExamID),
	ScoredPoints INT,
	PRIMARY KEY(ExamID, UserID)
);

CREATE TABLE "CodingExam".QuestionType
(
	QuestionTypeID INT NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	QuestionType VARCHAR(30) NOT NULL
);

CREATE TABLE "CodingExam".ExamQuestion
(
	QuestionID INT NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	QuestionText VARCHAR(300) NOT NULL,
	HasCorrectAnswers BOOLEAN NOT NULL,
	QuestionType INT NOT NULL REFERENCES "CodingExam".QuestionType(QuestionTypeID),
	ExamID INT NOT NULL REFERENCES "CodingExam".Exam(ExamID)
);

CREATE TABLE "CodingExam".QuestionAnswer
(
	AnswerID INT NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	QuestionID INT NOT NULL REFERENCES "CodingExam".ExamQuestion(QuestionID),
	CorrectAnswer BOOLEAN NOT NULL,
	AnswerIndex INT NOT NULL,
	AnswerText VARCHAR(30) NOT NULL
);

CREATE TABLE "CodingExam".StudentResponse
(
	StudentResponseID INT NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	IsTextResponse BOOLEAN NOT NULL,
	TextResponse VARCHAR(300), 
	AnswerResponse INT,
	QuestionID INT NOT NULL REFERENCES "CodingExam".ExamQuestion(QuestionID)
);

CREATE USER codingexam WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE "CodingExam" to codingexam;
GRANT USAGE ON SCHEMA "CodingExam" TO codingexam;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA "CodingExam" TO codingexam;

INSERT INTO "CodingExam".Users(CanvasUserID)
VALUES ('668ce32912fc74ec7e60cc59f32f304dc4379617');

INSERT INTO "CodingExam".Exam(CanvasExamID, TotalPoints)
VALUES ('a94f149b-336c-414f-a05b-8b193322cbd8', 1);

INSERT INTO "CodingExam".UserExam(UserID, ExamID)
VALUES (1, 1);

INSERT INTO "CodingExam".QuestionType(QuestionType)
VALUES ('Multiple Choice'), ('Short Answer'), ('True False');

INSERT INTO "CodingExam".ExamQuestion(QuestionText, HasCorrectAnswers, QuestionType, ExamID)
VALUES ('What''s the best programming language?', TRUE, 1, 1),
('Computer Science is dope.', TRUE, 3, 1),
('How do you feel today?', FALSE, 2, 1);

INSERT INTO "CodingExam".QuestionAnswer(QuestionID, CorrectAnswer, AnswerIndex, AnswerText)
VALUES (1, TRUE, 0, 'C#'), (1, TRUE, 1, 'Java'), (1, TRUE, 2, 'TypeScript'), (1, TRUE, 3, 'Fortran'), 
(2, TRUE, 1, 'True'), (2, FALSE, 1, 'False');

