package com.brewlog.exception;

import static org.assertj.core.api.Assertions.assertThat;

import com.brewlog.dto.FieldErrorDto;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;

@ExtendWith(OutputCaptureExtension.class)
class ApiExceptionHandlerTest {

    private static final String UNEXPECTED_MESSAGE =
            "insert or update on table \"brew\" violates foreign key constraint \"brew_method_id_fkey\"";

    private final ApiExceptionHandler handler = new ApiExceptionHandler();

    @Test
    @DisplayName("an unexpected integrity error is logged at error level with its exception")
    void unexpectedIntegrityErrorIsLogged(CapturedOutput output) {
        handler.handleDataIntegrity(new DataIntegrityViolationException(UNEXPECTED_MESSAGE));

        assertThat(output).contains("Unexpected data integrity violation", "brew_method_id_fkey", "ERROR");
    }

    @Test
    @DisplayName("an unexpected integrity error is answered with a bare 500 and nothing from the exception")
    void unexpectedIntegrityErrorIsAnsweredBare() {
        ProblemDetail problem = handler.handleDataIntegrity(new DataIntegrityViolationException(UNEXPECTED_MESSAGE));

        assertThat(problem.getStatus()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR.value());
        assertThat(problem.getDetail()).isNull();
        assertThat(problem.getProperties()).isNullOrEmpty();
    }

    @Test
    @DisplayName("a duplicate brew name is answered DUPLICATE on name and is not logged as unexpected")
    void duplicateBrewNameIsNotLoggedAsUnexpected(CapturedOutput output) {
        ProblemDetail problem = handler.handleDataIntegrity(
                new DataIntegrityViolationException("duplicate key value violates unique constraint \"ux_brew_name\""));

        assertThat(problem.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST.value());
        assertThat(problem.getProperties())
                .containsEntry("errors", List.of(new FieldErrorDto("name", ErrorCode.DUPLICATE)));
        assertThat(output).doesNotContain("Unexpected data integrity violation");
    }

    @Test
    @DisplayName("a duplicate method name is answered DUPLICATE on name and is not logged as unexpected")
    void duplicateMethodNameIsNotLoggedAsUnexpected(CapturedOutput output) {
        ProblemDetail problem = handler.handleDataIntegrity(new DataIntegrityViolationException(
                "duplicate key value violates unique constraint \"ux_brew_method_name\""));

        assertThat(problem.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST.value());
        assertThat(problem.getProperties())
                .containsEntry("errors", List.of(new FieldErrorDto("name", ErrorCode.DUPLICATE)));
        assertThat(output).doesNotContain("Unexpected data integrity violation");
    }
}
