CREATE UNIQUE INDEX applications_one_non_withdrawn
  ON applications (student_id, offer_id)
  WHERE status <> 'WITHDRAWN';
