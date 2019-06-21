CREATE DATABASE IF NOT EXISTS `Budget`;

USE `Budget`;

CREATE TABLE IF NOT EXISTS `Transaction` (
	`id` INT PRIMARY KEY AUTO_INCREMENT,
	`date` DATE NOT NULL,
	`description` VARCHAR(255) NOT NULL,
	`amount` FLOAT(10,2) NOT NULL,
	`category` VARCHAR(255),
	`createdOn` DATETIME DEFAULT NOW()
);