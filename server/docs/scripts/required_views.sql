-- Gets each member extended info
-- Use `me.username = ?` to filter by an specific member

CREATE OR REPLACE VIEW member_extended AS
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
FROM member m 
JOIN affiliate a ON a.id = m.affiliate_id
JOIN entity e ON e.id = a.entity_id
JOIN member_description md ON m.id = md.member_id
LEFT JOIN member_followees mf ON m.id = mf.member_id 
LEFT JOIN affiliate_followers af ON m.affiliate_id = af.affiliate_id
WHERE e.is_active = 1;

-- Gets each member shortened info
-- Use `me.username = ?` to filter by an specific member

CREATE OR REPLACE VIEW member_shortened AS
SELECT 
	m.username,
    a.id AS affiliate_id,
    m.id AS member_id,
    md.fullname,
    IF(md.is_private = 1, TRUE, FALSE) AS is_private,
	IF(mf.followees IS NULL, 0, mf.followees) AS followees,
	IF(af.followers IS NULL, 0, af.followers) AS followers
FROM member m 
JOIN affiliate a ON a.id = m.affiliate_id
JOIN entity e ON e.id = a.entity_id
JOIN member_description md ON m.id = md.member_id
LEFT JOIN member_followees mf ON m.id = mf.member_id 
LEFT JOIN affiliate_followers af ON m.affiliate_id = af.affiliate_id
WHERE e.is_active = 1;

-- Gets each affiliate's follow requests
-- Use `apfr.consultant_affiliate_id = ?` to filter by an specific affiliate

CREATE OR REPLACE VIEW affiliate_follow_requests AS
WITH follower AS (
	SELECT
		ms.username,
        ms.fullname,
        ms.affiliate_id,
        mfr.id AS follow_request_id
	FROM member_shortened ms
    JOIN member_follow_request mfr ON ms.member_id = mfr.from_member_id
)
SELECT
	f.*,
	a.id AS consultant_affiliate_id
FROM member_follow_request mfr
JOIN follower f ON mfr.id = f.follow_request_id
JOIN affiliate a ON a.id = mfr.to_affiliate_id
WHERE mfr.is_accepted = 0;

-- Gets member info from another member's perspective
-- Use `m.username = ?` and `mfr.consultant_member_id = ?` to specify the member and the member who's perspective is used to consult from, respectavely.

CREATE OR REPLACE VIEW member_from_member_pov AS
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
FROM member m 
JOIN affiliate a ON a.id = m.affiliate_id
JOIN entity e ON e.id = a.entity_id
JOIN member_description md ON m.id = md.member_id
LEFT JOIN member_follow_request mfr ON mfr.to_affiliate_id = a.id
LEFT JOIN member_followees mf ON m.id = mf.member_id 
LEFT JOIN affiliate_followers af ON m.affiliate_id = af.affiliate_id
WHERE e.is_active = 1;

-- Gets affiliates' followers lists
-- Use `afl.consultant_affiliate_id = ?` to get a specific affiliate's

CREATE OR REPLACE VIEW affiliate_followers_listed AS
WITH follower AS (
	SELECT
		ms.username,
        ms.fullname,
        ms.affiliate_id,
        mfr.id AS follow_request_id
	FROM member_shortened ms
    JOIN member_follow_request mfr ON ms.member_id = mfr.from_member_id
)
SELECT
	f.*,
	a.id AS consultant_affiliate_id
FROM member_follow_request mfr
JOIN follower f ON mfr.id = f.follow_request_id
JOIN affiliate a ON a.id = mfr.to_affiliate_id
WHERE mfr.is_accepted = 1;

-- Gets affiliates' followees lists
-- Use `afl.consultant_affiliate_id = ?` to get a specific affiliate's

CREATE OR REPLACE VIEW affiliate_followees_listed AS
WITH followee AS (
	SELECT
		ms.username,
        ms.fullname,
        ms.affiliate_id,
        mfr.id AS follow_request_id
	FROM member_shortened ms
    JOIN member_follow_request mfr ON ms.affiliate_id = mfr.to_affiliate_id
)
SELECT
	f.*,
	m.affiliate_id AS consultant_affiliate_id
FROM member_follow_request mfr
JOIN followee f ON mfr.id = f.follow_request_id
JOIN member m ON m.id = mfr.from_member_id
WHERE mfr.is_accepted = 1;

-- Gets valid posts

CREATE OR REPLACE VIEW valid_posts AS
WITH post_times_saved AS (
	SELECT
		p.id AS post_id,
		COUNT(ps.post_id) AS times_saved                                                 
	FROM post p
	JOIN post_saved ps ON p.id = ps.post_id
    GROUP BY (ps.post_id)
)
SELECT
	p.id AS post_id,
    p.body,
    e.created_at,
    IF(pts.times_saved IS NULL, 0, pts.times_saved) AS times_saved
FROM post p
JOIN entity e ON e.id = p.entity_id
LEFT JOIN post_times_saved pts ON p.id = pts.post_id
WHERE e.is_active = 1;

-- Gets board shortened info

CREATE OR REPLACE VIEW board_shortened AS
SELECT
    a.id AS affiliate_id,
    b.id AS board_id,
    bd.title,
    bd.about,
    IF(bd.is_private = 1, TRUE, FALSE) AS is_private,
	IF(af.followers IS NULL, 0, af.followers) AS followers
FROM board b
JOIN affiliate a ON b.affiliate_id = a.id
JOIN entity e ON e.id = a.entity_id
JOIN board_description bd ON b.id = bd.board_id
LEFT JOIN affiliate_followers af ON b.affiliate_id = af.affiliate_id
WHERE e.is_active = 1;

-- Gets affiliates saved posts
-- Use `ps.affiliate_id = ?` to specify affiliate

CREATE OR REPLACE VIEW affiliate_saved_posts AS
SELECT
    vp.*,
    ps.affiliate_id AS saver_affiliate_id,
	ps.affiliate_id AS consultant_affiliate_id,
    IF(ps.affiliate_id IS NULL, FALSE, TRUE) AS saved_by_consultant,
	ms.member_id, ms.affiliate_id AS member_affiliate_id, ms.username, ms.fullname, ms.is_private AS member_is_private, ms.followees AS member_followees, ms.followers AS member_followers,
    bs.board_id, bs.affiliate_id AS board_affiliate_id, bs.title, bs.about, bs.is_private AS board_is_private, bs.followers AS board_followers
FROM valid_posts vp
JOIN post_saved ps ON vp.post_id = ps.post_id
JOIN post_membership pm ON vp.post_id = pm.post_id
LEFT JOIN member_shortened ms ON ms.affiliate_id = pm.affiliate_id
LEFT JOIN board_shortened bs ON bs.affiliate_id = pm.affiliate_id
ORDER BY vp.created_at DESC;

-- Gets feed

CREATE OR REPLACE VIEW feed AS
SELECT
	vp.*,
	pm.affiliate_id AS post_membership_affiliate_id,
	ms.affiliate_id AS member_affiliate_id, ms.username, ms.fullname, ms.is_private AS member_is_private, ms.followees AS member_followees, ms.followers AS member_followers,
	bs.affiliate_id AS board_affiliate_id, bs.title, bs.about, bs.is_private AS board_is_private, bs.followers AS board_followers
FROM valid_posts vp
JOIN post_membership pm ON vp.post_id = pm.post_id
LEFT JOIN member_shortened ms ON ms.affiliate_id = pm.affiliate_id
LEFT JOIN board_shortened bs ON bs.affiliate_id = pm.affiliate_id;
