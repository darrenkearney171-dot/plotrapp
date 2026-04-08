ALTER TABLE `guest_leads` ADD `estimateType` varchar(32) DEFAULT 'renovation' NOT NULL;--> statement-breakpoint
ALTER TABLE `guest_leads` ADD `rooms` json;