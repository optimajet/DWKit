DROP [dbo].[dwUploadedFiles]
GO
CREATE TABLE [dbo].[dwUploadedFiles](
	[Id] [uniqueidentifier] NOT NULL,
	[Data] [varbinary](max) NOT NULL,
	[AttachmentLength] [bigint] NOT NULL,
	[Used] [bit] NOT NULL  DEFAULT ((0)),
	[Name] [nvarchar](max) NOT NULL,
	[ContentType] [nvarchar](255) NULL,
	[CreatedBy] [nchar](1024) NULL,
	[CreatedDate] [datetime] NULL,
	[UpdatedBy] [nchar](1024) NULL,
	[UpdatedDate] [datetime] NULL,
	[Properties] [nvarchar](max) NULL,
	CONSTRAINT [PK_dwUploadedFiles] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

PRINT '[dwUploadedFiles] - Add table'
