-- public.picture definition

-- Drop table

-- DROP TABLE public.picture;

CREATE TABLE public.picture (
	id serial4 NOT NULL,
	"name" varchar NULL,
	createdby varchar NULL,
	filename varchar NULL,
	filesystem varchar NULL,
	CONSTRAINT picture_pk PRIMARY KEY (id)
);
