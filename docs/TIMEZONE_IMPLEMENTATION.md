# Timezone Implementation Guide

## Overview

This document describes the comprehensive timezone implementation for the DevQuest application. The system ensures that all data is stored in UTC while displaying dates in the user's local timezone.

## Key Principles

1. **UTC Storage**: All timestamps in the database are stored in UTC
2. **UTC API Responses**: All API responses include UTC timestamps with timezone metadata
3. **Local Display**: UI components display dates in the user's local timezone
4. **Consistent Formatting**: Centralized date formatting utilities ensure consistency

## Architecture

### 1. TimezoneService (`src/lib/timezone.ts`)

The core timezone utility service that handles:
- UTC date calculations for leaderboards and sessions
- Client-side timezone detection
- Date formatting utilities for display
- Timezone conversion functions

**Key Methods:**
- `getUserTimezone()`: Detects user's browser timezone
- `formatForDisplay()`: Formats UTC timestamps for local display
- `formatRelativeTime()`: Shows relative time (e.g., "2 hours ago")
- `formatDateOnly()`, `formatTimeOnly()`: Specific format utilities

### 2. DateFormatter (`src/lib/date-formatter.ts`)

Centralized date formatting utility with context-specific methods:
- `format()`: General date and time display
- `relative()`: Relative time formatting
- `leaderboard()`: Leaderboard-specific formatting
- `session()`: Session time formatting
- `profile()`: Profile date formatting
- `admin()`: Admin panel formatting
- `cache()`: Cache timestamp formatting
- `smart()`: Intelligent formatting based on recency

### 3. TimezoneContext (`src/components/common/timezone-context.tsx`)

React context for timezone management:
- Provides timezone-aware formatting functions
- Manages timezone state across the application
- Auto-detects timezone changes
- Provides hooks for easy access

**Hooks:**
- `useTimezone()`: Access to timezone context
- `useDateFormatting()`: Timezone-aware formatting functions
- `useTimezoneManagement()`: Timezone management functions

### 4. ApiResponse (`src/lib/api-response.ts`)

Standardized API response utility:
- Ensures all timestamps are in UTC ISO format
- Includes timezone metadata in responses
- Transforms database timestamps to UTC
- Provides consistent error handling

## Database Schema

All timestamp fields use `timestamp with timezone` and default to UTC:

```sql
-- Example from users table
createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
githubCreatedAt: timestamp("github_created_at", { withTimezone: true }),
```

## API Responses

All API responses include timezone metadata:

```json
{
  "success": true,
  "data": [...],
  "timestamp": "2024-01-15T10:30:00.000Z",
  "timezone": {
    "server": "UTC",
    "format": "ISO 8601",
    "note": "All timestamps are in UTC. Use client-side timezone detection for display."
  }
}
```

## Usage Examples

### Basic Date Formatting

```typescript
import { formatDate, formatRelativeTime } from '@/lib/date-formatter'

// Format a UTC timestamp for display
const displayDate = formatDate('2024-01-15T10:30:00.000Z')
// Output: "Jan 15, 2024, 10:30 AM PST" (in user's timezone)

// Show relative time
const relativeTime = formatRelativeTime('2024-01-15T10:30:00.000Z')
// Output: "2 hours ago" (in user's timezone)
```

### Using Timezone Context

```typescript
import { useDateFormatting } from '@/components/common/timezone-context'

function MyComponent() {
  const { formatDate, formatRelativeTime } = useDateFormatting()
  
  return (
    <div>
      <p>Last updated: {formatRelativeTime(lastUpdated)}</p>
      <p>Created: {formatDate(createdAt)}</p>
    </div>
  )
}
```

### Context-Specific Formatting

```typescript
import { 
  formatLeaderboardDate, 
  formatSessionDate, 
  formatProfileDate 
} from '@/lib/date-formatter'

// Leaderboard display
const leaderboardTime = formatLeaderboardDate('2024-01-15T10:30:00.000Z')
// Output: "Jan 15, 10:30 AM PST"

// Session display
const sessionTime = formatSessionDate('2024-01-15T10:30:00.000Z')
// Output: "Jan 15, 2024, 10:30 AM PST"

// Profile display
const profileDate = formatProfileDate('2024-01-15T10:30:00.000Z')
// Output: "January 15, 2024"
```

## Implementation Details

### 1. Database Layer
- All timestamps stored in UTC with timezone information
- Database handles timezone conversion automatically
- Consistent `defaultNow()` usage for creation timestamps

### 2. Service Layer
- Services use `new Date()` for UTC timestamps
- TimezoneService provides consistent date calculations
- All date operations use UTC internally

### 3. API Layer
- ApiResponse utility ensures UTC timestamps in responses
- Timezone metadata included for client-side formatting
- Consistent error handling with timezone information

### 4. UI Layer
- Components use centralized date formatting utilities
- TimezoneContext provides timezone-aware functions
- Automatic timezone detection and updates

## Benefits

1. **Consistency**: All dates displayed in user's local timezone
2. **Accuracy**: UTC storage ensures data integrity across timezones
3. **User Experience**: Users see dates in their familiar timezone
4. **Maintainability**: Centralized formatting utilities
5. **Scalability**: Works for users worldwide

## Migration Notes

When updating existing components:

1. Replace direct `new Date().toLocaleString()` calls with formatting utilities
2. Use `formatDate()` instead of manual date formatting
3. Import timezone-aware functions from `@/lib/date-formatter`
4. Use TimezoneContext for components that need timezone management

## Testing

Test timezone functionality by:
1. Changing browser timezone settings
2. Verifying dates display in local timezone
3. Checking API responses include UTC timestamps
4. Ensuring database stores UTC timestamps

## Future Enhancements

1. User timezone preferences
2. Timezone-aware notifications
3. Meeting scheduler integration
4. Timezone conversion utilities
5. Daylight saving time handling
