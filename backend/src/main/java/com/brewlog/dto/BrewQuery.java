package com.brewlog.dto;

import com.brewlog.entity.Roast;

public record BrewQuery(String q, Long methodId, Roast roast, Integer minRating, SortKey sort, int page) {}
