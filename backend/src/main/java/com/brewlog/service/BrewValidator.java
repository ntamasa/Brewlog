package com.brewlog.service;

import com.brewlog.dto.FieldErrorDto;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
class BrewValidator {

    List<FieldErrorDto> validate(BrewDraft draft, Long selfId) {
        draft.name = strip(draft.name);
        draft.beanName = strip(draft.beanName);
        draft.origin = strip(draft.origin);
        draft.notes = blankToNull(strip(draft.notes));
        return List.of();
    }

    private static String strip(String value) {
        return value == null ? null : value.strip();
    }

    private static String blankToNull(String value) {
        return value == null || value.isEmpty() ? null : value;
    }
}
