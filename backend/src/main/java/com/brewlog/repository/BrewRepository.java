package com.brewlog.repository;

import com.brewlog.entity.Brew;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface BrewRepository extends JpaRepository<Brew, Long>, JpaSpecificationExecutor<Brew> {

    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);

    List<Brew> findByMethodId(long methodId);

    long countByMethodId(long methodId);
}
