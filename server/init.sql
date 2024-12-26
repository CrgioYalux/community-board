CREATE DATABASE IF NOT EXISTS community_board;

CREATE TABLE IF NOT EXISTS community_board.entity (
	id INT NOT NULL UNIQUE AUTO_INCREMENT,
    is_active BIT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk__entity
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS community_board.affiliate (
	id INT NOT NULL UNIQUE AUTO_INCREMENT,
    entity_id INT NOT NULL UNIQUE,
    CONSTRAINT pk__affiliate
    PRIMARY KEY (id),
    CONSTRAINT fk__affiliate__entity
    FOREIGN KEY (entity_id)
    REFERENCES entity (id)
);

CREATE TABLE IF NOT EXISTS community_board.member (
	id INT NOT NULL UNIQUE AUTO_INCREMENT,
    affiliate_id INT NOT NULL UNIQUE,
    username VARCHAR (30) NOT NULL UNIQUE,
    CONSTRAINT pk__member
    PRIMARY KEY (id),
    CONSTRAINT fk__member__affiliate
    FOREIGN KEY (affiliate_id)
    REFERENCES affiliate (id)
);

CREATE TABLE IF NOT EXISTS community_board.member_description (
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

CREATE TABLE IF NOT EXISTS community_board.member_auth (
	member_id INT NOT NULL UNIQUE,
    salt VARCHAR (100) NOT NULL,
    hash VARCHAR (100) NOT NULL,
    CONSTRAINT fk__member_auth__member
    FOREIGN KEY (member_id)
    REFERENCES member (id)
);

CREATE TABLE IF NOT EXISTS community_board.member_follow_request (
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

CREATE TABLE IF NOT EXISTS community_board.board (
	id INT NOT NULL UNIQUE AUTO_INCREMENT,
	affiliate_id INT NOT NULL UNIQUE,
    from_member_id INT NOT NULL,
    CONSTRAINT pk__board
    PRIMARY KEY (id),
    CONSTRAINT fk__board__member
    FOREIGN KEY (from_member_id)
    REFERENCES member (id),
    CONSTRAINT fk__board__affiliate
    FOREIGN KEY (affiliate_id)
    REFERENCES affiliate (id)
);

CREATE TABLE IF NOT EXISTS community_board.board_description (
	board_id INT NOT NULL UNIQUE,
    title VARCHAR (100) NOT NULL,
    about VARCHAR (255) DEFAULT NULL,
    is_private BIT (1) NOT NULL DEFAULT 0,
    CONSTRAINT fk__board_description__board
    FOREIGN KEY (board_id)
    REFERENCES board (id)
);

CREATE TABLE IF NOT EXISTS community_board.post (
	id INT NOT NULL UNIQUE AUTO_INCREMENT,
    entity_id INT NOT NULL UNIQUE,
    body VARCHAR (255) NOT NULL,
    CONSTRAINT pk__post
    PRIMARY KEY (id),
    CONSTRAINT fk__post__entity
    FOREIGN KEY (entity_id)
    REFERENCES entity (id)
);

CREATE TABLE IF NOT EXISTS community_board.post_membership (
	post_id INT NOT NULL,
    affiliate_id INT NOT NULL,
    CONSTRAINT fk__post_membership__post
    FOREIGN KEY (post_id)
    REFERENCES post (id),
    CONSTRAINT fk__post_membership__affiliate
    FOREIGN KEY (affiliate_id)
    REFERENCES affiliate (id)
);

CREATE TABLE IF NOT EXISTS community_board.post_saved (
	post_id INT NOT NULL,
    affiliate_id INT NOT NULL,
    CONSTRAINT fk__post_saved__post
    FOREIGN KEY (post_id)
    REFERENCES post (id),
    CONSTRAINT fk__post_saved__affiliate
    FOREIGN KEY (affiliate_id)
    REFERENCES affiliate (id)
);

CREATE TABLE IF NOT EXISTS community_board.post_comment (
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

CREATE OR REPLACE VIEW community_board.valid_members AS
WITH valid AS (
	SELECT 
		e.id AS entity_id,
        a.id AS affiliate_id,
		m.id AS member_id,
        m.username,
        IF(md.member_id IS NULL, FALSE, TRUE) AS has_description
	FROM community_board.member m
	JOIN community_board.affiliate a ON a.id = m.affiliate_id
    JOIN community_board.entity e ON e.id = a.entity_id
    LEFT JOIN community_board.member_description md ON m.id = md.member_id
	WHERE e.is_active = 1
)
SELECT * FROM valid v WHERE v.has_description = 1;

CREATE OR REPLACE VIEW community_board.valid_affiliates AS
WITH valid AS (
	SELECT 
		a.id AS affiliate_id,
		IF(m.id IS NULL, FALSE, TRUE) AS is_member,
		IF(b.id IS NULL, FALSE, TRUE) AS is_board,
		IF(md.member_id IS NULL, IF(bd.board_id IS NULL, FALSE, TRUE), TRUE) AS has_description
	FROM community_board.affiliate a
	JOIN community_board.entity e ON e.id = a.entity_id
	LEFT JOIN community_board.member m ON a.id = m.affiliate_id
	LEFT JOIN community_board.member_description md ON m.id = md.member_id
	LEFT JOIN community_board.board b ON a.id = b.affiliate_id
	LEFT JOIN community_board.board_description bd ON b.id = bd.board_id
	WHERE e.is_active = 1
)
SELECT * FROM valid v WHERE v.has_description = 1;

CREATE OR REPLACE VIEW community_board.member_followees AS
SELECT 
	count(mfr.id) AS followees,
    mfr.from_member_id AS member_id
FROM community_board.member_follow_request mfr
JOIN community_board.valid_members vm ON mfr.from_member_id = vm.member_id
JOIN community_board.valid_affiliates va ON mfr.to_affiliate_id = va.affiliate_id
WHERE mfr.is_accepted = 1
GROUP BY mfr.from_member_id;

CREATE OR REPLACE VIEW community_board.affiliate_followers AS
SELECT 
	count(mfr.id) AS followers,
	mfr.to_affiliate_id AS affiliate_id
FROM community_board.member_follow_request mfr
JOIN community_board.valid_members vm ON mfr.from_member_id = vm.member_id
JOIN community_board.valid_affiliates va ON mfr.to_affiliate_id = va.affiliate_id
WHERE mfr.is_accepted = 1
GROUP BY mfr.to_affiliate_id;

CREATE OR REPLACE VIEW community_board.member_extended AS
SELECT 
	m.username,
    e.id AS entity_id,
    a.id AS affiliate_id,
    m.id AS member_id,
    md.email, md.fullname, md.bio, md.birthdate,
    IF(md.is_private = 1, TRUE, FALSE) AS is_private,
	IF(mf.followees IS NULL, 0, mf.followees) AS followees,
	IF(af.followers IS NULL, 0, af.followers) AS followers,
    e.created_at
FROM community_board.member m 
JOIN community_board.affiliate a ON a.id = m.affiliate_id
JOIN community_board.entity e ON e.id = a.entity_id
JOIN community_board.member_description md ON m.id = md.member_id
LEFT JOIN community_board.member_followees mf ON m.id = mf.member_id 
LEFT JOIN community_board.affiliate_followers af ON m.affiliate_id = af.affiliate_id
WHERE e.is_active = 1;

CREATE OR REPLACE VIEW community_board.member_shortened AS
SELECT 
	m.username,
    a.id AS affiliate_id,
    m.id AS member_id,
    md.fullname,
    IF(md.is_private = 1, TRUE, FALSE) AS is_private,
	IF(mf.followees IS NULL, 0, mf.followees) AS followees,
	IF(af.followers IS NULL, 0, af.followers) AS followers
FROM community_board.member m 
JOIN community_board.affiliate a ON a.id = m.affiliate_id
JOIN community_board.entity e ON e.id = a.entity_id
JOIN community_board.member_description md ON m.id = md.member_id
LEFT JOIN community_board.member_followees mf ON m.id = mf.member_id 
LEFT JOIN community_board.affiliate_followers af ON m.affiliate_id = af.affiliate_id
WHERE e.is_active = 1;

CREATE OR REPLACE VIEW community_board.affiliate_follow_requests AS
WITH follower AS (
	SELECT
		ms.username,
        ms.fullname,
        ms.affiliate_id,
        mfr.id AS follow_request_id
	FROM community_board.member_shortened ms
    JOIN community_board.member_follow_request mfr ON ms.member_id = mfr.from_member_id
)
SELECT
	f.*,
	a.id AS consultant_affiliate_id
FROM community_board.member_follow_request mfr
JOIN follower f ON mfr.id = f.follow_request_id
JOIN community_board.affiliate a ON a.id = mfr.to_affiliate_id
WHERE mfr.is_accepted = 0;

CREATE OR REPLACE VIEW community_board.member_from_member_pov AS
SELECT 
    IF(mfr.id IS NULL, FALSE, TRUE) AS follow_requested_by_consultant,
    IF(mfr.is_accepted IS NULL, IF(md.is_private = 1, FALSE, TRUE), IF(mfr.is_accepted = 1, TRUE, FALSE)) AS is_consultant_allowed,
    mfr.from_member_id AS consultant_member_id,
	m.username,
    m.affiliate_id,
    md.fullname, md.bio, md.birthdate,
    IF(md.is_private = 1, TRUE, FALSE) AS is_private,
	IF(mf.followees IS NULL, 0, mf.followees) AS followees,
	IF(af.followers IS NULL, 0, af.followers) AS followers,
    e.created_at
FROM community_board.member m 
JOIN community_board.affiliate a ON a.id = m.affiliate_id
JOIN community_board.entity e ON e.id = a.entity_id
JOIN community_board.member_description md ON m.id = md.member_id
LEFT JOIN community_board.member_follow_request mfr ON mfr.to_affiliate_id = a.id
LEFT JOIN community_board.member_followees mf ON m.id = mf.member_id 
LEFT JOIN community_board.affiliate_followers af ON m.affiliate_id = af.affiliate_id
WHERE e.is_active = 1;

CREATE OR REPLACE VIEW community_board.affiliate_followers_listed AS
WITH follower AS (
	SELECT
		ms.username,
        ms.fullname,
        ms.affiliate_id,
        mfr.id AS follow_request_id
	FROM community_board.member_shortened ms
    JOIN community_board.member_follow_request mfr ON ms.member_id = mfr.from_member_id
)
SELECT
	f.*,
	a.id AS consultant_affiliate_id
FROM community_board.member_follow_request mfr
JOIN follower f ON mfr.id = f.follow_request_id
JOIN community_board.affiliate a ON a.id = mfr.to_affiliate_id
WHERE mfr.is_accepted = 1;

CREATE OR REPLACE VIEW community_board.affiliate_followees_listed AS
WITH followee AS (
	SELECT
		ms.username,
        ms.fullname,
        ms.affiliate_id,
        mfr.id AS follow_request_id
	FROM community_board.member_shortened ms
    JOIN community_board.member_follow_request mfr ON ms.affiliate_id = mfr.to_affiliate_id
)
SELECT
	f.*,
	m.affiliate_id AS consultant_affiliate_id
FROM community_board.member_follow_request mfr
JOIN followee f ON mfr.id = f.follow_request_id
JOIN community_board.member m ON m.id = mfr.from_member_id
WHERE mfr.is_accepted = 1;

CREATE OR REPLACE VIEW community_board.valid_posts AS
WITH post_times_saved AS (
	SELECT
		p.id AS post_id,
		COUNT(ps.post_id) AS times_saved
	FROM community_board.post p
	JOIN community_board.post_saved ps ON p.id = ps.post_id
    GROUP BY (ps.post_id)
)
SELECT
	p.id AS post_id,
    p.body,
    e.created_at,
    IF(pts.times_saved IS NULL, 0, pts.times_saved) AS times_saved
FROM community_board.post p
JOIN community_board.entity e ON e.id = p.entity_id
LEFT JOIN post_times_saved pts ON p.id = pts.post_id
WHERE e.is_active = 1;

CREATE OR REPLACE VIEW community_board.board_shortened AS
SELECT
    a.id AS affiliate_id,
    b.id AS board_id,
    bd.title,
    bd.about,
    IF(bd.is_private = 1, TRUE, FALSE) AS is_private,
	IF(af.followers IS NULL, 0, af.followers) AS followers
FROM community_board.board b
JOIN community_board.affiliate a ON b.affiliate_id = a.id
JOIN community_board.entity e ON e.id = a.entity_id
JOIN community_board.board_description bd ON b.id = bd.board_id
LEFT JOIN community_board.affiliate_followers af ON b.affiliate_id = af.affiliate_id
WHERE e.is_active = 1;

CREATE OR REPLACE VIEW community_board.affiliate_saved_posts AS
SELECT
    vp.*,
    ps.affiliate_id AS saver_affiliate_id,
	ps.affiliate_id AS consultant_affiliate_id,
    IF(ps.affiliate_id IS NULL, FALSE, TRUE) AS saved_by_consultant,
	ms.member_id, ms.affiliate_id AS member_affiliate_id, ms.username, ms.fullname, ms.is_private AS member_is_private, ms.followees AS member_followees, ms.followers AS member_followers,
    bs.board_id, bs.affiliate_id AS board_affiliate_id, bs.title, bs.about, bs.is_private AS board_is_private, bs.followers AS board_followers
FROM community_board.valid_posts vp
JOIN community_board.post_saved ps ON vp.post_id = ps.post_id
JOIN community_board.post_membership pm ON vp.post_id = pm.post_id
LEFT JOIN community_board.member_shortened ms ON ms.affiliate_id = pm.affiliate_id
LEFT JOIN community_board.board_shortened bs ON bs.affiliate_id = pm.affiliate_id
ORDER BY vp.created_at DESC;

CREATE OR REPLACE VIEW community_board.feed AS
SELECT
	vp.*,
	pm.affiliate_id AS post_membership_affiliate_id,
	ms.affiliate_id AS member_affiliate_id, ms.username, ms.fullname, ms.is_private AS member_is_private, ms.followees AS member_followees, ms.followers AS member_followers,
	bs.affiliate_id AS board_affiliate_id, bs.title, bs.about, bs.is_private AS board_is_private, bs.followers AS board_followers
FROM community_board.valid_posts vp
JOIN community_board.post_membership pm ON vp.post_id = pm.post_id
LEFT JOIN community_board.member_shortened ms ON ms.affiliate_id = pm.affiliate_id
LEFT JOIN community_board.board_shortened bs ON bs.affiliate_id = pm.affiliate_id;
