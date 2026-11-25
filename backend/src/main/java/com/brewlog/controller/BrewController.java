package com.brewlog.controller;

import com.brewlog.dto.BrewPage;
import com.brewlog.service.BrewService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/brews")
public class BrewController {

    private final BrewService brewService;

    public BrewController(BrewService brewService) {
        this.brewService = brewService;
    }

    @GetMapping
    public BrewPage list(BrewQueryParams params) {
        return brewService.list(params.toQuery());
    }
}
