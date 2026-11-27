package com.brewlog;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.brewlog.support.IntegrationTest;
import com.brewlog.support.TestData;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class MethodListIT extends IntegrationTest {

    @Test
    @DisplayName("lists the seeded methods A-Z with Other last, and the AeroPress entry has its documented shape")
    void seededMethodsAreListedInOrder() throws Exception {
        mvc.perform(get("/api/methods"))
                .andExpect(status().isOk())
                .andExpect(jsonPath(
                        "$[*].name",
                        contains(
                                "AeroPress",
                                "Cold Brew",
                                "Espresso",
                                "French Press",
                                "Moka Pot",
                                "Pour Over",
                                "Other")))
                .andExpect(jsonPath("$[0].id").value(4))
                .andExpect(jsonPath("$[0].name").value("AeroPress"))
                .andExpect(jsonPath("$[0].iconKey").value("aeropress"))
                .andExpect(jsonPath("$[0].predefined").value(true))
                .andExpect(jsonPath("$[0].protected").value(false))
                .andExpect(jsonPath("$[0].position").value(4))
                .andExpect(jsonPath("$[0].brewCount").value(0))
                .andExpect(jsonPath("$[6].protected").value(true))
                .andExpect(jsonPath("$[6].position").value(99))
                .andExpect(jsonPath("$[6].iconKey").value("cup"));
    }

    @Test
    @DisplayName("each method carries the number of brews that use it, 0 when none")
    void brewCountsArePerMethod() throws Exception {
        TestData.brew("Kenyan Morning").method(2).insert(jdbc);
        TestData.brew("Ethiopia Natural").method(2).insert(jdbc);
        TestData.brew("Brazil Espresso").method(1).insert(jdbc);

        mvc.perform(get("/api/methods"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].brewCount", contains(0, 0, 1, 0, 0, 2, 0)));
    }

    @Test
    @DisplayName("a custom method is placed A-Z among the predefined ones, with a null position")
    void customMethodIsSortedAmongPredefined() throws Exception {
        jdbc.update("INSERT INTO brew_method (name, icon_key, predefined, is_protected, position)"
                + " VALUES ('chemex', 'cup', false, false, null)");

        mvc.perform(get("/api/methods"))
                .andExpect(status().isOk())
                .andExpect(jsonPath(
                        "$[*].name",
                        contains(
                                "AeroPress",
                                "chemex",
                                "Cold Brew",
                                "Espresso",
                                "French Press",
                                "Moka Pot",
                                "Pour Over",
                                "Other")))
                .andExpect(jsonPath("$[1].position").value(nullValue()))
                .andExpect(jsonPath("$[1].predefined").value(false));
    }

    @Test
    @DisplayName("Other stays last even after a custom method that sorts after it alphabetically would")
    void otherStaysLastAfterCustomMethodZebra() throws Exception {
        jdbc.update("INSERT INTO brew_method (name, icon_key, predefined, is_protected, position)"
                + " VALUES ('zebra', 'cup', false, false, null)");

        mvc.perform(get("/api/methods"))
                .andExpect(status().isOk())
                .andExpect(jsonPath(
                        "$[*].name",
                        contains(
                                "AeroPress",
                                "Cold Brew",
                                "Espresso",
                                "French Press",
                                "Moka Pot",
                                "Pour Over",
                                "zebra",
                                "Other")))
                .andExpect(jsonPath("$[7].protected").value(true));
    }
}
