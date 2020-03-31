CREATE DATABASE items_db;

USE items_db;

CREATE TABLE `item`(
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `n` TEXT NOT NULL,
    `c` INT,
    `t` INT,
    `d` TEXT,
    `in` TEXT,
    PRIMARY KEY (`id`)
);

CREATE TABLE `position`(
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `item` TEXT NOT NULL,
    `content` TEXT,
    `date` DATETIME,
    PRIMARY KEY (`id`)
);

CREATE TABLE `correct`(
    `value` INT
)
INSERT INTO `correct` (`value`) VALUES (0);