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