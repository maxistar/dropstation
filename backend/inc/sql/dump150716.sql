-- phpMyAdmin SQL Dump
-- version 3.2.2.1
-- http://www.phpmyadmin.net
--
-- Host: localhost:3307
-- Generation Time: Jul 16, 2015 at 06:46 AM
-- Server version: 5.5.40
-- PHP Version: 5.3.10-1ubuntu3.15

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";


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
(1, 1, 40000, 36420),
(2, 1, 5000, 3530),
(3, 1, 5000, 3530);

-- --------------------------------------------------------

--
-- Table structure for table `devices`
--

CREATE TABLE IF NOT EXISTS `devices` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `place_id` int(11) NOT NULL,
  `device_key` varchar(40) NOT NULL,
  `last_access` datetime DEFAULT NULL,
  `notes` varchar(500) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=3 ;

--
-- Dumping data for table `devices`
--

INSERT INTO `devices` (`id`, `user_id`, `place_id`, `device_key`, `last_access`, `notes`) VALUES
(1, 1, 1, '1a382ff4-5099-4be1-9e48-71eb7c36db27', '2015-07-16 06:43:52', 'на подоконнике в детской'),
(2, 1, 2, 'dc28a39d-1d23-46a8-81db-2c3b5ca32729', '0000-00-00 00:00:00', 'в офисе');

-- --------------------------------------------------------

--
-- Table structure for table `events`
--

CREATE TABLE IF NOT EXISTS `events` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `point_id` int(11) NOT NULL,
  `time` datetime NOT NULL,
  `amount` int(11) NOT NULL,
  `event_type` enum('watering') NOT NULL DEFAULT 'watering',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=122 ;

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
(43, 1, '2015-06-16 11:10:34', 70, 'watering'),
(44, 2, '2015-06-16 19:41:59', 70, 'watering'),
(45, 1, '2015-06-16 21:03:02', 70, 'watering'),
(46, 1, '2015-06-16 21:04:52', 70, 'watering'),
(47, 1, '2015-06-16 21:08:24', 30, 'watering'),
(48, 2, '2015-06-16 21:08:24', 70, 'watering'),
(49, 1, '2015-06-16 21:12:05', 30, 'watering'),
(50, 1, '2015-06-16 21:13:42', 30, 'watering'),
(51, 1, '2015-06-17 07:20:01', 30, 'watering'),
(52, 2, '2015-06-17 07:20:01', 70, 'watering'),
(53, 1, '2015-06-17 07:28:38', 30, 'watering'),
(54, 2, '2015-06-17 07:28:38', 70, 'watering'),
(55, 2, '2015-06-17 07:30:26', 70, 'watering'),
(56, 1, '2015-06-17 07:31:51', 30, 'watering'),
(57, 1, '2015-06-17 07:56:49', 30, 'watering'),
(58, 2, '2015-06-17 07:56:49', 70, 'watering'),
(59, 1, '2015-06-17 08:04:48', 30, 'watering'),
(60, 2, '2015-06-17 08:04:48', 70, 'watering'),
(61, 1, '2015-06-17 09:06:27', 100, 'watering'),
(62, 2, '2015-06-17 17:17:06', 70, 'watering'),
(63, 2, '2015-06-17 17:19:44', 70, 'watering'),
(64, 2, '2015-06-17 17:21:28', 70, 'watering'),
(65, 1, '2015-06-18 05:21:48', 100, 'watering'),
(66, 2, '2015-06-18 13:21:49', 70, 'watering'),
(67, 2, '2015-06-18 18:29:40', 70, 'watering'),
(68, 1, '2015-06-18 18:32:23', 120, 'watering'),
(69, 2, '2015-06-18 18:32:23', 120, 'watering'),
(70, 1, '2015-06-18 18:37:42', 120, 'watering'),
(71, 2, '2015-06-18 18:37:42', 120, 'watering'),
(72, 1, '2015-06-18 18:52:09', 120, 'watering'),
(73, 1, '2015-06-18 18:57:18', 10, 'watering'),
(74, 1, '2015-06-18 18:59:13', 10, 'watering'),
(75, 2, '2015-06-18 18:59:13', 10, 'watering'),
(76, 1, '2015-06-19 05:01:53', 10, 'watering'),
(77, 1, '2015-06-19 05:03:27', 10, 'watering'),
(78, 1, '2015-06-19 05:07:28', 10, 'watering'),
(79, 1, '2015-06-19 05:08:17', 10, 'watering'),
(80, 2, '2015-06-19 05:08:17', 10, 'watering'),
(81, 1, '2015-06-19 18:09:13', 10, 'watering'),
(82, 2, '2015-06-19 18:09:13', 10, 'watering'),
(83, 1, '2015-06-20 05:12:34', 10, 'watering'),
(84, 2, '2015-06-20 05:12:34', 10, 'watering'),
(85, 1, '2015-06-20 09:09:37', 10, 'watering'),
(86, 2, '2015-06-20 09:09:37', 10, 'watering'),
(87, 1, '2015-06-20 09:12:15', 10, 'watering'),
(88, 2, '2015-06-20 09:12:15', 10, 'watering'),
(89, 1, '2015-06-20 09:20:38', 10, 'watering'),
(90, 2, '2015-06-20 09:20:38', 10, 'watering'),
(91, 1, '2015-06-20 11:11:42', 10, 'watering'),
(92, 2, '2015-06-20 11:11:42', 10, 'watering'),
(93, 1, '2015-06-20 11:16:05', 10, 'watering'),
(94, 2, '2015-06-20 11:16:05', 10, 'watering'),
(95, 1, '2015-06-20 13:41:55', 10, 'watering'),
(96, 2, '2015-06-20 13:41:55', 10, 'watering'),
(97, 1, '2015-06-20 18:34:38', 10, 'watering'),
(98, 2, '2015-06-20 18:36:33', 10, 'watering'),
(99, 2, '2015-06-20 18:37:37', 10, 'watering'),
(100, 1, '2015-06-24 17:55:00', 10, 'watering'),
(101, 2, '2015-06-24 17:55:00', 10, 'watering'),
(102, 1, '2015-07-06 18:03:03', 10, 'watering'),
(103, 2, '2015-07-06 18:03:03', 10, 'watering'),
(104, 1, '2015-07-12 18:05:27', 10, 'watering'),
(105, 2, '2015-07-12 18:05:27', 10, 'watering'),
(106, 1, '2015-07-12 18:08:22', 10, 'watering'),
(107, 2, '2015-07-12 18:08:22', 10, 'watering'),
(108, 2, '2015-07-12 18:16:18', 10, 'watering'),
(109, 1, '2015-07-12 18:24:08', 10, 'watering'),
(110, 2, '2015-07-12 18:24:08', 10, 'watering'),
(111, 1, '2015-07-12 18:32:35', 100, 'watering'),
(112, 2, '2015-07-12 18:32:35', 100, 'watering'),
(113, 1, '2015-07-13 03:32:35', 100, 'watering'),
(114, 2, '2015-07-13 03:32:35', 100, 'watering'),
(115, 1, '2015-07-13 17:35:30', 100, 'watering'),
(116, 2, '2015-07-13 17:35:30', 100, 'watering'),
(117, 1, '2015-07-13 17:43:50', 10, 'watering'),
(118, 1, '2015-07-14 17:43:51', 70, 'watering'),
(119, 2, '2015-07-14 17:43:51', 180, 'watering'),
(120, 1, '2015-07-15 17:43:52', 70, 'watering'),
(121, 2, '2015-07-15 17:43:52', 180, 'watering');

-- --------------------------------------------------------

--
-- Table structure for table `places`
--

CREATE TABLE IF NOT EXISTS `places` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `num` int(11) NOT NULL,
  `name` varchar(500) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=3 ;

--
-- Dumping data for table `places`
--

INSERT INTO `places` (`id`, `user_id`, `num`, `name`) VALUES
(1, 1, 1, 'Дом'),
(2, 1, 2, 'Офис');

-- --------------------------------------------------------

--
-- Table structure for table `points`
--

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
(1, 1, 1, 1, '2015-07-15 17:43:51', 'Лимон', 0, 70, 20, 1),
(2, 1, 1, 1, '2015-07-15 17:43:52', 'Кофе', 0, 180, 20, 2),
(3, 1, 2, 2, '2015-06-16 11:09:13', 'Монстерра', 0, 70, 9, 3),
(4, 1, 2, 3, '2015-06-16 11:09:13', 'Пальма', 0, 70, 10, 4);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

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
