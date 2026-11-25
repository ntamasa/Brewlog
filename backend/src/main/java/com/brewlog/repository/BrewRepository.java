package com.brewlog.repository;

import com.brewlog.entity.Brew;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface BrewRepository extends JpaRepository<Brew, Long>, JpaSpecificationExecutor<Brew> {

    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);

    List<Brew> findByMethodId(long methodId);

    long countByMethodId(long methodId);

    @Override
    @EntityGraph(attributePaths = "method")
    Page<Brew> findAll(Pageable pageable);

    @Override
    @EntityGraph(attributePaths = "method")
    Page<Brew> findAll(Specification<Brew> spec, Pageable pageable);
}
