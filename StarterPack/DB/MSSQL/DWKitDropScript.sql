/*
Company: OptimaJet
Project: DWKIT Provider for MSSQL
Version: 2.1
File: DWKitDropScript.sql
*/

BEGIN TRANSACTION

--Common tables---------------------------------------------------------------------
IF EXISTS (SELECT 1 FROM [INFORMATION_SCHEMA].[TABLES] WHERE [TABLE_NAME] = N'dwAppSettings')
BEGIN
	DROP TABLE [dwAppSettings]		
	PRINT '[dwAppSettings] - DROP table'
END

--UploadedFiles---------------------------------------------------------------

IF EXISTS (SELECT 1 FROM [INFORMATION_SCHEMA].[TABLES] WHERE [TABLE_NAME] = N'dwUploadedFiles')
BEGIN

	DROP TABLE [dwUploadedFiles]
	PRINT '[dwUploadedFiles] - DROP table'
END

--SecurityPermission---------------------------------------------------------------

IF EXISTS (SELECT 1 FROM [INFORMATION_SCHEMA].[TABLES] WHERE [TABLE_NAME] = N'dwSecurityCredential')
BEGIN
	DROP TABLE [dwSecurityCredential]
	PRINT '[dwSecurityCredential] - DROP table'
END

IF EXISTS (SELECT 1 FROM [INFORMATION_SCHEMA].[TABLES] WHERE [TABLE_NAME] = N'dwSecurityUserImpersonation')
BEGIN

	DROP TABLE [dwSecurityUserImpersonation]
	PRINT '[dwSecurityUserImpersonation] - DROP table'

END

IF EXISTS (SELECT 1 FROM [INFORMATION_SCHEMA].[TABLES] WHERE [TABLE_NAME] = N'dwSecurityUserToSecurityRole')
BEGIN

	DROP TABLE [dwSecurityUserToSecurityRole]
	PRINT '[dwSecurityUserToSecurityRole] - DROP table'

END

IF EXISTS (SELECT 1 FROM [INFORMATION_SCHEMA].[TABLES] WHERE [TABLE_NAME] = N'dwSecurityGroupToSecurityRole')
BEGIN

	DROP TABLE [dwSecurityGroupToSecurityRole]
	PRINT '[dwSecurityGroupToSecurityRole] - DROP table'

END

IF EXISTS (SELECT 1 FROM [INFORMATION_SCHEMA].[TABLES] WHERE [TABLE_NAME] = N'dwSecurityGroupToSecurityUser')
BEGIN

	DROP TABLE [dwSecurityGroupToSecurityUser]
	PRINT '[dwSecurityGroupToSecurityUser] - DROP table'

END

IF EXISTS (SELECT 1 FROM [INFORMATION_SCHEMA].[TABLES] WHERE [TABLE_NAME] = N'dwSecurityRoleToSecurityPermission')
BEGIN
	DROP TABLE [dwSecurityRoleToSecurityPermission]
	PRINT '[dwSecurityRoleToSecurityPermission] - DROP table'

END

IF EXISTS (SELECT 1 FROM [INFORMATION_SCHEMA].[TABLES] WHERE [TABLE_NAME] = N'dwSecurityPermission')
BEGIN

	DROP TABLE [dwSecurityPermission]
	PRINT '[dwSecurityPermission] - DROP table'
END

IF EXISTS (SELECT 1 FROM [INFORMATION_SCHEMA].[TABLES] WHERE [TABLE_NAME] = N'dwSecurityPermissionGroup')
BEGIN
	DROP TABLE [dwSecurityPermissionGroup]
	PRINT '[dwSecurityPermissionGroup] - DROP table'
END

IF EXISTS (SELECT 1 FROM [INFORMATION_SCHEMA].[TABLES] WHERE [TABLE_NAME] = N'dwSecurityRole')
BEGIN

	DROP TABLE [dwSecurityRole]
	PRINT '[dwSecurityRole] - DROP table'
END

IF EXISTS (SELECT 1 FROM [INFORMATION_SCHEMA].[TABLES] WHERE [TABLE_NAME] = N'dwSecurityGroup')
BEGIN

	DROP TABLE [dwSecurityGroup]
	PRINT '[dwSecurityGroup] - DROP table'
END

IF EXISTS (SELECT 1 FROM [INFORMATION_SCHEMA].[TABLES] WHERE [TABLE_NAME] = N'dwSecurityUserState')
BEGIN
	DROP TABLE [dwSecurityUserState]
	PRINT '[dwSecurityUserState] - DROP table'

END

IF EXISTS (SELECT 1 FROM [INFORMATION_SCHEMA].[TABLES] WHERE [TABLE_NAME] = N'dwSecurityUser')
BEGIN
	DROP TABLE [dwSecurityUser]
	PRINT '[dwSecurityUser] - DROP table'

END

IF EXISTS (SELECT 1 FROM [INFORMATION_SCHEMA].[TABLES] WHERE [TABLE_NAME] = N'dwV_Security_UserRole')
BEGIN
	DROP VIEW [dwV_Security_UserRole]
	PRINT '[dwV_Security_UserRole] - DROP view'
END

IF EXISTS (SELECT 1 FROM [INFORMATION_SCHEMA].[TABLES] WHERE [TABLE_NAME] = N'dwV_Security_CheckPermissionUser')
BEGIN
	DROP VIEW [dwV_Security_CheckPermissionUser]
	PRINT '[dwV_Security_CheckPermissionUser] - DROP view'
END

IF EXISTS (SELECT 1 FROM [INFORMATION_SCHEMA].[TABLES] WHERE [TABLE_NAME] = N'dwV_Security_CheckPermissionRole')
BEGIN

	DROP VIEW [dwV_Security_CheckPermissionRole]
	PRINT '[dwV_Security_CheckPermissionRole] - DROP view'
END

IF EXISTS (SELECT 1 FROM [INFORMATION_SCHEMA].[TABLES] WHERE [TABLE_NAME] = N'dwV_Security_CheckPermissionGroup')
BEGIN
	DROP VIEW [dbo].[dwV_Security_CheckPermissionGroup]
	PRINT '[dwV_Security_CheckPermissionGroup] - DROP view'
END

COMMIT TRANSACTION