CREATE TABLE `entity` (
  `id` integer PRIMARY KEY,
  `is_active` boolean,
  `created_at` timestamp
);

CREATE TABLE `affiliate` (
  `id` integer PRIMARY KEY,
  `entity_id` integer
);

CREATE TABLE `member` (
  `id` integer PRIMARY KEY,
  `affiliate_id` integer
);

CREATE TABLE `member_description` (
  `member_id` integer,
  `bio` varchar(255),
  `fullname` varchar(255),
  `username` varchar(255),
  `birthdate` date,
  `is_private` boolean
);

CREATE TABLE `board` (
  `id` integer PRIMARY KEY,
  `affiliate_id` integer,
  `member_id` integer
);

CREATE TABLE `board_description` (
  `board_id` integer,
  `about` varchar(255),
  `is_private` boolean
);

CREATE TABLE `board_contribution_request` (
  `id` integer PRIMARY KEY,
  `entity_id` integer,
  `from_member_id` integer,
  `to_board_id` integer,
  `is_accepted` boolean
);

CREATE TABLE `member_follow_request` (
  `id` integer PRIMARY KEY,
  `entity_id` integer,
  `from_member_id` integer,
  `to_member_id` integer,
  `is_accepted` boolean
);

CREATE TABLE `post` (
  `id` integer PRIMARY KEY,
  `entity_id` integer,
  `body` varchar(255)
);

CREATE TABLE `post_membership` (
  `post_id` integer,
  `affiliate_id` integer
);

CREATE TABLE `post_saved` (
  `post_id` integer,
  `affiliate_id` integer
);

CREATE TABLE `post_comment` (
  `from_post_id` integer,
  `to_post_id` integer
);

ALTER TABLE `affiliate` ADD FOREIGN KEY (`id`) REFERENCES `entity` (`id`);

ALTER TABLE `post` ADD FOREIGN KEY (`entity_id`) REFERENCES `entity` (`id`);

ALTER TABLE `member` ADD FOREIGN KEY (`affiliate_id`) REFERENCES `affiliate` (`id`);

ALTER TABLE `board` ADD FOREIGN KEY (`affiliate_id`) REFERENCES `affiliate` (`id`);

ALTER TABLE `member_description` ADD FOREIGN KEY (`member_id`) REFERENCES `member` (`id`);

ALTER TABLE `board_description` ADD FOREIGN KEY (`board_id`) REFERENCES `board` (`id`);

ALTER TABLE `board_contribution_request` ADD FOREIGN KEY (`from_member_id`) REFERENCES `member` (`id`);

ALTER TABLE `board_contribution_request` ADD FOREIGN KEY (`to_board_id`) REFERENCES `board` (`id`);

ALTER TABLE `member_follow_request` ADD FOREIGN KEY (`from_member_id`) REFERENCES `member` (`id`);

ALTER TABLE `member_follow_request` ADD FOREIGN KEY (`to_member_id`) REFERENCES `member` (`id`);

ALTER TABLE `post_membership` ADD FOREIGN KEY (`post_id`) REFERENCES `post` (`id`);

ALTER TABLE `post_membership` ADD FOREIGN KEY (`affiliate_id`) REFERENCES `affiliate` (`id`);

ALTER TABLE `post_saved` ADD FOREIGN KEY (`post_id`) REFERENCES `post` (`id`);

ALTER TABLE `post_saved` ADD FOREIGN KEY (`affiliate_id`) REFERENCES `affiliate` (`id`);

ALTER TABLE `post_comment` ADD FOREIGN KEY (`from_post_id`) REFERENCES `post` (`id`);

ALTER TABLE `post_comment` ADD FOREIGN KEY (`to_post_id`) REFERENCES `post` (`id`);
