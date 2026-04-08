CREATE TABLE `affiliate_clicks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`supplierId` int NOT NULL,
	`userId` int,
	`projectId` int,
	`clickedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `affiliate_clicks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `materials_lists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`roomAnalysisId` int,
	`userId` int NOT NULL,
	`title` varchar(255),
	`items` json NOT NULL,
	`totalTradePrice` float,
	`totalRetailPrice` float,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `materials_lists_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`status` enum('planning','in_progress','completed') NOT NULL DEFAULT 'planning',
	`propertyAddress` text,
	`totalEstimatedCost` float,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tradespersonId` int NOT NULL,
	`userId` int NOT NULL,
	`projectId` int,
	`rating` int NOT NULL,
	`comment` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `room_analyses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`userId` int NOT NULL,
	`roomName` varchar(255),
	`photoUrl` text NOT NULL,
	`photoKey` text NOT NULL,
	`status` enum('processing','completed','failed') NOT NULL DEFAULT 'processing',
	`dimensions` json,
	`renovationScope` json,
	`aiSummary` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `room_analyses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `suppliers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`category` enum('timber_merchants','builders_merchants','paint_decorating','roofing_insulation','flooring','kitchen_bathroom','electrical_plumbing','windows_doors','general') NOT NULL,
	`region` varchar(100),
	`isNational` boolean NOT NULL DEFAULT false,
	`websiteUrl` text,
	`affiliateUrl` text,
	`commissionRate` float DEFAULT 0.03,
	`logoUrl` text,
	`phone` varchar(30),
	`email` varchar(320),
	`address` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `suppliers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tradespeople` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`trade` enum('joiner_carpenter','plumber','electrician','plasterer','painter_decorator','roofer','tiler','builder_general','kitchen_fitter','bathroom_fitter','landscaper','other') NOT NULL,
	`bio` text,
	`region` varchar(100) NOT NULL,
	`phone` varchar(30),
	`email` varchar(320),
	`websiteUrl` text,
	`profilePhotoUrl` text,
	`isVerified` boolean NOT NULL DEFAULT false,
	`isActive` boolean NOT NULL DEFAULT true,
	`averageRating` float DEFAULT 0,
	`reviewCount` int DEFAULT 0,
	`yearsExperience` int,
	`qualifications` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tradespeople_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionTier` enum('free','pro','trade') DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionExpiresAt` timestamp;