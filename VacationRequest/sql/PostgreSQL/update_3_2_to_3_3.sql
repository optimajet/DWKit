DO $$
BEGIN
	IF NOT EXISTS (SELECT * FROM "dwSecurityRole" WHERE "Code" = 'Anonymous') THEN
		INSERT INTO "dwSecurityRole"("Id","Code","Name","Comment","DomainGroup") VALUES( 'cb871934-e1e8-c4f5-7845-fa4733d85f69', 'Anonymous', 'Anonymous', '', '');
	END IF;
END $$;