CREATE TABLE `project_visualisations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`leadId` int,
	`imageUrl` text NOT NULL,
	`roomType` varchar(128),
	`promptUsed` text,
	`projectType` varchar(128),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `project_visualisations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `freeVisualisationsUsed` int DEFAULT 0 NOT NULL;