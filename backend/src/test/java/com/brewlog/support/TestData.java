package com.brewlog.support;

import org.springframework.jdbc.core.JdbcTemplate;

public final class TestData {

    private final String name;
    private String bean = "AA Kiambu";
    private String origin = "Kenya";
    private long methodId = 1;
    private String roast = "MEDIUM";
    private int rating = 3;
    private String date = "2026-10-01";
    private String createdAt;
    private String notes;

    private TestData(String name) {
        this.name = name;
    }

    public static TestData brew(String name) {
        return new TestData(name);
    }

    public TestData bean(String bean) {
        this.bean = bean;
        return this;
    }

    public TestData origin(String origin) {
        this.origin = origin;
        return this;
    }

    public TestData method(long methodId) {
        this.methodId = methodId;
        return this;
    }

    public TestData roast(String roast) {
        this.roast = roast;
        return this;
    }

    public TestData rating(int rating) {
        this.rating = rating;
        return this;
    }

    public TestData date(String isoDate) {
        this.date = isoDate;
        return this;
    }

    public TestData createdAt(String isoInstant) {
        this.createdAt = isoInstant;
        return this;
    }

    public TestData notes(String notes) {
        this.notes = notes;
        return this;
    }

    public long insert(JdbcTemplate jdbc) {
        return jdbc.queryForObject(
                "INSERT INTO brew (name, bean_name, origin, method_id, roast, rating, brew_date, notes, created_at)"
                        + " VALUES (?, ?, ?, ?, ?, ?, CAST(? AS date), ?, COALESCE(CAST(? AS timestamptz), now()))"
                        + " RETURNING id",
                Long.class,
                name,
                bean,
                origin,
                methodId,
                roast,
                rating,
                date,
                notes,
                createdAt);
    }
}
