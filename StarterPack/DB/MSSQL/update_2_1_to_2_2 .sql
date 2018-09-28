IF NOT EXISTS (SELECT 1 FROM [dwAppSettings] WHERE Name = N'IntegrationApiKey')
BEGIN
	INSERT INTO [dwAppSettings] ([Name],[GroupName],[ParamName],[Value],[Order],[EditorType],[IsHidden]) VALUES (N'IntegrationApiKey',N'Application settings',N'Api key','',2,0,0 )
	PRINT '[dwAppSettings] - Add param [IntegrationApiKey]'
END

