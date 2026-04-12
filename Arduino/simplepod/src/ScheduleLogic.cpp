#include "ScheduleLogic.h"

#include <ctype.h>
#include <stdio.h>
#include <string.h>

namespace
{
const uint32_t kSecondsPerDay = 86400UL;

bool isLeapYear(int year)
{
    return (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0);
}

int daysInMonth(int year, int month)
{
    static const int kMonthDays[] = {31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31};
    if (month == 2 && isLeapYear(year))
    {
        return 29;
    }
    return kMonthDays[month - 1];
}

bool isValidDate(int year, int month, int day)
{
    if (month < 1 || month > 12)
    {
        return false;
    }
    if (day < 1 || day > daysInMonth(year, month))
    {
        return false;
    }
    return true;
}

int monthFromAbbrev(const char *month)
{
    static const char *kMonths[] = {
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
    for (int i = 0; i < 12; ++i)
    {
        if (strcmp(month, kMonths[i]) == 0)
        {
            return i + 1;
        }
    }
    return 0;
}
} // namespace

bool parseTimeOfDay(const char *text, uint32_t *secondOfDay)
{
    if (text == NULL || secondOfDay == NULL)
    {
        return false;
    }

    int hour = -1;
    int minute = -1;
    int second = -1;
    char tail = '\0';
    if (sscanf(text, "%2d:%2d:%2d%c", &hour, &minute, &second, &tail) != 3)
    {
        return false;
    }

    if (strlen(text) != 8)
    {
        return false;
    }

    if (!isdigit(text[0]) || !isdigit(text[1]) || text[2] != ':' ||
        !isdigit(text[3]) || !isdigit(text[4]) || text[5] != ':' ||
        !isdigit(text[6]) || !isdigit(text[7]))
    {
        return false;
    }

    if (hour < 0 || hour > 23 || minute < 0 || minute > 59 || second < 0 || second > 59)
    {
        return false;
    }

    *secondOfDay = static_cast<uint32_t>(hour) * 3600UL +
                   static_cast<uint32_t>(minute) * 60UL +
                   static_cast<uint32_t>(second);
    return true;
}

bool parseHttpDateHeader(const char *header, ParsedHttpDate *out)
{
    if (header == NULL || out == NULL)
    {
        return false;
    }

    char weekday[4] = {0};
    char month[4] = {0};
    char gmt[4] = {0};
    int day = 0;
    int year = 0;
    int hour = 0;
    int minute = 0;
    int second = 0;

    if (sscanf(header, "%3s, %d %3s %d %d:%d:%d %3s",
               weekday, &day, month, &year, &hour, &minute, &second, gmt) != 8)
    {
        return false;
    }

    if (strcmp(gmt, "GMT") != 0)
    {
        return false;
    }

    int monthValue = monthFromAbbrev(month);
    if (monthValue == 0)
    {
        return false;
    }

    if (!isValidDate(year, monthValue, day))
    {
        return false;
    }

    if (hour < 0 || hour > 23 || minute < 0 || minute > 59 || second < 0 || second > 59)
    {
        return false;
    }

    out->year = year;
    out->month = monthValue;
    out->day = day;
    out->hour = hour;
    out->minute = minute;
    out->second = second;
    return true;
}

bool localSecondOfDay(const ParsedHttpDate *utc, int32_t timezoneOffsetSec, uint32_t *secondOfDay)
{
    if (utc == NULL || secondOfDay == NULL)
    {
        return false;
    }

    int64_t totalSeconds = static_cast<int64_t>(utc->hour) * 3600LL +
                           static_cast<int64_t>(utc->minute) * 60LL +
                           static_cast<int64_t>(utc->second) +
                           timezoneOffsetSec;

    while (totalSeconds < 0)
    {
        totalSeconds += kSecondsPerDay;
    }
    while (totalSeconds >= static_cast<int64_t>(kSecondsPerDay))
    {
        totalSeconds -= kSecondsPerDay;
    }

    *secondOfDay = static_cast<uint32_t>(totalSeconds);
    return true;
}

ScheduleDecision decideWatering(
    bool enabled,
    uint32_t currentSecondOfDay,
    const uint32_t *slotSeconds,
    size_t slotCount,
    uint32_t wakeupIntervalSec,
    uint16_t wateringDurationSec)
{
    ScheduleDecision decision = {false, 0, -1};

    if (!enabled || slotSeconds == NULL || slotCount == 0 || wakeupIntervalSec == 0 || wateringDurationSec == 0)
    {
        return decision;
    }

    for (size_t i = 0; i < slotCount; ++i)
    {
        if (slotSeconds[i] > currentSecondOfDay)
        {
            continue;
        }

        uint32_t diff = currentSecondOfDay - slotSeconds[i];
        if (diff < wakeupIntervalSec)
        {
            decision.shouldWater = true;
            decision.durationSec = wateringDurationSec;
            decision.matchedSlotIndex = static_cast<int>(i);
            return decision;
        }
    }

    return decision;
}
