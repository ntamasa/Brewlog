package com.brewlog;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.brewlog.support.IntegrationTest;
import com.brewlog.support.TestData;
import java.time.LocalDate;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class BrewListIT extends IntegrationTest {

    @Test
    @DisplayName("lists the first page of 12 brews, newest first, with the page totals")
    void firstPageHoldsTwelveNewestBrews() throws Exception {
        insertNumberedBrews(41);

        mvc.perform(get("/api/brews"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items", hasSize(12)))
                .andExpect(jsonPath("$.items[0].name").value("Brew 41"))
                .andExpect(jsonPath("$.items[11].name").value("Brew 30"))
                .andExpect(jsonPath("$.page").value(1))
                .andExpect(jsonPath("$.totalPages").value(4))
                .andExpect(jsonPath("$.matchingCount").value(41))
                .andExpect(jsonPath("$.totalCount").value(41));
    }

    @Test
    @DisplayName("the last page holds the 5 oldest brews, latest of them first")
    void lastPageHoldsTheFiveOldestBrews() throws Exception {
        insertNumberedBrews(41);

        mvc.perform(get("/api/brews").param("page", "4"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items", hasSize(5)))
                .andExpect(jsonPath("$.items[0].name").value("Brew 05"))
                .andExpect(jsonPath("$.items[4].name").value("Brew 01"))
                .andExpect(jsonPath("$.page").value(4))
                .andExpect(jsonPath("$.totalPages").value(4));
    }

    @Test
    @DisplayName("a brew is listed with its method, bean, origin, roast, rating, date and notes")
    void brewItemHasTheDocumentedShape() throws Exception {
        long id = TestData.brew("Kenyan Morning")
                .bean("AA Kiambu")
                .origin("Kenya")
                .method(2)
                .roast("LIGHT")
                .rating(5)
                .date("2026-10-28")
                .notes("Bright")
                .insert(jdbc);

        mvc.perform(get("/api/brews"))
                .andExpect(status().isOk())
                .andExpect(content().json(singleBrewPage(id, "\"Bright\""), true));
    }

    @Test
    @DisplayName("of two brews on the same date, the one added later is listed first")
    void sameDateBrewAddedLaterComesFirst() throws Exception {
        TestData.brew("Added first")
                .date("2026-11-01")
                .createdAt("2026-11-01T10:00:00Z")
                .insert(jdbc);
        TestData.brew("Added second")
                .date("2026-11-01")
                .createdAt("2026-11-01T11:00:00Z")
                .insert(jdbc);

        mvc.perform(get("/api/brews"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items", hasSize(2)))
                .andExpect(jsonPath("$.items[0].name").value("Added second"))
                .andExpect(jsonPath("$.items[1].name").value("Added first"));
    }

    @Test
    @DisplayName("an empty journal lists no brews and counts zero")
    void emptyJournalListsNothing() throws Exception {
        mvc.perform(get("/api/brews"))
                .andExpect(status().isOk())
                .andExpect(content()
                        .json("{\"items\":[],\"page\":1,\"totalPages\":0,\"matchingCount\":0,\"totalCount\":0}", true));
    }

    @Test
    @DisplayName("a brew without tasting notes is listed with notes null")
    void brewWithoutNotesHasNullNotes() throws Exception {
        long id = TestData.brew("Kenyan Morning")
                .method(2)
                .roast("LIGHT")
                .rating(5)
                .date("2026-10-28")
                .notes(null)
                .insert(jdbc);

        mvc.perform(get("/api/brews"))
                .andExpect(status().isOk())
                .andExpect(content().json(singleBrewPage(id, "null"), true));
    }

    private void insertNumberedBrews(int count) {
        LocalDate first = LocalDate.parse("2026-09-01");
        for (int i = 1; i <= count; i++) {
            TestData.brew(String.format("Brew %02d", i))
                    .date(first.plusDays(i).toString())
                    .insert(jdbc);
        }
    }

    private static String singleBrewPage(long id, String notesJson) {
        return "{\"items\":[{"
                + "\"id\":" + id + ","
                + "\"name\":\"Kenyan Morning\","
                + "\"beanName\":\"AA Kiambu\","
                + "\"origin\":\"Kenya\","
                + "\"method\":{\"id\":2,\"name\":\"Pour Over\",\"iconKey\":\"pour-over\"},"
                + "\"roast\":\"LIGHT\","
                + "\"rating\":5,"
                + "\"brewDate\":\"2026-10-28\","
                + "\"notes\":" + notesJson
                + "}],\"page\":1,\"totalPages\":1,\"matchingCount\":1,\"totalCount\":1}";
    }
}
