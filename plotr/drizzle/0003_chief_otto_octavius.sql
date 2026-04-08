ALTER TABLE `room_analyses` ADD `renderUrl` text;--> statement-breakpoint
ALTER TABLE `room_analyses` ADD `renderStatus` enum('none','generating','completed','failed') DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE `room_analyses` ADD `renderPrompt` text;