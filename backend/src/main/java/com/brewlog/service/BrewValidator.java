package com.brewlog.service;

import com.brewlog.dto.FieldErrorDto;
import com.brewlog.entity.Roast;
import com.brewlog.exception.ErrorCode;
import com.brewlog.repository.BrewMethodRepository;
import com.brewlog.repository.BrewRepository;
import java.time.Clock;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
class BrewValidator {

    private static final int NAME_MAX = 100;
    private static final int NOTES_MAX = 2000;

    private final Clock clock;
    private final BrewRepository brewRepository;
    private final BrewMethodRepository brewMethodRepository;

    BrewValidator(Clock clock, BrewRepository brewRepository, BrewMethodRepository brewMethodRepository) {
        this.clock = clock;
        this.brewRepository = brewRepository;
        this.brewMethodRepository = brewMethodRepository;
    }

    List<FieldErrorDto> validate(BrewDraft draft, Long selfId) {
        draft.name = strip(draft.name);
        draft.beanName = strip(draft.beanName);
        draft.origin = strip(draft.origin);
        draft.notes = blankToNull(strip(draft.notes));

        List<FieldErrorDto> errors = new ArrayList<>();
        checkText(errors, "name", draft.name, NAME_MAX);
        checkText(errors, "beanName", draft.beanName, NAME_MAX);
        checkText(errors, "origin", draft.origin, NAME_MAX);
        if (draft.methodId == null) {
            errors.add(new FieldErrorDto("methodId", ErrorCode.REQUIRED));
        }
        checkRoast(errors, draft.roast);
        checkRating(errors, draft.rating);
        checkDate(errors, draft.brewDate);
        if (draft.notes != null && draft.notes.length() > NOTES_MAX) {
            errors.add(new FieldErrorDto("notes", ErrorCode.TOO_LONG));
        }
        if (!errors.isEmpty()) {
            return List.copyOf(errors);
        }
        if (brewRepository.existsByNameIgnoreCaseAndIdNot(draft.name, selfId == null ? -1L : selfId)) {
            return List.of(new FieldErrorDto("name", ErrorCode.DUPLICATE));
        }
        if (!brewMethodRepository.existsById(draft.methodId)) {
            return List.of(new FieldErrorDto("methodId", ErrorCode.METHOD_NOT_FOUND));
        }
        return List.of();
    }

    private static void checkText(List<FieldErrorDto> errors, String field, String value, int max) {
        if (value == null || value.isEmpty()) {
            errors.add(new FieldErrorDto(field, ErrorCode.REQUIRED));
        } else if (value.length() > max) {
            errors.add(new FieldErrorDto(field, ErrorCode.TOO_LONG));
        }
    }

    private static void checkRoast(List<FieldErrorDto> errors, String roast) {
        if (roast == null || roast.isEmpty()) {
            errors.add(new FieldErrorDto("roast", ErrorCode.REQUIRED));
        } else if (Arrays.stream(Roast.values()).noneMatch(value -> value.name().equals(roast))) {
            errors.add(new FieldErrorDto("roast", ErrorCode.INVALID));
        }
    }

    private static void checkRating(List<FieldErrorDto> errors, Integer rating) {
        if (rating == null) {
            errors.add(new FieldErrorDto("rating", ErrorCode.REQUIRED));
        } else if (rating < 1 || rating > 5) {
            errors.add(new FieldErrorDto("rating", ErrorCode.OUT_OF_RANGE));
        }
    }

    private void checkDate(List<FieldErrorDto> errors, LocalDate brewDate) {
        if (brewDate == null) {
            errors.add(new FieldErrorDto("brewDate", ErrorCode.REQUIRED));
        } else if (brewDate.isAfter(LocalDate.now(clock).plusDays(1))) {
            errors.add(new FieldErrorDto("brewDate", ErrorCode.FUTURE_DATE));
        }
    }

    private static String strip(String value) {
        return value == null ? null : value.strip();
    }

    private static String blankToNull(String value) {
        return value == null || value.isEmpty() ? null : value;
    }
}
