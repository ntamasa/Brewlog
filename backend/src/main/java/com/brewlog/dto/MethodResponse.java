package com.brewlog.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record MethodResponse(
        long id,
        String name,
        String iconKey,
        boolean predefined,
        @JsonProperty("protected") boolean isProtected,
        Integer position,
        long brewCount) {}
