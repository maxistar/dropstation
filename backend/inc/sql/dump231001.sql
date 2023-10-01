-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: db
-- Generation Time: Oct 01, 2023 at 08:05 AM
-- Server version: 5.7.40
-- PHP Version: 8.0.19

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `dropstation`
--

-- --------------------------------------------------------

--
-- Table structure for table `points`
--

CREATE TABLE `points` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `device_id` int(11) NOT NULL,
  `capacity_id` int(11) NOT NULL,
  `last_watering` datetime DEFAULT NULL,
  `notes` varchar(500) NOT NULL,
  `watering_type` int(11) NOT NULL,
  `watering_value` int(11) NOT NULL,
  `watering_hour` tinyint(4) NOT NULL,
  `num` int(11) NOT NULL DEFAULT '0',
  `address` varchar(10) DEFAULT NULL,
  `status` varchar(10) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

--
-- Dumping data for table `points`
--

INSERT INTO `points` (`id`, `user_id`, `device_id`, `capacity_id`, `last_watering`, `notes`, `watering_type`, `watering_value`, `watering_hour`, `num`, `address`, `status`) VALUES
(1, 1, 1, 1, '2015-07-15 17:43:51', 'Лимон', 0, 70, 20, 1, NULL, NULL),
(2, 1, 1, 1, '2015-07-15 17:43:52', 'Кофе', 0, 180, 20, 2, NULL, NULL),
(3, 1, 2, 2, '2015-06-16 11:09:13', 'Монстерра', 0, 70, 9, 3, NULL, NULL),
(4, 1, 2, 3, '2015-06-16 11:09:13', 'Пальма', 0, 70, 10, 4, NULL, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `points`
--
ALTER TABLE `points`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `points`
--
ALTER TABLE `points`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
