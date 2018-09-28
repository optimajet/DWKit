/*
Company: OptimaJet
Project: DWKitSample DWKIT.COM
File: CreateObjects.sql
*/

CREATE TABLE StructDivision
(
  Id RAW(16) NOT NULL,
  Name NVARCHAR2(256) NOT NULL,
  ParentId RAW(16) NULL,
  CONSTRAINT PK_StructDivision PRIMARY KEY (ID) USING INDEX STORAGE ( INITIAL 64K NEXT 1M MAXEXTENTS UNLIMITED )
);

ALTER TABLE dwSecurityUser ADD StructDivisionId RAW(16) NULL;
ALTER TABLE dwSecurityUser ADD IsHead CHAR(1 BYTE) DEFAULT '0' NOT NULL;

CREATE TABLE Document
(
  Id RAW(16) NOT NULL,
  "Number" NUMBER GENERATED ALWAYS AS IDENTITY,
  Name VARCHAR2(256) NOT NULL,
  "Comment" VARCHAR2(1024) NULL,
  AuthorId RAW(16) NOT NULL REFERENCES dwSecurityUser,
  ManagerId RAW(16) REFERENCES dwSecurityUser,
  Amount NUMBER DEFAULT 0 NOT NULL,
  State VARCHAR2(256) DEFAULT 'Draft' NOT NULL,
  StateName VARCHAR2(256) ,
  CONSTRAINT PK_Document PRIMARY KEY (ID) USING INDEX STORAGE ( INITIAL 64K NEXT 1M MAXEXTENTS UNLIMITED )
);

CREATE TABLE DocumentTransitionHistory
(
  Id RAW(16) NOT NULL,
  DocumentId RAW(16) NOT NULL REFERENCES Document ON DELETE CASCADE,
  EmployeeId RAW(16) NULL REFERENCES dwSecurityUser,
  AllowedToEmployeeNames VARCHAR2(1024) NULL,
  TransitionTime date NULL,
  "Order" NUMBER GENERATED ALWAYS AS IDENTITY,
  InitialState VARCHAR2(256) NOT NULL,
  DestinationState VARCHAR2(256) NOT NULL,
  Command VARCHAR2(1024) NOT NULL,
  CONSTRAINT PK_DocumentTransitionHistory PRIMARY KEY (ID) USING INDEX STORAGE ( INITIAL 64K NEXT 1M MAXEXTENTS UNLIMITED )
);


CREATE OR REPLACE VIEW  vStructDivisionParents
	AS
WITH cteRecursive(FirstId, ParentId, Id) as (
 select sd.Id as FirstId, sd.ParentId as ParentId, sd.Id as Id
  from  StructDivision sd WHERE sd.ParentId IS NOT NULL
 union all 
 select r.FirstId as FirstId, sdr.ParentId as ParentId, sdr.Id as Id
 from StructDivision sdr
 inner join cteRecursive r ON r.ParentId = sdr.Id)

select DISTINCT FirstId as Id, ParentId as ParentId FROM cteRecursive;


CREATE OR REPLACE VIEW vStructDivisionParentsAndThis
	AS
	select  Id as Id, Id as ParentId FROM StructDivision
	UNION 
	select  Id as Id, ParentId as ParentId FROM vStructDivisionParents;
	
CREATE OR REPLACE VIEW vHeads
AS
	select  e.Id as Id, e.Name as Name, eh.Id as HeadId, eh.Name as HeadName FROM dwSecurityUser e 
	INNER JOIN vStructDivisionParentsAndThis vsp ON e.StructDivisionId = vsp.Id
	INNER JOIN dwSecurityUser eh ON eh.StructDivisionId = vsp.ParentId AND eh.IsHead = '1';

CREATE OR REPLACE VIEW vStructDivisionUsers
	AS
	select Id, Name, ParentId, null as Roles from StructDivision
	union all
	select  dwSecurityUser.Id, dwSecurityUser.Name, dwSecurityUser.StructDivisionId, 
            LISTAGG(dwSecurityRole.Name, ', ') WITHIN GROUP (ORDER BY dwSecurityRole.Name) as Roles from dwSecurityUser
	LEFT JOIN dwV_Security_UserRole on dwV_Security_UserRole.UserId = dwSecurityUser.Id
	LEFT JOIN dwSecurityRole on dwSecurityRole.Id = dwV_Security_UserRole.RoleId
	GROUP BY dwSecurityUser.Id, dwSecurityUser.Name, dwSecurityUser.StructDivisionId;

CREATE OR REPLACE VIEW vUsers AS
	 SELECT dwSecurityUser.Id,
	    dwSecurityUser.Name,
	    dwSecurityUser.StructDivisionId,
	    LISTAGG(dwSecurityRole.Name, ', ') WITHIN GROUP (ORDER BY dwSecurityRole.Name) AS Roles,
	    dwSecurityUser.Name || ' (' || LISTAGG(dwSecurityRole.Name, ', ') WITHIN GROUP (ORDER BY dwSecurityRole.Name) || ')' as Title
	   FROM dwSecurityUser
	     LEFT JOIN dwV_Security_UserRole ON dwV_Security_UserRole.UserId = dwSecurityUser.Id
	     LEFT JOIN dwSecurityRole ON dwSecurityRole.Id = dwV_Security_UserRole.RoleId
	  GROUP BY dwSecurityUser.Id, dwSecurityUser.Name, dwSecurityUser.StructDivisionId;
