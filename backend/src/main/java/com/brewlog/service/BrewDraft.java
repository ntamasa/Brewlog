package com.brewlog.service;

import com.brewlog.dto.BrewRequest;
import com.brewlog.entity.Brew;
import java.time.LocalDate;
import tools.jackson.databind.node.ObjectNode;

class BrewDraft {

    String name;
    String beanName;
    String origin;
    Long methodId;
    String roast;
    Integer rating;
    LocalDate brewDate;
    String notes;

    static BrewDraft from(BrewRequest r) {
        BrewDraft d = new BrewDraft();
        d.name = r.name();
        d.beanName = r.beanName();
        d.origin = r.origin();
        d.methodId = r.methodId();
        d.roast = r.roast();
        d.rating = r.rating();
        d.brewDate = r.brewDate();
        d.notes = r.notes();
        return d;
    }

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
        throw new UnsupportedOperationException("BREW-128: not implemented");
    }
}
