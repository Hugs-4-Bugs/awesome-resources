package com.dependecy.injection.Service;




import com.dependecy.injection.Entity.User;
import com.dependecy.injection.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserServiceConstructorInjection {

    private final UserRepository userRepository;

    // Constructor-based injection
    @Autowired
    public UserServiceConstructorInjection(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    public User saveUser(User user) {
        return userRepository.save(user);
    }
}
