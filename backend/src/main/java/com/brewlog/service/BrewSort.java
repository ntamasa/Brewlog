package com.brewlog.service;

import static org.springframework.data.domain.Sort.Order.asc;
import static org.springframework.data.domain.Sort.Order.desc;

import com.brewlog.dto.SortKey;
import org.springframework.data.domain.Sort;

public final class BrewSort {

    private BrewSort() {}

    public static Sort toSort(SortKey key) {
        return switch (key) {
            case NEWEST -> Sort.by(desc("brewDate"), desc("createdAt"), desc("id"));
            case OLDEST -> Sort.by(asc("brewDate"), asc("createdAt"), asc("id"));
            case HIGHEST -> Sort.by(desc("rating"), desc("brewDate"), desc("createdAt"), desc("id"));
            case LOWEST -> Sort.by(asc("rating"), desc("brewDate"), desc("createdAt"), desc("id"));
        };
    }
}
