#ifndef SCHEDULE_LOGIC_H
#define SCHEDULE_LOGIC_H

#include <stddef.h>
#include <stdint.h>

struct ParsedHttpDate
{
    int year;
    int month;
    int day;
    int hour;
    int minute;
    int second;
};

struct ScheduleDecision
{
    bool shouldWater;
    uint16_t durationSec;
    int matchedSlotIndex;
};

bool parseTimeOfDay(const char *text, uint32_t *secondOfDay);
bool parseHttpDateHeader(const char *header, ParsedHttpDate *out);
bool localSecondOfDay(const ParsedHttpDate *utc, int32_t timezoneOffsetSec, uint32_t *secondOfDay);
ScheduleDecision decideWatering(
    bool enabled,
    uint32_t currentSecondOfDay,
    const uint32_t *slotSeconds,
    size_t slotCount,
    uint32_t wakeupIntervalSec,
    uint16_t wateringDurationSec);

#endif // SCHEDULE_LOGIC_H
