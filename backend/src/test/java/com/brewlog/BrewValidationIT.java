package com.brewlog;

import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.brewlog.support.IntegrationTest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

class BrewValidationIT extends IntegrationTest {

    private static String brewWithName(String name) {
        return """
                {"name":"%s","beanName":"AA Kiambu","origin":"Kenya","methodId":2,
                 "roast":"LIGHT","rating":5,"brewDate":"2026-11-01","notes":null}""".formatted(name);
    }

    @Test
    @DisplayName("an empty brew answers 400 with the seven required field errors in order and saves nothing")
    void emptyBrewIsRejectedWithSevenRequiredErrors() throws Exception {
        mvc.perform(post("/api/brews").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.length()").value(7))
                .andExpect(jsonPath("$.errors[0].field").value("name"))
                .andExpect(jsonPath("$.errors[0].code").value("REQUIRED"))
                .andExpect(jsonPath("$.errors[1].field").value("beanName"))
                .andExpect(jsonPath("$.errors[2].field").value("origin"))
                .andExpect(jsonPath("$.errors[3].field").value("methodId"))
                .andExpect(jsonPath("$.errors[4].field").value("roast"))
                .andExpect(jsonPath("$.errors[5].field").value("rating"))
                .andExpect(jsonPath("$.errors[6].field").value("brewDate"))
                .andExpect(jsonPath("$.errors[6].code").value("REQUIRED"));

        mvc.perform(get("/api/brews")).andExpect(jsonPath("$.totalCount").value(0));
    }

    @Test
    @DisplayName("accepts a brew whose name is exactly 100 characters")
    void nameOfHundredCharactersIsAccepted() throws Exception {
        mvc.perform(post("/api/brews").contentType(MediaType.APPLICATION_JSON).content(brewWithName("a".repeat(100))))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("rejects a brew whose name is 101 characters with TOO_LONG and saves nothing")
    void nameOfHundredAndOneCharactersIsRejected() throws Exception {
        mvc.perform(post("/api/brews").contentType(MediaType.APPLICATION_JSON).content(brewWithName("a".repeat(101))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.length()").value(1))
                .andExpect(jsonPath("$.errors[0].field").value("name"))
                .andExpect(jsonPath("$.errors[0].code").value("TOO_LONG"));

        mvc.perform(get("/api/brews")).andExpect(jsonPath("$.totalCount").value(0));
    }

    @Test
    @DisplayName("rejects a rating of 6 with OUT_OF_RANGE")
    void ratingOfSixIsRejected() throws Exception {
        String body = """
                {"name":"Kenyan Morning","beanName":"AA Kiambu","origin":"Kenya","methodId":2,
                 "roast":"LIGHT","rating":6,"brewDate":"2026-11-01","notes":null}""";

        mvc.perform(post("/api/brews").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.length()").value(1))
                .andExpect(jsonPath("$.errors[0].field").value("rating"))
                .andExpect(jsonPath("$.errors[0].code").value("OUT_OF_RANGE"));
    }

    @Test
    @DisplayName("rejects the roast BOLD with INVALID")
    void roastBoldIsRejected() throws Exception {
        String body = """
                {"name":"Kenyan Morning","beanName":"AA Kiambu","origin":"Kenya","methodId":2,
                 "roast":"BOLD","rating":5,"brewDate":"2026-11-01","notes":null}""";

        mvc.perform(post("/api/brews").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.length()").value(1))
                .andExpect(jsonPath("$.errors[0].field").value("roast"))
                .andExpect(jsonPath("$.errors[0].code").value("INVALID"));
    }

    @Test
    @DisplayName("rejects a brew dated 2026-11-03 with FUTURE_DATE when the server's today is 2026-11-01")
    void dateTwoDaysAheadIsRejected() throws Exception {
        String body = """
                {"name":"Kenyan Morning","beanName":"AA Kiambu","origin":"Kenya","methodId":2,
                 "roast":"LIGHT","rating":5,"brewDate":"2026-11-03","notes":null}""";

        mvc.perform(post("/api/brews").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.length()").value(1))
                .andExpect(jsonPath("$.errors[0].field").value("brewDate"))
                .andExpect(jsonPath("$.errors[0].code").value("FUTURE_DATE"));
    }

    @Test
    @DisplayName("accepts a brew dated 2026-11-02, the day after the server's today")
    void dateOneDayAheadIsAccepted() throws Exception {
        String body = """
                {"name":"Kenyan Morning","beanName":"AA Kiambu","origin":"Kenya","methodId":2,
                 "roast":"LIGHT","rating":5,"brewDate":"2026-11-02","notes":null}""";

        mvc.perform(post("/api/brews").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("rejects a blank bean name with beanName REQUIRED, even when the name and notes are padded")
    void blankBeanNameIsRejected() throws Exception {
        String body = """
                {"name":"  Kenyan Morning ","beanName":"   ","origin":"Kenya","methodId":2,
                 "roast":"LIGHT","rating":5,"brewDate":"2026-11-01","notes":"   "}""";

        mvc.perform(post("/api/brews").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.length()").value(1))
                .andExpect(jsonPath("$.errors[0].field").value("beanName"))
                .andExpect(jsonPath("$.errors[0].code").value("REQUIRED"));
    }

    @Test
    @DisplayName("once the bean name is fixed, the name is stored trimmed and blank notes are stored as null")
    void paddedBrewIsStoredTrimmedAfterBeanIsFixed() throws Exception {
        String body = """
                {"name":"  Kenyan Morning ","beanName":"AA Kiambu","origin":"Kenya","methodId":2,
                 "roast":"LIGHT","rating":5,"brewDate":"2026-11-01","notes":"   "}""";

        mvc.perform(post("/api/brews").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Kenyan Morning"))
                .andExpect(jsonPath("$.notes").value(nullValue()));
    }
}
