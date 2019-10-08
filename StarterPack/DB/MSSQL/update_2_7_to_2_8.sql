ALTER TABLE [dbo].[dwSecurityUser] ADD [Theme] [nvarchar](256) NULL;
BEGIN TRANSACTION;
ALTER TABLE [dbo].[dwSecurityUser] ADD DEFAULT 0 FOR [IsRTL];
UPDATE [dbo].[dwSecurityUser] SET [IsRTL] = 0;
ALTER TABLE [dbo].[dwSecurityUser] ALTER COLUMN [IsRTL] bit NOT NULL;
COMMIT TRANSACTION;

ALTER TABLE [dbo].[dwSecurityCredential]
    ADD [ExternalProviderName] [nvarchar](128) NULL;
