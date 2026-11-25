package com.brewlog.repository;

import com.brewlog.entity.BrewMethod;

public interface MethodWithCount {

    BrewMethod getMethod();

    long getBrewCount();
}
