package com.brewlog.exception;

import com.brewlog.dto.FieldErrorDto;
import java.util.List;

public class ValidationException extends RuntimeException {

    private final List<FieldErrorDto> errors;

    public ValidationException(List<FieldErrorDto> errors) {
        super("Brew is invalid");
        this.errors = errors;
    }

    public List<FieldErrorDto> errors() {
        return errors;
    }
}
