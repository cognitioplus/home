-- Adminer 4.5.0 MySQL dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

SET NAMES utf8mb4;

DROP TABLE IF EXISTS `pt_conversations`;
CREATE TABLE `pt_conversations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `conversation_id` int(11) NOT NULL,
  `operator_id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `msg_read` tinyint(4) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `pt_conversation_tickets`;
CREATE TABLE `pt_conversation_tickets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `customer_id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `operator_id` int(11) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `pt_customers`;
CREATE TABLE `pt_customers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `email` varchar(50) NOT NULL,
  `project_id` int(11) NOT NULL,
  `customer_ip` varchar(255) NOT NULL,
  `active` tinyint(4) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `pt_notifications`;
CREATE TABLE `pt_notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(150) NOT NULL,
  `project_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `conversation_id` int(11) NOT NULL,
  `msg_read` int(11) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `pt_projects`;
CREATE TABLE `pt_projects` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `project_name` varchar(50) NOT NULL,
  `url` varchar(255) NOT NULL,
  `favourite` tinyint(4) NOT NULL,
  `status` tinyint(4) NOT NULL,
  `auto_expires` date NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `pt_project_settings`;
CREATE TABLE `pt_project_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `project_setting` text NOT NULL,
  `project_id` int(11) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `pt_users`;
CREATE TABLE `pt_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(50) NOT NULL,
  `resetPasswordToken` varchar(50) NOT NULL,
  `access_level` tinyint(4) NOT NULL,
  `active` tinyint(4) NOT NULL,
  `project_id` varchar(50) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `pt_users` (`id`, `name`, `email`, `password`, `resetPasswordToken`, `access_level`, `active`, `project_id`, `createdAt`, `updatedAt`) VALUES
(1,	'admin',	'admin@pixeltalk.com',	'e10adc3949ba59abbe56e057f20f883e',	'',	1,	1,	'',	'2020-08-28 16:12:27',	'2020-09-18 16:35:30');

-- 2020-09-18 11:26:01
