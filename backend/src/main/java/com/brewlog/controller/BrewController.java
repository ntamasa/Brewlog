package com.brewlog.controller;

import com.brewlog.dto.BrewPage;
import com.brewlog.dto.BrewResponse;
import com.brewlog.service.BrewService;
import java.net.URI;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tools.jackson.databind.node.ObjectNode;

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

    @PostMapping
    public ResponseEntity<BrewResponse> create(@RequestBody ObjectNode body) {
        BrewResponse created = brewService.create(body);
        return ResponseEntity.created(URI.create("/api/brews/" + created.id())).body(created);
    }
}
