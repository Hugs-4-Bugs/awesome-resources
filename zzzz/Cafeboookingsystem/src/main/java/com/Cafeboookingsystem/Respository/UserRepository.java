package com.Cafeboookingsystem.Respository;

import com.Cafeboookingsystem.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Custom method to find user by email
    User findByEmail(@Param("email")String email);

    // Custom method to find user by status
   // Optional<User> findByStatus(String status);

    // Custom method to find user by role
    //Optional<User> findByRole(String role);
}
