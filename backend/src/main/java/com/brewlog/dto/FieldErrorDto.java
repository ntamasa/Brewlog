package com.brewlog.dto;

import com.brewlog.exception.ErrorCode;

public record FieldErrorDto(String field, ErrorCode code) {}
