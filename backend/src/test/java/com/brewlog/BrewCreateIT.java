package com.brewlog;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.brewlog.support.IntegrationTest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

class BrewCreateIT extends IntegrationTest {

    private static final String KENYAN_MORNING = """
            {"name":"Kenyan Morning","beanName":"AA Kiambu","origin":"Kenya","methodId":2,
             "roast":"LIGHT","rating":5,"brewDate":"2026-11-01","notes":""}""";

    @Test
    @DisplayName("creating a brew returns 201 with its method and null notes, and the list holds it")
    void createdBrewIsReturnedAndListed() throws Exception {
        mvc.perform(post("/api/brews").contentType(MediaType.APPLICATION_JSON).content(KENYAN_MORNING))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", org.hamcrest.Matchers.startsWith("/api/brews/")))
                .andExpect(jsonPath("$.name").value("Kenyan Morning"))
                .andExpect(jsonPath("$.method.id").value(2))
                .andExpect(jsonPath("$.method.name").value("Pour Over"))
                .andExpect(jsonPath("$.method.iconKey").value("pour-over"))
                .andExpect(jsonPath("$.notes").value(nullValue()));

        mvc.perform(get("/api/brews"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalCount").value(1));
    }

    @Test
    @DisplayName("name and notes are trimmed before they are stored and returned")
    void textIsTrimmedOnCreate() throws Exception {
        String body = """
                {"name":"  Kenyan Morning ","beanName":"AA Kiambu","origin":"Kenya","methodId":2,
                 "roast":"LIGHT","rating":5,"brewDate":"2026-11-01","notes":"  Bright  "}""";

        mvc.perform(post("/api/brews").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Kenyan Morning"))
                .andExpect(jsonPath("$.notes").value("Bright"));

        String storedName = jdbc.queryForObject("SELECT name FROM brew", String.class);
        String storedNotes = jdbc.queryForObject("SELECT notes FROM brew", String.class);
        assertThat(storedName).isEqualTo("Kenyan Morning");
        assertThat(storedNotes).isEqualTo("Bright");
    }

    @Test
    @DisplayName("notes that are only spaces are stored as NULL")
    void blankNotesAreStoredAsNull() throws Exception {
        String body = """
                {"name":"Kenyan Morning","beanName":"AA Kiambu","origin":"Kenya","methodId":2,
                 "roast":"LIGHT","rating":5,"brewDate":"2026-11-01","notes":"   "}""";

        mvc.perform(post("/api/brews").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated());

        String storedNotes = jdbc.queryForObject("SELECT notes FROM brew", String.class);
        assertThat(storedNotes).isNull();
    }
}
