package com.brewlog.dto;

import com.brewlog.entity.Roast;
import java.time.LocalDate;

public record BrewResponse(
        long id,
        String name,
        String beanName,
        String origin,
        MethodRef method,
        Roast roast,
        int rating,
        LocalDate brewDate,
        String notes) {}
