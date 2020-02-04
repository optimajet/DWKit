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

GO

CREATE PROCEDURE [dbo].[dwGet_Sequence]
	@Code NVARCHAR(256),
	@Value BIGINT OUTPUT
AS
BEGIN
	IF(NOT EXISTS(SELECT * FROM dwAppSettings WHERE [Name] = @Code))
	BEGIN
		INSERT dwAppSettings([Name], [Value], GroupName, ParamName) VALUES(@Code, 1, 'DataSequence', @Code)
	END

	SELECT @Value = CAST (Value as bigint)
	FROM dwAppSettings
	WHERE [Name] = @Code

	UPDATE dwAppSettings
		SET Value = CAST((@Value + 1) as varchar(1000))
	WHERE [Name] = @Code
END

