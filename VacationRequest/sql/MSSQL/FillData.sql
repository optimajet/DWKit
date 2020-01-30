/*
Company: OptimaJet
Project: DWKitSample DWKIT.COM
File: FillData.sql
*/

BEGIN TRANSACTION

INSERT dbo.dwSecurityRole(Id, Code, Name) VALUES ('8d378ebe-0666-46b3-b7ab-1a52480fd12a', N'BigBoss', N'BigBoss')
INSERT dbo.dwSecurityRole(Id, Code, Name) VALUES ('412174c2-0490-4101-a7b3-830de90bcaa0', N'Accountant', N'Accountant')
INSERT dbo.dwSecurityRole(Id, Code, Name) VALUES ('71fffb5b-b707-4b3c-951c-c37fdfcc8dfb', N'User', N'User')

INSERT dbo.dwSecurityUser(Id, Name, Email) VALUES ('81537e21-91c5-4811-a546-2dddff6bf409', N'Silviya', N'silviya@domain.com')
INSERT dbo.dwSecurityUser(Id, Name, Email) VALUES ('b0e6fd4c-2db9-4bb6-a62e-68b6b8999905', N'Margo', N'margo@domain.com')
INSERT dbo.dwSecurityUser(Id, Name, Email) VALUES ('deb579f9-991c-4db9-a17d-bb1eccf2842c', N'Max', N'max@domain.com')
INSERT dbo.dwSecurityUser(Id, Name, Email) VALUES ('91f2b471-4a96-4ab7-a41a-ea4293703d16', N'John', N'john@domain.com')
INSERT dbo.dwSecurityUser(Id, Name, Email) VALUES ('e41b48e3-c03d-484f-8764-1711248c4f8a', N'Maria', N'maria@domain.com')
INSERT dbo.dwSecurityUser(Id, Name, Email) VALUES ('bbe686f8-8736-48a7-a886-2da25567f978', N'Mark', N'mark@domain.com')

INSERT INTO [dbo].[dwSecurityCredential]
           ([Id],[PasswordHash],[PasswordSalt],[SecurityUserId],[Login],[AuthenticationType]) 
SELECT Id, 'VatmT7uZ8YiKAbBNrCcm2J7iW5Q=', '/9xAN64KIM7tQ4qdAIgAwA==', Id, LOWER(Name), 0 FROM dbo.dwSecurityUser
	WHERE Id in (
'81537e21-91c5-4811-a546-2dddff6bf409',
'b0e6fd4c-2db9-4bb6-a62e-68b6b8999905',
'deb579f9-991c-4db9-a17d-bb1eccf2842c',
'91f2b471-4a96-4ab7-a41a-ea4293703d16',
'e41b48e3-c03d-484f-8764-1711248c4f8a',
'bbe686f8-8736-48a7-a886-2da25567f978')

INSERT dbo.dwSecurityUserToSecurityRole(Id, SecurityUserId, SecurityRoleId) VALUES ('157B945E-CED5-44CE-8CF7-7999A15387B8', 'e41b48e3-c03d-484f-8764-1711248c4f8a', '412174c2-0490-4101-a7b3-830de90bcaa0')
INSERT dbo.dwSecurityUserToSecurityRole(Id, SecurityUserId, SecurityRoleId) VALUES ('257B945E-CED5-44CE-8CF7-7999A15387B8', 'e41b48e3-c03d-484f-8764-1711248c4f8a', '71fffb5b-b707-4b3c-951c-c37fdfcc8dfb')
INSERT dbo.dwSecurityUserToSecurityRole(Id, SecurityUserId, SecurityRoleId) VALUES ('357B945E-CED5-44CE-8CF7-7999A15387B8', 'bbe686f8-8736-48a7-a886-2da25567f978', '71fffb5b-b707-4b3c-951c-c37fdfcc8dfb')
INSERT dbo.dwSecurityUserToSecurityRole(Id, SecurityUserId, SecurityRoleId) VALUES ('457B945E-CED5-44CE-8CF7-7999A15387B8', '81537e21-91c5-4811-a546-2dddff6bf409', '8d378ebe-0666-46b3-b7ab-1a52480fd12a')
INSERT dbo.dwSecurityUserToSecurityRole(Id, SecurityUserId, SecurityRoleId) VALUES ('557B945E-CED5-44CE-8CF7-7999A15387B8', '81537e21-91c5-4811-a546-2dddff6bf409', '71fffb5b-b707-4b3c-951c-c37fdfcc8dfb')
INSERT dbo.dwSecurityUserToSecurityRole(Id, SecurityUserId, SecurityRoleId) VALUES ('657B945E-CED5-44CE-8CF7-7999A15387B8', 'b0e6fd4c-2db9-4bb6-a62e-68b6b8999905', '71fffb5b-b707-4b3c-951c-c37fdfcc8dfb')
INSERT dbo.dwSecurityUserToSecurityRole(Id, SecurityUserId, SecurityRoleId) VALUES ('757B945E-CED5-44CE-8CF7-7999A15387B8', 'deb579f9-991c-4db9-a17d-bb1eccf2842c', '71fffb5b-b707-4b3c-951c-c37fdfcc8dfb')
INSERT dbo.dwSecurityUserToSecurityRole(Id, SecurityUserId, SecurityRoleId) VALUES ('857B945E-CED5-44CE-8CF7-7999A15387B8', '91f2b471-4a96-4ab7-a41a-ea4293703d16', '71fffb5b-b707-4b3c-951c-c37fdfcc8dfb')

COMMIT TRANSACTION