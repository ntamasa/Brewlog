package com.brewlog.repository;

import com.brewlog.entity.BrewMethod;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface BrewMethodRepository extends JpaRepository<BrewMethod, Long> {

    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);

    List<BrewMethod> findByIsProtectedTrue();

    @Query("select m as method, count(b) as brewCount from BrewMethod m left join Brew b on b.method = m group by m")
    List<MethodWithCount> findAllWithBrewCount();
}
