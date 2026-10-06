-- Migration: 20261006_drop_attendance.sql
-- Description: Drop any attendance-related tables, policies, functions and triggers if they ever existed.

DROP TABLE IF EXISTS public.attendance_records CASCADE;
DROP TABLE IF EXISTS public.attendance_targets CASCADE;
DROP TABLE IF EXISTS public.attendance_history CASCADE;
DROP TABLE IF EXISTS public.attendance CASCADE;

DROP FUNCTION IF EXISTS calculate_attendance_percentage(uuid) CASCADE;
DROP FUNCTION IF EXISTS get_attendance_summary(uuid, int) CASCADE;
