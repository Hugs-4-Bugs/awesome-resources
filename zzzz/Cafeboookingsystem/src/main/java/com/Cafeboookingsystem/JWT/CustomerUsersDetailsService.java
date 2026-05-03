package com.Cafeboookingsystem.JWT;


import com.Cafeboookingsystem.Respository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;


import java.util.ArrayList;
import java.util.Objects;

@Slf4j
@Service


public class CustomerUsersDetailsService implements UserDetailsService {


    @Autowired
    UserRepository userRepository;

    private com.Cafeboookingsystem.Entity.User userDetails;


    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        log.info("Inside loadUserByUsername{}", username);
        userDetails = userRepository.findByEmail(username);

        if (!Objects.isNull(userDetails))

            // something failed
            return  new org.springframework.security.core.userdetails.User(userDetails.getEmail(), userDetails.getPassword(), new ArrayList<>());
        else
            throw new UsernameNotFoundException("User not found with username");


    }

    public com.Cafeboookingsystem.Entity.User getUserDetails() {




        return userDetails;
    }
    }

