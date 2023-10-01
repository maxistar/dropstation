-- phpMyAdmin SQL Dump
-- version 3.2.2.1
-- http://www.phpmyadmin.net
--
-- Host: localhost:3307
-- Generation Time: Jun 16, 2015 at 07:02 AM
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
(1, 1, 40000, 40000),
(2, 1, 5000, 5000),
(3, 1, 5000, 5000);

-- --------------------------------------------------------

--
-- Table structure for table `devices`
--

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

CREATE TABLE IF NOT EXISTS `events` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `point_id` int(11) NOT NULL,
  `time` datetime NOT NULL,
  `amount` int(11) NOT NULL,
  `event_type` enum('watering') NOT NULL DEFAULT 'watering',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

--
-- Dumping data for table `events`
--


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
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=5 ;

--
-- Dumping data for table `points`
--

INSERT INTO `points` (`id`, `user_id`, `device_id`, `capacity_id`, `last_watering`, `notes`, `watering_type`, `watering_value`) VALUES
(1, 0, 1, 1, '0000-00-00 00:00:00', 'лимон', 0, 70),
(2, 0, 1, 1, '0000-00-00 00:00:00', 'кофе', 0, 70),
(3, 1, 2, 2, NULL, 'Монстерра', 0, 70),
(4, 1, 2, 3, NULL, 'Пальма', 0, 70);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `login` varchar(30) CHARACTER SET latin1 NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=2 ;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `login`) VALUES
(1, 'maxim@maxistar.ru');
