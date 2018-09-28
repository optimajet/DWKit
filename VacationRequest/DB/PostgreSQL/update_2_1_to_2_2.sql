DO $AppSettingsValues$
BEGIN
	IF NOT EXISTS(SELECT 1 FROM "dwAppSettings" WHERE "Name" = N'IntegrationApiKey') THEN
		INSERT INTO "dwAppSettings" ("Name","GroupName","ParamName","Value","Order","EditorType","IsHidden")VALUES (N'IntegrationApiKey',N'Application settings',N'Api key','',2,0,false );
	END IF;
END $AppSettingsValues$;