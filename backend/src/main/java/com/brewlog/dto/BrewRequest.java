package com.brewlog.dto;

import java.time.LocalDate;

public record BrewRequest(
        String name,
        String beanName,
        String origin,
        Long methodId,
        String roast,
        Integer rating,
        LocalDate brewDate,
        String notes) {}
