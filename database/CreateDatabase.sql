--Copyright 2022 under MIT License
SET search_path TO 'CodingExam';

DROP TABLE IF EXISTS "CodingExam".StudentResponse CASCADE;
DROP TABLE IF EXISTS "CodingExam".QuestionAnswer CASCADE;
DROP TABLE IF EXISTS "CodingExam".ExamQuestion CASCADE;
DROP TABLE IF EXISTS "CodingExam".QuestionType CASCADE;
DROP TABLE IF EXISTS "CodingExam".UserExam CASCADE;
DROP TABLE IF EXISTS "CodingExam".Exam CASCADE;
DROP TABLE IF EXISTS "CodingExam".Users CASCADE;

CREATE TABLE "CodingExam".Users
(
	UserID INT NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	CanvasUserID VARCHAR(60) NOT NULL,
	FullName VARCHAR(60) NOT NULL,
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
	HasTaken BOOLEAN NOT NULL DEFAULT FALSE,
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
	ParsonsAnswer VARCHAR(20),
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
	InstructorFeedback VARCHAR(300),
	QuestionID INT NOT NULL REFERENCES "CodingExam".ExamQuestion(QuestionID),
	CanvasUserID VARCHAR(60) NOT NULL REFERENCES "CodingExam".Users(CanvasUserID),
	UNIQUE(QuestionID, CanvasUserID)
);

CREATE USER codingexam WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE "CodingExam" to codingexam;
GRANT USAGE ON SCHEMA "CodingExam" TO codingexam;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA "CodingExam" TO codingexam;

INSERT INTO "CodingExam".Users(CanvasUserID, FullName)
VALUES ('2b7a2ea9f28bc312753640b0c1cc537fa85c5a49', 'John User'),
('a3alsdf9cjasq713h4jwld9c8galsdf94', 'Noah Sandford'),
('aasdja45ojaf2nvpnoaejoirtjj9eq0jf', 'Jacob Williams'),
('a4sdlkj99oqneig9bspdakfmdj19384kk', 'Jack Walter'),
('aocigpqdjfi18340t8g0vajald99fa03a', 'Test User');

INSERT INTO "CodingExam".Exam(CanvasExamID, TotalPoints)
VALUES ('01cf10c5-f5d3-466e-b716-53f2b0bcd3b4', 1), ('e81f6b6e-8755-4fec-b2d5-c471d34f2e62', 0),
('jqpeijfpoadvpioaueouaouera', 0);

INSERT INTO "CodingExam".UserExam(UserID, ExamID)
VALUES (1, 1), (2, 1), (3, 1), (4, 1), (5, 1), (1,3);

INSERT INTO "CodingExam".QuestionType(QuestionType)
VALUES ('MultipleChoice'), ('ShortAnswer'), ('TrueFalse'), ('CodingAnswer'), ('ParsonsProblem');

INSERT INTO "CodingExam".ExamQuestion(QuestionText, HasCorrectAnswers, QuestionType, ExamID)
VALUES ('What''s the best programming language?', TRUE, 1, 1),
('Computer Science is dope.', TRUE, 3, 1),
('How do you feel today?', FALSE, 2, 1),
('Print "Hello World" in the language:python', FALSE, 4, 1),
('What''s your favorite color', FALSE, 2, 2),
('Which number is the biggest', TRUE, 1, 2),
('Which number is the smallest', TRUE, 1, 2),
('Select true for full points', TRUE, 3, 2);

INSERT INTO "CodingExam".ExamQuestion(QuestionText, HasCorrectAnswers, ParsonsAnswer, QuestionType, ExamID)
VALUES ('This is a test parsons problem', TRUE, '21', 5, 1);

INSERT INTO "CodingExam".QuestionAnswer(QuestionID, CorrectAnswer, AnswerIndex, AnswerText)
VALUES (1, TRUE, 0, 'C#'), (1, TRUE, 1, 'Java'), (1, TRUE, 2, 'TypeScript'), (1, TRUE, 3, 'Fortran'), 
(2, TRUE, 1, 'True'), (2, FALSE, 2, 'False'),
(6, TRUE, 0, '6'), (6, TRUE, 1, '7'), (6, TRUE, 2, '8'), (6, TRUE, 3, '9'),
(7, TRUE, 0, '1'), (7, TRUE, 1, '2'), (7, TRUE, 2, '3'), (7, TRUE, 3, '4'),
(8, TRUE, 1, 'True'), (8, FALSE, 2, 'False'),
(9, FALSE, 1, 'Second Block'), (9, FALSE, 2, 'First Block');

INSERT INTO "CodingExam".StudentResponse(IsTextResponse, AnswerResponse, QuestionID, CanvasUserID)
VALUES (FALSE, 0, 1, 'a3alsdf9cjasq713h4jwld9c8galsdf94'), (FALSE, 1, 2, 'a3alsdf9cjasq713h4jwld9c8galsdf94'),
(FALSE, 1, 1, 'aasdja45ojaf2nvpnoaejoirtjj9eq0jf'), (FALSE, 0, 2, 'aasdja45ojaf2nvpnoaejoirtjj9eq0jf'),
(FALSE, 2, 1, 'a4sdlkj99oqneig9bspdakfmdj19384kk'), (FALSE, 0, 2, 'a4sdlkj99oqneig9bspdakfmdj19384kk');

INSERT INTO "CodingExam".StudentResponse(IsTextResponse, TextResponse, QuestionID, CanvasUserID)
VALUES (TRUE, 'Good', 3, 'a3alsdf9cjasq713h4jwld9c8galsdf94'),
(TRUE, 'Great', 3, 'aasdja45ojaf2nvpnoaejoirtjj9eq0jf'),
(TRUE, 'Pretty good', 3, 'a4sdlkj99oqneig9bspdakfmdj19384kk');

INSERT INTO "CodingExam".StudentResponse(IsTextResponse, AnswerResponse, InstructorFeedback, QuestionID, CanvasUserID)
VALUES (FALSE, 2, 'feedback for question 1', 1, 'aocigpqdjfi18340t8g0vajald99fa03a'), (FALSE, 0, 'feedback for question 2', 2, 'aocigpqdjfi18340t8g0vajald99fa03a');

INSERT INTO "CodingExam".StudentResponse(IsTextResponse, TextResponse, InstructorFeedback, QuestionID, CanvasUserID)
VALUES (TRUE, 'test', 'feedback for question 3', 3, 'aocigpqdjfi18340t8g0vajald99fa03a'),
(TRUE, 'print(hello world)', 'feedback fr question 4', 4, 'aocigpqdjfi18340t8g0vajald99fa03a');