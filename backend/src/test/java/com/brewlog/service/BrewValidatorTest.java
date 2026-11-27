package com.brewlog.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.brewlog.dto.BrewRequest;
import com.brewlog.dto.FieldErrorDto;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class BrewValidatorTest {

    private final BrewValidator validator =
            new BrewValidator(Clock.fixed(Instant.parse("2026-11-01T12:00:00Z"), ZoneOffset.UTC));

    @Test
    @DisplayName("surrounding whitespace is removed from origin and no error is returned")
    void originIsTrimmed() {
        BrewRequest request = new BrewRequest(
                "Kenyan Morning", "AA Kiambu", " Kenya\t", 2L, "LIGHT", 5, LocalDate.of(2026, 11, 1), null);
        BrewDraft draft = BrewDraft.from(request);

        List<FieldErrorDto> errors = validator.validate(draft, null);

        assertThat(errors).isEmpty();
        assertThat(draft.origin).isEqualTo("Kenya");
    }
}
