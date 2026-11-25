package com.brewlog.controller;

import com.brewlog.dto.BrewQuery;
import com.brewlog.dto.SortKey;

public class BrewQueryParams {

    private int page = 1;

    public int getPage() {
        return page;
    }

    public void setPage(int page) {
        this.page = page;
    }

    BrewQuery toQuery() {
        return new BrewQuery(null, null, null, null, SortKey.NEWEST, page);
    }
}
