#include <unity.h>

#include "ScheduleLogic.h"

void test_parse_time_of_day_valid()
{
    uint32_t secondOfDay = 0;
    TEST_ASSERT_TRUE(parseTimeOfDay("07:30:00", &secondOfDay));
    TEST_ASSERT_EQUAL_UINT32(27000U, secondOfDay);
}

void test_parse_time_of_day_invalid()
{
    uint32_t secondOfDay = 0;
    TEST_ASSERT_FALSE(parseTimeOfDay("7:30:00", &secondOfDay));
    TEST_ASSERT_FALSE(parseTimeOfDay("24:00:00", &secondOfDay));
    TEST_ASSERT_FALSE(parseTimeOfDay("07:61:00", &secondOfDay));
}

void test_parse_http_date_header_valid()
{
    ParsedHttpDate date = {};
    TEST_ASSERT_TRUE(parseHttpDateHeader("Sat, 11 Apr 2026 09:32:53 GMT", &date));
    TEST_ASSERT_EQUAL_INT(2026, date.year);
    TEST_ASSERT_EQUAL_INT(4, date.month);
    TEST_ASSERT_EQUAL_INT(11, date.day);
    TEST_ASSERT_EQUAL_INT(9, date.hour);
    TEST_ASSERT_EQUAL_INT(32, date.minute);
    TEST_ASSERT_EQUAL_INT(53, date.second);
}

void test_parse_http_date_header_invalid()
{
    ParsedHttpDate date = {};
    TEST_ASSERT_FALSE(parseHttpDateHeader("Sat, 11 Xxx 2026 09:32:53 GMT", &date));
    TEST_ASSERT_FALSE(parseHttpDateHeader("Sat, 11 Apr 2026 09:32:53 UTC", &date));
}

void test_local_second_of_day_with_timezone()
{
    ParsedHttpDate date = {2026, 4, 11, 9, 32, 53};
    uint32_t secondOfDay = 0;
    TEST_ASSERT_TRUE(localSecondOfDay(&date, 7200, &secondOfDay));
    TEST_ASSERT_EQUAL_UINT32(41573U, secondOfDay);
}

void test_local_second_of_day_wraps()
{
    ParsedHttpDate date = {2026, 4, 11, 23, 30, 0};
    uint32_t secondOfDay = 0;
    TEST_ASSERT_TRUE(localSecondOfDay(&date, 7200, &secondOfDay));
    TEST_ASSERT_EQUAL_UINT32(5400U, secondOfDay);
}

void test_decide_watering_due()
{
    const uint32_t slots[] = {27000U, 68400U};
    ScheduleDecision decision = decideWatering(true, 27900U, slots, 2, 3600U, 10U);
    TEST_ASSERT_TRUE(decision.shouldWater);
    TEST_ASSERT_EQUAL_INT(0, decision.matchedSlotIndex);
    TEST_ASSERT_EQUAL_UINT16(10U, decision.durationSec);
}

void test_decide_watering_not_due()
{
    const uint32_t slots[] = {27000U, 68400U};
    ScheduleDecision decision = decideWatering(true, 30601U, slots, 2, 3600U, 10U);
    TEST_ASSERT_FALSE(decision.shouldWater);
    TEST_ASSERT_EQUAL_INT(-1, decision.matchedSlotIndex);
}

void test_decide_watering_disabled()
{
    const uint32_t slots[] = {27000U};
    ScheduleDecision decision = decideWatering(false, 27900U, slots, 1, 3600U, 10U);
    TEST_ASSERT_FALSE(decision.shouldWater);
}

int main(int argc, char **argv)
{
    UNITY_BEGIN();
    RUN_TEST(test_parse_time_of_day_valid);
    RUN_TEST(test_parse_time_of_day_invalid);
    RUN_TEST(test_parse_http_date_header_valid);
    RUN_TEST(test_parse_http_date_header_invalid);
    RUN_TEST(test_local_second_of_day_with_timezone);
    RUN_TEST(test_local_second_of_day_wraps);
    RUN_TEST(test_decide_watering_due);
    RUN_TEST(test_decide_watering_not_due);
    RUN_TEST(test_decide_watering_disabled);
    return UNITY_END();
}
