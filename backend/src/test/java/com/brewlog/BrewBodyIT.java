package com.brewlog;

import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.brewlog.support.IntegrationTest;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.http.MediaType;

class BrewBodyIT extends IntegrationTest {

    private static final Map<String, String> VALID_FIELDS = new LinkedHashMap<>();

    static {
        VALID_FIELDS.put("name", "\"Kenyan Morning\"");
        VALID_FIELDS.put("beanName", "\"AA Kiambu\"");
        VALID_FIELDS.put("origin", "\"Kenya\"");
        VALID_FIELDS.put("methodId", "2");
        VALID_FIELDS.put("roast", "\"LIGHT\"");
        VALID_FIELDS.put("rating", "5");
        VALID_FIELDS.put("brewDate", "\"2026-10-28\"");
        VALID_FIELDS.put("notes", "null");
    }

    private static final String LONG_ORIGIN = "\"" + "x".repeat(101) + "\"";

    /** VALID with the given key-value pairs replacing or adding fields. */
    private static String body(String... keyValues) {
        Map<String, String> fields = new LinkedHashMap<>(VALID_FIELDS);
        for (int i = 0; i < keyValues.length; i += 2) {
            fields.put(keyValues[i], keyValues[i + 1]);
        }
        return fields.entrySet().stream()
                .map(e -> "\"" + e.getKey() + "\":" + e.getValue())
                .collect(Collectors.joining(",", "{", "}"));
    }

    private static Stream<Arguments> invalidBodies() {
        return Stream.of(
                Arguments.of(body("brewDate", "\"yesterday\""), "brewDate"),
                Arguments.of(body("brewDate", "\"2026-02-30\""), "brewDate"),
                Arguments.of(body("methodId", "\"abc\""), "methodId"),
                Arguments.of(body("methodId", "\"3\""), "methodId"),
                Arguments.of(body("methodId", "3.0"), "methodId"),
                Arguments.of(body("methodId", "99999999999999999999"), "methodId"),
                Arguments.of(body("rating", "\"4\""), "rating"),
                Arguments.of(body("rating", "4.0"), "rating"),
                Arguments.of(body("rating", "4.5"), "rating"),
                Arguments.of(body("name", "5"), "name"),
                Arguments.of(body("roast", "7"), "roast"),
                Arguments.of(body("id", "3"), "id"),
                Arguments.of(body("foo", "null"), "foo"),
                Arguments.of(
                        "{\"foo\":1,\"beanName\":\"AA Kiambu\",\"origin\":\"Kenya\",\"methodId\":2,"
                                + "\"roast\":\"LIGHT\",\"rating\":\"4\",\"brewDate\":\"2026-10-28\","
                                + "\"notes\":null,\"name\":5}",
                        "name"),
                Arguments.of(body("rating", "\"4\"", "origin", LONG_ORIGIN), "rating"));
    }

    @Test
    @DisplayName("a valid body creates the brew with rating 5, its date and null notes (R52)")
    void validBodyIsCreated() throws Exception {
        mvc.perform(post("/api/brews").contentType(MediaType.APPLICATION_JSON).content(body()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.rating").value(5))
                .andExpect(jsonPath("$.brewDate").value("2026-10-28"))
                .andExpect(jsonPath("$.notes").value(nullValue()));
    }

    @ParameterizedTest(name = "{0} is answered 422 with field {1}")
    @MethodSource("invalidBodies")
    @DisplayName("a body with a wrong-typed or unknown key is answered 422 INVALID_BODY and nothing is saved (R52)")
    void invalidBodyIsAnswered422(String json, String field) throws Exception {
        mvc.perform(post("/api/brews").contentType(MediaType.APPLICATION_JSON).content(json))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.status").value(422))
                .andExpect(jsonPath("$.code").value("INVALID_BODY"))
                .andExpect(jsonPath("$.field").value(field))
                .andExpect(jsonPath("$.errors").doesNotExist());

        mvc.perform(get("/api/brews")).andExpect(jsonPath("$.totalCount").value(0));
    }

    @Test
    @DisplayName("an out-of-range rating and an over-long origin are answered 400 with both format errors (R52, R17)")
    void outOfRangeRatingIsAFormatError() throws Exception {
        mvc.perform(post("/api/brews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body("rating", "99999999999", "origin", LONG_ORIGIN)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.length()").value(2))
                .andExpect(jsonPath("$.errors[0].field").value("origin"))
                .andExpect(jsonPath("$.errors[0].code").value("TOO_LONG"))
                .andExpect(jsonPath("$.errors[1].field").value("rating"))
                .andExpect(jsonPath("$.errors[1].code").value("OUT_OF_RANGE"))
                .andExpect(jsonPath("$.code").doesNotExist());

        mvc.perform(get("/api/brews")).andExpect(jsonPath("$.totalCount").value(0));
    }

    @ParameterizedTest(name = "the body {0} is answered 400 with no errors and no code")
    @MethodSource("notAnObjectBodies")
    @DisplayName(
            "a body that isn't a JSON object or is malformed is answered 400 with no errors and no code (R52, R41)")
    void notAnObjectIsAnswered400(String json) throws Exception {
        mvc.perform(post("/api/brews").contentType(MediaType.APPLICATION_JSON).content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors").doesNotExist())
                .andExpect(jsonPath("$.code").doesNotExist());

        mvc.perform(get("/api/brews")).andExpect(jsonPath("$.totalCount").value(0));
    }

    private static Stream<String> notAnObjectBodies() {
        return Stream.of("[]", "\"x\"", "5", "null", "", "{\"name\": ");
    }
}
