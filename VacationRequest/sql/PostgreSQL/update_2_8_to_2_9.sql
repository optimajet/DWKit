CREATE TABLE IF NOT EXISTS "dwEntities"(
        "Id" uuid NOT NULL PRIMARY KEY,
        "ParentId" uuid NULL,
        "ReferenceId" uuid NULL,
        "CreatedBy" uuid NULL,
        "ChangedBy" uuid NULL,
        "Created" timestamp NULL,
        "Changed" timestamp NULL,
        "Name" varchar(2048) NULL,
        "DataModelName" varchar(256) NOT NULL,
        "SchemeName" varchar(256) NULL,
        "State" text NULL,
        "StateName" text NULL,
        "Extensions" text NULL
);

CREATE INDEX "IX_DataModelName"
    ON public."dwEntities" USING btree
    ("DataModelName" ASC NULLS LAST)
    TABLESPACE pg_default;

CREATE INDEX "IX_ParentId"
    ON public."dwEntities" USING btree
    ("ParentId" ASC NULLS LAST)
;

CREATE INDEX "IX_ReferenceId"
    ON public."dwEntities" USING btree
    ("ReferenceId" ASC NULLS LAST)
;


CREATE OR REPLACE FUNCTION "dwGet_Sequence"(IN Code VARCHAR(256),OUT Value BIGINT) AS $$
BEGIN
    IF(NOT EXISTS(SELECT * FROM "dwAppSettings" WHERE "Name" = Code))
	THEN
		INSERT INTO "dwAppSettings"("Name", "Value", "GroupName", "ParamName") VALUES(Code, 1, 'DataSequence', Code);
	END IF;

	SELECT CAST ("Value" as bigint) INTO Value
	FROM "dwAppSettings"
	WHERE "Name" = Code;

	UPDATE "dwAppSettings"
		SET "Value" = CAST((Value + 1) as varchar(1000))
	WHERE "Name" = Code;
END;
$$ LANGUAGE plpgsql;
