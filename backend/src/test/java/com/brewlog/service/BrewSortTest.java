package com.brewlog.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.data.domain.Sort.Order.desc;

import com.brewlog.dto.SortKey;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Sort;

class BrewSortTest {

    @Test
    @DisplayName("newest first sorts by brew date, then creation date, then id, all descending")
    void newestSortsByDateThenCreatedAtThenId() {
        assertEquals(
                Sort.by(desc("brewDate"), desc("createdAt"), desc("id")),
                BrewSort.toSort(SortKey.NEWEST));
    }
}
