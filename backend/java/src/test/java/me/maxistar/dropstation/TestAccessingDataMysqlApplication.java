package me.maxistar.dropstation;

import org.springframework.boot.SpringApplication;

public class TestAccessingDataMysqlApplication {

	public static void main(String[] args) {
		SpringApplication.from(AccessingDataMysqlApplication::main).with(TestcontainersConfiguration.class).run(args);
	}

}
