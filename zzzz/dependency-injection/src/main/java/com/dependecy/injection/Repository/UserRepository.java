package com.dependecy.injection.Repository;

import com.dependecy.injection.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}