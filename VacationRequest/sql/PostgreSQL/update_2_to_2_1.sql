DROP TABLE IF EXISTS "dwUploadedFiles";

CREATE TABLE IF NOT EXISTS "dwUploadedFiles"(
	"Id" uuid NOT NULL PRIMARY KEY,
	"Data" bytea NOT NULL,
	"AttachmentLength" bigint NOT null,
	"Used" boolean NOT NULL  DEFAULT 0::boolean,
	"Name" varchar(1000) NOT NULL,
	"ContentType" varchar(255) NOT NULL,
	"CreatedBy" varchar(1024) NULL,
	"CreatedDate" timestamp NULL,
	"UpdatedBy" varchar(1024) NULL,
	"UpdatedDate" timestamp NULL,
	"Properties" text NULL
);