package com.brewlog.controller;

import com.brewlog.dto.BrewQuery;
import com.brewlog.dto.SortKey;

public class BrewQueryParams {

    private String q;
    private int page = 1;

    public String getQ() {
        return q;
    }

    public void setQ(String q) {
        this.q = q == null || q.isBlank() ? null : q.strip();
    }

    public int getPage() {
        return page;
    }

    public void setPage(int page) {
        this.page = page;
    }

    BrewQuery toQuery() {
        return new BrewQuery(q, null, null, null, SortKey.NEWEST, page);
    }
}
