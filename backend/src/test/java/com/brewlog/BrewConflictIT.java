package com.brewlog;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.brewlog.support.IntegrationTest;
import com.brewlog.support.TestData;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

class BrewConflictIT extends IntegrationTest {

    private static String brewBody(String name, long methodId) {
        return brewBody(name, "Kenya", methodId);
    }

    private static String brewBody(String name, String origin, long methodId) {
        return """
                {"name":"%s","beanName":"AA Kiambu","origin":"%s","methodId":%d,
                 "roast":"LIGHT","rating":5,"brewDate":"2026-11-01","notes":""}""".formatted(name, origin, methodId);
    }

    @Test
    @DisplayName("a name that differs only in capitals from a saved brew is rejected with DUPLICATE on name")
    void duplicateNameIsRejectedAndNothingIsSaved() throws Exception {
        TestData.brew("Kenyan Morning").insert(jdbc);

        mvc.perform(post("/api/brews").contentType(MediaType.APPLICATION_JSON).content(brewBody("kenyan morning", 2L)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[0].field").value("name"))
                .andExpect(jsonPath("$.errors[0].code").value("DUPLICATE"))
                .andExpect(jsonPath("$.errors.length()").value(1));

        Integer rows = jdbc.queryForObject("SELECT count(*) FROM brew", Integer.class);
        assertThat(rows).isEqualTo(1);
    }

    @Test
    @DisplayName("a method deleted before the save is rejected with METHOD_NOT_FOUND on methodId and nothing is saved")
    void deletedMethodIsRejectedAndNothingIsSaved() throws Exception {
        long methodId = jdbc.queryForObject(
                "INSERT INTO brew_method (name, icon_key, predefined, is_protected, position)"
                        + " VALUES ('Kalita Wave', 'cup', false, false, NULL) RETURNING id",
                Long.class);
        jdbc.update("DELETE FROM brew_method WHERE id = ?", methodId);

        mvc.perform(post("/api/brews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(brewBody("Kenyan Morning", methodId)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[0].field").value("methodId"))
                .andExpect(jsonPath("$.errors[0].code").value("METHOD_NOT_FOUND"))
                .andExpect(jsonPath("$.errors.length()").value(1));

        Integer rows = jdbc.queryForObject("SELECT count(*) FROM brew", Integer.class);
        assertThat(rows).isZero();
    }

    @Test
    @DisplayName("a duplicate name with a deleted method is answered with DUPLICATE alone and nothing is saved")
    void duplicateNameIsAnsweredAloneWhenTheMethodIsAlsoGone() throws Exception {
        TestData.brew("Kenyan Morning").insert(jdbc);
        long methodId = jdbc.queryForObject(
                "INSERT INTO brew_method (name, icon_key, predefined, is_protected, position)"
                        + " VALUES ('Kalita Wave', 'cup', false, false, NULL) RETURNING id",
                Long.class);
        jdbc.update("DELETE FROM brew_method WHERE id = ?", methodId);

        mvc.perform(post("/api/brews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(brewBody("kenyan morning", methodId)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[0].field").value("name"))
                .andExpect(jsonPath("$.errors[0].code").value("DUPLICATE"))
                .andExpect(jsonPath("$.errors.length()").value(1));

        Integer rows = jdbc.queryForObject("SELECT count(*) FROM brew", Integer.class);
        assertThat(rows).isEqualTo(1);
    }

    @Test
    @DisplayName("a 101-character origin with a duplicate name and a deleted method is answered with TOO_LONG alone")
    void originErrorIsAnsweredAloneWhenTheNameAndMethodAreAlsoWrong() throws Exception {
        TestData.brew("Kenyan Morning").insert(jdbc);
        long methodId = jdbc.queryForObject(
                "INSERT INTO brew_method (name, icon_key, predefined, is_protected, position)"
                        + " VALUES ('Kalita Wave', 'cup', false, false, NULL) RETURNING id",
                Long.class);
        jdbc.update("DELETE FROM brew_method WHERE id = ?", methodId);

        mvc.perform(post("/api/brews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(brewBody("kenyan morning", "x".repeat(101), methodId)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[0].field").value("origin"))
                .andExpect(jsonPath("$.errors[0].code").value("TOO_LONG"))
                .andExpect(jsonPath("$.errors.length()").value(1));

        Integer rows = jdbc.queryForObject("SELECT count(*) FROM brew", Integer.class);
        assertThat(rows).isEqualTo(1);
    }

    @Test
    @DisplayName("two parallel saves of one name: one answers 201, the other 400 DUPLICATE, one row is stored")
    void parallelSavesOfOneNameLetOnlyOneThrough() throws Exception {
        CountDownLatch start = new CountDownLatch(1);
        ExecutorService pool = Executors.newFixedThreadPool(2);
        List<Future<MvcResult>> results = new ArrayList<>();
        try {
            for (int i = 0; i < 2; i++) {
                Callable<MvcResult> save = () -> {
                    start.await();
                    return mvc.perform(post("/api/brews")
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .content(brewBody("Parallel Brew", 2L)))
                            .andReturn();
                };
                results.add(pool.submit(save));
            }
            start.countDown();

            List<Integer> statuses = new ArrayList<>();
            List<String> rejectedBodies = new ArrayList<>();
            for (Future<MvcResult> result : results) {
                MvcResult answer = result.get();
                statuses.add(answer.getResponse().getStatus());
                if (answer.getResponse().getStatus() == 400) {
                    rejectedBodies.add(answer.getResponse().getContentAsString());
                }
            }
            assertThat(statuses).containsExactlyInAnyOrder(201, 400);
            assertThat(rejectedBodies).hasSize(1);
            assertThat(rejectedBodies.get(0)).contains("\"field\":\"name\"").contains("\"code\":\"DUPLICATE\"");
        } finally {
            pool.shutdownNow();
        }

        Integer rows = jdbc.queryForObject("SELECT count(*) FROM brew", Integer.class);
        assertThat(rows).isEqualTo(1);
    }
}
