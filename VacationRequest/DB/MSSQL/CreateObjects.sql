/*
Company: OptimaJet
Project: DWKitSample DWKIT.COM
File: CreateObjects.sql
*/


BEGIN TRANSACTION

IF NOT EXISTS (SELECT 1 FROM [INFORMATION_SCHEMA].[TABLES] WHERE [TABLE_NAME] = N'StructDivision')
BEGIN
	CREATE TABLE dbo.StructDivision (
	  Id uniqueidentifier NOT NULL,
	  Name nvarchar(256) NOT NULL,
	  ParentId uniqueidentifier NULL,
	  CONSTRAINT PK_StructDivision PRIMARY KEY (Id),
	  CONSTRAINT FK_StructDivision_StructDivision FOREIGN KEY (ParentId) REFERENCES dbo.StructDivision (Id)
	)
	PRINT 'StructDivision CREATE TABLE'
END

IF NOT EXISTS (SELECT 1 FROM [INFORMATION_SCHEMA].[VIEWS] WHERE [TABLE_NAME] = N'vStructDivisionParents')
BEGIN
	EXEC('CREATE VIEW dbo.vStructDivisionParents
	AS
	with cteRecursive as (
	 select sd.Id FirstId, sd.ParentId ParentId, sd.Id Id
	  from  [dbo].[StructDivision] sd WHERE sd.ParentId IS NOT NULL
	 union all 
	 select r.FirstId FirstId, sdr.ParentId ParentId, sdr.Id Id
	 from [dbo].[StructDivision] sdr
	 inner join cteRecursive r ON r.ParentId = sdr.Id)

	select DISTINCT FirstId Id, ParentId ParentId FROM cteRecursive ')

	PRINT 'vStructDivisionParents CREATE VIEW'
END

IF NOT EXISTS (SELECT 1 FROM [INFORMATION_SCHEMA].[VIEWS] WHERE [TABLE_NAME] = N'vStructDivisionParentsAndThis')
BEGIN
	EXEC('CREATE VIEW dbo.vStructDivisionParentsAndThis
	AS
	select  Id Id, Id ParentId FROM [dbo].[StructDivision]
	UNION 
	select  Id Id, ParentId ParentId FROM [dbo].[vStructDivisionParents]')

	PRINT 'vStructDivisionParentsAndThis CREATE VIEW'
END


ALTER TABLE dbo.dwSecurityUser ADD StructDivisionId uniqueidentifier NULL
ALTER TABLE dbo.dwSecurityUser ADD IsHead bit NOT NULL CONSTRAINT DF_dwSecurityUser_IsHead DEFAULT (0)

IF NOT EXISTS (SELECT 1 FROM [INFORMATION_SCHEMA].[VIEWS] WHERE [TABLE_NAME] = N'vHeads')
BEGIN
	EXEC('CREATE VIEW dbo.vHeads
	AS
	select  e.Id Id, e.Name Name, eh.Id HeadId, eh.Name HeadName FROM dwSecurityUser e
		INNER JOIN [vStructDivisionParentsAndThis] vsp ON e.StructDivisionId = vsp.Id
		INNER JOIN dwSecurityUser eh ON eh.StructDivisionId = vsp.ParentId AND eh.IsHead = 1')
	PRINT 'vHeads CREATE VIEW'
END

IF NOT EXISTS (SELECT 1 FROM [INFORMATION_SCHEMA].[TABLES] WHERE [TABLE_NAME] = N'Document')
BEGIN
	CREATE TABLE dbo.Document (
	  Id uniqueidentifier NOT NULL,
	  Number int IDENTITY,
	  Name nvarchar(256) NOT NULL,
	  Comment nvarchar(max) NULL,
	  AuthorId uniqueidentifier NOT NULL,
	  ManagerId uniqueidentifier NULL,
	  [Amount] money NOT NULL CONSTRAINT DF_Document_Amount DEFAULT (0),
	  [State] nvarchar(1024) NOT NULL DEFAULT ('Draft'),
	  StateName nvarchar(1024) ,
	  CONSTRAINT PK_Document PRIMARY KEY (Id),
	  CONSTRAINT FK_Document_dwSecurityUser FOREIGN KEY (ManagerId) REFERENCES dbo.dwSecurityUser (Id),
	  CONSTRAINT FK_Document_dwSecurityUser1 FOREIGN KEY (AuthorId) REFERENCES dbo.dwSecurityUser (Id) ON DELETE CASCADE ON UPDATE CASCADE
	)

	PRINT 'Document CREATE TABLE'
END

IF NOT EXISTS (SELECT 1 FROM [INFORMATION_SCHEMA].[TABLES] WHERE [TABLE_NAME] = N'DocumentTransitionHistory')
BEGIN
	CREATE TABLE dbo.DocumentTransitionHistory (
	  Id uniqueidentifier NOT NULL,
	  DocumentId uniqueidentifier NOT NULL,
	  EmployeeId uniqueidentifier NULL,
	  AllowedToEmployeeNames nvarchar(max) NOT NULL,
	  TransitionTime datetime NULL,
	  [Order] bigint IDENTITY,
	  InitialState nvarchar(1024) NOT NULL,
	  DestinationState nvarchar(1024) NOT NULL,
	  Command nvarchar(1024) NOT NULL,
	  CONSTRAINT PK_DocumentTransitionHistory PRIMARY KEY (Id),
	  CONSTRAINT FK_DocumentTransitionHistory_Document FOREIGN KEY (DocumentId) REFERENCES dbo.Document (Id) ON DELETE CASCADE ON UPDATE CASCADE,
	  CONSTRAINT FK_DocumentTransitionHistory_dwSecurityUser FOREIGN KEY (EmployeeId) REFERENCES dbo.dwSecurityUser (Id)
	)

	PRINT 'DocumentTransitionHistory CREATE TABLE'
END


IF NOT EXISTS (SELECT 1 FROM [INFORMATION_SCHEMA].[VIEWS] WHERE [TABLE_NAME] = N'vStructDivisionUsers')
BEGIN
	EXEC('CREATE VIEW [dbo].[vStructDivisionUsers]
AS
select Id, Name, ParentId, null as Roles from StructDivision
union all
select dwSecurityUser.Id, dwSecurityUser.Name, dwSecurityUser.StructDivisionId, 
stuff(
    (
    select cast('', '' as varchar(max)) + dwSecurityRole.Name
    from dwV_Security_UserRole
	LEFT JOIN dwSecurityRole on dwSecurityRole.Id = dwV_Security_UserRole.RoleId
	WHERE dwV_Security_UserRole.UserId = dwSecurityUser.Id
    order by dwSecurityRole.Name
    for xml path('''')
    ), 1, 1, '''') as Roles 
from dwSecurityUser')
	PRINT 'vStructDivisionUsers CREATE VIEW'
END

IF NOT EXISTS (SELECT 1 FROM [INFORMATION_SCHEMA].[VIEWS] WHERE [TABLE_NAME] = N'vUsers')
BEGIN
	EXEC('CREATE VIEW [dbo].[vUsers]
AS
select dwSecurityUser.Id, dwSecurityUser.Name, dwSecurityUser.StructDivisionId, 
stuff(
    (
    select cast('', '' as varchar(max)) + dwSecurityRole.Name
    from dwV_Security_UserRole
	LEFT JOIN dwSecurityRole on dwSecurityRole.Id = dwV_Security_UserRole.RoleId
	WHERE dwV_Security_UserRole.UserId = dwSecurityUser.Id
    order by dwSecurityRole.Name
    for xml path('''')
    ), 1, 2, '''') as Roles,
dwSecurityUser.Name + '' ('' + stuff(
    (
    select cast('', '' as varchar(max)) + dwSecurityRole.Name
    from dwV_Security_UserRole
	LEFT JOIN dwSecurityRole on dwSecurityRole.Id = dwV_Security_UserRole.RoleId
	WHERE dwV_Security_UserRole.UserId = dwSecurityUser.Id
    order by dwSecurityRole.Name
    for xml path('''')
    ), 1, 2, '''') + '')'' as Title 
from dwSecurityUser')
	PRINT 'vStructDivisionUsers CREATE VIEW'
END

COMMIT TRANSACTION