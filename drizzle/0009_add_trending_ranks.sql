-- Migration: Add rank tracking to trending developer badges
-- Tracks current rank and best rank achieved
-- Date: 2025-10-01

ALTER TABLE "trending_developer_badges" 
ADD COLUMN "current_rank" integer,
ADD COLUMN "best_rank" integer;

