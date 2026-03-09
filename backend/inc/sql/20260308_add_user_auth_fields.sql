ALTER TABLE `users`
  ADD COLUMN `email` VARCHAR(191) NULL AFTER `login`,
  ADD COLUMN `password_hash` VARCHAR(255) NULL AFTER `email`,
  ADD COLUMN `active` TINYINT(1) NOT NULL DEFAULT 1 AFTER `password_hash`;

ALTER TABLE `users`
  MODIFY COLUMN `login` VARCHAR(191) CHARACTER SET utf8mb4 NOT NULL,
  MODIFY COLUMN `timezone` VARCHAR(100) NOT NULL,
  MODIFY COLUMN `email` VARCHAR(191) NULL,
  MODIFY COLUMN `password_hash` VARCHAR(255) NULL,
  MODIFY COLUMN `active` TINYINT(1) NOT NULL DEFAULT 1;

UPDATE `users`
SET `email` = `login`
WHERE (`email` IS NULL OR TRIM(`email`) = '')
  AND `login` LIKE '%@%';

ALTER TABLE `users`
  ADD UNIQUE INDEX `uq_users_login` (`login`),
  ADD UNIQUE INDEX `uq_users_email` (`email`),
  ADD INDEX `idx_users_active` (`active`);

INSERT INTO `users` (`id`, `login`, `timezone`, `email`, `password_hash`, `active`)
VALUES (
  1001,
  'admin',
  'UTC',
  'admin@example.com',
  'scrypt$16384$8$1$i0hly_X09ycrznpvVOlxYA$OM3Xnl0TvYK1M7CNqKtMaDKGGsuBcEx-ZDchDr9CdighBIP1W0QlcDrNEDnZwPR5yXSZBOneO2nYPAXwRP05Xw',
  1
)
ON DUPLICATE KEY UPDATE
  `timezone` = VALUES(`timezone`),
  `email` = VALUES(`email`),
  `password_hash` = VALUES(`password_hash`),
  `active` = VALUES(`active`);
