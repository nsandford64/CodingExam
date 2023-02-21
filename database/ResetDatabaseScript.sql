-- Copyright 2022 under MIT License
-- This script is used to reset the database when developing locally

DROP DATABASE coding_exam;
CREATE DATABASE coding_exam;

CREATE USER coding_exam_user WITH PASSWORD 'coding_exam_pass'