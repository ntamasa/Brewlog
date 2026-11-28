package com.brewlog;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.brewlog.support.IntegrationTest;
import com.brewlog.support.TestData;
import java.util.Map;
import java.util.stream.Stream;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.http.MediaType;

class BrewPatchIT extends IntegrationTest {

    private static final String ORIGIN_101 = "x".repeat(101);

    /** "Kenyan Morning": bean "AA Kiambu", origin "Kenya", Pour Over, LIGHT, 5, 2026-10-28, notes "Bright". */
    private long insertKenyanMorning() {
        return TestData.brew("Kenyan Morning")
                .bean("AA Kiambu")
                .origin("Kenya")
                .method(2)
                .roast("LIGHT")
                .rating(5)
                .date("2026-10-28")
                .notes("Bright")
                .insert(jdbc);
    }

    private Map<String, Object> row(long id) {
        return jdbc.queryForMap("SELECT * FROM brew WHERE id = ?", id);
    }

    private void assertRow(
            long id,
            String name,
            String beanName,
            String origin,
            long methodId,
            String roast,
            int rating,
            String brewDate,
            String notes) {
        Map<String, Object> row = row(id);
        assertThat(row.get("name")).isEqualTo(name);
        assertThat(row.get("bean_name")).isEqualTo(beanName);
        assertThat(row.get("origin")).isEqualTo(origin);
        assertThat(((Number) row.get("method_id")).longValue()).isEqualTo(methodId);
        assertThat(row.get("roast")).isEqualTo(roast);
        assertThat(((Number) row.get("rating")).intValue()).isEqualTo(rating);
        assertThat(String.valueOf(row.get("brew_date"))).isEqualTo(brewDate);
        assertThat(row.get("notes")).isEqualTo(notes);
    }

    @Test
    @DisplayName("a rating-only PATCH returns the full brew with the new rating and every other field unchanged (R22)")
    void ratingOnlyPatchChangesOnlyTheRating() throws Exception {
        long id = insertKenyanMorning();

        mvc.perform(patch("/api/brews/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"rating\": 4}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id))
                .andExpect(jsonPath("$.name").value("Kenyan Morning"))
                .andExpect(jsonPath("$.beanName").value("AA Kiambu"))
                .andExpect(jsonPath("$.origin").value("Kenya"))
                .andExpect(jsonPath("$.method.id").value(2))
                .andExpect(jsonPath("$.roast").value("LIGHT"))
                .andExpect(jsonPath("$.rating").value(4))
                .andExpect(jsonPath("$.brewDate").value("2026-10-28"))
                .andExpect(jsonPath("$.notes").value("Bright"));

        assertRow(id, "Kenyan Morning", "AA Kiambu", "Kenya", 2, "LIGHT", 4, "2026-10-28", "Bright");
    }

    @Test
    @DisplayName("a PATCH with notes null clears the notes, in the response and in the row (R23)")
    void nullNotesClearsNotes() throws Exception {
        long id = insertKenyanMorning();

        mvc.perform(patch("/api/brews/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"notes\": null}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.notes").value(nullValue()));

        assertThat(row(id).get("notes")).isNull();
    }

    @Test
    @DisplayName("an empty PATCH body answers 200 and leaves the row unchanged (R23)")
    void emptyPatchChangesNothing() throws Exception {
        long id = insertKenyanMorning();
        Map<String, Object> before = row(id);

        mvc.perform(patch("/api/brews/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isOk());

        assertThat(row(id)).isEqualTo(before);
    }

    @Test
    @DisplayName(
            "a PATCH with every field changes them all, keeps created_at and returns the method by id and name (R22, B9)")
    void fullPatchChangesEveryFieldAndKeepsCreatedAt() throws Exception {
        long id = insertKenyanMorning();
        Object createdAtBefore = row(id).get("created_at");

        mvc.perform(patch("/api/brews/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Kenyan Evening\",\"beanName\":\"Yirgacheffe\",\"origin\":\"Ethiopia\","
                                + "\"methodId\":1,\"roast\":\"DARK\",\"rating\":2,\"brewDate\":\"2026-10-30\","
                                + "\"notes\":\"Heavy\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Kenyan Evening"))
                .andExpect(jsonPath("$.beanName").value("Yirgacheffe"))
                .andExpect(jsonPath("$.origin").value("Ethiopia"))
                .andExpect(jsonPath("$.method.id").value(1))
                .andExpect(jsonPath("$.method.name").value("Espresso"))
                .andExpect(jsonPath("$.method.iconKey").value("espresso"))
                .andExpect(jsonPath("$.roast").value("DARK"))
                .andExpect(jsonPath("$.rating").value(2))
                .andExpect(jsonPath("$.brewDate").value("2026-10-30"))
                .andExpect(jsonPath("$.notes").value("Heavy"));

        assertRow(id, "Kenyan Evening", "Yirgacheffe", "Ethiopia", 1, "DARK", 2, "2026-10-30", "Heavy");
        assertThat(row(id).get("created_at")).isEqualTo(createdAtBefore);
    }

    @ParameterizedTest(name = "PATCH {0} is answered 400 REQUIRED on name and the row is unchanged")
    @ValueSource(strings = {"{\"name\": null}", "{\"name\": \"  \"}"})
    @DisplayName("a PATCH that empties the name is answered 400 REQUIRED on name (R23)")
    void emptiedNameIsRequired(String json) throws Exception {
        long id = insertKenyanMorning();
        Map<String, Object> before = row(id);

        mvc.perform(patch("/api/brews/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.length()").value(1))
                .andExpect(jsonPath("$.errors[0].field").value("name"))
                .andExpect(jsonPath("$.errors[0].code").value("REQUIRED"));

        assertThat(row(id)).isEqualTo(before);
    }

    @Test
    @DisplayName("a rating of 6 is answered 400 OUT_OF_RANGE on rating and the row is unchanged (R23)")
    void ratingOfSixIsOutOfRange() throws Exception {
        long id = insertKenyanMorning();
        Map<String, Object> before = row(id);

        mvc.perform(patch("/api/brews/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"rating\": 6}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.length()").value(1))
                .andExpect(jsonPath("$.errors[0].field").value("rating"))
                .andExpect(jsonPath("$.errors[0].code").value("OUT_OF_RANGE"));

        assertThat(row(id)).isEqualTo(before);
    }

    @Test
    @DisplayName("a name another brew uses, in other capitals, is answered 400 DUPLICATE on name (R23)")
    void duplicateNameIsRejected() throws Exception {
        long id = insertKenyanMorning();
        TestData.brew("Sunday Moka").insert(jdbc);
        Map<String, Object> before = row(id);

        mvc.perform(patch("/api/brews/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\": \"SUNDAY MOKA\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.length()").value(1))
                .andExpect(jsonPath("$.errors[0].field").value("name"))
                .andExpect(jsonPath("$.errors[0].code").value("DUPLICATE"));

        assertThat(row(id)).isEqualTo(before);
    }

    @Test
    @DisplayName("a PATCH to an unknown brew is answered 404 BREW_NOT_FOUND (R25)")
    void unknownBrewIsNotFound() throws Exception {
        mvc.perform(patch("/api/brews/999")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"rating\": 4}"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("BREW_NOT_FOUND"));
    }

    @ParameterizedTest(name = "the body {0} is answered 400 with no errors and no code")
    @ValueSource(strings = {"{\"rating\": ", "[]", "\"x\""})
    @DisplayName(
            "a malformed body or one that isn't a JSON object is answered 400 with no errors and no code (R41, R52)")
    void notAnObjectIsAnswered400(String json) throws Exception {
        long id = insertKenyanMorning();
        Map<String, Object> before = row(id);

        mvc.perform(patch("/api/brews/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors").doesNotExist())
                .andExpect(jsonPath("$.code").doesNotExist());

        assertThat(row(id)).isEqualTo(before);
    }

    @Test
    @DisplayName(
            "a method deleted elsewhere and a name taken by another brew: the name DUPLICATE alone is answered (B28, R51)")
    void duplicateNameWinsOverGoneMethod() throws Exception {
        long id = insertKenyanMorning();
        TestData.brew("Sunday Moka").insert(jdbc);
        long kalitaId = jdbc.queryForObject(
                "INSERT INTO brew_method (name, icon_key, predefined, is_protected, position)"
                        + " VALUES ('Kalita Wave', 'cup', false, false, NULL) RETURNING id",
                Long.class);
        jdbc.update("DELETE FROM brew_method WHERE id = ?", kalitaId);
        Map<String, Object> before = row(id);

        mvc.perform(patch("/api/brews/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\": \"SUNDAY MOKA\", \"methodId\": " + kalitaId + "}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.length()").value(1))
                .andExpect(jsonPath("$.errors[0].field").value("name"))
                .andExpect(jsonPath("$.errors[0].code").value("DUPLICATE"));

        assertThat(row(id)).isEqualTo(before);
    }

    @Test
    @DisplayName("a format error alongside a duplicate name is answered alone: the format error comes first (B28, R51)")
    void formatErrorIsAnsweredBeforeDuplicate() throws Exception {
        long id = insertKenyanMorning();
        TestData.brew("Sunday Moka").insert(jdbc);
        long kalitaId = jdbc.queryForObject(
                "INSERT INTO brew_method (name, icon_key, predefined, is_protected, position)"
                        + " VALUES ('Kalita Wave', 'cup', false, false, NULL) RETURNING id",
                Long.class);
        jdbc.update("DELETE FROM brew_method WHERE id = ?", kalitaId);
        Map<String, Object> before = row(id);

        mvc.perform(patch("/api/brews/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\": \"SUNDAY MOKA\", \"methodId\": " + kalitaId + ", \"origin\": \""
                                + ORIGIN_101 + "\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.length()").value(1))
                .andExpect(jsonPath("$.errors[0].field").value("origin"))
                .andExpect(jsonPath("$.errors[0].code").value("TOO_LONG"));

        assertThat(row(id)).isEqualTo(before);
    }

    private static Stream<Arguments> wrongTypedBodies() {
        return Stream.of(
                Arguments.of("{\"rating\":\"4\"}", "rating"),
                Arguments.of("{\"brewDate\":\"2026-02-30\"}", "brewDate"),
                Arguments.of("{\"methodId\":3.0}", "methodId"),
                Arguments.of("{\"id\":3}", "id"),
                Arguments.of("{\"foo\":null}", "foo"),
                Arguments.of("{\"foo\":1,\"rating\":\"4\",\"name\":5}", "name"),
                Arguments.of("{\"rating\":\"4\",\"origin\":\"" + ORIGIN_101 + "\"}", "rating"));
    }

    @ParameterizedTest(name = "PATCH {0} is answered 422 INVALID_BODY on {1}")
    @MethodSource("wrongTypedBodies")
    @DisplayName("a PATCH with a wrong-typed or unknown key is answered 422 INVALID_BODY with no errors (R52)")
    void wrongTypedKeyIsAnswered422(String json, String field) throws Exception {
        long id = insertKenyanMorning();
        Map<String, Object> before = row(id);

        mvc.perform(patch("/api/brews/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.status").value(422))
                .andExpect(jsonPath("$.code").value("INVALID_BODY"))
                .andExpect(jsonPath("$.field").value(field))
                .andExpect(jsonPath("$.errors").doesNotExist());

        assertThat(row(id)).isEqualTo(before);
    }

    @Test
    @DisplayName("an out-of-range rating with an over-long origin is answered 400 with both format errors (R52, R17)")
    void outOfRangeRatingWithLongOriginIsAnsweredWithBothErrors() throws Exception {
        long id = insertKenyanMorning();
        Map<String, Object> before = row(id);

        mvc.perform(patch("/api/brews/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"rating\":99999999999,\"origin\":\"" + ORIGIN_101 + "\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.length()").value(2))
                .andExpect(jsonPath("$.errors[0].field").value("origin"))
                .andExpect(jsonPath("$.errors[0].code").value("TOO_LONG"))
                .andExpect(jsonPath("$.errors[1].field").value("rating"))
                .andExpect(jsonPath("$.errors[1].code").value("OUT_OF_RANGE"))
                .andExpect(jsonPath("$.code").doesNotExist());

        assertThat(row(id)).isEqualTo(before);
    }
}
