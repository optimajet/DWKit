/*
Company: OptimaJet
Project: DWKIT Provider for PostgreSQL
Version: 2.9
File: DWKitScript.sql
*/

BEGIN;

--Common tables---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "dwAppSettings"(
	"Name" varchar(50) NOT NULL PRIMARY KEY,
	"Value" varchar(1000) NOT NULL,
	"GroupName" varchar(50) NULL,
	"ParamName" varchar(1024) NOT NULL,
	"Order" integer NULL,
	"EditorType" varchar(50) NOT NULL DEFAULT (0),
	"IsHidden" boolean NOT NULL DEFAULT 0::boolean
);

DO $AppSettingsValues$
BEGIN
	IF NOT EXISTS(SELECT 1 FROM "dwAppSettings" WHERE "Name" = N'ApplicationDesc') THEN
		INSERT INTO "dwAppSettings"("Name", "Value", "GroupName", "ParamName", "Order", "EditorType") VALUES (N'ApplicationDesc', N'', N'Application settings', N'Description', 1, 0);
	END IF;

	IF NOT EXISTS(SELECT 1 FROM "dwAppSettings" WHERE "Name" = N'ApplicationName') THEN
		INSERT INTO "dwAppSettings"("Name", "Value", "GroupName", "ParamName", "Order", "EditorType") VALUES (N'ApplicationName', N'DWKit', N'Application settings', N'Name', 0, 0);
	END IF;

	IF NOT EXISTS(SELECT 1 FROM "dwAppSettings" WHERE "Name" = N'IntegrationApiKey') THEN
		INSERT INTO "dwAppSettings" ("Name","GroupName","ParamName","Value","Order","EditorType","IsHidden")VALUES (N'IntegrationApiKey',N'Application settings',N'Api key','',2,0,false );
	END IF;
END $AppSettingsValues$;

--UploadedFiles---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "dwUploadedFiles"(
	"Id" uuid NOT NULL PRIMARY KEY,
	"Data" bytea NOT NULL,
	"AttachmentLength" bigint NOT null,
	"Used" boolean NOT NULL  DEFAULT 0::boolean,
	"Name" varchar(1000) NOT NULL,
	"ContentType" varchar(255) NOT NULL,
	"CreatedBy" varchar(1024) NULL,
	"CreatedDate" timestamp NULL,
	"UpdatedBy" varchar(1024) NULL,
	"UpdatedDate" timestamp NULL,
	"Properties" text NULL
);

--SecurityPermission---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "dwSecurityGroup"(
	"Id" uuid NOT NULL PRIMARY KEY,
	"Name" varchar(128) NOT NULL,
	"Comment" varchar(1000) NULL,
	"IsSyncWithDomainGroup" boolean NOT NULL DEFAULT 0::boolean
);

CREATE TABLE IF NOT EXISTS "dwSecurityPermissionGroup"(
	"Id" uuid NOT NULL PRIMARY KEY,
	"Name" varchar(128) NOT NULL,
	"Code" varchar(128) NOT NULL
);

CREATE TABLE IF NOT EXISTS "dwSecurityPermission"(
	"Id" uuid NOT NULL PRIMARY KEY,
	"Code" varchar(128) NOT NULL,
	"Name" varchar(128) NULL,
	"GroupId" uuid NOT NULL REFERENCES "dwSecurityPermissionGroup" ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "dwSecurityRole"(
	"Id" uuid NOT NULL PRIMARY KEY,
	"Code" varchar(128) NOT NULL,
	"Name" varchar(128) NOT NULL,
	"Comment" varchar(1000) NULL,
	"DomainGroup" varchar(512) NULL
);

CREATE TABLE IF NOT EXISTS "dwSecurityRoleToSecurityPermission"(
	"Id" uuid NOT NULL PRIMARY KEY,
	"SecurityRoleId" uuid NOT NULL REFERENCES "dwSecurityRole",
	"SecurityPermissionId" uuid NOT NULL REFERENCES "dwSecurityPermission" ON DELETE CASCADE,
	"AccessType" smallint NOT NULL DEFAULT (0)
);


CREATE TABLE IF NOT EXISTS "dwSecurityUser"(
	"Id" uuid NOT NULL PRIMARY KEY,
	"Name" varchar(256) NOT NULL,
	"Email" varchar(256) NULL,
	"IsLocked" boolean NOT NULL DEFAULT 0::boolean,
	"ExternalId" varchar(1024) NULL,
	"Timezone" varchar(256) NULL,
	"Localization" varchar(256) NULL,
	"DecimalSeparator" char(1) NULL,
	"PageSize" integer NULL,
	"StartPage" varchar(256) NULL,
	"IsRTL" boolean NOT NULL DEFAULT 0::boolean,
	"Theme" varchar(256) NULL
);

CREATE TABLE IF NOT EXISTS "dwSecurityUserState"(
	"Id" uuid NOT NULL PRIMARY KEY,
	"SecurityUserId" uuid NOT NULL REFERENCES "dwSecurityUser" ON DELETE CASCADE,
	"Key" varchar(256) NOT NULL,
	"Value" text NOT NULL
);

CREATE TABLE IF NOT EXISTS "dwSecurityCredential"(
	"Id" uuid NOT NULL PRIMARY KEY,
	"PasswordHash" varchar(128) NULL,
	"PasswordSalt" varchar(128) NULL,
	"SecurityUserId" uuid NOT NULL REFERENCES "dwSecurityUser" ON DELETE CASCADE,
	"Login" varchar(256) NOT NULL,
	"AuthenticationType" smallint NOT NULL,
    "ExternalProviderName" varchar(128) NULL
);

CREATE TABLE IF NOT EXISTS "dwSecurityUserImpersonation"(
	"Id" uuid NOT NULL PRIMARY KEY,
	"SecurityUserId" uuid NOT NULL REFERENCES "dwSecurityUser" ON DELETE CASCADE,
	"ImpSecurityUserId" uuid NOT NULL REFERENCES "dwSecurityUser",
	"DateFrom" timestamp NOT NULL,
	"DateTo" timestamp NOT NULL
);

CREATE TABLE IF NOT EXISTS "dwSecurityUserToSecurityRole"(
	"Id" uuid NOT NULL PRIMARY KEY,
	"SecurityRoleId" uuid NOT NULL REFERENCES "dwSecurityRole" ON DELETE CASCADE,
	"SecurityUserId" uuid NOT NULL REFERENCES "dwSecurityUser" ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "dwSecurityGroupToSecurityRole"(
	"Id" uuid NOT NULL PRIMARY KEY,
	"SecurityRoleId" uuid NOT NULL REFERENCES "dwSecurityRole" ON DELETE CASCADE,
	"SecurityGroupId" uuid NOT NULL REFERENCES "dwSecurityGroup" ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "dwSecurityGroupToSecurityUser"(
	"Id" uuid NOT NULL PRIMARY KEY,
	"SecurityUserId" uuid NOT NULL REFERENCES "dwSecurityUser" ON DELETE CASCADE,
	"SecurityGroupId" uuid NOT NULL REFERENCES "dwSecurityGroup" ON DELETE CASCADE
);

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

DO $SecurityValues$
BEGIN
	IF NOT EXISTS (SELECT * FROM "dwSecurityCredential") THEN
		INSERT INTO "dwSecurityUser"("Id","Name","Email","IsLocked") VALUES ('540E514C-911F-4A03-AC90-C450C28838C5','admin', '', 0::boolean);
		INSERT INTO "dwSecurityCredential"("Id","PasswordHash","PasswordSalt","SecurityUserId","Login","AuthenticationType")
		VALUES('C0819C1D-C3BA-4EA7-ADA1-DF2D3D24C62F','VatmT7uZ8YiKAbBNrCcm2J7iW5Q=','/9xAN64KIM7tQ4qdAIgAwA==',	'540E514C-911F-4A03-AC90-C450C28838C5',	'admin',	0);

		INSERT INTO "dwSecurityPermissionGroup"("Id","Name","Code") VALUES ('94B616A1-62B5-41AB-AA10-46856158C55E', 'Common', 'Common');
		INSERT INTO "dwSecurityPermission"("Id","Code","Name","GroupId") VALUES ('952DC428-693D-4E83-A809-ABB6AFF7CA95', 'AccessToAdminPanel', 'Access to admin panel', '94B616A1-62B5-41AB-AA10-46856158C55E');
		INSERT INTO "dwSecurityRole"("Id","Code","Name","Comment","DomainGroup") VALUES( '1B7F60C8-D860-4510-8E71-5469FC1814D3', 'Admins', 'Admins', '', '');
		INSERT INTO "dwSecurityRoleToSecurityPermission"("Id", "SecurityRoleId","SecurityPermissionId","AccessType") VALUES ( '88B616A1-62B5-41AB-AA10-58851158C440', '1B7F60C8-D860-4510-8E71-5469FC1814D3', '952DC428-693D-4E83-A809-ABB6AFF7CA95', 1);
		INSERT INTO "dwSecurityUserToSecurityRole"("Id", "SecurityRoleId","SecurityUserId") VALUES ('88B616A1-62B5-41AB-AA10-58851158C4DD', '1B7F60C8-D860-4510-8E71-5469FC1814D3', '540E514C-911F-4A03-AC90-C450C28838C5');

	END IF;
END $SecurityValues$;


CREATE OR REPLACE VIEW "dwV_Security_UserRole" as
SELECT
	"SecurityUserId" as "UserId",
	"SecurityRoleId" as "RoleId"
FROM "dwSecurityUserToSecurityRole"

UNION

SELECT DISTINCT
	"dwSecurityGroupToSecurityUser"."SecurityUserId" as "UserId",
	"dwSecurityGroupToSecurityRole"."SecurityRoleId" as "RoleId"
FROM "dwSecurityGroupToSecurityRole"
INNER JOIN "dwSecurityGroupToSecurityUser" ON "dwSecurityGroupToSecurityUser"."SecurityGroupId" = "dwSecurityGroupToSecurityRole"."SecurityGroupId";


CREATE OR REPLACE VIEW "dwV_Security_CheckPermissionUser"
	AS
	SELECT "dwV_Security_UserRole"."UserId",
		sp."Id" AS "PermissionId",
	    spg."Code" AS "PermissionGroupCode",
	    spg."Name" AS "PermissionGroupName",
	    sp."Code" AS "PermissionCode",
	    sp."Name" AS "PermissionName",
	    MAX(srtosp."AccessType") as "AccessType"
	   FROM "dwSecurityPermission" sp
	     JOIN "dwSecurityPermissionGroup" spg ON sp."GroupId" = spg."Id"
	     JOIN "dwSecurityRoleToSecurityPermission" srtosp ON srtosp."SecurityPermissionId" = sp."Id"
	     JOIN "dwV_Security_UserRole" ON "dwV_Security_UserRole"."RoleId" = srtosp."SecurityRoleId"
	   WHERE srtosp."AccessType" <> 0
	   GROUP BY "dwV_Security_UserRole"."UserId", sp."Id",spg."Code", spg."Name", sp."Code", sp."Name";

CREATE OR REPLACE VIEW "dwV_Security_CheckPermissionGroup"
	AS
	SELECT
	sgtosr."SecurityGroupId" as "SecurityGroupId",
	sp."Id" as "PermissionId",
	spg."Code" as "PermissionGroupCode",
	spg."Name" as "PermissionGroupName",
	sp."Code" as "PermissionCode",
	sp."Name" as "PermissionName",
    MAX(srtosp."AccessType") as "AccessType"
	FROM "dwSecurityPermission" sp
	INNER JOIN "dwSecurityPermissionGroup" spg on sp."GroupId" = spg."Id"
	INNER JOIN "dwSecurityRoleToSecurityPermission" srtosp on srtosp."SecurityPermissionId" = sp."Id"
	INNER JOIN "dwSecurityGroupToSecurityRole" sgtosr on sgtosr."SecurityRoleId" = srtosp."SecurityRoleId"
	WHERE srtosp."AccessType" <> 0
	GROUP BY sgtosr."SecurityGroupId", sp."Id",spg."Code", spg."Name", sp."Code", sp."Name";

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

COMMIT;
