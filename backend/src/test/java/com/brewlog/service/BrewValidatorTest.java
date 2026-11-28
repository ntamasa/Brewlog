package com.brewlog.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.brewlog.dto.BrewRequest;
import com.brewlog.dto.FieldErrorDto;
import com.brewlog.exception.ErrorCode;
import com.brewlog.repository.BrewMethodRepository;
import com.brewlog.repository.BrewRepository;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class BrewValidatorTest {

    private static final LocalDate TODAY = LocalDate.of(2026, 11, 1);

    private final BrewRepository brewRepository = mock(BrewRepository.class);
    private final BrewMethodRepository brewMethodRepository = mock(BrewMethodRepository.class);
    private final BrewValidator validator = new BrewValidator(
            Clock.fixed(Instant.parse("2026-11-01T12:00:00Z"), ZoneOffset.UTC), brewRepository, brewMethodRepository);

    @BeforeEach
    void methodTwoExistsAndNoBrewHasTheName() {
        when(brewMethodRepository.existsById(2L)).thenReturn(true);
        when(brewRepository.existsByNameIgnoreCaseAndIdNot(anyString(), eq(-1L)))
                .thenReturn(false);
    }

    @Test
    @DisplayName("a name no other brew uses and an existing method give no errors")
    void newNameAndExistingMethodAreAccepted() {
        List<FieldErrorDto> errors = validate("Kenyan Morning", "AA Kiambu", "Kenya", 2L, "LIGHT", 5, TODAY, null);

        assertThat(errors).isEmpty();
    }

    @Test
    @DisplayName("a name another brew already uses, in other capitals, is rejected with DUPLICATE on name")
    void duplicateNameIsRejected() {
        when(brewRepository.existsByNameIgnoreCaseAndIdNot("kenyan morning", -1L))
                .thenReturn(true);

        List<FieldErrorDto> errors = validate("kenyan morning", "AA Kiambu", "Kenya", 2L, "LIGHT", 5, TODAY, null);

        assertThat(errors).containsExactly(new FieldErrorDto("name", ErrorCode.DUPLICATE));
    }

    @Test
    @DisplayName("a method that no longer exists is rejected with METHOD_NOT_FOUND on methodId")
    void missingMethodIsRejected() {
        List<FieldErrorDto> errors = validate("Kenyan Morning", "AA Kiambu", "Kenya", 9L, "LIGHT", 5, TODAY, null);

        assertThat(errors).containsExactly(new FieldErrorDto("methodId", ErrorCode.METHOD_NOT_FOUND));
    }

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

    @Test
    @DisplayName("accepts name, bean name and origin of exactly 100 characters, notes of 2000, rating 1, roast DARK")
    void acceptsValuesAtTheUpperLimitsWithRatingOne() {
        List<FieldErrorDto> errors = validate(
                "a".repeat(100),
                "b".repeat(100),
                "c".repeat(100),
                2L,
                "DARK",
                1,
                LocalDate.of(2026, 11, 2),
                "d".repeat(2000));

        assertThat(errors).isEmpty();
    }

    @Test
    @DisplayName("accepts a rating of 5 with the same limits")
    void acceptsRatingFive() {
        List<FieldErrorDto> errors = validate(
                "a".repeat(100),
                "b".repeat(100),
                "c".repeat(100),
                2L,
                "DARK",
                5,
                LocalDate.of(2026, 11, 2),
                "d".repeat(2000));

        assertThat(errors).isEmpty();
    }

    @Test
    @DisplayName("an empty draft is rejected with REQUIRED for the seven required fields in order")
    void emptyDraftRequiresSevenFieldsInOrder() {
        List<FieldErrorDto> errors = validate(null, null, null, null, null, null, null, null);

        assertThat(errors)
                .containsExactly(
                        new FieldErrorDto("name", ErrorCode.REQUIRED),
                        new FieldErrorDto("beanName", ErrorCode.REQUIRED),
                        new FieldErrorDto("origin", ErrorCode.REQUIRED),
                        new FieldErrorDto("methodId", ErrorCode.REQUIRED),
                        new FieldErrorDto("roast", ErrorCode.REQUIRED),
                        new FieldErrorDto("rating", ErrorCode.REQUIRED),
                        new FieldErrorDto("brewDate", ErrorCode.REQUIRED));
    }

    @Test
    @DisplayName("a bean name of only spaces is rejected with REQUIRED")
    void blankBeanNameIsRequired() {
        List<FieldErrorDto> errors = validate("Kenyan Morning", "   ", "Kenya", 2L, "LIGHT", 5, TODAY, null);

        assertThat(errors).containsExactly(new FieldErrorDto("beanName", ErrorCode.REQUIRED));
    }

    @Test
    @DisplayName("a name of 101 characters is rejected with TOO_LONG")
    void nameOfHundredAndOneIsTooLong() {
        List<FieldErrorDto> errors = validate("a".repeat(101), "AA Kiambu", "Kenya", 2L, "LIGHT", 5, TODAY, null);

        assertThat(errors).containsExactly(new FieldErrorDto("name", ErrorCode.TOO_LONG));
    }

    @Test
    @DisplayName("a bean name of 101 characters is rejected with TOO_LONG")
    void beanNameOfHundredAndOneIsTooLong() {
        List<FieldErrorDto> errors = validate("Kenyan Morning", "b".repeat(101), "Kenya", 2L, "LIGHT", 5, TODAY, null);

        assertThat(errors).containsExactly(new FieldErrorDto("beanName", ErrorCode.TOO_LONG));
    }

    @Test
    @DisplayName("an origin of 101 characters is rejected with TOO_LONG")
    void originOfHundredAndOneIsTooLong() {
        List<FieldErrorDto> errors =
                validate("Kenyan Morning", "AA Kiambu", "c".repeat(101), 2L, "LIGHT", 5, TODAY, null);

        assertThat(errors).containsExactly(new FieldErrorDto("origin", ErrorCode.TOO_LONG));
    }

    @Test
    @DisplayName("tasting notes of 2001 characters are rejected with TOO_LONG")
    void notesOfTwoThousandAndOneAreTooLong() {
        List<FieldErrorDto> errors =
                validate("Kenyan Morning", "AA Kiambu", "Kenya", 2L, "LIGHT", 5, TODAY, "d".repeat(2001));

        assertThat(errors).containsExactly(new FieldErrorDto("notes", ErrorCode.TOO_LONG));
    }

    @Test
    @DisplayName("a rating of 0 is rejected with OUT_OF_RANGE")
    void ratingOfZeroIsOutOfRange() {
        List<FieldErrorDto> errors = validate("Kenyan Morning", "AA Kiambu", "Kenya", 2L, "LIGHT", 0, TODAY, null);

        assertThat(errors).containsExactly(new FieldErrorDto("rating", ErrorCode.OUT_OF_RANGE));
    }

    @Test
    @DisplayName("a rating of 6 is rejected with OUT_OF_RANGE")
    void ratingOfSixIsOutOfRange() {
        List<FieldErrorDto> errors = validate("Kenyan Morning", "AA Kiambu", "Kenya", 2L, "LIGHT", 6, TODAY, null);

        assertThat(errors).containsExactly(new FieldErrorDto("rating", ErrorCode.OUT_OF_RANGE));
    }

    @Test
    @DisplayName("the roast BOLD is rejected with INVALID")
    void roastBoldIsInvalid() {
        List<FieldErrorDto> errors = validate("Kenyan Morning", "AA Kiambu", "Kenya", 2L, "BOLD", 5, TODAY, null);

        assertThat(errors).containsExactly(new FieldErrorDto("roast", ErrorCode.INVALID));
    }

    @Test
    @DisplayName("a brew dated 2026-11-03 is rejected with FUTURE_DATE when today is 2026-11-01")
    void dateTwoDaysAheadIsFutureDate() {
        List<FieldErrorDto> errors =
                validate("Kenyan Morning", "AA Kiambu", "Kenya", 2L, "LIGHT", 5, LocalDate.of(2026, 11, 3), null);

        assertThat(errors).containsExactly(new FieldErrorDto("brewDate", ErrorCode.FUTURE_DATE));
    }

    @Test
    @DisplayName("the roast MEDIUM is accepted with no error")
    void roastMediumIsAccepted() {
        List<FieldErrorDto> errors = validate("Kenyan Morning", "AA Kiambu", "Kenya", 2L, "MEDIUM", 5, TODAY, null);

        assertThat(errors).isEmpty();
    }

    @Test
    @DisplayName("the roast light in lower case is rejected with INVALID, the match is case-sensitive")
    void lowerCaseRoastIsInvalid() {
        List<FieldErrorDto> errors = validate("Kenyan Morning", "AA Kiambu", "Kenya", 2L, "light", 5, TODAY, null);

        assertThat(errors).containsExactly(new FieldErrorDto("roast", ErrorCode.INVALID));
    }

    @Test
    @DisplayName("an empty roast is rejected with REQUIRED, not INVALID")
    void emptyRoastIsRequired() {
        List<FieldErrorDto> errors = validate("Kenyan Morning", "AA Kiambu", "Kenya", 2L, "", 5, TODAY, null);

        assertThat(errors).containsExactly(new FieldErrorDto("roast", ErrorCode.REQUIRED));
    }

    private List<FieldErrorDto> validate(
            String name,
            String beanName,
            String origin,
            Long methodId,
            String roast,
            Integer rating,
            LocalDate brewDate,
            String notes) {
        BrewRequest request = new BrewRequest(name, beanName, origin, methodId, roast, rating, brewDate, notes);
        return validator.validate(BrewDraft.from(request), null);
    }
}
