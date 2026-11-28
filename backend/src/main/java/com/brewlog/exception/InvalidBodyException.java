package com.brewlog.exception;

public class InvalidBodyException extends RuntimeException {

    private final String field;

    public InvalidBodyException(String field) {
        super("Invalid brew body field: " + field);
        this.field = field;
    }

    public String field() {
        return field;
    }
}
