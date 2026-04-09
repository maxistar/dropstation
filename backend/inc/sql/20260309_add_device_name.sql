ALTER TABLE `devices`
  ADD COLUMN `name` VARCHAR(255) NULL AFTER `place_id`;

UPDATE `devices`
SET `name` = COALESCE(
  NULLIF(TRIM(`name`), ''),
  NULLIF(TRIM(`notes`), ''),
  CONCAT('Device ', `id`)
)
WHERE `name` IS NULL OR TRIM(`name`) = '';

ALTER TABLE `devices`
  MODIFY COLUMN `name` VARCHAR(255) NOT NULL;
