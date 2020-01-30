/*
Company: OptimaJet
Project: DWKIT Provider for MSSQL
Version: 2.9
File: DWKitScript.sql
*/

BEGIN TRANSACTION

--Common tables---------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM [INFORMATION_SCHEMA].[TABLES] WHERE [TABLE_NAME] = N'dwAppSettings')
BEGIN
	CREATE TABLE [dwAppSettings](
		[Name] [nvarchar](50) NOT NULL,
		[Value] [nvarchar](1000) NOT NULL,
		[GroupName] [nvarchar](50) NULL,
		[ParamName] [nvarchar](1024) NOT NULL,
		[Order] [int] NULL,
		[EditorType] [nvarchar](50) NULL,
		[IsHidden] [bit] NOT NULL DEFAULT (0),
	 CONSTRAINT [PK_dwAppSettings] PRIMARY KEY CLUSTERED
	(
		[Name] ASC
	)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
	) ON [PRIMARY]

	PRINT '[dwAppSettings] - Add table'
END

IF NOT EXISTS (SELECT 1 FROM [dwAppSettings] WHERE Name = N'ApplicationDesc')
BEGIN
	INSERT dbo.dwAppSettings(Name, Value, GroupName, ParamName, [Order], EditorType, IsHidden) VALUES (N'ApplicationDesc', N'', N'Application settings', N'Description', 1, 0, 0)
	PRINT '[dwAppSettings] - Add param [ApplicationDesc]'
END

IF NOT EXISTS (SELECT 1 FROM [dwAppSettings] WHERE Name = N'ApplicationName')
BEGIN
	INSERT dbo.dwAppSettings(Name, Value, GroupName, ParamName, [Order], EditorType, IsHidden) VALUES (N'ApplicationName', N'DWKit', N'Application settings', N'Name', 0, 0, 0)
	PRINT '[dwAppSettings] - Add param [ApplicationName]'
END

IF NOT EXISTS (SELECT 1 FROM [dwAppSettings] WHERE Name = N'IntegrationApiKey')
BEGIN
	INSERT INTO [dwAppSettings] ([Name],[GroupName],[ParamName],[Value],[Order],[EditorType],[IsHidden]) VALUES (N'IntegrationApiKey',N'Application settings',N'Api key','',2,0,0 )
	PRINT '[dwAppSettings] - Add param [IntegrationApiKey]'
END

--UploadedFiles---------------------------------------------------------------

IF NOT EXISTS (SELECT 1 FROM [INFORMATION_SCHEMA].[TABLES] WHERE [TABLE_NAME] = N'dwUploadedFiles')
BEGIN

	CREATE TABLE [dbo].[dwUploadedFiles](
		[Id] [uniqueidentifier] NOT NULL,
		[Data] [varbinary](max) NOT NULL,
		[AttachmentLength] [bigint] NOT NULL,
		[Used] [bit] NOT NULL  DEFAULT ((0)),
		[Name] [nvarchar](max) NOT NULL,
		[ContentType] [nvarchar](255) NULL,
		[CreatedBy] [nvarchar](1024) NULL,
		[CreatedDate] [datetime] NULL,
		[UpdatedBy] [nvarchar](1024) NULL,
		[UpdatedDate] [datetime] NULL,
		[Properties] [nvarchar](max) NULL,
		CONSTRAINT [PK_dwUploadedFiles] PRIMARY KEY CLUSTERED
	(
		[Id] ASC
	)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
	) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

	PRINT '[dwUploadedFiles] - Add table'

END


--SecurityPermission

IF NOT EXISTS (SELECT 1 FROM [INFORMATION_SCHEMA].[TABLES] WHERE [TABLE_NAME] = N'dwSecurityGroup')
BEGIN

	CREATE TABLE [dwSecurityGroup](
		[Id] [uniqueidentifier] NOT NULL,
		[Name] [nvarchar](128) NOT NULL,
		[Comment] [nvarchar](max) NULL,
		[IsSyncWithDomainGroup] [bit] NOT NULL DEFAULT (0),
	 CONSTRAINT [PK_dwSecurityGroup] PRIMARY KEY CLUSTERED
	(
		[Id] ASC
	)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
	) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]


	PRINT '[dwSecurityGroup] - Add table'
END

IF NOT EXISTS (SELECT 1 FROM [INFORMATION_SCHEMA].[TABLES] WHERE [TABLE_NAME] = N'dwSecurityPermissionGroup')
BEGIN
	CREATE TABLE [dwSecurityPermissionGroup](
		[Id] [uniqueidentifier] NOT NULL,
		[Name] [nvarchar](128) NOT NULL,
		[Code] [nvarchar](128) NOT NULL,
	 CONSTRAINT [PK_dwSecurityPermissionGroup] PRIMARY KEY CLUSTERED
	(
		[Id] ASC
	)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
	) ON [PRIMARY]

	PRINT '[dwSecurityPermissionGroup] - Add table'
END

IF NOT EXISTS (SELECT 1 FROM [INFORMATION_SCHEMA].[TABLES] WHERE [TABLE_NAME] = N'dwSecurityPermission')
BEGIN

	CREATE TABLE [dwSecurityPermission](
		[Id] [uniqueidentifier] NOT NULL,
		[Code] [nvarchar](128) NOT NULL,
		[Name] [nvarchar](max) NULL,
		[GroupId] [uniqueidentifier] NOT NULL,
	 CONSTRAINT [PK_dwSecurityPermission_1] PRIMARY KEY CLUSTERED
	(
		[Id] ASC
	)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
	) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

	ALTER TABLE [dwSecurityPermission]  WITH NOCHECK ADD  CONSTRAINT [FK_dwSecurityPermission_dwSecurityPermissionGroup] FOREIGN KEY([GroupId])
	REFERENCES [dwSecurityPermissionGroup] ([Id])
	ON UPDATE CASCADE
	ON DELETE CASCADE

	ALTER TABLE [dwSecurityPermission] CHECK CONSTRAINT [FK_dwSecurityPermission_dwSecurityPermissionGroup]

	PRINT '[dwSecurityPermission] - Add table'
END

IF NOT EXISTS (SELECT 1 FROM [INFORMATION_SCHEMA].[TABLES] WHERE [TABLE_NAME] = N'dwSecurityRole')
BEGIN

	CREATE TABLE [dwSecurityRole](
		[Code] [nvarchar](128) NOT NULL,
		[Name] [nvarchar](128) NOT NULL,
		[Comment] [nvarchar](max) NULL,
		[Id] [uniqueidentifier] NOT NULL,
		[DomainGroup] [nvarchar](512) NULL,
	 CONSTRAINT [PK_dwSecurityRole] PRIMARY KEY CLUSTERED
	(
		[Id] ASC
	)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
	) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

	PRINT '[dwSecurityRole] - Add table'
END


IF NOT EXISTS (SELECT 1 FROM [INFORMATION_SCHEMA].[TABLES] WHERE [TABLE_NAME] = N'dwSecurityRoleToSecurityPermission')
BEGIN
	CREATE TABLE [dwSecurityRoleToSecurityPermission](
		[Id] [uniqueidentifier] NOT NULL,
		[SecurityRoleId] [uniqueidentifier] NOT NULL,
		[SecurityPermissionId] [uniqueidentifier] NOT NULL,
		[AccessType] [tinyint] NOT NULL DEFAULT (0),
	 CONSTRAINT [PK_SecurityRoleToSecurityPermission] PRIMARY KEY CLUSTERED
	(
		[Id] ASC
	)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
	) ON [PRIMARY]

	ALTER TABLE [dwSecurityRoleToSecurityPermission]  WITH NOCHECK ADD  CONSTRAINT [FK_dwSecurityRoleToSecurityPermission_dwSecurityPermission] FOREIGN KEY([SecurityPermissionId])
	REFERENCES [dwSecurityPermission] ([Id])
	ON UPDATE CASCADE
	ON DELETE CASCADE

	ALTER TABLE [dwSecurityRoleToSecurityPermission] CHECK CONSTRAINT [FK_dwSecurityRoleToSecurityPermission_dwSecurityPermission]

	ALTER TABLE [dwSecurityRoleToSecurityPermission]  WITH NOCHECK ADD  CONSTRAINT [FK_dwSecurityRoleToSecurityPermission_dwSecurityRole] FOREIGN KEY([SecurityRoleId])
	REFERENCES [dwSecurityRole] ([Id])
	ON UPDATE CASCADE
	ON DELETE CASCADE

	ALTER TABLE [dwSecurityRoleToSecurityPermission] CHECK CONSTRAINT [FK_dwSecurityRoleToSecurityPermission_dwSecurityRole]

	PRINT '[dwSecurityRoleToSecurityPermission] - Add table'

END


IF NOT EXISTS (SELECT 1 FROM [INFORMATION_SCHEMA].[TABLES] WHERE [TABLE_NAME] = N'dwSecurityUser')
BEGIN
	CREATE TABLE [dwSecurityUser](
		[Id] [uniqueidentifier] NOT NULL,
		[Name] [nvarchar](256) NOT NULL,
		[Email] [nvarchar](256) NULL,
		[IsLocked] [bit] NOT NULL DEFAULT ((0)),
		[ExternalId] [nvarchar](1024) NULL,
		[Timezone] [nvarchar](256) NULL,
		[Localization] [nvarchar](256) NULL,
		[DecimalSeparator] [nchar](1) NULL,
		[PageSize] [int] NULL,
		[StartPage] [nvarchar](256) NULL,
		[IsRTL] [bit] NOT NULL DEFAULT(0),
		[Theme] [nvarchar](256) NULL,
	 CONSTRAINT [PK_dwSecurityUser] PRIMARY KEY CLUSTERED
	(
		[Id] ASC
	)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
	) ON [PRIMARY]

	PRINT '[dwSecurityUser] - Add table'

END

IF NOT EXISTS (SELECT 1 FROM [INFORMATION_SCHEMA].[TABLES] WHERE [TABLE_NAME] = N'dwSecurityUserState')
BEGIN
	CREATE TABLE [dbo].[dwSecurityUserState](
		[Id] [uniqueidentifier] NOT NULL,
		[SecurityUserId] [uniqueidentifier] NOT NULL,
		[Key] [nvarchar](max) NOT NULL,
		[Value] [nvarchar](max) NOT NULL,
	 CONSTRAINT [PK_SecurityUserState] PRIMARY KEY CLUSTERED
	(
		[Id] ASC
	)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
	) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

	ALTER TABLE [dbo].[dwSecurityUserState]  WITH CHECK ADD  CONSTRAINT [FK_dwSecurityUserState_dwSecurityUser] FOREIGN KEY([SecurityUserId])
	REFERENCES [dbo].[dwSecurityUser] ([Id])
	ON DELETE CASCADE

	ALTER TABLE [dbo].[dwSecurityUserState] CHECK CONSTRAINT [FK_dwSecurityUserState_dwSecurityUser]

	PRINT '[dwSecurityUserState] - Add table'

END



IF NOT EXISTS (SELECT 1 FROM [INFORMATION_SCHEMA].[TABLES] WHERE [TABLE_NAME] = N'dwSecurityCredential')
BEGIN
	CREATE TABLE [dwSecurityCredential](
		[Id] [uniqueidentifier] NOT NULL,
		[PasswordHash] [nvarchar](128) NULL,
		[PasswordSalt] [nvarchar](128) NULL,
		[SecurityUserId] [uniqueidentifier] NOT NULL,
		[Login] [nvarchar](256) NOT NULL,
		[AuthenticationType] [tinyint] NOT NULL,
        [ExternalProviderName] [nvarchar](128) NULL,
	 CONSTRAINT [PK_dwSecurityCredential] PRIMARY KEY CLUSTERED
	(
		[Id] ASC
	)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
	) ON [PRIMARY]

	ALTER TABLE [dwSecurityCredential] ADD  CONSTRAINT [DF_dwSecurityCredential_dwAuthenticationType]  DEFAULT ((0)) FOR [AuthenticationType]

	ALTER TABLE [dwSecurityCredential]  WITH NOCHECK ADD  CONSTRAINT [FK_dwSecurityCredential_dwSecurityUser] FOREIGN KEY([SecurityUserId])
	REFERENCES [dwSecurityUser] ([Id])
	ON UPDATE CASCADE
	ON DELETE CASCADE

	ALTER TABLE [dwSecurityCredential] CHECK CONSTRAINT [FK_dwSecurityCredential_dwSecurityUser]
	PRINT '[dwSecurityCredential] - Add table'

	--Create User-----------------------------------------------------------------------------
	INSERT INTO [dwSecurityUser]([Id],[Name],[Email],[IsLocked]) VALUES ('540E514C-911F-4A03-AC90-C450C28838C5','admin', '', 0)
	INSERT INTO [dbo].[dwSecurityCredential]([Id],[PasswordHash],[PasswordSalt],[SecurityUserId],[Login],[AuthenticationType])
	VALUES('C0819C1D-C3BA-4EA7-ADA1-DF2D3D24C62F','VatmT7uZ8YiKAbBNrCcm2J7iW5Q=','/9xAN64KIM7tQ4qdAIgAwA==',	'540E514C-911F-4A03-AC90-C450C28838C5',	'admin',	0)

	PRINT 'Added user: Login:admin Pass:1'
END

IF NOT EXISTS (SELECT 1 FROM [INFORMATION_SCHEMA].[TABLES] WHERE [TABLE_NAME] = N'dwSecurityUserImpersonation')
BEGIN

	CREATE TABLE [dwSecurityUserImpersonation](
		[Id] [uniqueidentifier] NOT NULL,
		[SecurityUserId] [uniqueidentifier] NOT NULL,
		[ImpSecurityUserId] [uniqueidentifier] NOT NULL,
		[DateFrom] [datetime] NOT NULL,
		[DateTo] [datetime] NOT NULL,
	 CONSTRAINT [PK_dwSecurityUserImpersonation] PRIMARY KEY CLUSTERED
	(
		[Id] ASC
	)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
	) ON [PRIMARY]

	ALTER TABLE [dwSecurityUserImpersonation]  WITH NOCHECK ADD  CONSTRAINT [FK_dwSecurityUserImpersonation_dwSecurityUser] FOREIGN KEY([SecurityUserId])
	REFERENCES [dwSecurityUser] ([Id])
	ON UPDATE CASCADE
	ON DELETE CASCADE

	ALTER TABLE [dwSecurityUserImpersonation] CHECK CONSTRAINT [FK_dwSecurityUserImpersonation_dwSecurityUser]

	ALTER TABLE [dwSecurityUserImpersonation]  WITH CHECK ADD  CONSTRAINT [FK_dwSecurityUserImpersonation_dwSecurityUser1] FOREIGN KEY([ImpSecurityUserId])
	REFERENCES [dwSecurityUser] ([Id])

	ALTER TABLE [dwSecurityUserImpersonation] CHECK CONSTRAINT [FK_dwSecurityUserImpersonation_dwSecurityUser1]

	PRINT '[dwSecurityUserImpersonation] - Add table'

END

IF NOT EXISTS (SELECT 1 FROM [INFORMATION_SCHEMA].[TABLES] WHERE [TABLE_NAME] = N'dwSecurityUserToSecurityRole')
BEGIN

	CREATE TABLE [dwSecurityUserToSecurityRole](
		[Id] [uniqueidentifier] NOT NULL,
		[SecurityRoleId] [uniqueidentifier] NOT NULL,
		[SecurityUserId] [uniqueidentifier] NOT NULL,
	 CONSTRAINT [PK_SecurityUserToSecurityRole] PRIMARY KEY CLUSTERED
	(
		[Id] ASC
	)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
	) ON [PRIMARY]

	ALTER TABLE [dwSecurityUserToSecurityRole]  WITH NOCHECK ADD  CONSTRAINT [FK_dwSecurityUserToSecurityRole_dwSecurityRole] FOREIGN KEY([SecurityRoleId])
	REFERENCES [dwSecurityRole] ([Id])
	ON UPDATE CASCADE
	ON DELETE CASCADE

	ALTER TABLE [dwSecurityUserToSecurityRole] CHECK CONSTRAINT [FK_dwSecurityUserToSecurityRole_dwSecurityRole]

	ALTER TABLE [dwSecurityUserToSecurityRole]  WITH NOCHECK ADD  CONSTRAINT [FK_dwSecurityUserToSecurityRole_dwSecurityUser] FOREIGN KEY([SecurityUserId])
	REFERENCES [dwSecurityUser] ([Id])
	ON UPDATE CASCADE
	ON DELETE CASCADE

	ALTER TABLE [dwSecurityUserToSecurityRole] CHECK CONSTRAINT [FK_dwSecurityUserToSecurityRole_dwSecurityUser]

	PRINT '[dwSecurityUserToSecurityRole] - Add table'

END

IF NOT EXISTS (SELECT 1 FROM [INFORMATION_SCHEMA].[TABLES] WHERE [TABLE_NAME] = N'dwSecurityGroupToSecurityRole')
BEGIN

	CREATE TABLE [dwSecurityGroupToSecurityRole](
		[Id] [uniqueidentifier] NOT NULL,
		[SecurityGroupId] [uniqueidentifier] NOT NULL,
		[SecurityRoleId] [uniqueidentifier] NOT NULL,
	 CONSTRAINT [PK_dwSecurityGroupToSecurityRole] PRIMARY KEY CLUSTERED
	(
		[Id] ASC
	)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
	) ON [PRIMARY]

	ALTER TABLE [dwSecurityGroupToSecurityRole]  WITH NOCHECK ADD  CONSTRAINT [FK_dwSecurityGroupToSecurityRole_dwSecurityGroup] FOREIGN KEY([SecurityGroupId])
	REFERENCES [dwSecurityGroup] ([Id])
	ON UPDATE CASCADE
	ON DELETE CASCADE

	ALTER TABLE [dwSecurityGroupToSecurityRole] CHECK CONSTRAINT [FK_dwSecurityGroupToSecurityRole_dwSecurityGroup]

	ALTER TABLE [dwSecurityGroupToSecurityRole]  WITH CHECK ADD  CONSTRAINT [FK_dwSecurityGroupToSecurityRole_dwSecurityRole] FOREIGN KEY([SecurityRoleId])
	REFERENCES [dwSecurityRole] ([Id])
	ON UPDATE CASCADE
	ON DELETE CASCADE

	ALTER TABLE [dwSecurityGroupToSecurityRole] CHECK CONSTRAINT [FK_dwSecurityGroupToSecurityRole_dwSecurityRole]

	PRINT '[dwSecurityGroupToSecurityRole] - Add table'

END

IF NOT EXISTS (SELECT 1 FROM [INFORMATION_SCHEMA].[TABLES] WHERE [TABLE_NAME] = N'dwSecurityGroupToSecurityUser')
BEGIN

	CREATE TABLE [dwSecurityGroupToSecurityUser](
		[Id] [uniqueidentifier] NOT NULL,
		[SecurityGroupId] [uniqueidentifier] NOT NULL,
		[SecurityUserId] [uniqueidentifier] NOT NULL,
	 CONSTRAINT [PK_dwSecurityGroupToSecurityUser] PRIMARY KEY CLUSTERED
	(
		[Id] ASC
	)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
	) ON [PRIMARY]

	ALTER TABLE [dwSecurityGroupToSecurityUser]  WITH NOCHECK ADD  CONSTRAINT [FK_dwSecurityGroupToSecurityUser_dwSecurityGroup] FOREIGN KEY([SecurityGroupId])
	REFERENCES [dwSecurityGroup] ([Id])
	ON UPDATE CASCADE
	ON DELETE CASCADE

	ALTER TABLE [dwSecurityGroupToSecurityUser] CHECK CONSTRAINT [FK_dwSecurityGroupToSecurityUser_dwSecurityGroup]

	ALTER TABLE [dwSecurityGroupToSecurityUser]  WITH CHECK ADD  CONSTRAINT [FK_dwSecurityGroupToSecurityUser_dwSecurityUser] FOREIGN KEY([SecurityUserId])
	REFERENCES [dwSecurityUser] ([Id])
	ON UPDATE CASCADE
	ON DELETE CASCADE

	ALTER TABLE [dwSecurityGroupToSecurityUser] CHECK CONSTRAINT [FK_dwSecurityGroupToSecurityUser_dwSecurityUser]

	PRINT '[dwSecurityGroupToSecurityUser] - Add table'

	INSERT INTO [dbo].[dwSecurityRole] ([Id], [Code],[Name],[Comment],[DomainGroup]) VALUES( '1B7F60C8-D860-4510-8E71-5469FC1814D3', 'Admins', 'Admins', '', '')
	INSERT INTO [dbo].[dwSecurityUserToSecurityRole]([Id], [SecurityRoleId],[SecurityUserId]) VALUES ('88B616A1-62B5-41AB-AA10-58851158C4DD','1B7F60C8-D860-4510-8E71-5469FC1814D3', '540E514C-911F-4A03-AC90-C450C28838C5')
	PRINT 'Access to admin panel for user admin has been done'
END

IF NOT EXISTS (SELECT 1 FROM [INFORMATION_SCHEMA].[TABLES] WHERE [TABLE_NAME] = N'dwV_Security_UserRole')
BEGIN
	EXEC ('CREATE VIEW [dwV_Security_UserRole]
	AS
	SELECT
		dwSecurityUserToSecurityRole.SecurityUserId as UserId,
		dwSecurityUserToSecurityRole.SecurityRoleId as RoleId
	FROM dwSecurityUserToSecurityRole WITH(NOLOCK)

	UNION

	SELECT DISTINCT
		dwSecurityGroupToSecurityUser.SecurityUserId as UserId,
		dwSecurityGroupToSecurityRole.SecurityRoleId as RoleId
	FROM dwSecurityGroupToSecurityRole WITH(NOLOCK)
	INNER JOIN dwSecurityGroupToSecurityUser WITH(NOLOCK) ON dwSecurityGroupToSecurityUser.SecurityGroupId = dwSecurityGroupToSecurityRole.SecurityGroupId')
	PRINT '[dwV_Security_UserRole] - Add view'

END

IF NOT EXISTS (SELECT 1 FROM [INFORMATION_SCHEMA].[TABLES] WHERE [TABLE_NAME] = N'dwV_Security_CheckPermissionUser')
BEGIN
	EXEC ('CREATE VIEW [dwV_Security_CheckPermissionUser]
	AS
	SELECT
	dwV_Security_UserRole.UserId,
	sp.Id as "PermissionId",
	spg.Code as PermissionGroupCode,
	spg.Name as PermissionGroupName,
	sp.Code as PermissionCode,
	sp.Name as PermissionName,
	MAX(srtosp.[AccessType]) as AccessType
	FROM dbo.dwSecurityPermission sp WITH(NOLOCK)
	INNER JOIN dbo.dwSecurityPermissionGroup spg WITH(NOLOCK) on sp.GroupId = spg.Id
	INNER JOIN dbo.dwSecurityRoleToSecurityPermission srtosp WITH(NOLOCK) on srtosp.SecurityPermissionId = sp.Id
	INNER JOIN dwV_Security_UserRole on dwV_Security_UserRole.RoleId = srtosp.SecurityRoleId
	WHERE srtosp.[AccessType] <> 0
	GROUP BY dwV_Security_UserRole.UserId, sp.Id, spg.Code, spg.Name, sp.Code, sp.Name')

	PRINT '[dwV_Security_CheckPermissionUser] - Add view'
END


IF NOT EXISTS (SELECT 1 FROM [INFORMATION_SCHEMA].[TABLES] WHERE [TABLE_NAME] = N'dwV_Security_CheckPermissionGroup')
BEGIN
	EXEC ('CREATE VIEW [dbo].[dwV_Security_CheckPermissionGroup]
	AS
	SELECT
	sgtosr.SecurityGroupId as SecurityGroupId,
	sp.Id as PermissionId,
	spg.Code as PermissionGroupCode,
	spg.Name as PermissionGroupName,
	sp.Code as PermissionCode,
	sp.Name as PermissionName,
	MAX(srtosp.[AccessType]) as AccessType
	FROM dbo.dwSecurityPermission sp WITH(NOLOCK)
	INNER JOIN dbo.dwSecurityPermissionGroup spg WITH(NOLOCK) on sp.GroupId = spg.Id
	INNER JOIN dbo.dwSecurityRoleToSecurityPermission srtosp WITH(NOLOCK) on srtosp.SecurityPermissionId = sp.Id
	INNER JOIN dbo.dwSecurityGroupToSecurityRole sgtosr WITH(NOLOCK) on sgtosr.SecurityRoleId = srtosp.SecurityRoleId
	WHERE srtosp.[AccessType] <> 0
	GROUP BY sgtosr.SecurityGroupId, sp.Id, spg.Code, spg.Name, sp.Code, sp.Name')

	PRINT '[dwV_Security_CheckPermissionGroup] - Add view'
END

IF NOT EXISTS (SELECT 1 FROM [INFORMATION_SCHEMA].[TABLES] WHERE [TABLE_NAME] = N'dwEntities')
BEGIN
    CREATE TABLE [dbo].[dwEntities](
        [Id] [uniqueidentifier] NOT NULL,
        [ParentId] [uniqueidentifier] NULL,
        [ReferenceId] [uniqueidentifier] NULL,
        [CreatedBy] [uniqueidentifier] NULL,
        [ChangedBy] [uniqueidentifier] NULL,
        [Created] [datetime] NULL,
        [Changed] [datetime] NULL,
        [Name] [nvarchar](2048) NULL,
        [DataModelName] [nvarchar](256) NOT NULL,
        [SchemeName] [nvarchar](256) NULL,
        [State] [nvarchar](max) NULL,
        [StateName] [nvarchar](max) NULL,
        [Extensions] [nvarchar](max) NULL,
    CONSTRAINT [PK_dwEntities] PRIMARY KEY CLUSTERED
    (
        [Id] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
    ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

    CREATE NONCLUSTERED INDEX [IX_DataModelName] ON [dbo].[dwEntities]
    (
        [DataModelName] ASC
    )
    INCLUDE ( 	[Id],
        [ParentId],
        [ReferenceId],
        [CreatedBy],
        [ChangedBy],
        [Created],
        [Changed],
        [Name],
        [SchemeName],
        [State],
        [StateName],
        [Extensions]) WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]


    CREATE NONCLUSTERED INDEX [IX_ReferenceId] ON [dbo].[dwEntities]
    (
        [ReferenceId] ASC
    ) ON [PRIMARY]

	CREATE NONCLUSTERED INDEX [IX_ParentId] ON [dbo].[dwEntities]
    (
        [ParentId] ASC
    ) ON [PRIMARY]

END

IF NOT EXISTS (
		SELECT 1
		FROM sys.procedures
		WHERE name = N'dwGet_Sequence'
		)
BEGIN
	EXECUTE (
			'CREATE PROCEDURE [dbo].[dwGet_Sequence]
	@Code NVARCHAR(256),
	@Value BIGINT OUTPUT
AS
BEGIN
	IF(NOT EXISTS(SELECT * FROM dwAppSettings WHERE [Name] = @Code))
	BEGIN
		INSERT dwAppSettings([Name], [Value], GroupName, ParamName) VALUES(@Code, 1, ''DataSequence'', @Code)
	END

	SELECT @Value = CAST (Value as bigint)
	FROM dwAppSettings
	WHERE [Name] = @Code

	UPDATE dwAppSettings
		SET Value = CAST((@Value + 1) as varchar(1000))
	WHERE [Name] = @Code
END'
			)

	PRINT 'dwGet_Sequence CREATE PROCEDURE'
END

COMMIT TRANSACTION
