ALTER TABLE `events` ADD `payload` TEXT NULL AFTER `event_type`;

ALTER TABLE `points` ADD `humidity` FLOAT NULL AFTER `status`;

ALTER TABLE `points` ADD `last_lightning` DATETIME NULL AFTER `last_watering`;

ALTER TABLE `devices` ADD `battery` FLOAT NULL AFTER `notes`;

ALTER TABLE `devices` ADD `sleep_duration` INT NOT NULL AFTER `battery`;

ALTER TABLE `devices` ADD `activity_number` INT NOT NULL AFTER `battery`;

ALTER TABLE `devices` ADD `recent_event_time` DATETIME NULL AFTER `activity_number`;

ALTER TABLE `devices` ADD `recent_event_id` INT NULL AFTER `recent_event_time`;

ALTER TABLE `devices` ADD `check_interval` INT NOT NULL AFTER `sleep_duration`;

CREATE TABLE `schedule` (
    `id` INT NOT NULL AUTO_INCREMENT , 
    `hour` TINYINT NOT NULL , 
    `minute` TINYINT NOT NULL , 
    `event_type` ENUM('watering','lighting') NOT NULL , 
    `device_id` INT NOT NULL , 
    `point_id` INT NOT NULL ,
    `duration` INT NOT NULL ,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB;
