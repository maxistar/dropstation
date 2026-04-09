CREATE TABLE `plants` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `external_id` VARCHAR(64) NOT NULL,
  `user_id` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `species` VARCHAR(255) DEFAULT NULL,
  `location` VARCHAR(255) DEFAULT NULL,
  `target_humidity_min` FLOAT DEFAULT NULL,
  `target_humidity_max` FLOAT DEFAULT NULL,
  `target_watering_duration_sec` INT DEFAULT NULL,
  `insolation_enabled` TINYINT(1) NOT NULL DEFAULT 0,
  `target_insolation_minutes_per_day` INT DEFAULT NULL,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_plants_external_id` (`external_id`),
  KEY `idx_plants_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE `points`
  ADD `plant_id` INT DEFAULT NULL AFTER `device_id`;

INSERT INTO `plants` (
  `external_id`,
  `user_id`,
  `name`,
  `location`,
  `target_watering_duration_sec`
)
SELECT
  CONCAT('pl_legacy_', LPAD(p.`id`, 10, '0')),
  p.`user_id`,
  COALESCE(NULLIF(TRIM(p.`notes`), ''), CONCAT('Plant ', p.`id`)),
  pl.`name`,
  NULLIF(p.`watering_value`, 0)
FROM `points` p
LEFT JOIN `devices` d ON d.`id` = p.`device_id`
LEFT JOIN `places` pl ON pl.`id` = d.`place_id`;

UPDATE `points` p
JOIN `plants` pl ON pl.`external_id` = CONCAT('pl_legacy_', LPAD(p.`id`, 10, '0'))
SET p.`plant_id` = pl.`id`
WHERE p.`plant_id` IS NULL;

CREATE TABLE `tanks` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `external_id` VARCHAR(64) NOT NULL,
  `user_id` INT NOT NULL,
  `zone_id` VARCHAR(255) NOT NULL,
  `capacity_ml` INT NOT NULL,
  `current_level_ml` INT NOT NULL,
  `last_refilled_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_tanks_external_id` (`external_id`),
  KEY `idx_tanks_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `tank_devices` (
  `tank_id` INT NOT NULL,
  `device_id` INT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`tank_id`, `device_id`),
  KEY `idx_tank_devices_device_id` (`device_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `tanks` (
  `external_id`,
  `user_id`,
  `zone_id`,
  `capacity_ml`,
  `current_level_ml`
)
SELECT
  CONCAT('tk_legacy_', LPAD(c.`id`, 10, '0')),
  c.`user_id`,
  CONCAT('zone_capacity_', c.`id`),
  c.`capacity`,
  c.`value`
FROM `capacitors` c;

INSERT IGNORE INTO `tank_devices` (`tank_id`, `device_id`)
SELECT DISTINCT
  t.`id`,
  p.`device_id`
FROM `capacitors` c
JOIN `tanks` t ON t.`external_id` = CONCAT('tk_legacy_', LPAD(c.`id`, 10, '0'))
JOIN `points` p ON p.`capacity_id` = c.`id`;

ALTER TABLE `schedule`
  MODIFY `event_type` ENUM('watering', 'insolation', 'lighting') NOT NULL,
  ADD `external_id` VARCHAR(64) DEFAULT NULL AFTER `id`,
  ADD `plant_id` INT DEFAULT NULL AFTER `point_id`,
  ADD `recurrence` ENUM('daily') NOT NULL DEFAULT 'daily' AFTER `duration`,
  ADD `active_from` DATE DEFAULT NULL AFTER `recurrence`,
  ADD `active_until` DATE DEFAULT NULL AFTER `active_from`,
  ADD `enabled` TINYINT(1) NOT NULL DEFAULT 1 AFTER `active_until`,
  ADD `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `enabled`,
  ADD `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER `created_at`;

UPDATE `schedule`
SET `event_type` = 'insolation'
WHERE `event_type` = 'lighting';

UPDATE `schedule`
SET `external_id` = CONCAT('sc_legacy_', LPAD(`id`, 10, '0'))
WHERE `external_id` IS NULL;

UPDATE `schedule` s
LEFT JOIN `points` p ON p.`id` = s.`point_id`
SET s.`plant_id` = p.`plant_id`
WHERE s.`plant_id` IS NULL;

CREATE TABLE `events_canonical` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `external_id` VARCHAR(64) NOT NULL,
  `legacy_event_id` INT DEFAULT NULL,
  `event_type` ENUM(
    'device_checkin',
    'humidity_reading',
    'watering_decision',
    'watering',
    'insolation_decision',
    'insolation_state_changed',
    'insolation_patch',
    'command_requested',
    'command_applied',
    'error',
    'tank_refill'
  ) NOT NULL,
  `occurred_at` DATETIME NOT NULL,
  `device_id` INT DEFAULT NULL,
  `point_id` INT DEFAULT NULL,
  `plant_id` INT DEFAULT NULL,
  `amount_ml` INT DEFAULT NULL,
  `duration_sec` INT DEFAULT NULL,
  `humidity` FLOAT DEFAULT NULL,
  `status` ENUM('success', 'failed', 'partial', 'info') NOT NULL DEFAULT 'info',
  `payload` JSON DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_events_canonical_external_id` (`external_id`),
  KEY `idx_events_canonical_legacy_event_id` (`legacy_event_id`),
  KEY `idx_events_canonical_device_id` (`device_id`),
  KEY `idx_events_canonical_point_id` (`point_id`),
  KEY `idx_events_canonical_plant_id` (`plant_id`),
  KEY `idx_events_canonical_occurred_at` (`occurred_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `events_canonical` (
  `external_id`,
  `legacy_event_id`,
  `event_type`,
  `occurred_at`,
  `device_id`,
  `point_id`,
  `plant_id`,
  `amount_ml`,
  `humidity`,
  `status`,
  `payload`
)
SELECT
  CONCAT('ev_legacy_', LPAD(e.`id`, 10, '0')),
  e.`id`,
  'watering',
  e.`time`,
  p.`device_id`,
  e.`point_id`,
  p.`plant_id`,
  e.`amount`,
  p.`humidity`,
  'success',
  CASE
    WHEN e.`payload` IS NULL OR TRIM(e.`payload`) = '' THEN JSON_OBJECT('source', 'legacy-events')
    ELSE JSON_OBJECT('source', 'legacy-events', 'legacyPayload', e.`payload`)
  END
FROM `events` e
LEFT JOIN `points` p ON p.`id` = e.`point_id`;

CREATE TABLE `commands` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `external_id` VARCHAR(64) NOT NULL,
  `command_type` ENUM('watering', 'insolation') NOT NULL,
  `device_id` INT NOT NULL,
  `point_id` INT DEFAULT NULL,
  `plant_id` INT DEFAULT NULL,
  `requested_payload` JSON NOT NULL,
  `requested_by` VARCHAR(255) NOT NULL,
  `reason` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('accepted', 'applied', 'failed', 'cancelled') NOT NULL DEFAULT 'accepted',
  `accepted_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `applied_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_commands_external_id` (`external_id`),
  KEY `idx_commands_device_id` (`device_id`),
  KEY `idx_commands_point_id` (`point_id`),
  KEY `idx_commands_plant_id` (`plant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
