package com.brewlog.controller;

import com.brewlog.dto.BrewQuery;
import com.brewlog.dto.FieldErrorDto;
import com.brewlog.dto.SortKey;
import com.brewlog.exception.ErrorCode;
import com.brewlog.exception.ValidationException;
import java.util.List;

public class BrewQueryParams {

    private String q;
    private String sort;
    private int page = 1;

    public String getQ() {
        return q;
    }

    public void setQ(String q) {
        this.q = q == null || q.isBlank() ? null : q.strip();
    }

    public String getSort() {
        return sort;
    }

    public void setSort(String sort) {
        this.sort = sort;
    }

    public int getPage() {
        return page;
    }

    public void setPage(int page) {
        this.page = page;
    }

    BrewQuery toQuery() {
        return new BrewQuery(q, null, null, null, parseSort(sort), page);
    }

    private static SortKey parseSort(String sort) {
        if (sort == null || sort.isEmpty()) {
            return SortKey.NEWEST;
        }
        for (SortKey key : SortKey.values()) {
            if (key.name().equals(sort)) {
                return key;
            }
        }
        throw new ValidationException(List.of(new FieldErrorDto("sort", ErrorCode.INVALID)));
    }
}
