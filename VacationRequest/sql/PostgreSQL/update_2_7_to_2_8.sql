

alter table "dwSecurityUserToSecurityRole"
drop constraint "dwSecurityUserToSecurityRole_SecurityRoleId_fkey",
add constraint "dwSecurityUserToSecurityRole_SecurityRoleId_fkey"
   foreign key ("SecurityRoleId")
   references "dwSecurityRole"
   on delete cascade,
drop constraint "dwSecurityUserToSecurityRole_SecurityUserId_fkey",
add constraint "dwSecurityUserToSecurityRole_SecurityUserId_fkey"
   foreign key ("SecurityUserId")
   references "dwSecurityUser"
   on delete cascade;


alter table "dwSecurityGroupToSecurityRole"
drop constraint "dwSecurityGroupToSecurityRole_SecurityGroupId_fkey",
add constraint "dwSecurityGroupToSecurityRole_SecurityGroupId_fkey"
   foreign key ("SecurityGroupId")
   references "dwSecurityGroup"
   on delete cascade,
drop constraint "dwSecurityGroupToSecurityRole_SecurityRoleId_fkey",
add constraint "dwSecurityGroupToSecurityRole_SecurityRoleId_fkey"
   foreign key ("SecurityRoleId")
   references "dwSecurityRole"
   on delete cascade;


alter table "dwSecurityGroupToSecurityUser"
drop constraint "dwSecurityGroupToSecurityUser_SecurityGroupId_fkey",
add constraint "dwSecurityGroupToSecurityUser_SecurityGroupId_fkey"
   foreign key ("SecurityGroupId")
   references "dwSecurityGroup"
   on delete cascade,
drop constraint "dwSecurityGroupToSecurityUser_SecurityUserId_fkey",
add constraint "dwSecurityGroupToSecurityUser_SecurityUserId_fkey"
   foreign key ("SecurityUserId")
   references "dwSecurityUser"
   on delete cascade;
   
ALTER TABLE "dwSecurityUser" ADD COLUMN "Theme" varchar(256) NULL;

ALTER TABLE "dwSecurityCredential"
    ADD COLUMN "ExternalProviderName" character varying(128);
