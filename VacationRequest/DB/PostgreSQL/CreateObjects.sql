/*
Company: OptimaJet
Project: DWKitSample DWKIT.COM
File: CreateObjects.sql
*/

BEGIN;

CREATE TABLE IF NOT EXISTS "StructDivision"
(
  "Id" uuid NOT NULL,
  "Name" character varying(256) NOT NULL,
  "ParentId" uuid NULL,
  CONSTRAINT "StructDivision_pkey" PRIMARY KEY ("Id")
);

ALTER TABLE "dwSecurityUser" ADD COLUMN "StructDivisionId" uuid NULL;
ALTER TABLE "dwSecurityUser" ADD COLUMN "IsHead" boolean NOT NULL DEFAULT 0::boolean;

CREATE TABLE IF NOT EXISTS "Document"
(
  "Id" uuid NOT NULL,
  "Number" SERIAL NOT NULL,
  "Name" character varying(256) NOT NULL,
  "Comment" character varying(1024) NULL,
  "AuthorId" uuid NOT NULL REFERENCES "dwSecurityUser",
  "ManagerId" uuid REFERENCES "dwSecurityUser",
  "Amount" numeric NOT NULL DEFAULT 0::numeric,
  "State" character varying(256) NOT NULL DEFAULT 'Draft',
  "StateName" character varying(256) ,
  CONSTRAINT "Document_pkey" PRIMARY KEY ("Id")
);

CREATE TABLE IF NOT EXISTS "DocumentTransitionHistory"
(
  "Id" uuid NOT NULL,
  "DocumentId" uuid NOT NULL REFERENCES "Document" ON DELETE CASCADE,
  "EmployeeId" uuid NULL REFERENCES "dwSecurityUser",
  "AllowedToEmployeeNames" character varying(1024) NULL,
  "TransitionTime" date NULL,
  "Order" SERIAL NOT NULL,
  "InitialState" character varying(256) NOT NULL,
  "DestinationState" character varying(256) NOT NULL,
  "Command" character varying(1024) NOT NULL,
  CONSTRAINT "DocumentTransitionHistory_pkey" PRIMARY KEY ("Id")
);


CREATE OR REPLACE VIEW  "vStructDivisionParents"
	AS
WITH RECURSIVE "cteRecursive" as (
 select sd."Id" as "FirstId", sd."ParentId" as "ParentId", sd."Id" as "Id"
  from  "StructDivision" as sd WHERE sd."ParentId" IS NOT NULL
 union all 
 select r."FirstId" as "FirstId", sdr."ParentId" as "ParentId", sdr."Id" as "Id"
 from "StructDivision" as sdr
 inner join "cteRecursive" r ON r."ParentId" = sdr."Id")

select DISTINCT "FirstId" as "Id", "ParentId" as "ParentId" FROM "cteRecursive";


CREATE OR REPLACE VIEW "vStructDivisionParentsAndThis"
	AS
	select  "Id" as "Id", "Id" as "ParentId" FROM "StructDivision"
	UNION 
	select  "Id" as "Id", "ParentId" as "ParentId" FROM "vStructDivisionParents";
	
CREATE OR REPLACE VIEW "vHeads"
AS
	select  e."Id" as "Id", e."Name" as "Name", eh."Id" as "HeadId", eh."Name" as "HeadName" FROM "dwSecurityUser" e 
	INNER JOIN "vStructDivisionParentsAndThis" vsp ON e."StructDivisionId" = vsp."Id"
	INNER JOIN "dwSecurityUser" eh ON eh."StructDivisionId" = vsp."ParentId" AND eh."IsHead" = true;

CREATE OR REPLACE VIEW "vStructDivisionUsers"
	AS
	select "Id", "Name", "ParentId", null as "Roles" from "StructDivision"
	union all
	select "dwSecurityUser"."Id", "dwSecurityUser"."Name", "dwSecurityUser"."StructDivisionId", string_agg("dwSecurityRole"."Name", ', ') as "Roles" from "dwSecurityUser"
	LEFT JOIN "dwV_Security_UserRole" on "dwV_Security_UserRole"."UserId" = "dwSecurityUser"."Id"
	LEFT JOIN "dwSecurityRole" on "dwSecurityRole"."Id" = "dwV_Security_UserRole"."RoleId"
	GROUP BY "dwSecurityUser"."Id", "dwSecurityUser"."Name", "dwSecurityUser"."StructDivisionId";

CREATE OR REPLACE VIEW "vUsers" AS
	 SELECT "dwSecurityUser"."Id",
	    "dwSecurityUser"."Name",
	    "dwSecurityUser"."StructDivisionId",
	    string_agg("dwSecurityRole"."Name"::text, ', '::text) AS "Roles",
	    concat("dwSecurityUser"."Name", ' (', string_agg("dwSecurityRole"."Name"::text, ', '::text), ')') as "Title"
	   FROM "dwSecurityUser"
	     LEFT JOIN "dwV_Security_UserRole" ON "dwV_Security_UserRole"."UserId" = "dwSecurityUser"."Id"
	     LEFT JOIN "dwSecurityRole" ON "dwSecurityRole"."Id" = "dwV_Security_UserRole"."RoleId"
	  GROUP BY "dwSecurityUser"."Id", "dwSecurityUser"."Name", "dwSecurityUser"."StructDivisionId";

COMMIT;
