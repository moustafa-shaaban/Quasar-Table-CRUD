import { defineStore } from "pinia";

import { customersList } from "@/data/data";
import { useStorage } from "@vueuse/core";

export const useCustomersStore = defineStore("customers", {
  state: () => ({
    customersData: useStorage("customersStorage", customersList),
  }),

  getters: {
    getCustomerById: (state) => {
      return (id) => state.customersData.find((customer) => customer.id === id);
    },
  },

  actions: {
    createCustomer(customer) {
      this.customersData.unshift(customer);
    },

    updateCustomer(updatedCustomer) {
      const customerIndex = this.customersData.findIndex(customer => customer.id === updatedCustomer.id)
      if (customerIndex !== -1) {
        this.customersData[customerIndex] = { ...updatedCustomer }
      }
    },

    deleteCustomer(id) {
      const customerIndex = this.customersData.findIndex((customer) => customer.id === id);
      this.customersData.splice(customerIndex, 1);
    },
  },
});
