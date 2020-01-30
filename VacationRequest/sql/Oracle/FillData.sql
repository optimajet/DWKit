/*
Company: OptimaJet
Project: DWKitSample DWKIT.COM
File: FillData.sql
*/

INSERT INTO dwSecurityRole(Id, Code, Name) VALUES ('8d378ebe066646b3b7ab1a52480fd12a', 'BigBoss', 'BigBoss');
INSERT INTO dwSecurityRole(Id, Code, Name) VALUES ('412174c204904101a7b3830de90bcaa0', 'Accountant', 'Accountant');
INSERT INTO dwSecurityRole(Id, Code, Name) VALUES ('71fffb5bb7074b3c951cc37fdfcc8dfb', 'User', 'User');

INSERT INTO dwSecurityUser(Id, Name, Email) VALUES ('81537e2191c54811a5462dddff6bf409', 'Silviya', 'silvia@domain.com');
INSERT INTO dwSecurityUser(Id, Name, Email) VALUES ('b0e6fd4c2db94bb6a62e68b6b8999905', 'Margo', 'margo@domain.com');
INSERT INTO dwSecurityUser(Id, Name, Email) VALUES ('deb579f9991c4db9a17dbb1eccf2842c', 'Max', 'max@domain.com');
INSERT INTO dwSecurityUser(Id, Name, Email) VALUES ('91f2b4714a964ab7a41aea4293703d16', 'John', 'john@domain.com');
INSERT INTO dwSecurityUser(Id, Name, Email) VALUES ('e41b48e3c03d484f87641711248c4f8a', 'Maria', 'maria@domain.com');
INSERT INTO dwSecurityUser(Id, Name, Email) VALUES ('bbe686f8873648a7a8862da25567f978', 'Mark', 'mark@domain.com');

INSERT INTO dwSecurityCredential
           (Id,PasswordHash,PasswordSalt,SecurityUserId,Login,AuthenticationType) 
SELECT Id, 'VatmT7uZ8YiKAbBNrCcm2J7iW5Q=', '/9xAN64KIM7tQ4qdAIgAwA==', Id, lower(Name), 0 FROM dwSecurityUser
	WHERE Id in (
HEXTORAW('81537e2191c54811a5462dddff6bf409'),
HEXTORAW('b0e6fd4c2db94bb6a62e68b6b8999905'),
HEXTORAW('deb579f9991c4db9a17dbb1eccf2842c'),
HEXTORAW('91f2b4714a964ab7a41aea4293703d16'),
HEXTORAW('e41b48e3c03d484f87641711248c4f8a'),
HEXTORAW('bbe686f8873648a7a8862da25567f978'));

INSERT INTO dwSecurityUserToSecurityRole(Id, SecurityUserId, SecurityRoleId) VALUES ('157B945ECED544CE8CF77999A15387B8', 'e41b48e3c03d484f87641711248c4f8a', '412174c204904101a7b3830de90bcaa0');
INSERT INTO dwSecurityUserToSecurityRole(Id, SecurityUserId, SecurityRoleId) VALUES ('257B945ECED544CE8CF77999A15387B8', 'e41b48e3c03d484f87641711248c4f8a', '71fffb5bb7074b3c951cc37fdfcc8dfb');
INSERT INTO dwSecurityUserToSecurityRole(Id, SecurityUserId, SecurityRoleId) VALUES ('357B945ECED544CE8CF77999A15387B8', 'bbe686f8873648a7a8862da25567f978', '71fffb5bb7074b3c951cc37fdfcc8dfb');
INSERT INTO dwSecurityUserToSecurityRole(Id, SecurityUserId, SecurityRoleId) VALUES ('457B945ECED544CE8CF77999A15387B8', '81537e2191c54811a5462dddff6bf409', '8d378ebe066646b3b7ab1a52480fd12a');
INSERT INTO dwSecurityUserToSecurityRole(Id, SecurityUserId, SecurityRoleId) VALUES ('557B945ECED544CE8CF77999A15387B8', '81537e2191c54811a5462dddff6bf409', '71fffb5bb7074b3c951cc37fdfcc8dfb');
INSERT INTO dwSecurityUserToSecurityRole(Id, SecurityUserId, SecurityRoleId) VALUES ('657B945ECED544CE8CF77999A15387B8', 'b0e6fd4c2db94bb6a62e68b6b8999905', '71fffb5bb7074b3c951cc37fdfcc8dfb');
INSERT INTO dwSecurityUserToSecurityRole(Id, SecurityUserId, SecurityRoleId) VALUES ('757B945ECED544CE8CF77999A15387B8', 'deb579f9991c4db9a17dbb1eccf2842c', '71fffb5bb7074b3c951cc37fdfcc8dfb');
INSERT INTO dwSecurityUserToSecurityRole(Id, SecurityUserId, SecurityRoleId) VALUES ('857B945ECED544CE8CF77999A15387B8', '91f2b4714a964ab7a41aea4293703d16', '71fffb5bb7074b3c951cc37fdfcc8dfb');


COMMIT;