/*
 SQLite does not support "Changing existing column type" out of the box, we do not generate automatic migration for that, so it has to be done manually
 Please refer to: https://www.techonthenet.com/sqlite/tables/alter_table.php
                  https://www.sqlite.org/lang_altertable.html
                  https://stackoverflow.com/questions/2083543/modify-a-columns-type-in-sqlite3

 Due to that we don't generate migration automatically and it has to be done manually
*/
PRAGMA foreign_keys = off;

BEGIN TRANSACTION;

ALTER TABLE account_group RENAME TO _account_group_old;
CREATE TABLE `account_group` (
  `account_id` text NOT NULL,
	`group_id` text NOT NULL,
	PRIMARY KEY(`account_id`, `group_id`),
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON UPDATE no action ON DELETE no action
)

INSERT INTO `account_group` (`account_id`, `group_id`) SELECT `account_id`, `group_id` FROM _account_group_old;
DROP TABLE _account_group_old;

COMMIT;

BEGIN TRANSACTION;

ALTER TABLE group_permission RENAME TO _group_permission_old;
CREATE TABLE `group_permission` (
	`group_id` text NOT NULL,
	`permission_id` text NOT NULL,
	PRIMARY KEY(`group_id`, `permission_id`),
	FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON UPDATE no action ON DELETE no action
);

INSERT INTO `group_permission` (`group_id`, `permission_id`) SELECT `group_id`, `permission_id` FROM _group_permission_old;
DROP TABLE _group_permission_old;

COMMIT;

PRAGMA foreign_keys = on;
