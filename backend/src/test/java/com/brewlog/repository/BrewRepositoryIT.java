package com.brewlog.repository;

import static org.assertj.core.api.Assertions.assertThat;

import com.brewlog.dto.SortKey;
import com.brewlog.entity.Brew;
import com.brewlog.service.BrewSort;
import com.brewlog.support.IntegrationTest;
import com.brewlog.support.TestData;
import java.time.LocalDate;
import java.util.List;
import java.util.function.Function;
import org.hibernate.Hibernate;
import org.hibernate.stat.Statistics;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

class BrewRepositoryIT extends IntegrationTest {

    @Autowired
    private BrewRepository brews;

    @Autowired
    private PlatformTransactionManager transactionManager;

    private record Listed(List<String> rows, long totalElements, long statements) {}

    @Test
    @DisplayName("a page of brews loads their methods in one statement")
    void pageLoadsMethodsInOneStatement() {
        insertThreeBrews();

        Listed listed = list(r -> r.findAll(PageRequest.of(0, 12, BrewSort.toSort(SortKey.NEWEST))));

        assertThat(listed.rows())
                .containsExactly(
                        "Double Shot | Espresso | espresso",
                        "Morning Pour | Pour Over | pour-over",
                        "Sunday Press | French Press | french-press");
        assertThat(listed.totalElements()).isEqualTo(3);
        assertThat(listed.statements()).isEqualTo(1);
    }

    @Test
    @DisplayName("a filtered page of brews loads their methods in one statement")
    void filteredPageLoadsMethodsInOneStatement() {
        insertThreeBrews();
        Specification<Brew> notSundayPress = (root, query, cb) -> cb.notEqual(root.get("name"), "Sunday Press");

        Listed listed = list(r -> r.findAll(notSundayPress, PageRequest.of(0, 12, BrewSort.toSort(SortKey.NEWEST))));

        assertThat(listed.rows())
                .containsExactly("Double Shot | Espresso | espresso", "Morning Pour | Pour Over | pour-over");
        assertThat(listed.totalElements()).isEqualTo(2);
        assertThat(listed.statements()).isEqualTo(1);
    }

    @Test
    @DisplayName("an empty journal costs one statement and lists no brews")
    void emptyJournalCostsOneStatement() {
        Listed listed = list(r -> r.findAll(PageRequest.of(0, 12, BrewSort.toSort(SortKey.NEWEST))));

        assertThat(listed.rows()).isEmpty();
        assertThat(listed.totalElements()).isZero();
        assertThat(listed.statements()).isEqualTo(1);
    }

    @Test
    @DisplayName("a full page loads its methods with one statement and counts with one more, never one per method")
    void fullPageCostsPageAndCountOnly() {
        LocalDate first = LocalDate.parse("2026-09-01");
        for (int i = 1; i <= 13; i++) {
            TestData.brew(String.format("Brew %02d", i))
                    .method(((i - 1) % 7) + 1)
                    .date(first.plusDays(i).toString())
                    .insert(jdbc);
        }

        Listed listed = list(r -> r.findAll(PageRequest.of(0, 12, BrewSort.toSort(SortKey.NEWEST))));

        assertThat(listed.rows()).hasSize(12);
        assertThat(listed.rows().getFirst()).isEqualTo("Brew 13 | Cold Brew | cold-brew");
        assertThat(listed.rows().getLast()).isEqualTo("Brew 02 | Pour Over | pour-over");
        assertThat(listed.rows().stream()
                        .map(row -> row.split(" \\| ")[1])
                        .distinct()
                        .toList())
                .containsExactlyInAnyOrder(
                        "Espresso", "Pour Over", "French Press", "AeroPress", "Moka Pot", "Cold Brew", "Other");
        assertThat(listed.totalElements()).isEqualTo(13);
        assertThat(listed.statements()).isEqualTo(2);
    }

    @Test
    @DisplayName("a brew read outside a transaction leaves its method unloaded")
    void brewReadLeavesMethodLazy() {
        long id = TestData.brew("Morning Pour").method(2).date("2026-10-02").insert(jdbc);

        Brew brew = brews.findById(id).orElseThrow();

        assertThat(Hibernate.isInitialized(brew.getMethod())).isFalse();
    }

    private void insertThreeBrews() {
        TestData.brew("Double Shot").method(1).date("2026-10-03").insert(jdbc);
        TestData.brew("Morning Pour").method(2).date("2026-10-02").insert(jdbc);
        TestData.brew("Sunday Press").method(3).date("2026-10-01").insert(jdbc);
    }

    private Listed list(Function<BrewRepository, Page<Brew>> query) {
        Statistics stats = hibernateStatistics();
        return new TransactionTemplate(transactionManager).execute(status -> {
            stats.clear();
            Page<Brew> page = query.apply(brews);
            List<String> rows = page.getContent().stream()
                    .map(b -> b.getName() + " | " + b.getMethod().getName() + " | "
                            + b.getMethod().getIconKey())
                    .toList();
            return new Listed(rows, page.getTotalElements(), stats.getPrepareStatementCount());
        });
    }
}
