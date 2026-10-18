CREATE TABLE IF NOT EXISTS `phone_sims` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `phone_number` varchar(12) NOT NULL,
  `owner_sid` bigint(20) NOT NULL COMMENT 'Character SID who owns this number',
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `deactivated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_phone_number_active` (`phone_number`, `active`),
  KEY `idx_owner_sid` (`owner_sid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
