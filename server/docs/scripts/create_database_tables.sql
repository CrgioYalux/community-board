CREATE SCHEMA IF NOT EXISTS community_board;

USE community_board;

CREATE TABLE IF NOT EXISTS entity (
	id INT NOT NULL UNIQUE AUTO_INCREMENT,
    is_active BIT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk__entity
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS affiliate (
	id INT NOT NULL UNIQUE AUTO_INCREMENT,
    entity_id INT NOT NULL UNIQUE,
    CONSTRAINT pk__affiliate
    PRIMARY KEY (id),
    CONSTRAINT fk__affiliate__entity
    FOREIGN KEY (entity_id)
    REFERENCES entity (id)
);

CREATE TABLE IF NOT EXISTS member (
	id INT NOT NULL UNIQUE AUTO_INCREMENT,
    affiliate_id INT NOT NULL UNIQUE,
    username VARCHAR (30) NOT NULL UNIQUE,
    CONSTRAINT pk__member
    PRIMARY KEY (id),
    CONSTRAINT fk__member__affiliate
    FOREIGN KEY (affiliate_id)
    REFERENCES affiliate (id)
);

CREATE TABLE IF NOT EXISTS member_description (
	member_id INT NOT NULL UNIQUE,
    email VARCHAR (100) DEFAULT NULL,
	fullname VARCHAR (100) DEFAULT NULL,
    bio VARCHAR (255) DEFAULT NULL,
    birthdate DATE DEFAULT NULL,
    is_private BIT (1) NOT NULL DEFAULT 0,
    CONSTRAINT fk__member_description__member
    FOREIGN KEY (member_id)
    REFERENCES member (id)
);

CREATE TABLE IF NOT EXISTS member_auth (
	member_id INT NOT NULL UNIQUE,
    salt VARCHAR (100) NOT NULL,
    hash VARCHAR (100) NOT NULL,
    CONSTRAINT fk__member_auth__member
    FOREIGN KEY (member_id)
    REFERENCES member (id)
);

CREATE TABLE IF NOT EXISTS member_follow_request (
	id INT NOT NULL UNIQUE AUTO_INCREMENT,
    from_member_id INT NOT NULL,
    to_affiliate_id INT NOT NULL,
	is_accepted BIT (1) NOT NULL,
    CONSTRAINT pk__member_follow_request
    PRIMARY KEY (id),
    CONSTRAINT fk__member_follow_request__member
    FOREIGN KEY (from_member_id)
    REFERENCES member (id),
    CONSTRAINT fk__member_follow_request__affiliate
    FOREIGN KEY (to_affiliate_id)
    REFERENCES affiliate (id)
);

CREATE TABLE IF NOT EXISTS board (
	id INT NOT NULL UNIQUE AUTO_INCREMENT,
	affiliate_id INT NOT NULL UNIQUE,
    from_member_id INT NOT NULL,
    CONSTRAINT pk__board
    PRIMARY KEY (id),
    CONSTRAINT fk__board__member
    FOREIGN KEY (from_member_id)
    REFERENCES member (id),
    CONSTRAINT Ffk__board__affiliate
    FOREIGN KEY (affiliate_id)
    REFERENCES affiliate (id)
);

CREATE TABLE IF NOT EXISTS board_description (
	board_id INT NOT NULL UNIQUE,
    title VARCHAR (100) NOT NULL,
    about VARCHAR (255) DEFAULT NULL,
    is_private BIT (1) NOT NULL DEFAULT 0,
    CONSTRAINT fk__board_description__board
    FOREIGN KEY (board_id)
    REFERENCES board (id)
);

CREATE TABLE IF NOT EXISTS post (
	id INT NOT NULL UNIQUE AUTO_INCREMENT,
    entity_id INT NOT NULL UNIQUE,
    body VARCHAR (255) NOT NULL,
    CONSTRAINT pk__post
    PRIMARY KEY (id),
    CONSTRAINT fk__post__entity
    FOREIGN KEY (entity_id)
    REFERENCES entity (id)
);

CREATE TABLE IF NOT EXISTS post_membership (
	post_id INT NOT NULL,
    affiliate_id INT NOT NULL,
    CONSTRAINT fk__post_membership__post
    FOREIGN KEY (post_id)
    REFERENCES post (id),
    CONSTRAINT fk__post_membership__affiliate
    FOREIGN KEY (affiliate_id)
    REFERENCES affiliate (id)
);

CREATE TABLE IF NOT EXISTS post_saved (
	post_id INT NOT NULL,
    affiliate_id INT NOT NULL,
    CONSTRAINT fk__post_saved__post
    FOREIGN KEY (post_id)
    REFERENCES post (id),
    CONSTRAINT fk__post_saved__affiliate
    FOREIGN KEY (affiliate_id)
    REFERENCES affiliate (id)
);

CREATE TABLE IF NOT EXISTS post_comment (
	from_post_id INT NOT NULL,
    to_post_id INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk__post_comment__post__from
    FOREIGN KEY (from_post_id)
    REFERENCES post (id),
    CONSTRAINT fk__post_comment__post__to
    FOREIGN KEY (to_post_id)
    REFERENCES post (id)
);

DROP TABLE IF EXISTS post_comment;
DROP TABLE IF EXISTS post_saved;
DROP TABLE IF EXISTS post_membership;
DROP TABLE IF EXISTS post;
DROP TABLE IF EXISTS board_description;
DROP TABLE IF EXISTS board;
DROP TABLE IF EXISTS member_follow_request;
DROP TABLE IF EXISTS member_description;
DROP TABLE IF EXISTS member_auth;
DROP TABLE IF EXISTS member;
DROP TABLE IF EXISTS affiliate;
DROP TABLE IF EXISTS entity;

SHOW TABLES;