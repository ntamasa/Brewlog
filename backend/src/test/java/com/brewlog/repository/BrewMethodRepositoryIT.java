package com.brewlog.repository;

import static org.assertj.core.api.Assertions.assertThat;

import com.brewlog.entity.BrewMethod;
import com.brewlog.support.IntegrationTest;
import com.brewlog.support.TestData;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

class BrewMethodRepositoryIT extends IntegrationTest {

    @Autowired
    private BrewMethodRepository methods;

    @Test
    @DisplayName("returns every method with its brew count, Espresso and Pour Over counted")
    void countsBrewsPerSeededMethod() {
        TestData.brew("Morning Pour").method(2).insert(jdbc);
        TestData.brew("Afternoon Pour").method(2).insert(jdbc);
        TestData.brew("Double Shot").method(1).insert(jdbc);

        List<MethodWithCount> rows = methods.findAllWithBrewCount();

        assertThat(rows).hasSize(7);
        assertThat(countsByName(rows))
                .isEqualTo(Map.of(
                        "Espresso", 1L,
                        "Pour Over", 2L,
                        "French Press", 0L,
                        "AeroPress", 0L,
                        "Moka Pot", 0L,
                        "Cold Brew", 0L,
                        "Other", 0L));
    }

    @Test
    @DisplayName("each row carries the whole method: id, name, icon key, flags and position")
    void rowsCarryTheWholeMethod() {
        TestData.brew("Morning Pour").method(2).insert(jdbc);
        TestData.brew("Afternoon Pour").method(2).insert(jdbc);
        TestData.brew("Double Shot").method(1).insert(jdbc);

        List<MethodWithCount> rows = methods.findAllWithBrewCount();

        assertThat(rows).hasSize(7);
        BrewMethod pourOver = rowNamed(rows, "Pour Over").getMethod();
        assertThat(pourOver.getId()).isEqualTo(2L);
        assertThat(pourOver.getIconKey()).isEqualTo("pour-over");
        assertThat(pourOver.isPredefined()).isTrue();
        assertThat(pourOver.isProtected()).isFalse();
        assertThat(pourOver.getPosition()).isEqualTo(2);

        BrewMethod other = rowNamed(rows, "Other").getMethod();
        assertThat(other.getId()).isEqualTo(7L);
        assertThat(other.getIconKey()).isEqualTo("cup");
        assertThat(other.isPredefined()).isTrue();
        assertThat(other.isProtected()).isTrue();
        assertThat(other.getPosition()).isEqualTo(99);
    }

    @Test
    @DisplayName("with no brews, every seeded method is still listed, each with count 0")
    void methodsWithoutBrewsAreNotDropped() {
        List<MethodWithCount> rows = methods.findAllWithBrewCount();

        assertThat(rows).hasSize(7);
        assertThat(rows).extracting(MethodWithCount::getBrewCount).containsOnly(0L);
    }

    @Test
    @DisplayName("a custom method without brews is listed with count 0, not predefined, null position")
    void customMethodWithoutBrewsIsListed() {
        jdbc.update("INSERT INTO brew_method (name, icon_key, predefined, is_protected, position)"
                + " VALUES ('Chemex', 'cup', false, false, NULL)");
        TestData.brew("Morning Pour").method(2).insert(jdbc);

        List<MethodWithCount> rows = methods.findAllWithBrewCount();

        assertThat(rows).hasSize(8);
        assertThat(countsByName(rows))
                .isEqualTo(Map.of(
                        "Espresso", 0L,
                        "Pour Over", 1L,
                        "French Press", 0L,
                        "AeroPress", 0L,
                        "Moka Pot", 0L,
                        "Cold Brew", 0L,
                        "Other", 0L,
                        "Chemex", 0L));
        BrewMethod chemex = rowNamed(rows, "Chemex").getMethod();
        assertThat(chemex.isPredefined()).isFalse();
        assertThat(chemex.getPosition()).isNull();
    }

    private static Map<String, Long> countsByName(List<MethodWithCount> rows) {
        return rows.stream().collect(Collectors.toMap(row -> row.getMethod().getName(), MethodWithCount::getBrewCount));
    }

    private static MethodWithCount rowNamed(List<MethodWithCount> rows, String name) {
        return rows.stream()
                .filter(row -> row.getMethod().getName().equals(name))
                .findFirst()
                .orElseThrow(() -> new AssertionError("no row named " + name));
    }
}
