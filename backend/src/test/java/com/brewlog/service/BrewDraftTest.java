package com.brewlog.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.brewlog.exception.InvalidBodyException;
import java.time.LocalDate;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import tools.jackson.databind.json.JsonMapper;
import tools.jackson.databind.node.ObjectNode;

class BrewDraftTest {

    private static final String FULL = """
            {"name":"Kenyan Morning","beanName":"AA Kiambu","origin":"Kenya","methodId":2,
             "roast":"LIGHT","rating":5,"brewDate":"2026-10-28","notes":"Bright"}""";

    private static final String ALL_NULL = """
            {"name":null,"beanName":null,"origin":null,"methodId":null,
             "roast":null,"rating":null,"brewDate":null,"notes":null}""";

    private static ObjectNode body(String json) {
        return (ObjectNode) JsonMapper.builder().build().readTree(json);
    }

    @Test
    @DisplayName("a body with all eight keys sets every field of the draft (R52)")
    void fullBodySetsEveryField() {
        BrewDraft draft = new BrewDraft();

        draft.apply(body(FULL));

        assertThat(draft.name).isEqualTo("Kenyan Morning");
        assertThat(draft.beanName).isEqualTo("AA Kiambu");
        assertThat(draft.origin).isEqualTo("Kenya");
        assertThat(draft.methodId).isEqualTo(2L);
        assertThat(draft.roast).isEqualTo("LIGHT");
        assertThat(draft.rating).isEqualTo(5);
        assertThat(draft.brewDate).isEqualTo(LocalDate.of(2026, 10, 28));
        assertThat(draft.notes).isEqualTo("Bright");
    }

    @Test
    @DisplayName("a body with all eight keys null clears every field of the draft (R52, R23)")
    void allNullBodyClearsEveryField() {
        BrewDraft draft = new BrewDraft();
        draft.apply(body(FULL));

        draft.apply(body(ALL_NULL));

        assertThat(draft.name).isNull();
        assertThat(draft.beanName).isNull();
        assertThat(draft.origin).isNull();
        assertThat(draft.methodId).isNull();
        assertThat(draft.roast).isNull();
        assertThat(draft.rating).isNull();
        assertThat(draft.brewDate).isNull();
        assertThat(draft.notes).isNull();
    }

    @Test
    @DisplayName("an empty object changes no field of the draft (R23)")
    void emptyObjectChangesNothing() {
        BrewDraft draft = new BrewDraft();
        draft.apply(body(FULL));

        draft.apply(body("{}"));

        assertThat(draft.name).isEqualTo("Kenyan Morning");
        assertThat(draft.beanName).isEqualTo("AA Kiambu");
        assertThat(draft.origin).isEqualTo("Kenya");
        assertThat(draft.methodId).isEqualTo(2L);
        assertThat(draft.roast).isEqualTo("LIGHT");
        assertThat(draft.rating).isEqualTo(5);
        assertThat(draft.brewDate).isEqualTo(LocalDate.of(2026, 10, 28));
        assertThat(draft.notes).isEqualTo("Bright");
    }

    @Test
    @DisplayName(
            "an integer rating beyond the int range is kept as the bound so the validator says OUT_OF_RANGE (R52, R17)")
    void ratingBeyondIntRangeIsClampedToBounds() {
        BrewDraft high = new BrewDraft();
        high.apply(body("{\"rating\":99999999999}"));
        BrewDraft low = new BrewDraft();
        low.apply(body("{\"rating\":-99999999999}"));

        assertThat(high.rating).isEqualTo(Integer.MAX_VALUE);
        assertThat(low.rating).isEqualTo(Integer.MIN_VALUE);
    }

    @Test
    @DisplayName("a rating of 6 and a roast BOLD are read without a body error, the validator judges them (R52, R17)")
    void outOfRangeValuesAreNotBodyErrors() {
        BrewDraft rating = new BrewDraft();
        rating.apply(body("{\"rating\":6}"));
        BrewDraft roast = new BrewDraft();
        roast.apply(body("{\"roast\":\"BOLD\"}"));

        assertThat(rating.rating).isEqualTo(6);
        assertThat(roast.roast).isEqualTo("BOLD");
    }

    @Test
    @DisplayName("a real date in yyyy-MM-dd form is read as a date (R52)")
    void validDateIsRead() {
        BrewDraft draft = new BrewDraft();

        draft.apply(body("{\"brewDate\":\"2024-02-29\"}"));

        assertThat(draft.brewDate).isEqualTo(LocalDate.of(2024, 2, 29));
    }

    @Test
    @DisplayName("the largest long is accepted as a method id (R52)")
    void largestLongIsAcceptedAsMethodId() {
        BrewDraft draft = new BrewDraft();

        draft.apply(body("{\"methodId\":9223372036854775807}"));

        assertThat(draft.methodId).isEqualTo(Long.MAX_VALUE);
    }

    @ParameterizedTest(name = "{0} is answered with field {1}")
    @CsvSource(
            delimiter = '|',
            value = {
                "{\"brewDate\":\"yesterday\"}|brewDate",
                "{\"brewDate\":\"2026-02-30\"}|brewDate",
                "{\"brewDate\":\"2026-11-1\"}|brewDate",
                "{\"brewDate\":20261101}|brewDate",
                "{\"methodId\":\"abc\"}|methodId",
                "{\"methodId\":\"3\"}|methodId",
                "{\"methodId\":3.0}|methodId",
                "{\"methodId\":9223372036854775808}|methodId",
                "{\"methodId\":99999999999999999999}|methodId",
                "{\"rating\":\"4\"}|rating",
                "{\"rating\":4.0}|rating",
                "{\"rating\":4.5}|rating",
                "{\"rating\":true}|rating",
                "{\"name\":5}|name",
                "{\"roast\":7}|roast",
                "{\"notes\":[\"a\"]}|notes",
                "{\"origin\":{}}|origin",
                "{\"id\":3}|id",
                "{\"foo\":null}|foo",
                "{\"foo\":1,\"bar\":2}|foo",
                "{\"foo\":1,\"rating\":\"4\",\"name\":5}|name",
                "{\"foo\":1,\"rating\":\"4\"}|rating",
            })
    @DisplayName("a wrong-typed or unknown key throws InvalidBodyException naming the first bad key (R52)")
    void badKeyThrowsWithItsField(String json, String field) {
        BrewDraft draft = new BrewDraft();

        assertThatThrownBy(() -> draft.apply(body(json)))
                .isInstanceOfSatisfying(
                        InvalidBodyException.class, e -> assertThat(e.field()).isEqualTo(field));
    }
}
