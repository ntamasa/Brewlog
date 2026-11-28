package com.brewlog.service;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class BrewSpecificationsTest {

    @Test
    @DisplayName("escape puts a backslash before each backslash, percent sign and underscore")
    void escapesLikeWildcardsAndTheEscapeCharacter() {
        assertThat(BrewSpecifications.escape("50%_\\x")).isEqualTo("50\\%\\_\\\\x");
    }
}
