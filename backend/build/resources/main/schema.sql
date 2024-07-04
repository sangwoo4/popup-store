-- schema.sql

CREATE TABLE IF NOT EXISTS `user` (
      `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
      `email` VARCHAR(255) UNIQUE NOT NULL,
      `password` VARCHAR(255) NOT NULL,
      `username` VARCHAR(255) NOT NULL,
      `birth` VARCHAR(10) NOT NULL,
      `gender` VARCHAR(10) NOT NULL,
      `phone` VARCHAR(11) UNIQUE NOT NULL,
      `nickname` VARCHAR(20) UNIQUE NOT NULL
);