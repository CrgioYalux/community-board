CREATE OR REPLACE VIEW valid_affiliates AS
WITH valid AS (
	SELECT 
		a.id AS affiliate_id,
		IF(m.id IS NULL, FALSE, TRUE) AS is_member,
		IF(b.id IS NULL, FALSE, TRUE) AS is_board,
		IF(md.member_id IS NULL, IF(bd.board_id IS NULL, FALSE, TRUE), TRUE) AS has_description
	FROM affiliate a
	JOIN entity e ON e.id = a.entity_id
	LEFT JOIN member m ON a.id = m.affiliate_id
	LEFT JOIN member_description md ON m.id = md.member_id
	LEFT JOIN board b ON a.id = b.affiliate_id
	LEFT JOIN board_description bd ON b.id = bd.board_id
	WHERE e.is_active = 1
)
SELECT * FROM valid v WHERE v.has_description = 1;

CREATE OR REPLACE VIEW valid_members AS
WITH valid AS (
	SELECT 
		e.id AS entity_id,
        a.id AS affiliate_id,
		m.id AS member_id,
        m.username,
        IF(md.member_id IS NULL, FALSE, TRUE) AS has_description
	FROM member m
	JOIN affiliate a ON a.id = m.affiliate_id
    JOIN entity e ON e.id = a.entity_id
    LEFT JOIN member_description md ON m.id = md.member_id
	WHERE e.is_active = 1
)
SELECT * FROM valid v WHERE v.has_description = 1;

CREATE OR REPLACE VIEW affiliate_followers AS
SELECT 
	count(mfr.id) AS followers,
	mfr.to_affiliate_id AS affiliate_id
FROM member_follow_request mfr
JOIN valid_members vm ON mfr.from_member_id = vm.member_id
JOIN valid_affiliates va ON mfr.to_affiliate_id = va.affiliate_id
WHERE mfr.is_accepted = 1
GROUP BY mfr.to_affiliate_id;

CREATE OR REPLACE VIEW member_followees AS
SELECT 
	count(mfr.id) AS followees,
    mfr.from_member_id AS member_id
FROM member_follow_request mfr
JOIN valid_members vm ON mfr.from_member_id = vm.member_id
JOIN valid_affiliates va ON mfr.to_affiliate_id = va.affiliate_id
WHERE mfr.is_accepted = 1
GROUP BY mfr.from_member_id;

CREATE OR REPLACE VIEW member_pending_follow_requests AS
WITH follower AS (
	SELECT
		m.username AS follower_username,
        m.id AS follower_member_id,
        mfr.id AS member_follow_request_id
	FROM member_shortened m
    JOIN member_follow_request mfr ON m.id = mfr.from_member_id
)
SELECT
	mfr.id AS member_follow_request_id,
	m.id AS followee_member_id,
    m.username AS followee_username,
    f.follower_member_id,
    f.follower_username,
	mfr.is_accepted
FROM member_follow_request mfr
JOIN affiliate a ON a.id = mfr.to_affiliate_id
JOIN member m ON a.id = m.affiliate_id
JOIN follower f ON mfr.id = f.member_follow_request_id
WHERE mfr.is_accepted = 0;
    
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
-- where apfr.consultant_affiliate_id = ?

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

CREATE OR REPLACE VIEW affiliate_posts AS
SELECT
    vp.*,
	ms.member_id, ms.affiliate_id AS member_affiliate_id, ms.username, ms.fullname, ms.is_private AS member_is_private, ms.followees AS member_followees, ms.followers AS member_followers,
    bs.board_id, bs.affiliate_id AS board_affiliate_id, bs.title, bs.about, bs.is_private AS board_is_private, bs.followers AS board_followers
FROM valid_posts vp
JOIN post_membership pm ON vp.post_id = pm.post_id
LEFT JOIN member_shortened ms ON ms.affiliate_id = pm.affiliate_id
LEFT JOIN board_shortened bs ON bs.affiliate_id = pm.affiliate_id;

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
-- WHERE ps.affiliate_id = ?;

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

/*
CREATE OR REPLACE VIEW affiliate_feed AS
SELECT 
	ps.affiliate_id AS consultant_affiliate_id,
	IF(ps.affiliate_id IS NULL, FALSE, TRUE) AS saved_by_consultant,
	f.*
FROM feed f
LEFT JOIN post_saved ps ON ps.post_id = f.post_id AND ps.affiliate_id = ?
WHERE (f.post_membership_affiliate_id = ?);
*/

CREATE OR REPLACE VIEW member_from_member_pov AS
SELECT 
    IF(mfr.id IS NULL, FALSE, TRUE) AS follow_requested_by_consultant,
    IF(mfr.is_accepted IS NULL, md.is_private, mfr.is_accepted) AS is_consultant_allowed,
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
-- m.username = ? AND mfr.consultant_member_id = ?;