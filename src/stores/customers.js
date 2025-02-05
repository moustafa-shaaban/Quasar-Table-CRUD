import { ref, computed } from "vue";
import { defineStore } from "pinia";

import { customersList } from "@/data/data";
import { useStorage } from "@vueuse/core";

export const useCustomersStore = defineStore("customers", {
  state: () => ({
    customersData: useStorage("customersStorage", customersList),
  }),

  getters: {
    // Read
    getCustomerById: (state) => {
      return (id) => state.customersData.find((customer) => customer.id === id);
    },
  },

  actions: {
    // Create
    createCustomer(customer) {
      this.customersData.unshift(customer);
    },

    // Update
    updateCustomer(id, newCustomer) {
      const customerToUpdate = this.customersData.find(
        (customer) => customer.id === id
      );
      customerToUpdate.name = newCustomer.name;
      customerToUpdate.email = newCustomer.email;
      customerToUpdate.address = newCustomer.address;
      customerToUpdate.phone = newCustomer.phone;
      customerToUpdate.country = newCustomer.country;
    },

    // Delete
    deleteCustomer(id) {
      const index = this.customersData.findIndex((item) => item.id === id);
      this.customersData.splice(index, 1);
      // this.customersData = this.customersData.filter((customer) => {
      //   return customer.id !== id;
      // });
    },
  },
});
