package com.brewlog.service;

import com.brewlog.dto.BrewPage;
import com.brewlog.dto.BrewQuery;
import com.brewlog.dto.BrewResponse;
import com.brewlog.dto.MethodRef;
import com.brewlog.entity.Brew;
import com.brewlog.repository.BrewRepository;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BrewService {

    static final int PAGE_SIZE = 12;

    private final BrewRepository brewRepository;

    public BrewService(BrewRepository brewRepository) {
        this.brewRepository = brewRepository;
    }

    @Transactional(readOnly = true)
    public BrewPage list(BrewQuery query) {
        Page<Brew> page =
                brewRepository.findAll(PageRequest.of(query.page() - 1, PAGE_SIZE, BrewSort.toSort(query.sort())));
        List<BrewResponse> items =
                page.getContent().stream().map(BrewService::toResponse).toList();
        return new BrewPage(items, query.page(), page.getTotalPages(), page.getTotalElements(), brewRepository.count());
    }

    private static BrewResponse toResponse(Brew brew) {
        MethodRef method = new MethodRef(
                brew.getMethod().getId(),
                brew.getMethod().getName(),
                brew.getMethod().getIconKey());
        return new BrewResponse(
                brew.getId(),
                brew.getName(),
                brew.getBeanName(),
                brew.getOrigin(),
                method,
                brew.getRoast(),
                brew.getRating(),
                brew.getBrewDate(),
                brew.getNotes());
    }
}
