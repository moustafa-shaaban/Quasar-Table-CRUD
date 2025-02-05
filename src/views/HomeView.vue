<script setup>
import { ref, onMounted, computed } from 'vue';
import { exportFile, Notify, Dialog, uid } from 'quasar';

import { useCustomersStore } from '@/stores/customers';
import { reactive } from 'vue';

const customersStore = useCustomersStore();

const filter = ref('');

const columns = [
  {
    name: 'name',
    required: true,
    label: 'Names',
    align: 'left',
    field: row => row.name,
    format: val => `${val}`,
    sortable: true,
  },
  { name: 'email', align: 'center', label: 'Email', align: 'left', field: 'email', sortable: true },
  { name: 'address', label: 'Address', field: 'address', align: 'left', sortable: true },
  { name: 'phone', label: 'Phone', field: 'phone', align: 'left', },
  { name: 'country', label: 'Country', field: 'country', align: 'left', sortable: true },
  { name: 'actions', label: 'Actions', align: 'left', }
]

const rows = customersStore.customersData;


function wrapCsvValue(val, formatFn, row) {
  let formatted = formatFn !== void 0
    ? formatFn(val, row)
    : val

  formatted = formatted === void 0 || formatted === null
    ? ''
    : String(formatted)

  formatted = formatted.split('"').join('""')
  /**
   * Excel accepts \n and \r in strings, but some other CSV parsers do not
   * Uncomment the next two lines to escape new lines
   */
  // .split('\n').join('\\n')
  // .split('\r').join('\\r')

  return `"${formatted}"`
}

function exportTable() {
  // naive encoding to csv format
  const content = [columns.map(col => wrapCsvValue(col.label))].concat(
    rows.map(row => columns.map(col => wrapCsvValue(
      typeof col.field === 'function'
        ? col.field(row)
        : row[col.field === void 0 ? col.name : col.field],
      col.format,
      row
    )).join(','))
  ).join('\r\n')

  const status = exportFile(
    'data-export.csv',
    content,
    'text/csv'
  )

  if (status !== true) {
    $q.notify({
      message: 'Browser denied file download...',
      color: 'negative',
      icon: 'warning'
    })
  }
}

const pagination = ref({
  // sortBy: 'desc',
  // descending: false,
  // page: 2,
  rowsPerPage: 10
  // rowsNumber: xx if getting data from a server
})

const createCustomerDialog = ref(false);
const updateCustomerDialog = ref(false);

const addCustomerFormData = reactive({
  name: '',
  email: '',
  address: '',
  phone: '',
  county: '',
})

const updateCustomerDialogData = reactive({
  name: '',
  email: '',
  address: '',
  phone: '',
  county: '',
})



function createCustomer() {
  customersStore.createCustomer({
    id: uid(),
    name: addCustomerFormData.name,
    email: addCustomerFormData.email,
    address: addCustomerFormData.address,
    phone: addCustomerFormData.phone,
    country: addCustomerFormData.country,
  })


  Notify.create({
    message: `Customer ${addCustomerFormData.name} Added Successfully`,
    type: "positive",
    actions: [
      { icon: 'close', color: 'white', round: true, }
    ]
  })
  createCustomerDialog.value = false
  onReset()
};

function onReset() {
  addCustomerFormData.name = ''
  addCustomerFormData.email = ''
  addCustomerFormData.address = ''
  addCustomerFormData.phone = ''
  addCustomerFormData.country = ''
}

const testId = ref()

function update(id) {
  updateCustomerDialog.value = true;
  const customerToUpdate = JSON.parse(JSON.stringify(
    customersStore.customersData.find((item) => item.id === id)
  ))
  testId.value = customerToUpdate.id
  updateCustomerDialogData.name = customerToUpdate.name
  updateCustomerDialogData.email = customerToUpdate.email
  updateCustomerDialogData.address = customerToUpdate.address
  updateCustomerDialogData.phone = customerToUpdate.phone
  updateCustomerDialogData.country = customerToUpdate.country
}

function updateCustomer() {
  try {
    customersStore.updateCustomer(testId.value, updateCustomerDialogData);
    onReset();
    updateCustomerDialog.value = false;
    Notify.create({
      message: 'Customer Updated Successfully',
      type: "positive",
      actions: [
        { icon: 'close', color: 'white', round: true, }
      ]
    })
  } catch (error) {
    Notify.create({
      message: error.message,
      type: "negative",
      actions: [
        { icon: 'close', color: 'white', round: true, }
      ]
    })
  }
};

function confirm(id) {
  const customerToDelete = customersStore.customersData.find((item) => item.id === id)
  Dialog.create({
    dark: true,
    title: 'Confirm',
    color: 'primary',
    message: `Are you sure you want to delete ${customerToDelete.name} ?`,
    cancel: true,
    persistent: true
  }).onOk(() => {
    try {
      customersStore.deleteCustomer(id);
      Notify.create({
        message: `Customer ${customerToDelete.name} Deleted Successfully`,
        type: "positive",
        actions: [
          { icon: 'close', color: 'white', round: true, }
        ]
      })
    } catch (error) {
      Notify.create({
        message: error.message,
        type: "negative",
        actions: [
          { icon: 'close', color: 'white', round: true, }
        ]
      })
    }
  })
};

</script>

<template>
  <q-page>
    <div class="q-pa-md">
      <q-table v-model:pagination="pagination" square :rows="rows" :columns="columns" row-key="id" rows-per-page="10" flat
        bordered separator="cell" :grid="$q.screen.lt.md" :dense="$q.screen.lt.md" :filter="filter"
        no-data-label="No data found">

        <template v-slot:top-left="props">
          <q-btn color="primary" label="Add Customer" @click="createCustomerDialog = true" />
          <q-btn color="primary" icon-right="archive" label="Export to csv" no-caps @click="exportTable" />
          <q-btn flat round dense :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
            @click="props.toggleFullscreen" class="q-ml-md" />
        </template>

        <template v-slot:top-right>
          <q-input borderless dense debounce="300" v-model="filter" placeholder="Search">
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </template>

        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="name" :props="props">
              {{ props.row.name }}
              <q-popup-edit v-model="props.row.name" v-slot="scope">
                <q-input v-model="scope.value" dense autofocus counter @keyup.enter="scope.set" />
              </q-popup-edit>
            </q-td>
            <q-td key="gender" :props="props">{{ props.row.gender }}</q-td>

            <q-td key="email" :props="props">
              {{ props.row.email }}
              <q-popup-edit v-model="props.row.email" type="email" title="Update email" buttons v-slot="scope">
                <q-input v-model="scope.value" dense autofocus />
              </q-popup-edit>
            </q-td>
            <q-td key="address" :props="props">
              {{ props.row.address }}
              <q-popup-edit v-model="props.row.address" title="Update address" buttons persistent v-slot="scope">
                <q-input v-model="scope.value" dense autofocus hint="Use buttons to close" />
              </q-popup-edit>
            </q-td>
            <q-td key="phone" :props="props">
              <div class="text-pre-wrap">{{ props.row.phone }}</div>
              <q-popup-edit v-model="props.row.phone" v-slot="scope">
                <q-input type="textarea" v-model="scope.value" dense autofocus />
              </q-popup-edit>
            </q-td>
            <q-td key="country" :props="props">
              {{ props.row.country }}
              <q-popup-edit v-model="props.row.country" title="Update country" buttons persistent v-slot="scope">
                <q-input v-model="scope.value" dense autofocus hint="Use buttons to close" />
              </q-popup-edit>
            </q-td>

            <q-td key="actions" :props="props">
              <q-btn round color="info" icon="edit" @click="update(props.row.id)" />
              <q-btn round color="negative" icon="delete" @click="confirm(props.row.id)" />
            </q-td>
          </q-tr>
        </template>
        <template v-slot:item="props">
          <q-card class="q-ma-xs">
            <q-list dense>
              <q-item :key="columns.name" v-if="columns.field !== 'action'" v-for="col in props.cols">
                <q-item-section>
                  <q-item-label>{{ col.label }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label caption>{{ col.value }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
            <q-card-section>
              <q-btn dense flat round color="blue" field="edit" icon="edit" @click="update(props.row.id)"></q-btn>
              <q-btn round color="negative" icon="delete" @click="confirm(props.row.id)" />
            </q-card-section>
          </q-card>
        </template>
      </q-table>
    </div>

    <q-dialog v-model="createCustomerDialog">
      <q-card flat bordered class="form-card">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Update Customer</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>


        <q-card-section>
          <q-form @submit="createCustomer" @reset="onReset" class="q-gutter-md">
            <q-input filled v-model="addCustomerFormData.name" label="Customer Name *" hint="Customer Name" lazy-rules
              :rules="[val => val && val.length > 0 || 'Please type something']" />

            <q-input filled type="email" v-model="addCustomerFormData.email" label="Customer Email *"
              hint="Customer Email" lazy-rules :rules="[val => val && val.length > 0 || 'Please type something']" />

            <q-input filled type="textarea" v-model="addCustomerFormData.address" label="Customer Address *"
              hint="Customer Address" lazy-rules :rules="[val => val && val.length > 0 || 'Please type something']" />
            <q-input filled type="number" v-model="addCustomerFormData.phone" label="Customer Phone *"
              hint="Customer Phone" lazy-rules :rules="[val => val && val.length > 0 || 'Please type something']" />
            <q-input filled v-model="addCustomerFormData.country" label="Customer Country *" hint="Customer Country"
              lazy-rules :rules="[val => val && val.length > 0 || 'Please type something']" />
            <div>
              <q-btn label="Submit" type="submit" color="primary" />
              <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="updateCustomerDialog">
      <q-card flat bordered class="form-card">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Update Customer</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="updateCustomerDialog = false" />
        </q-card-section>


        <q-card-section>
          <q-form @submit="updateCustomer(id)" @reset="onReset" class="q-gutter-md">
            <q-input filled v-model="updateCustomerDialogData.name" label="Customer Name *" hint="Customer Name"
              lazy-rules :rules="[val => val && val.length > 0 || 'Please type something']" />

            <q-input filled type="email" v-model="updateCustomerDialogData.email" label="Customer Email *"
              hint="Customer Email" lazy-rules :rules="[val => val && val.length > 0 || 'Please type something']" />

            <q-input filled type="textarea" v-model="updateCustomerDialogData.address" label="Customer Address *"
              hint="Customer Address" lazy-rules :rules="[val => val && val.length > 0 || 'Please type something']" />
            <q-input filled type="number" v-model="updateCustomerDialogData.phone" label="Customer Phone *"
              hint="Customer Phone" lazy-rules :rules="[val => val && val.length > 0 || 'Please type something']" />
            <q-input filled v-model="updateCustomerDialogData.country" label="Customer Country *" hint="Customer Country"
              lazy-rules :rules="[val => val && val.length > 0 || 'Please type something']" />
            <div>
              <q-btn label="Submit" type="submit" color="primary" />
              <q-btn label="Cancel" color="negative" flat class="q-ml-sm" @click="updateCustomerDialog = false" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>


<style lang="sass">
.form-card
  width: 100%
  max-width: 400px
</style>