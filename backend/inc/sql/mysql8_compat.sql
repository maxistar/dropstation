SET @OLD_SQL_MODE = @@SESSION.sql_mode;
SET SESSION sql_mode = REPLACE(REPLACE(REPLACE(@@SESSION.sql_mode, 'NO_ZERO_IN_DATE', ''), 'NO_ZERO_DATE', ''), 'STRICT_TRANS_TABLES', '');

UPDATE devices
SET last_access = NULL
WHERE last_access = '0000-00-00 00:00:00';

SET SESSION sql_mode = @OLD_SQL_MODE;
