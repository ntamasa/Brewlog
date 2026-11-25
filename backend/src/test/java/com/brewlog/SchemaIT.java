package com.brewlog;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowable;

import com.brewlog.support.IntegrationTest;
import java.sql.SQLException;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;

class SchemaIT extends IntegrationTest {

    private static final String INSERT_VALID_BREW =
            "INSERT INTO brew (name, bean_name, origin, method_id, roast, rating, brew_date)"
                    + " VALUES ('%s', 'Test Bean', 'Test Origin', 1, '%s', %d, DATE '2026-11-01')";

    @Test
    void resetRestoresTheSeedWithIdsOneToSeven() throws Exception {
        jdbc.update("INSERT INTO brew_method (name, icon_key, predefined, is_protected, position)"
                + " VALUES ('Siphon', 'cup', false, false, NULL)");
        jdbc.update("INSERT INTO brew (name, bean_name, origin, method_id, roast, rating, brew_date)"
                + " SELECT 'Kenyan Morning', 'Test Bean', 'Test Origin', id, 'LIGHT', 5, DATE '2026-11-01'"
                + " FROM brew_method WHERE name = 'Siphon'");
        assertThat(countMethods()).isEqualTo(8);
        assertThat(countBrews()).isEqualTo(1);

        resetDatabase();

        assertThat(countBrews()).isZero();
        List<List<Object>> rows = jdbc.query(
                "SELECT id, name FROM brew_method ORDER BY id",
                (rs, rowNum) -> row(rs.getLong("id"), rs.getString("name")));
        assertThat(rows)
                .containsExactly(
                        row(1L, "Espresso"),
                        row(2L, "Pour Over"),
                        row(3L, "French Press"),
                        row(4L, "AeroPress"),
                        row(5L, "Moka Pot"),
                        row(6L, "Cold Brew"),
                        row(7L, "Other"));
    }

    @Test
    void seedsTheSevenPredefinedMethodsInOrder() {
        List<List<Object>> rows = jdbc.query(
                "SELECT name, icon_key, predefined, is_protected, position FROM brew_method ORDER BY id",
                (rs, rowNum) -> row(
                        rs.getString("name"),
                        rs.getString("icon_key"),
                        rs.getBoolean("predefined"),
                        rs.getBoolean("is_protected"),
                        rs.getInt("position")));

        assertThat(rows)
                .containsExactly(
                        row("Espresso", "espresso", true, false, 1),
                        row("Pour Over", "pour-over", true, false, 2),
                        row("French Press", "french-press", true, false, 3),
                        row("AeroPress", "aeropress", true, false, 4),
                        row("Moka Pot", "moka-pot", true, false, 5),
                        row("Cold Brew", "cold-brew", true, false, 6),
                        row("Other", "cup", true, true, 99));
    }

    @Test
    void storesCreatedAtWhenItIsNotGiven() {
        jdbc.update(String.format(INSERT_VALID_BREW, "Kenyan Morning", "LIGHT", 5));

        Boolean hasCreatedAt = jdbc.queryForObject("SELECT created_at IS NOT NULL FROM brew", Boolean.class);

        assertThat(hasCreatedAt).isTrue();
    }

    @Test
    void rejectsADuplicateMethodNameIgnoringCase() {
        Throwable thrown = catchThrowable(
                () -> jdbc.update("INSERT INTO brew_method (name, icon_key, predefined, is_protected, position)"
                        + " VALUES ('espresso', 'espresso', true, false, 20)"));

        assertThat(thrown).isInstanceOf(DataIntegrityViolationException.class);
        assertThat(thrown.getMessage()).contains("ux_brew_method_name");
        assertThat(countMethods()).isEqualTo(7);
    }

    @Test
    void rejectsADuplicateBrewNameIgnoringCase() {
        jdbc.update(String.format(INSERT_VALID_BREW, "Kenyan Morning", "LIGHT", 5));

        Throwable thrown =
                catchThrowable(() -> jdbc.update(String.format(INSERT_VALID_BREW, "KENYAN MORNING", "LIGHT", 5)));

        assertThat(thrown).isInstanceOf(DataIntegrityViolationException.class);
        assertThat(thrown.getMessage()).contains("ux_brew_name");
    }

    @Test
    void rejectsARatingAboveFive() {
        Throwable thrown = catchThrowable(() -> jdbc.update(String.format(INSERT_VALID_BREW, "Too High", "LIGHT", 6)));

        assertThat(thrown).isInstanceOf(DataIntegrityViolationException.class);
        assertThat(thrown.getMessage()).contains("brew_rating_check");
        assertThat(countBrews()).isZero();
    }

    @Test
    void rejectsARatingBelowOne() {
        Throwable thrown = catchThrowable(() -> jdbc.update(String.format(INSERT_VALID_BREW, "Too Low", "LIGHT", 0)));

        assertThat(thrown).isInstanceOf(DataIntegrityViolationException.class);
        assertThat(thrown.getMessage()).contains("brew_rating_check");
        assertThat(countBrews()).isZero();
    }

    @Test
    void rejectsAnUnknownRoast() {
        Throwable thrown = catchThrowable(() -> jdbc.update(String.format(INSERT_VALID_BREW, "Bold Brew", "BOLD", 5)));

        assertThat(thrown).isInstanceOf(DataIntegrityViolationException.class);
        assertThat(thrown.getMessage()).contains("brew_roast_check");
        assertThat(countBrews()).isZero();
    }

    @Test
    void rejectsAnExplicitIdForBrewMethod() {
        Throwable thrown = catchThrowable(
                () -> jdbc.update("INSERT INTO brew_method (id, name, icon_key, predefined, is_protected, position)"
                        + " VALUES (100, 'Siphon', 'siphon', true, false, 20)"));

        assertThat(sqlState(thrown)).isEqualTo("428C9");
        assertThat(countMethods()).isEqualTo(7);
    }

    @Test
    void rejectsAnExplicitIdForBrew() {
        Throwable thrown = catchThrowable(
                () -> jdbc.update("INSERT INTO brew (id, name, bean_name, origin, method_id, roast, rating, brew_date)"
                        + " VALUES (100, 'Explicit Id', 'Test Bean', 'Test Origin', 1, 'LIGHT', 5,"
                        + " DATE '2026-11-01')"));

        assertThat(sqlState(thrown)).isEqualTo("428C9");
        assertThat(countBrews()).isZero();
    }

    private Integer countMethods() {
        return jdbc.queryForObject("SELECT count(*) FROM brew_method", Integer.class);
    }

    private Integer countBrews() {
        return jdbc.queryForObject("SELECT count(*) FROM brew", Integer.class);
    }

    private static String sqlState(Throwable thrown) {
        assertThat(thrown).isNotNull();
        Throwable cause = thrown;
        while (cause.getCause() != null) {
            cause = cause.getCause();
        }
        assertThat(cause).isInstanceOf(SQLException.class);
        return ((SQLException) cause).getSQLState();
    }

    private static List<Object> row(Object... values) {
        return List.of(values);
    }
}
