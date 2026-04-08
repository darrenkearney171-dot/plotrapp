CREATE TABLE `guest_leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`firstName` varchar(128),
	`userType` varchar(32) NOT NULL DEFAULT 'homeowner',
	`projectType` varchar(128),
	`photoUrl` text,
	`dimensions` json,
	`stylePrompt` text,
	`guidedAnswers` json,
	`analysisResult` json,
	`costRangeLow` int,
	`costRangeHigh` int,
	`convertedToUser` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `guest_leads_id` PRIMARY KEY(`id`)
);
