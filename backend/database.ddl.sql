-- public.picture definition

-- Drop table

-- DROP TABLE public.picture;

CREATE TABLE public.picture (
	id serial4 NOT NULL,
	"name" varchar NULL,
	CONSTRAINT picture_pk PRIMARY KEY (id)
);
