package com.brewlog.service;

import com.brewlog.entity.Brew;
import com.brewlog.exception.InvalidBodyException;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.node.ObjectNode;

class BrewDraft {

    private static final List<String> KNOWN_KEYS =
            List.of("name", "beanName", "origin", "methodId", "roast", "rating", "brewDate", "notes");

    String name;
    String beanName;
    String origin;
    Long methodId;
    String roast;
    Integer rating;
    LocalDate brewDate;
    String notes;

    static BrewDraft from(Brew b) {
        BrewDraft d = new BrewDraft();
        d.name = b.getName();
        d.beanName = b.getBeanName();
        d.origin = b.getOrigin();
        d.methodId = b.getMethod().getId();
        d.roast = b.getRoast().name();
        d.rating = b.getRating();
        d.brewDate = b.getBrewDate();
        d.notes = b.getNotes();
        return d;
    }

    void apply(ObjectNode body) {
        for (String key : KNOWN_KEYS) {
            if (body.has(key)) {
                applyKnown(key, body.get(key));
            }
        }
        for (String key : body.propertyNames()) {
            if (!KNOWN_KEYS.contains(key)) {
                throw new InvalidBodyException(key);
            }
        }
    }

    private void applyKnown(String key, JsonNode v) {
        switch (key) {
            case "name" -> name = text(key, v);
            case "beanName" -> beanName = text(key, v);
            case "origin" -> origin = text(key, v);
            case "roast" -> roast = text(key, v);
            case "notes" -> notes = text(key, v);
            case "methodId" -> methodId = v.isNull() ? null : longOf(key, v);
            case "rating" -> rating = v.isNull() ? null : ratingOf(key, v);
            case "brewDate" -> brewDate = v.isNull() ? null : dateOf(key, v);
            default -> throw new IllegalStateException(key);
        }
    }

    private static String text(String key, JsonNode v) {
        if (v.isNull()) {
            return null;
        }
        if (!v.isString()) {
            throw new InvalidBodyException(key);
        }
        return v.stringValue();
    }

    private static Long longOf(String key, JsonNode v) {
        if (!v.isIntegralNumber() || !v.canConvertToLong()) {
            throw new InvalidBodyException(key);
        }
        return v.longValue();
    }

    private static Integer ratingOf(String key, JsonNode v) {
        if (!v.isIntegralNumber()) {
            throw new InvalidBodyException(key);
        }
        if (v.canConvertToInt()) {
            return v.intValue();
        }
        return v.bigIntegerValue().signum() > 0 ? Integer.MAX_VALUE : Integer.MIN_VALUE;
    }

    private static LocalDate dateOf(String key, JsonNode v) {
        if (!v.isString()) {
            throw new InvalidBodyException(key);
        }
        try {
            return LocalDate.parse(v.stringValue());
        } catch (DateTimeParseException e) {
            throw new InvalidBodyException(key);
        }
    }
}
