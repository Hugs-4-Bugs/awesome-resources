package com.Cafeboookingsystem.restImpl;

import com.Cafeboookingsystem.Constant.UserConstant;
import com.Cafeboookingsystem.Service.UserService;
import com.Cafeboookingsystem.Utils.CafeUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import com.Cafeboookingsystem.rest.UserRest;

import java.util.Map;

@RestController

public class UserRestImpl implements UserRest {

    @Autowired
    UserService userService;






    @Override
    public ResponseEntity<String> signup(Map<String, String> requestMap) {
       try{


           return userService.signup(requestMap);
       }catch (Exception e){


           e.printStackTrace();
       }


       return CafeUtils.getResponseEntity(UserConstant.SOMETHING_WENT_WRONG,HttpStatus.INTERNAL_SERVER_ERROR);

    }

    @Override
    public ResponseEntity<String> login(Map<String, String> requestMap) {
        try{

            return userService.login(requestMap);

        }catch(Exception e){
            e.printStackTrace();
        }

        return CafeUtils.getResponseEntity(UserConstant.SOMETHING_WENT_WRONG,HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
