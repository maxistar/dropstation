package me.maxistar.dropstation;

import org.springframework.data.repository.CrudRepository;

import me.maxistar.dropstation.Capacitor;

// This will be AUTO IMPLEMENTED by Spring into a Bean called userRepository
// CRUD refers Create, Read, Update, Delete

public interface CapacitorRepository extends CrudRepository<Capacitor, Integer> {

}
