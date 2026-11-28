package com.brewlog;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.brewlog.support.IntegrationTest;
import com.brewlog.support.TestData;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class BrewSortIT extends IntegrationTest {

    @Test
    @DisplayName("without a sort param the list is in Newest order: B, A, C")
    void newestIsTheDefault() throws Exception {
        insertABC();

        mvc.perform(get("/api/brews"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].name").value("B"))
                .andExpect(jsonPath("$.items[1].name").value("A"))
                .andExpect(jsonPath("$.items[2].name").value("C"));
    }

    @Test
    @DisplayName("sort=NEWEST lists the newest brew date first, then the latest added: B, A, C")
    void newestFirst() throws Exception {
        insertABC();

        mvc.perform(get("/api/brews").param("sort", "NEWEST"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].name").value("B"))
                .andExpect(jsonPath("$.items[1].name").value("A"))
                .andExpect(jsonPath("$.items[2].name").value("C"));
    }

    @Test
    @DisplayName("sort=OLDEST lists the oldest brew date first, then the earliest added: C, A, B")
    void oldestFirst() throws Exception {
        insertABC();

        mvc.perform(get("/api/brews").param("sort", "OLDEST"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].name").value("C"))
                .andExpect(jsonPath("$.items[1].name").value("A"))
                .andExpect(jsonPath("$.items[2].name").value("B"));
    }

    @Test
    @DisplayName("sort=HIGHEST lists the highest rating first, then the newest date: C, B, A")
    void highestRatedFirst() throws Exception {
        insertABC();

        mvc.perform(get("/api/brews").param("sort", "HIGHEST"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].name").value("C"))
                .andExpect(jsonPath("$.items[1].name").value("B"))
                .andExpect(jsonPath("$.items[2].name").value("A"));
    }

    @Test
    @DisplayName("sort=LOWEST lists the lowest rating first, then the newest date: B, A, C")
    void lowestRatedFirst() throws Exception {
        insertABC();

        mvc.perform(get("/api/brews").param("sort", "LOWEST"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].name").value("B"))
                .andExpect(jsonPath("$.items[1].name").value("A"))
                .andExpect(jsonPath("$.items[2].name").value("C"));
    }

    @Test
    @DisplayName("brews equal in every sort field keep the same order on every call: the higher id first")
    void equalBrewsKeepTheSameOrderOnEveryCall() throws Exception {
        TestData.brew("A")
                .rating(4)
                .date("2026-11-01")
                .createdAt("2026-11-01T08:00:00Z")
                .insert(jdbc);
        TestData.brew("B")
                .rating(4)
                .date("2026-11-01")
                .createdAt("2026-11-01T08:00:00Z")
                .insert(jdbc);

        for (int call = 0; call < 2; call++) {
            mvc.perform(get("/api/brews").param("sort", "NEWEST"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.items[0].name").value("B"))
                    .andExpect(jsonPath("$.items[1].name").value("A"));
        }
    }

    @Test
    @DisplayName("an unknown sort is rejected with 400 INVALID on sort, and no brews are listed")
    void unknownSortIsRejected() throws Exception {
        insertABC();

        mvc.perform(get("/api/brews").param("sort", "FOO"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors", hasSize(1)))
                .andExpect(jsonPath("$.errors[0].field").value("sort"))
                .andExpect(jsonPath("$.errors[0].code").value("INVALID"))
                .andExpect(jsonPath("$.items").doesNotExist());
    }

    @Test
    @DisplayName("a lower case sort is rejected with 400 INVALID on sort: sort keys are case-sensitive")
    void lowerCaseSortIsRejected() throws Exception {
        insertABC();

        mvc.perform(get("/api/brews").param("sort", "newest"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors", hasSize(1)))
                .andExpect(jsonPath("$.errors[0].field").value("sort"))
                .andExpect(jsonPath("$.errors[0].code").value("INVALID"));
    }

    @Test
    @DisplayName("an empty sort lists in Newest order")
    void emptySortListsNewestFirst() throws Exception {
        insertABC();

        mvc.perform(get("/api/brews").param("sort", ""))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].name").value("B"))
                .andExpect(jsonPath("$.items[1].name").value("A"))
                .andExpect(jsonPath("$.items[2].name").value("C"));
    }

    private void insertABC() {
        TestData.brew("A")
                .rating(4)
                .date("2026-11-01")
                .createdAt("2026-11-01T08:00:00Z")
                .insert(jdbc);
        TestData.brew("B")
                .rating(4)
                .date("2026-11-01")
                .createdAt("2026-11-01T09:00:00Z")
                .insert(jdbc);
        TestData.brew("C")
                .rating(5)
                .date("2026-10-30")
                .createdAt("2026-10-30T08:00:00Z")
                .insert(jdbc);
    }
}
