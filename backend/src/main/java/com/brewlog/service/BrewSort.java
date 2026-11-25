package com.brewlog.service;

import static org.springframework.data.domain.Sort.Order.desc;

import com.brewlog.dto.SortKey;
import org.springframework.data.domain.Sort;

public final class BrewSort {

    private BrewSort() {}

    public static Sort toSort(SortKey key) {
        if (key == SortKey.NEWEST) {
            return Sort.by(desc("brewDate"), desc("createdAt"), desc("id"));
        }
        throw new UnsupportedOperationException("sort " + key + " is not supported yet");
    }
}
