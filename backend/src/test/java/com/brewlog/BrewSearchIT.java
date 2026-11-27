package com.brewlog;

import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.Matchers.empty;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.brewlog.support.IntegrationTest;
import com.brewlog.support.TestData;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class BrewSearchIT extends IntegrationTest {

    @Test
    @DisplayName("a search is trimmed and matches names containing it, ignoring case")
    void searchIsTrimmedAndIgnoresCase() throws Exception {
        insertSearchBrews();

        mvc.perform(get("/api/brews").param("q", "  kenya "))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items", hasSize(2)))
                .andExpect(jsonPath("$.items[*].name", containsInAnyOrder("Kenyan Morning", "KENYA AA Batch")))
                .andExpect(jsonPath("$.matchingCount").value(2))
                .andExpect(jsonPath("$.totalCount").value(7));
    }

    @Test
    @DisplayName("a % in the search matches a literal percent sign")
    void percentMatchesLiterally() throws Exception {
        insertSearchBrews();

        mvc.perform(get("/api/brews").param("q", "50%"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items", hasSize(1)))
                .andExpect(jsonPath("$.items[0].name").value("50% Blend"));
    }

    @Test
    @DisplayName("a _ in the search matches a literal underscore")
    void underscoreMatchesLiterally() throws Exception {
        insertSearchBrews();

        mvc.perform(get("/api/brews").param("q", "a_b"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items", hasSize(1)))
                .andExpect(jsonPath("$.items[0].name").value("a_b"));
    }

    @Test
    @DisplayName("a search of only spaces applies no search")
    void blankSearchListsEverything() throws Exception {
        insertSearchBrews();

        mvc.perform(get("/api/brews").param("q", "   "))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items", hasSize(7)))
                .andExpect(jsonPath("$.matchingCount").value(7));
    }

    @Test
    @DisplayName("a search that matches nothing lists no brews and has zero pages")
    void searchWithNoMatchListsNothing() throws Exception {
        insertSearchBrews();

        mvc.perform(get("/api/brews").param("q", "panama natural"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items", empty()))
                .andExpect(jsonPath("$.matchingCount").value(0))
                .andExpect(jsonPath("$.totalCount").value(7))
                .andExpect(jsonPath("$.totalPages").value(0));
    }

    private void insertSearchBrews() {
        TestData.brew("Kenyan Morning").date("2026-11-01").insert(jdbc);
        TestData.brew("KENYA AA Batch").date("2026-10-31").insert(jdbc);
        TestData.brew("Sunday Moka").date("2026-10-30").insert(jdbc);
        TestData.brew("50% Blend").date("2026-10-29").insert(jdbc);
        TestData.brew("50 Percent").date("2026-10-28").insert(jdbc);
        TestData.brew("a_b").date("2026-10-27").insert(jdbc);
        TestData.brew("axb").date("2026-10-26").insert(jdbc);
    }
}
