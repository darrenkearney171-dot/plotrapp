CREATE TABLE `introduction_requests` (
  `id` int AUTO_INCREMENT NOT NULL,
  `tradespersonId` int NOT NULL,
  `requesterName` varchar(256) NOT NULL,
  `requesterEmail` varchar(320) NOT NULL,
  `requesterPhone` varchar(64),
  `projectDescription` text,
  `status` varchar(32) NOT NULL DEFAULT 'new',
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `introduction_requests_id` PRIMARY KEY(`id`)
);
