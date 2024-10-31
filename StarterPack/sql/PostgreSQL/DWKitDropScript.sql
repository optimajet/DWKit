/*
Company: OptimaJet
Project: DWKIT Provider for PostgreSQL
Version: 4.0
File: DWKitDropScript.sql
*/

--Common tables---------------------------------------------------------------------
DROP TABLE IF EXISTS "dwAppSettings";
--UploadedFiles---------------------------------------------------------------
DROP TABLE IF EXISTS "dwUploadedFiles";
--SecurityPermission---------------------------------------------------------------
DROP VIEW IF EXISTS "dwV_Security_UserRole CASCADE";
DROP VIEW IF EXISTS "dwV_Security_CheckPermissionRole";
DROP VIEW IF EXISTS "dwV_Security_CheckPermissionGroup";
DROP VIEW IF EXISTS "dwV_Security_CheckPermissionUser";

DROP TABLE IF EXISTS "dwSecurityCredential";
DROP TABLE IF EXISTS "dwSecurityUserImpersonation";
DROP TABLE IF EXISTS "dwSecurityUserToSecurityRole" CASCADE;
DROP TABLE IF EXISTS "dwSecurityGroupToSecurityRole" CASCADE;
DROP TABLE IF EXISTS "dwSecurityGroupToSecurityUser";
DROP TABLE IF EXISTS "dwSecurityRoleToSecurityPermission";
DROP TABLE IF EXISTS "dwSecurityPermission";
DROP TABLE IF EXISTS "dwSecurityPermissionGroup";
DROP TABLE IF EXISTS "dwSecurityRole";
DROP TABLE IF EXISTS "dwSecurityGroup";
DROP TABLE IF EXISTS "dwSecurityUserState";
DROP TABLE IF EXISTS "dwSecurityUser";
DROP TABLE IF EXISTS "dwEntities";

DROP FUNCTION IF EXISTS "dwGet_Sequence"(IN Code VARCHAR(256),OUT Value BIGINT);


