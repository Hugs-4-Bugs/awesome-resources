package com.dependecy.injection.Controller;




import com.dependecy.injection.Entity.User;
import com.dependecy.injection.Service.UserServiceConstructorInjection;
import com.dependecy.injection.Service.UserServiceFieldInjection;
import com.dependecy.injection.Service.UserServiceSetterInjection;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserServiceFieldInjection userServiceFieldInjection;
    private UserServiceSetterInjection userServiceSetterInjection;
    private final UserServiceConstructorInjection userServiceConstructorInjection;

    // Constructor-based injection for UserServiceFieldInjection and UserServiceConstructorInjection
    @Autowired
    public UserController(UserServiceFieldInjection userServiceFieldInjection,
                          UserServiceConstructorInjection userServiceConstructorInjection) {
        this.userServiceFieldInjection = userServiceFieldInjection;
        this.userServiceConstructorInjection = userServiceConstructorInjection;
    }
   // http://localhost:8080/api/users

    // Setter-based injection for UserServiceSetterInjection
    @Autowired
    public void setUserServiceSetterInjection(UserServiceSetterInjection userServiceSetterInjection) {
        this.userServiceSetterInjection = userServiceSetterInjection;
    }

    // Example using Field-based injection
    @GetMapping("/field")
    public List<User> getAllUsersField() {
        return userServiceFieldInjection.getAllUsers();
    }

    // Example using Setter-based injection
    @GetMapping("/setter")
    public List<User> getAllUsersSetter() {
        return userServiceSetterInjection.getAllUsers();
    }

    // Example using Constructor-based injection
    @GetMapping("/constructor")
    public List<User> getAllUsersConstructor() {
        return userServiceConstructorInjection.getAllUsers();
    }

    // Save user example for all types of services
    @PostMapping("/save")
    public User saveUser(@RequestBody User user) {
        // You can use any of the services to save users, here we use the constructor-injected one
        return userServiceConstructorInjection.saveUser(user);




    }


}






