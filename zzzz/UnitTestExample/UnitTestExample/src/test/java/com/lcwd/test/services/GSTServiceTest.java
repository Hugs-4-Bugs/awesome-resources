package com.lcwd.test.services;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.mockito.junit.jupiter.MockitoExtension;

public class GSTServiceTest{

    @Test
    public void gstCalculateTest(){


        GstService gstService = new GstService();

        int actualresult = gstService.calculateGST();

        Assertions.assertEquals(18, actualResult);


    }




}