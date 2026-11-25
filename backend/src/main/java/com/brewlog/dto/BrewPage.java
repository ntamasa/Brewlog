package com.brewlog.dto;

import java.util.List;

public record BrewPage(List<BrewResponse> items, int page, int totalPages, long matchingCount, long totalCount) {}
