-- phpMyAdmin SQL Dump
-- version 4.1.12
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Jun 16, 2015 at 11:39 AM
-- Server version: 5.5.43-0ubuntu0.14.04.1
-- PHP Version: 5.5.9-1ubuntu4.9

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `polivalka`
--

-- --------------------------------------------------------

--
-- Table structure for table `capacitors`
--

DROP TABLE IF EXISTS `capacitors`;
CREATE TABLE IF NOT EXISTS `capacitors` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `capacity` int(11) NOT NULL,
  `value` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC AUTO_INCREMENT=4 ;

--
-- Dumping data for table `capacitors`
--

INSERT INTO `capacitors` (`id`, `user_id`, `capacity`, `value`) VALUES
(1, 1, 40000, 39930),
(2, 1, 5000, 3530),
(3, 1, 5000, 3530);

-- --------------------------------------------------------

--
-- Table structure for table `devices`
--

DROP TABLE IF EXISTS `devices`;
CREATE TABLE IF NOT EXISTS `devices` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `device_key` varchar(40) NOT NULL,
  `last_access` datetime DEFAULT NULL,
  `notes` varchar(500) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=3 ;

--
-- Dumping data for table `devices`
--

INSERT INTO `devices` (`id`, `user_id`, `device_key`, `last_access`, `notes`) VALUES
(1, 1, '1a382ff4-5099-4be1-9e48-71eb7c36db27', '0000-00-00 00:00:00', 'на подоконнике в детской'),
(2, 1, 'dc28a39d-1d23-46a8-81db-2c3b5ca32729', '0000-00-00 00:00:00', 'в офисе');

-- --------------------------------------------------------

--
-- Table structure for table `events`
--

DROP TABLE IF EXISTS `events`;
CREATE TABLE IF NOT EXISTS `events` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `point_id` int(11) NOT NULL,
  `time` datetime NOT NULL,
  `amount` int(11) NOT NULL,
  `event_type` enum('watering') NOT NULL DEFAULT 'watering',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=44 ;

--
-- Dumping data for table `events`
--

INSERT INTO `events` (`id`, `point_id`, `time`, `amount`, `event_type`) VALUES
(1, 3, '2015-06-16 11:07:52', 70, 'watering'),
(2, 4, '2015-06-16 11:07:52', 70, 'watering'),
(3, 3, '2015-06-16 11:07:54', 70, 'watering'),
(4, 4, '2015-06-16 11:07:54', 70, 'watering'),
(5, 3, '2015-06-16 11:07:55', 70, 'watering'),
(6, 4, '2015-06-16 11:07:55', 70, 'watering'),
(7, 3, '2015-06-16 11:07:55', 70, 'watering'),
(8, 4, '2015-06-16 11:07:55', 70, 'watering'),
(9, 3, '2015-06-16 11:07:55', 70, 'watering'),
(10, 4, '2015-06-16 11:07:55', 70, 'watering'),
(11, 3, '2015-06-16 11:07:56', 70, 'watering'),
(12, 4, '2015-06-16 11:07:56', 70, 'watering'),
(13, 3, '2015-06-16 11:07:56', 70, 'watering'),
(14, 4, '2015-06-16 11:07:56', 70, 'watering'),
(15, 3, '2015-06-16 11:07:56', 70, 'watering'),
(16, 4, '2015-06-16 11:07:56', 70, 'watering'),
(17, 3, '2015-06-16 11:07:57', 70, 'watering'),
(18, 4, '2015-06-16 11:07:57', 70, 'watering'),
(19, 3, '2015-06-16 11:07:57', 70, 'watering'),
(20, 4, '2015-06-16 11:07:57', 70, 'watering'),
(21, 3, '2015-06-16 11:07:57', 70, 'watering'),
(22, 4, '2015-06-16 11:07:57', 70, 'watering'),
(23, 3, '2015-06-16 11:07:57', 70, 'watering'),
(24, 4, '2015-06-16 11:07:57', 70, 'watering'),
(25, 3, '2015-06-16 11:07:58', 70, 'watering'),
(26, 4, '2015-06-16 11:07:58', 70, 'watering'),
(27, 3, '2015-06-16 11:07:58', 70, 'watering'),
(28, 4, '2015-06-16 11:07:58', 70, 'watering'),
(29, 3, '2015-06-16 11:07:58', 70, 'watering'),
(30, 4, '2015-06-16 11:07:58', 70, 'watering'),
(31, 3, '2015-06-16 11:07:58', 70, 'watering'),
(32, 4, '2015-06-16 11:07:58', 70, 'watering'),
(33, 3, '2015-06-16 11:07:59', 70, 'watering'),
(34, 4, '2015-06-16 11:07:59', 70, 'watering'),
(35, 3, '2015-06-16 11:07:59', 70, 'watering'),
(36, 4, '2015-06-16 11:07:59', 70, 'watering'),
(37, 3, '2015-06-16 11:07:59', 70, 'watering'),
(38, 4, '2015-06-16 11:07:59', 70, 'watering'),
(39, 3, '2015-06-16 11:07:59', 70, 'watering'),
(40, 4, '2015-06-16 11:07:59', 70, 'watering'),
(41, 3, '2015-06-16 11:09:13', 70, 'watering'),
(42, 4, '2015-06-16 11:09:13', 70, 'watering'),
(43, 1, '2015-06-16 11:10:34', 70, 'watering');

-- --------------------------------------------------------

--
-- Table structure for table `points`
--

DROP TABLE IF EXISTS `points`;
CREATE TABLE IF NOT EXISTS `points` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `device_id` int(11) NOT NULL,
  `capacity_id` int(11) NOT NULL,
  `last_watering` datetime DEFAULT NULL,
  `notes` varchar(500) NOT NULL,
  `watering_type` int(11) NOT NULL,
  `watering_value` int(11) NOT NULL,
  `watering_hour` tinyint(4) NOT NULL,
  `num` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=5 ;

--
-- Dumping data for table `points`
--

INSERT INTO `points` (`id`, `user_id`, `device_id`, `capacity_id`, `last_watering`, `notes`, `watering_type`, `watering_value`, `watering_hour`, `num`) VALUES
(1, 1, 1, 1, '2015-06-16 11:10:34', 'лимон', 0, 70, 20, 1),
(2, 1, 1, 1, '0000-00-00 00:00:00', 'кофе', 0, 70, 21, 2),
(3, 1, 2, 2, '2015-06-16 11:09:13', 'Монстерра', 0, 70, 9, 3),
(4, 1, 2, 3, '2015-06-16 11:09:13', 'Пальма', 0, 70, 10, 4);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `login` varchar(30) CHARACTER SET latin1 NOT NULL,
  `timezone` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=2 ;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `login`, `timezone`) VALUES
(1, 'maxim@maxistar.ru', 'Europe/Moscow');

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
