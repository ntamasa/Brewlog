package com.brewlog.service;

import com.brewlog.entity.Brew;
import java.util.Locale;
import org.springframework.data.jpa.domain.Specification;

public final class BrewSpecifications {

    private BrewSpecifications() {}

    public static Specification<Brew> nameContains(String q) {
        return (root, query, cb) -> q == null
                ? cb.conjunction()
                : cb.like(cb.lower(root.get("name")), "%" + escape(q.toLowerCase(Locale.ROOT)) + "%", '\\');
    }

    static String escape(String s) {
        return s.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }
}
