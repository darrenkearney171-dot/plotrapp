CREATE TABLE `project_templates` (
  `id` int AUTO_INCREMENT NOT NULL,
  `userId` int NOT NULL,
  `name` varchar(256) NOT NULL,
  `category` varchar(64) NOT NULL,
  `description` text,
  `templateData` text NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `project_templates_id` PRIMARY KEY(`id`)
);
